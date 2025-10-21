/**
 * Core Aramex SOAP Client
 */

import * as soap from 'soap';
import { Client as SoapClient } from 'soap';
import * as path from 'path';
import { AramexConfig, ClientInfo } from '../types';

// Helper type to make readonly properties mutable for internal use
type Mutable<T> = { -readonly [P in keyof T]: T[P] };

export class AramexClient {
  private config: Mutable<AramexConfig>;
  private readonly wsdlPaths = {
    shipping: path.join(__dirname, '../wsdl/shipping-services-api-wsdl.wsdl'),
    tracking: path.join(__dirname, '../wsdl/shipments-tracking-api-wsdl.wsdl'),
    rate: path.join(__dirname, '../wsdl/aramex-rates-calculator-wsdl.wsdl'),
    location: path.join(__dirname, '../wsdl/location-api-wsdl.wsdl'),
  };

  private readonly endpoints = {
    test: {
      shipping: 'https://ws.sbx.aramex.net/shippingapi.v2/shipping/service_1_0.svc',
      tracking: 'https://ws.sbx.aramex.net/shippingapi.v2/tracking/service_1_0.svc',
      rate: 'https://ws.sbx.aramex.net/shippingapi.v2/ratecalculator/service_1_0.svc',
      location: 'https://ws.sbx.aramex.net/shippingapi.v2/location/service_1_0.svc',
    },
    production: {
      shipping: 'https://ws.aramex.net/shippingapi.v2/shipping/service_1_0.svc',
      tracking: 'https://ws.aramex.net/shippingapi.v2/tracking/service_1_0.svc',
      rate: 'https://ws.aramex.net/shippingapi.v2/ratecalculator/service_1_0.svc',
      location: 'https://ws.aramex.net/shippingapi.v2/location/service_1_0.svc',
    },
  };

  private soapClients: {
    shipping?: SoapClient;
    tracking?: SoapClient;
    rate?: SoapClient;
    location?: SoapClient;
  } = {};

  constructor(config: AramexConfig) {
    this.config = {
      version: '1.0',
      source: 24,
      testMode: true,
      ...config,
    } as AramexConfig;
  }

  getClientInfo(): ClientInfo {
    return {
      UserName: this.config.username,
      Password: this.config.password,
      Version: this.config.version!,
      AccountNumber: this.config.accountNumber,
      AccountPin: this.config.accountPin,
      AccountEntity: this.config.accountEntity,
      AccountCountryCode: this.config.accountCountryCode,
      Source: this.config.source!,
    };
  }

  async getSoapClient(service: 'shipping' | 'tracking' | 'rate' | 'location'): Promise<SoapClient> {
    // Return cached client if available
    if (this.soapClients[service]) {
      return this.soapClients[service]!;
    }

    // Get local WSDL path and endpoint
    const wsdlPath = this.wsdlPaths[service];
    const endpointUrls = this.config.testMode ? this.endpoints.test : this.endpoints.production;
    const endpoint = endpointUrls[service];

    const options: soap.IOptions = {
      endpoint,
      forceSoap12Headers: false,
      envelopeKey: 'soap',
    };

    return new Promise((resolve, reject) => {
      soap.createClient(wsdlPath, options, (err, client) => {
        if (err) {
          reject(err);
        } else {
          // Cache the client
          this.soapClients[service] = client;
          resolve(client);
        }
      });
    });
  }

  async callSoapMethod<TRequest, TResponse>(
    service: 'shipping' | 'tracking' | 'rate' | 'location',
    method: string,
    request: TRequest,
  ): Promise<TResponse> {
    const client = await this.getSoapClient(service);

    return new Promise((resolve, reject) => {
      // Validate method exists
      if (typeof client[method] !== 'function') {
        reject(new Error(`SOAP method '${method}' not found in ${service} service`));
        return;
      }

      client[method](request, (err: Error | null, result: unknown) => {
        // Log the actual SOAP request/response XML
        if (process.env.DEBUG_SOAP === 'true') {
          console.log('\n━━━━ SOAP REQUEST XML ━━━━');
          console.log(client.lastRequest);
          console.log('\n━━━━ SOAP RESPONSE XML ━━━━');
          console.log(client.lastResponse);
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━\n');
        }

        if (err) {
          const enhancedError = new Error(
            `SOAP call failed: ${service}.${method} - ${err.message}`
          );
          (enhancedError as any).cause = err;
          reject(enhancedError);
        } else {
          // Extract the result from SOAP envelope
          const resultObj = result as Record<string, unknown>;
          let methodResult = resultObj[`${method}Result`] || result;

          // Fix SOAP array wrapping: ProcessedShipment should be an array
          if (methodResult && typeof methodResult === 'object') {
            const typed = methodResult as any;

            // Fix Shipments.ProcessedShipment array
            if (typed.Shipments?.ProcessedShipment) {
              typed.Shipments = Array.isArray(typed.Shipments.ProcessedShipment)
                ? typed.Shipments.ProcessedShipment
                : [typed.Shipments.ProcessedShipment];
            }

            // Fix Notifications.Notification array
            if (typed.Notifications?.Notification) {
              typed.Notifications = Array.isArray(typed.Notifications.Notification)
                ? typed.Notifications.Notification
                : [typed.Notifications.Notification];
            }
          }

          resolve(methodResult as TResponse);
        }
      });
    });
  }

  setTestMode(testMode: boolean): void {
    this.config.testMode = testMode;
    // Clear cached clients so they reconnect with new URLs
    this.soapClients = {};
  }

  getConfig(): Readonly<AramexConfig> {
    return { ...this.config };
  }

  /**
   * Clear all cached SOAP clients
   */
  clearClients(): void {
    this.soapClients = {};
  }
}

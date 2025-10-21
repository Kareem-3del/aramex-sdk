/**
 * Rate Calculator API Service
 * Provides rate calculation and quote operations
 */

import { AramexClient } from '../core/client';
import { AramexAPIError } from '../core/errors';
import {
  CalculateRateRequest,
  CalculateRateResponse,
  Transaction,
} from '../types';
import { normalizeAddress, normalizeShipmentForRate } from '../helpers/request-normalizer';

export class RateService {
  constructor(private readonly client: AramexClient) {}

  /**
   * Calculate shipping rate for a shipment
   * @param request Rate calculation request (without ClientInfo)
   * @returns CalculateRateResponse
   */
  async calculateRate(
    request: Omit<CalculateRateRequest, 'ClientInfo'>,
  ): Promise<CalculateRateResponse> {
    // Normalize addresses and shipment details to match WSDL field order
    const fullRequest: CalculateRateRequest = {
      ClientInfo: this.client.getClientInfo(),
      Transaction: request.Transaction,
      OriginAddress: normalizeAddress(request.OriginAddress),
      DestinationAddress: normalizeAddress(request.DestinationAddress),
      ShipmentDetails: normalizeShipmentForRate(request.ShipmentDetails),
      PreferredCurrencyCode: request.PreferredCurrencyCode,
    };

    const response = await this.client.callSoapMethod<
      CalculateRateRequest,
      CalculateRateResponse
    >('rate', 'CalculateRate', fullRequest);

    if (response.HasErrors) {
      throw new AramexAPIError(
        'Failed to calculate rate',
        response.Notifications,
      );
    }

    return response;
  }

  /**
   * Get a shipping quote (alias for calculateRate)
   * @param request Rate calculation request (without ClientInfo)
   * @returns CalculateRateResponse
   */
  async getQuote(
    request: Omit<CalculateRateRequest, 'ClientInfo'>,
  ): Promise<CalculateRateResponse> {
    return this.calculateRate(request);
  }
}

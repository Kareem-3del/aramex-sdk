/**
 * AramexClient SOAP Unit Tests
 */

import * as soap from 'soap';
import { AramexClient } from '../src/core/client';
import { testConfig } from './setup';

jest.mock('soap');
const mockedSoap = soap as jest.Mocked<typeof soap>;

describe('AramexClient', () => {
  let client: AramexClient;
  const mockSoapClient = {
    TestMethod: jest.fn(),
    CreateShipments: jest.fn(),
    TrackShipments: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedSoap.createClient.mockImplementation((wsdl, options, callback: any) => {
      callback(null, mockSoapClient);
    });
    client = new AramexClient(testConfig);
  });

  describe('constructor', () => {
    it('should initialize with default config', () => {
      expect(client).toBeDefined();
    });

    it('should set default version and source', () => {
      const clientInfo = client.getClientInfo();
      expect(clientInfo.Version).toBe('1.0');
      expect(clientInfo.Source).toBe(24);
    });

    it('should use custom version if provided', () => {
      const customConfig = { ...testConfig, version: '2.0' };
      const customClient = new AramexClient(customConfig);

      const clientInfo = customClient.getClientInfo();
      expect(clientInfo.Version).toBe('2.0');
    });

    it('should use custom source if provided', () => {
      const customConfig = { ...testConfig, source: 99 };
      const customClient = new AramexClient(customConfig);

      const clientInfo = customClient.getClientInfo();
      expect(clientInfo.Source).toBe(99);
    });

    it('should default to test mode', () => {
      const config = client.getConfig();
      expect(config.testMode).toBe(true);
    });
  });

  describe('getClientInfo', () => {
    it('should return complete client info', () => {
      const clientInfo = client.getClientInfo();

      expect(clientInfo).toEqual({
        UserName: testConfig.username,
        Password: testConfig.password,
        Version: '1.0',
        AccountNumber: testConfig.accountNumber,
        AccountPin: testConfig.accountPin,
        AccountEntity: testConfig.accountEntity,
        AccountCountryCode: testConfig.accountCountryCode,
        Source: 24,
      });
    });

    it('should return same structure each time', () => {
      const clientInfo1 = client.getClientInfo();
      const clientInfo2 = client.getClientInfo();

      expect(clientInfo1).toEqual(clientInfo2);
    });
  });

  describe('getSoapClient', () => {
    it('should create SOAP client for shipping service', async () => {
      const soapClient = await client.getSoapClient('shipping');

      expect(mockedSoap.createClient).toHaveBeenCalled();
      expect(soapClient).toBe(mockSoapClient);
    });

    it('should cache SOAP clients', async () => {
      await client.getSoapClient('shipping');
      await client.getSoapClient('shipping');

      // Should only create once due to caching
      expect(mockedSoap.createClient).toHaveBeenCalledTimes(1);
    });

    it('should create separate clients for different services', async () => {
      await client.getSoapClient('shipping');
      await client.getSoapClient('tracking');

      expect(mockedSoap.createClient).toHaveBeenCalledTimes(2);
    });

    it('should use test endpoint in test mode', async () => {
      await client.getSoapClient('shipping');

      const callArgs = mockedSoap.createClient.mock.calls[0];
      expect(callArgs[1]).toEqual(
        expect.objectContaining({
          endpoint: 'https://ws.sbx.aramex.net/shippingapi.v2/shipping/service_1_0.svc',
        }),
      );
    });

    it('should use production endpoint in production mode', async () => {
      const prodClient = new AramexClient({ ...testConfig, testMode: false });
      await prodClient.getSoapClient('shipping');

      const callArgs = mockedSoap.createClient.mock.calls[0];
      expect(callArgs[1]).toEqual(
        expect.objectContaining({
          endpoint: 'https://ws.aramex.net/shippingapi.v2/shipping/service_1_0.svc',
        }),
      );
    });

    it('should handle SOAP client creation error', async () => {
      const mockError = new Error('SOAP connection failed');
      mockedSoap.createClient.mockImplementation((wsdl, options, callback: any) => {
        callback(mockError, null);
      });

      await expect(client.getSoapClient('shipping')).rejects.toThrow(
        'SOAP connection failed',
      );
    });
  });

  describe('callSoapMethod', () => {
    beforeEach(() => {
      mockSoapClient.TestMethod.mockImplementation((request, callback) => {
        callback(null, { TestMethodResult: { success: true } });
      });
    });

    it('should call SOAP method successfully', async () => {
      const request = { data: 'test' };
      const result = await client.callSoapMethod('shipping', 'TestMethod', request);

      expect(mockSoapClient.TestMethod).toHaveBeenCalledWith(
        request,
        expect.any(Function),
      );
      expect(result).toEqual({ success: true });
    });

    it('should extract result from SOAP envelope', async () => {
      mockSoapClient.CreateShipments.mockImplementation((request, callback) => {
        callback(null, {
          CreateShipmentsResult: {
            HasErrors: false,
            Shipments: [{ ID: '123' }],
          },
        });
      });

      const result = await client.callSoapMethod('shipping', 'CreateShipments', {});

      expect(result).toEqual({
        HasErrors: false,
        Shipments: [{ ID: '123' }],
      });
    });

    it('should handle method that does not exist', async () => {
      const mockSoapClientWithoutMethod = {
        ...mockSoapClient,
        NonExistentMethod: undefined,
      };
      mockedSoap.createClient.mockImplementation((wsdl, options, callback: any) => {
        callback(null, mockSoapClientWithoutMethod);
      });

      const newClient = new AramexClient(testConfig);
      await expect(
        newClient.callSoapMethod('shipping', 'NonExistentMethod', {}),
      ).rejects.toThrow("SOAP method 'NonExistentMethod' not found");
    });

    it('should handle SOAP method errors', async () => {
      const mockError = new Error('SOAP method failed');
      mockSoapClient.TestMethod.mockImplementation((request, callback) => {
        callback(mockError, null);
      });

      await expect(
        client.callSoapMethod('shipping', 'TestMethod', {}),
      ).rejects.toThrow('SOAP call failed: shipping.TestMethod - SOAP method failed');
    });

    it('should handle result without Result suffix', async () => {
      mockSoapClient.TestMethod.mockImplementation((request, callback) => {
        callback(null, { directResult: true });
      });

      const result = await client.callSoapMethod('shipping', 'TestMethod', {});

      expect(result).toEqual({ directResult: true });
    });
  });

  describe('setTestMode', () => {
    it('should switch to production mode', () => {
      client.setTestMode(false);

      const config = client.getConfig();
      expect(config.testMode).toBe(false);
    });

    it('should switch to test mode', () => {
      client.setTestMode(false);
      client.setTestMode(true);

      const config = client.getConfig();
      expect(config.testMode).toBe(true);
    });

    it('should clear cached clients when switching modes', async () => {
      await client.getSoapClient('shipping');
      expect(mockedSoap.createClient).toHaveBeenCalledTimes(1);

      client.setTestMode(false);
      await client.getSoapClient('shipping');

      // Should create a new client after clearing cache
      expect(mockedSoap.createClient).toHaveBeenCalledTimes(2);
    });
  });

  describe('getConfig', () => {
    it('should return config copy', () => {
      const config = client.getConfig();

      expect(config.username).toBe(testConfig.username);
      expect(config.accountNumber).toBe(testConfig.accountNumber);
      expect(config.testMode).toBe(true);
    });

    it('should return readonly config', () => {
      const config = client.getConfig();
      const originalUsername = config.username;

      (config as any).username = 'modified';

      const newConfig = client.getConfig();
      expect(newConfig.username).toBe(originalUsername);
    });
  });

  describe('clearClients', () => {
    it('should clear all cached SOAP clients', async () => {
      await client.getSoapClient('shipping');
      await client.getSoapClient('tracking');
      expect(mockedSoap.createClient).toHaveBeenCalledTimes(2);

      client.clearClients();
      await client.getSoapClient('shipping');

      // Should create new client after clearing
      expect(mockedSoap.createClient).toHaveBeenCalledTimes(3);
    });
  });
});

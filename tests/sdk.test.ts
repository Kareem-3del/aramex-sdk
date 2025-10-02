/**
 * Main SDK Unit Tests
 */

import { AramexSDK } from '../src';
import { AramexClient } from '../src/core/client';
import {
  ShippingService,
  TrackingService,
  RateService,
  LocationService,
} from '../src/services';
import { testConfig } from './setup';

jest.mock('../src/core/client');
jest.mock('../src/services/shipping.service');
jest.mock('../src/services/tracking.service');
jest.mock('../src/services/rate.service');
jest.mock('../src/services/location.service');

describe('AramexSDK', () => {
  let sdk: AramexSDK;
  let mockClient: jest.Mocked<AramexClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    sdk = new AramexSDK(testConfig);
    mockClient = (AramexClient as jest.MockedClass<typeof AramexClient>)
      .mock.instances[0] as jest.Mocked<AramexClient>;
  });

  describe('constructor', () => {
    it('should initialize SDK with config', () => {
      expect(AramexClient).toHaveBeenCalledWith(testConfig);
    });

    it('should initialize all services with client', () => {
      expect(ShippingService).toHaveBeenCalledWith(mockClient);
      expect(TrackingService).toHaveBeenCalledWith(mockClient);
      expect(RateService).toHaveBeenCalledWith(mockClient);
      expect(LocationService).toHaveBeenCalledWith(mockClient);
    });

    it('should have all services defined', () => {
      expect(sdk.shipping).toBeDefined();
      expect(sdk.tracking).toBeDefined();
      expect(sdk.rate).toBeDefined();
      expect(sdk.location).toBeDefined();
    });

    it('should expose service instances', () => {
      expect(sdk.shipping).toBeInstanceOf(ShippingService);
      expect(sdk.tracking).toBeInstanceOf(TrackingService);
      expect(sdk.rate).toBeInstanceOf(RateService);
      expect(sdk.location).toBeInstanceOf(LocationService);
    });
  });

  describe('setTestMode', () => {
    it('should call client setTestMode with true', () => {
      mockClient.setTestMode = jest.fn();

      sdk.setTestMode(true);

      expect(mockClient.setTestMode).toHaveBeenCalledWith(true);
    });

    it('should call client setTestMode with false', () => {
      mockClient.setTestMode = jest.fn();

      sdk.setTestMode(false);

      expect(mockClient.setTestMode).toHaveBeenCalledWith(false);
    });
  });

  describe('getConfig', () => {
    it('should return config from client', () => {
      const mockConfig = { ...testConfig, testMode: true };
      mockClient.getConfig = jest.fn().mockReturnValue(mockConfig);

      const config = sdk.getConfig();

      expect(mockClient.getConfig).toHaveBeenCalled();
      expect(config).toEqual(mockConfig);
    });

    it('should return readonly config', () => {
      const mockConfig = { ...testConfig };
      mockClient.getConfig = jest.fn().mockReturnValue(mockConfig);

      const config = sdk.getConfig();

      expect(config).toBeDefined();
      expect(mockClient.getConfig).toHaveBeenCalledTimes(1);
    });
  });

  describe('getClient', () => {
    it('should return underlying client', () => {
      const client = sdk.getClient();

      expect(client).toBe(mockClient);
    });

    it('should return AramexClient instance', () => {
      const client = sdk.getClient();

      expect(client).toBeInstanceOf(AramexClient);
    });
  });

  describe('service accessibility', () => {
    it('should allow access to shipping service methods', () => {
      expect(sdk.shipping).toBeDefined();
      expect(typeof sdk.shipping).toBe('object');
    });

    it('should allow access to tracking service methods', () => {
      expect(sdk.tracking).toBeDefined();
      expect(typeof sdk.tracking).toBe('object');
    });

    it('should allow access to rate service methods', () => {
      expect(sdk.rate).toBeDefined();
      expect(typeof sdk.rate).toBe('object');
    });

    it('should allow access to location service methods', () => {
      expect(sdk.location).toBeDefined();
      expect(typeof sdk.location).toBe('object');
    });
  });
});

/**
 * TrackingService Unit Tests with Mocking
 */

import { TrackingService } from '../src/services/tracking.service';
import { AramexClient } from '../src/core/client';
import { AramexAPIError } from '../src/core/errors';
import { testConfig } from './setup';

jest.mock('../src/core/client');

describe('TrackingService Unit Tests', () => {
  let service: TrackingService;
  let mockClient: jest.Mocked<AramexClient>;

  beforeEach(() => {
    mockClient = new AramexClient(testConfig) as jest.Mocked<AramexClient>;
    mockClient.getClientInfo = jest.fn().mockReturnValue({
      UserName: testConfig.username,
      Password: testConfig.password,
      Version: '1.0',
      AccountNumber: testConfig.accountNumber,
      AccountPin: testConfig.accountPin,
      AccountEntity: testConfig.accountEntity,
      AccountCountryCode: testConfig.accountCountryCode,
      Source: 24,
    });
    mockClient.callSoapMethod = jest.fn();

    service = new TrackingService(mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('trackShipment', () => {
    it('should track a single shipment successfully', async () => {
      const mockResponse = {
        HasErrors: false,
        TrackingResults: [
          {
            WaybillNumber: '1234567890',
            UpdateCode: 'SH001',
            UpdateDescription: 'Shipment received',
            UpdateDateTime: '2024-01-01T10:00:00',
            UpdateLocation: 'Dubai',
          },
        ],
        Notifications: [],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      const result = await service.trackShipment('1234567890');

      expect(mockClient.callSoapMethod).toHaveBeenCalledWith(
        'tracking',
        'TrackShipments',
        expect.objectContaining({
          Shipments: ['1234567890'],
          GetLastTrackingUpdateOnly: false,
        }),
      );
      expect(result).toEqual(mockResponse);
    });

    it('should track shipment with last update only', async () => {
      const mockResponse = {
        HasErrors: false,
        TrackingResults: [
          {
            WaybillNumber: '1234567890',
            UpdateCode: 'SH010',
            UpdateDescription: 'Delivered',
            UpdateDateTime: '2024-01-05T15:30:00',
            UpdateLocation: 'Abu Dhabi',
          },
        ],
        Notifications: [],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      const result = await service.trackShipment('1234567890', true);

      expect(mockClient.callSoapMethod).toHaveBeenCalledWith(
        'tracking',
        'TrackShipments',
        expect.objectContaining({
          GetLastTrackingUpdateOnly: true,
        }),
      );
      expect(result.TrackingResults).toHaveLength(1);
    });

    it('should include transaction if provided', async () => {
      const mockResponse = {
        HasErrors: false,
        TrackingResults: [],
        Notifications: [],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      const transaction = { Reference1: 'TXN-TRACK-001' };
      await service.trackShipment('1234567890', false, transaction);

      expect(mockClient.callSoapMethod).toHaveBeenCalledWith(
        'tracking',
        'TrackShipments',
        expect.objectContaining({
          Transaction: transaction,
        }),
      );
    });

    it('should throw AramexAPIError on failure', async () => {
      const mockResponse = {
        HasErrors: true,
        TrackingResults: [],
        Notifications: [
          { Code: 'ERR001', Message: 'Shipment not found' },
        ],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      await expect(service.trackShipment('invalid')).rejects.toThrow(
        AramexAPIError,
      );
      await expect(service.trackShipment('invalid')).rejects.toThrow(
        'Failed to track shipments',
      );
    });
  });

  describe('trackShipments', () => {
    it('should track multiple shipments successfully', async () => {
      const mockResponse = {
        HasErrors: false,
        TrackingResults: [
          {
            WaybillNumber: '1234567890',
            UpdateCode: 'SH001',
            UpdateDescription: 'Shipment received',
          },
          {
            WaybillNumber: '0987654321',
            UpdateCode: 'SH005',
            UpdateDescription: 'In transit',
          },
        ],
        Notifications: [],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      const shipmentNumbers = ['1234567890', '0987654321'];
      const result = await service.trackShipments(shipmentNumbers);

      expect(mockClient.callSoapMethod).toHaveBeenCalledWith(
        'tracking',
        'TrackShipments',
        expect.objectContaining({
          Shipments: shipmentNumbers,
          GetLastTrackingUpdateOnly: false,
        }),
      );
      expect(result.TrackingResults).toHaveLength(2);
    });

    it('should track with last update only flag', async () => {
      const mockResponse = {
        HasErrors: false,
        TrackingResults: [
          { WaybillNumber: '1234567890', UpdateCode: 'SH010' },
          { WaybillNumber: '0987654321', UpdateCode: 'SH010' },
        ],
        Notifications: [],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      const shipmentNumbers = ['1234567890', '0987654321'];
      await service.trackShipments(shipmentNumbers, true);

      expect(mockClient.callSoapMethod).toHaveBeenCalledWith(
        'tracking',
        'TrackShipments',
        expect.objectContaining({
          GetLastTrackingUpdateOnly: true,
        }),
      );
    });

    it('should handle empty shipment array', async () => {
      const mockResponse = {
        HasErrors: false,
        TrackingResults: [],
        Notifications: [],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      const result = await service.trackShipments([]);

      expect(mockClient.callSoapMethod).toHaveBeenCalled();
      expect(result.TrackingResults).toHaveLength(0);
    });

    it('should throw AramexAPIError on failure', async () => {
      const mockResponse = {
        HasErrors: true,
        TrackingResults: [],
        Notifications: [
          { Code: 'ERR002', Message: 'Authentication failed' },
        ],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      await expect(
        service.trackShipments(['1234567890']),
      ).rejects.toThrow(AramexAPIError);
    });
  });

  describe('trackPickup', () => {
    it('should track pickup successfully', async () => {
      const mockResponse = {
        HasErrors: false,
        PickupTracking: {
          PickupID: 'PKP123',
          Reference: 'TEST-PICKUP-001',
          Status: 'Scheduled',
          UpdateDateTime: '2024-01-15T10:00:00',
        },
        Notifications: [],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      const result = await service.trackPickup('TEST-PICKUP-001');

      expect(mockClient.callSoapMethod).toHaveBeenCalledWith(
        'tracking',
        'TrackPickup',
        expect.objectContaining({
          Reference: 'TEST-PICKUP-001',
          ClientInfo: expect.any(Object),
        }),
      );
      expect(result).toEqual(mockResponse);
    });

    it('should include transaction if provided', async () => {
      const mockResponse = {
        HasErrors: false,
        PickupTracking: {
          PickupID: 'PKP123',
          Reference: 'TEST-PICKUP-001',
          Status: 'Completed',
          UpdateDateTime: '2024-01-15T10:00:00',
        },
        Notifications: [],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      const transaction = { Reference1: 'TXN-PICKUP-TRACK' };
      await service.trackPickup('TEST-PICKUP-001', transaction);

      expect(mockClient.callSoapMethod).toHaveBeenCalledWith(
        'tracking',
        'TrackPickup',
        expect.objectContaining({
          Transaction: transaction,
        }),
      );
    });

    it('should throw AramexAPIError on failure', async () => {
      const mockResponse = {
        HasErrors: true,
        Notifications: [
          { Code: 'ERR003', Message: 'Pickup not found' },
        ],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      await expect(service.trackPickup('INVALID-REF')).rejects.toThrow(
        AramexAPIError,
      );
      await expect(service.trackPickup('INVALID-REF')).rejects.toThrow(
        'Failed to track pickup',
      );
    });

    it('should handle special characters in reference', async () => {
      const mockResponse = {
        HasErrors: false,
        PickupTracking: {
          PickupID: 'PKP124',
          Reference: 'TEST-PICKUP-#001',
          Status: 'Scheduled',
          UpdateDateTime: '2024-01-15T10:00:00',
        },
        Notifications: [],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      const result = await service.trackPickup('TEST-PICKUP-#001');

      expect(mockClient.callSoapMethod).toHaveBeenCalledWith(
        'tracking',
        'TrackPickup',
        expect.objectContaining({
          Reference: 'TEST-PICKUP-#001',
        }),
      );
      expect(result.PickupTracking.Reference).toBe('TEST-PICKUP-#001');
    });
  });

  describe('error handling', () => {
    it('should propagate network errors', async () => {
      const networkError = new Error('Network timeout');
      mockClient.callSoapMethod.mockRejectedValue(networkError);

      await expect(service.trackShipment('1234567890')).rejects.toThrow(
        'Network timeout',
      );
    });

    it('should handle API errors with multiple notifications', async () => {
      const mockResponse = {
        HasErrors: true,
        TrackingResults: [],
        Notifications: [
          { Code: 'ERR001', Message: 'Error 1' },
          { Code: 'ERR002', Message: 'Error 2' },
        ],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      try {
        await service.trackShipments(['1234567890']);
      } catch (error) {
        expect(error).toBeInstanceOf(AramexAPIError);
        expect((error as AramexAPIError).notifications).toHaveLength(2);
      }
    });

    it('should handle empty tracking results', async () => {
      const mockResponse = {
        HasErrors: false,
        TrackingResults: [],
        Notifications: [],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      const result = await service.trackShipments(['1234567890']);

      expect(result.TrackingResults).toEqual([]);
      expect(result.HasErrors).toBe(false);
    });
  });
});

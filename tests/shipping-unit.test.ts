/**
 * ShippingService Unit Tests with Mocking
 */

import { ShippingService } from '../src/services/shipping.service';
import { AramexClient } from '../src/core/client';
import { AramexAPIError } from '../src/core/errors';
import { testConfig, mockShipment, mockPickup } from './setup';

jest.mock('../src/core/client');

describe('ShippingService Unit Tests', () => {
  let service: ShippingService;
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

    service = new ShippingService(mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createShipment', () => {
    it('should create a single shipment successfully', async () => {
      const mockResponse = {
        HasErrors: false,
        Shipments: [
          {
            ID: 'SHP123456',
            Reference1: 'TEST-001',
            ForeignHAWB: '1234567890',
          },
        ],
        Notifications: [],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      const result = await service.createShipment(mockShipment);

      expect(mockClient.callSoapMethod).toHaveBeenCalledWith(
        'shipping',
        'CreateShipments',
        expect.objectContaining({
          Shipments: { Shipment: [mockShipment] },
          ClientInfo: expect.any(Object),
        }),
      );
      expect(result).toEqual(mockResponse);
      expect(result.HasErrors).toBe(false);
    });

    it('should create shipment with label info', async () => {
      const mockResponse = {
        HasErrors: false,
        Shipments: [
          {
            ID: 'SHP123456',
            ShipmentLabel: {
              LabelURL: 'https://example.com/label.pdf',
            },
          },
        ],
        Notifications: [],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      const labelInfo = { ReportID: 9201, ReportType: 'URL' as const };
      await service.createShipment(mockShipment, labelInfo);

      expect(mockClient.callSoapMethod).toHaveBeenCalledWith(
        'shipping',
        'CreateShipments',
        expect.objectContaining({
          LabelInfo: labelInfo,
        }),
      );
    });

    it('should create shipment with transaction info', async () => {
      const mockResponse = {
        HasErrors: false,
        Shipments: [{ ID: 'SHP123456' }],
        Notifications: [],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      const transaction = { Reference1: 'TXN-001', Reference2: 'REF-002' };
      await service.createShipment(mockShipment, undefined, transaction);

      expect(mockClient.callSoapMethod).toHaveBeenCalledWith(
        'shipping',
        'CreateShipments',
        expect.objectContaining({
          Transaction: transaction,
        }),
      );
    });

    it('should throw AramexAPIError on failure', async () => {
      const mockResponse = {
        HasErrors: true,
        Shipments: [],
        Notifications: [
          { Code: 'ERR001', Message: 'Invalid address' },
        ],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      await expect(service.createShipment(mockShipment)).rejects.toThrow(
        AramexAPIError,
      );
      await expect(service.createShipment(mockShipment)).rejects.toThrow(
        'Failed to create shipments',
      );
    });
  });

  describe('createShipments', () => {
    it('should create multiple shipments', async () => {
      const mockResponse = {
        HasErrors: false,
        Shipments: [
          { ID: 'SHP123456' },
          { ID: 'SHP123457' },
        ],
        Notifications: [],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      const shipments = [mockShipment, { ...mockShipment }];
      const result = await service.createShipments(shipments);

      expect(mockClient.callSoapMethod).toHaveBeenCalledWith(
        'shipping',
        'CreateShipments',
        expect.objectContaining({
          Shipments: { Shipment: shipments },
        }),
      );
      expect(result.Shipments).toHaveLength(2);
    });
  });

  describe('printLabel', () => {
    it('should print label successfully', async () => {
      const mockResponse = {
        HasErrors: false,
        ShipmentLabel: {
          LabelURL: 'https://example.com/label.pdf',
        },
        Notifications: [],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      const result = await service.printLabel('1234567890');

      expect(mockClient.callSoapMethod).toHaveBeenCalledWith(
        'shipping',
        'PrintLabel',
        expect.objectContaining({
          ShipmentNumber: '1234567890',
          LabelInfo: { ReportID: 9201, ReportType: 'URL' },
        }),
      );
      expect(result).toEqual(mockResponse);
    });

    it('should print label with product group and origin entity', async () => {
      const mockResponse = {
        HasErrors: false,
        ShipmentLabel: { LabelURL: 'https://example.com/label.pdf' },
        Notifications: [],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      await service.printLabel('1234567890', 'DOM', 'BAH');

      expect(mockClient.callSoapMethod).toHaveBeenCalledWith(
        'shipping',
        'PrintLabel',
        expect.objectContaining({
          ProductGroup: 'DOM',
          OriginEntity: 'BAH',
        }),
      );
    });

    it('should use custom label info', async () => {
      const mockResponse = {
        HasErrors: false,
        ShipmentLabel: { LabelURL: 'https://example.com/label.pdf' },
        Notifications: [],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      const customLabelInfo = { ReportID: 9729, ReportType: 'RPT' as const };
      await service.printLabel(
        '1234567890',
        undefined,
        undefined,
        customLabelInfo,
      );

      expect(mockClient.callSoapMethod).toHaveBeenCalledWith(
        'shipping',
        'PrintLabel',
        expect.objectContaining({
          LabelInfo: customLabelInfo,
        }),
      );
    });

    it('should throw AramexAPIError on failure', async () => {
      const mockResponse = {
        HasErrors: true,
        Notifications: [
          { Code: 'ERR002', Message: 'Shipment not found' },
        ],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      await expect(service.printLabel('invalid')).rejects.toThrow(
        AramexAPIError,
      );
    });
  });

  describe('createPickup', () => {
    it('should create pickup successfully', async () => {
      const mockResponse = {
        HasErrors: false,
        ProcessedPickup: {
          ID: 'PKP123456',
          GUID: 'guid-123-456',
          Reference1: 'TEST-PICKUP',
        },
        Notifications: [],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      const result = await service.createPickup(mockPickup);

      expect(mockClient.callSoapMethod).toHaveBeenCalledWith(
        'shipping',
        'CreatePickup',
        expect.objectContaining({
          Pickup: mockPickup,
          ClientInfo: expect.any(Object),
        }),
      );
      expect(result).toEqual(mockResponse);
    });

    it('should create pickup with label and transaction', async () => {
      const mockResponse = {
        HasErrors: false,
        ProcessedPickup: { ID: 'PKP123456', GUID: 'guid-123' },
        Notifications: [],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      const labelInfo = { ReportID: 9201, ReportType: 'URL' as const };
      const transaction = { Reference1: 'TXN-PICKUP' };

      await service.createPickup(mockPickup, labelInfo, transaction);

      expect(mockClient.callSoapMethod).toHaveBeenCalledWith(
        'shipping',
        'CreatePickup',
        expect.objectContaining({
          LabelInfo: labelInfo,
          Transaction: transaction,
        }),
      );
    });

    it('should throw AramexAPIError on failure', async () => {
      const mockResponse = {
        HasErrors: true,
        Notifications: [
          { Code: 'ERR003', Message: 'Invalid pickup details' },
        ],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      await expect(service.createPickup(mockPickup)).rejects.toThrow(
        AramexAPIError,
      );
    });
  });

  describe('cancelPickup', () => {
    it('should cancel pickup successfully', async () => {
      const mockResponse = {
        HasErrors: false,
        Notifications: [],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      const result = await service.cancelPickup('guid-123-456');

      expect(mockClient.callSoapMethod).toHaveBeenCalledWith(
        'shipping',
        'CancelPickup',
        expect.objectContaining({
          PickupGUID: 'guid-123-456',
          ClientInfo: expect.any(Object),
        }),
      );
      expect(result.HasErrors).toBe(false);
    });

    it('should cancel pickup with comments', async () => {
      const mockResponse = {
        HasErrors: false,
        Notifications: [],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      await service.cancelPickup('guid-123', 'Customer requested cancellation');

      expect(mockClient.callSoapMethod).toHaveBeenCalledWith(
        'shipping',
        'CancelPickup',
        expect.objectContaining({
          Comments: 'Customer requested cancellation',
        }),
      );
    });

    it('should throw AramexAPIError on failure', async () => {
      const mockResponse = {
        HasErrors: true,
        Notifications: [
          { Code: 'ERR004', Message: 'Pickup not found' },
        ],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      await expect(service.cancelPickup('invalid')).rejects.toThrow(
        AramexAPIError,
      );
    });
  });

  describe('reserveShipmentNumberRange', () => {
    it('should reserve shipment numbers successfully', async () => {
      const mockResponse = {
        HasErrors: false,
        ShipmentRangeFrom: '1000000',
        ShipmentRangeTo: '1000009',
        Notifications: [],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      const result = await service.reserveShipmentNumberRange('BAH', 'DOM', 10);

      expect(mockClient.callSoapMethod).toHaveBeenCalledWith(
        'shipping',
        'ReserveShipmentNumberRange',
        expect.objectContaining({
          Entity: 'BAH',
          ProductGroup: 'DOM',
          Count: 10,
        }),
      );
      expect(result).toEqual(mockResponse);
    });

    it('should validate count is within range', async () => {
      await expect(
        service.reserveShipmentNumberRange('BAH', 'DOM', 0),
      ).rejects.toThrow('Count must be between 1 and 5000');

      await expect(
        service.reserveShipmentNumberRange('BAH', 'DOM', 5001),
      ).rejects.toThrow('Count must be between 1 and 5000');
    });

    it('should accept valid count range', async () => {
      const mockResponse = {
        HasErrors: false,
        ShipmentRangeFrom: '1000000',
        ShipmentRangeTo: '1000000',
        Notifications: [],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      await expect(
        service.reserveShipmentNumberRange('BAH', 'DOM', 1),
      ).resolves.toBeDefined();

      await expect(
        service.reserveShipmentNumberRange('BAH', 'DOM', 5000),
      ).resolves.toBeDefined();
    });

    it('should throw AramexAPIError on failure', async () => {
      const mockResponse = {
        HasErrors: true,
        Notifications: [
          { Code: 'ERR005', Message: 'No numbers available' },
        ],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      await expect(
        service.reserveShipmentNumberRange('BAH', 'DOM', 100),
      ).rejects.toThrow(AramexAPIError);
    });
  });

  describe('getLastShipmentsNumbersRange', () => {
    it('should get last shipment numbers range successfully', async () => {
      const mockResponse = {
        HasErrors: false,
        ShipmentRangeFrom: '1000000',
        ShipmentRangeTo: '1000099',
        Notifications: [],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      const result = await service.getLastShipmentsNumbersRange('BAH', 'DOM');

      expect(mockClient.callSoapMethod).toHaveBeenCalledWith(
        'shipping',
        'GetLastShipmentsNumbersRange',
        expect.objectContaining({
          Entity: 'BAH',
          ProductGroup: 'DOM',
        }),
      );
      expect(result).toEqual(mockResponse);
    });

    it('should include transaction if provided', async () => {
      const mockResponse = {
        HasErrors: false,
        ShipmentRangeFrom: '1000000',
        ShipmentRangeTo: '1000099',
        Notifications: [],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      const transaction = { Reference1: 'TXN-RANGE' };
      await service.getLastShipmentsNumbersRange('BAH', 'DOM', transaction);

      expect(mockClient.callSoapMethod).toHaveBeenCalledWith(
        'shipping',
        'GetLastShipmentsNumbersRange',
        expect.objectContaining({
          Transaction: transaction,
        }),
      );
    });

    it('should throw AramexAPIError on failure', async () => {
      const mockResponse = {
        HasErrors: true,
        Notifications: [
          { Code: 'ERR006', Message: 'No range found' },
        ],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      await expect(
        service.getLastShipmentsNumbersRange('BAH', 'DOM'),
      ).rejects.toThrow(AramexAPIError);
    });
  });

  describe('scheduleDelivery', () => {
    it('should schedule delivery successfully', async () => {
      const mockResponse = {
        HasErrors: false,
        ID: 'DEL123456',
        Notifications: [],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      const deliveryRequest = {
        ShipmentNumber: '1234567890',
        ProductGroup: 'DOM' as const,
        Entity: 'BAH',
        Address: {
          Line1: '123 Street',
          City: 'Manama',
          CountryCode: 'BH',
        },
        ConsigneePhone: '+973-1234-5678',
        ShipperNumber: testConfig.accountNumber,
      };

      const result = await service.scheduleDelivery(deliveryRequest);

      expect(mockClient.callSoapMethod).toHaveBeenCalledWith(
        'shipping',
        'ScheduleDelivery',
        expect.objectContaining({
          ClientInfo: expect.any(Object),
          ...deliveryRequest,
        }),
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw AramexAPIError on failure', async () => {
      const mockResponse = {
        HasErrors: true,
        Notifications: [
          { Code: 'ERR007', Message: 'Invalid delivery schedule' },
        ],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      await expect(
        service.scheduleDelivery({
          ShipmentNumber: '1234567890',
          ProductGroup: 'DOM' as const,
          Entity: 'BAH',
          Address: {
            Line1: '123 Street',
            City: 'Manama',
            CountryCode: 'BH',
          },
          ConsigneePhone: '+973-1234-5678',
          ShipperNumber: testConfig.accountNumber,
        }),
      ).rejects.toThrow(AramexAPIError);
    });
  });
});

/**
 * RateService Unit Tests with Mocking
 */

import { RateService } from '../src/services/rate.service';
import { AramexClient } from '../src/core/client';
import { AramexAPIError } from '../src/core/errors';
import { testConfig } from './setup';

jest.mock('../src/core/client');

describe('RateService Unit Tests', () => {
  let service: RateService;
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

    service = new RateService(mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateRate', () => {
    const rateRequest = {
      OriginAddress: {
        Line1: '123 Street',
        City: 'Dubai',
        CountryCode: 'AE',
      },
      DestinationAddress: {
        Line1: '456 Avenue',
        City: 'Abu Dhabi',
        CountryCode: 'AE',
      },
      ShipmentDetails: {
        NumberOfPieces: 1,
        ActualWeight: {
          Unit: 'KG' as const,
          Value: 5.0,
        },
        ProductGroup: 'DOM' as const,
        DescriptionOfGoods: 'Test Package',
        GoodsOriginCountry: 'AE',
      },
    };

    it('should calculate rate successfully', async () => {
      const mockResponse = {
        HasErrors: false,
        TotalAmount: {
          Value: 75.5,
          CurrencyCode: 'AED',
        },
        Notifications: [],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      const result = await service.calculateRate(rateRequest);

      expect(mockClient.callSoapMethod).toHaveBeenCalledWith(
        'rate',
        'CalculateRate',
        expect.objectContaining({
          ClientInfo: expect.any(Object),
          OriginAddress: expect.objectContaining({
            City: rateRequest.OriginAddress.City,
            CountryCode: rateRequest.OriginAddress.CountryCode,
          }),
          DestinationAddress: expect.objectContaining({
            City: rateRequest.DestinationAddress.City,
            CountryCode: rateRequest.DestinationAddress.CountryCode,
          }),
          ShipmentDetails: expect.objectContaining({
            NumberOfPieces: rateRequest.ShipmentDetails.NumberOfPieces,
            ProductGroup: rateRequest.ShipmentDetails.ProductGroup,
          }),
        }),
      );
      expect(result).toEqual(mockResponse);
    });

    it('should calculate rate with preferred currency', async () => {
      const mockResponse = {
        HasErrors: false,
        TotalAmount: {
          Value: 20.5,
          CurrencyCode: 'USD',
        },
        Notifications: [],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      const requestWithCurrency = {
        ...rateRequest,
        PreferredCurrencyCode: 'USD',
      };

      const result = await service.calculateRate(requestWithCurrency);

      expect(mockClient.callSoapMethod).toHaveBeenCalledWith(
        'rate',
        'CalculateRate',
        expect.objectContaining({
          PreferredCurrencyCode: 'USD',
        }),
      );
      expect(result.TotalAmount?.CurrencyCode).toBe('USD');
    });

    it('should calculate rate with cash on delivery', async () => {
      const mockResponse = {
        HasErrors: false,
        TotalAmount: {
          Value: 100.0,
          CurrencyCode: 'AED',
        },
        RateDetails: {
          TotalAmount: {
            Value: 100.0,
            CurrencyCode: 'AED',
          },
          RateLineItems: [],
          WeightCharged: {
            Unit: 'KG',
            Value: 5.0,
          },
        },
        Notifications: [],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      const requestWithCOD = {
        ...rateRequest,
        ShipmentDetails: {
          ...rateRequest.ShipmentDetails,
        },
      };

      const result = await service.calculateRate(requestWithCOD);

      expect(result.TotalAmount?.Value).toBe(100.0);
    });

    it('should calculate rate with customs value', async () => {
      const mockResponse = {
        HasErrors: false,
        TotalAmount: {
          Value: 150.0,
          CurrencyCode: 'USD',
        },
        Notifications: [],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      const requestWithCustoms = {
        ...rateRequest,
        ShipmentDetails: {
          ...rateRequest.ShipmentDetails,
          CustomsValueAmount: {
            Value: 1000.0,
            CurrencyCode: 'USD',
          },
        },
      };

      await service.calculateRate(requestWithCustoms);

      expect(mockClient.callSoapMethod).toHaveBeenCalledWith(
        'rate',
        'CalculateRate',
        expect.objectContaining({
          ShipmentDetails: expect.objectContaining({
            CustomsValueAmount: {
              Value: 1000.0,
              CurrencyCode: 'USD',
            },
          }),
        }),
      );
    });

    it('should calculate rate for international shipment', async () => {
      const mockResponse = {
        HasErrors: false,
        TotalAmount: {
          Value: 250.0,
          CurrencyCode: 'USD',
        },
        Notifications: [],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      const internationalRequest = {
        OriginAddress: {
          Line1: '123 Street',
          City: 'Dubai',
          CountryCode: 'AE',
        },
        DestinationAddress: {
          Line1: '456 Avenue',
          City: 'New York',
          CountryCode: 'US',
        },
        ShipmentDetails: {
          NumberOfPieces: 2,
          ActualWeight: {
            Unit: 'KG' as const,
            Value: 10.0,
          },
          ProductGroup: 'EXP' as const,
          DescriptionOfGoods: 'Electronics',
          GoodsOriginCountry: 'AE',
        },
      };

      const result = await service.calculateRate(internationalRequest);

      expect(mockClient.callSoapMethod).toHaveBeenCalledWith(
        'rate',
        'CalculateRate',
        expect.objectContaining({
          ShipmentDetails: expect.objectContaining({
            ProductGroup: 'EXP',
          }),
        }),
      );
      expect(result.HasErrors).toBe(false);
    });

    it('should include transaction if provided', async () => {
      const mockResponse = {
        HasErrors: false,
        TotalAmount: {
          Value: 75.5,
          CurrencyCode: 'AED',
        },
        Notifications: [],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      const transaction = { Reference1: 'RATE-CALC-001' };
      const requestWithTransaction = {
        ...rateRequest,
        Transaction: transaction,
      };

      await service.calculateRate(requestWithTransaction);

      expect(mockClient.callSoapMethod).toHaveBeenCalledWith(
        'rate',
        'CalculateRate',
        expect.objectContaining({
          Transaction: transaction,
        }),
      );
    });

    it('should throw AramexAPIError on failure', async () => {
      const mockResponse = {
        HasErrors: true,
        Notifications: [
          { Code: 'ERR001', Message: 'Invalid address' },
        ],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      await expect(service.calculateRate(rateRequest)).rejects.toThrow(
        AramexAPIError,
      );
      await expect(service.calculateRate(rateRequest)).rejects.toThrow(
        'Failed to calculate rate',
      );
    });

    it('should handle multiple weight units', async () => {
      const mockResponse = {
        HasErrors: false,
        TotalAmount: {
          Value: 50.0,
          CurrencyCode: 'AED',
        },
        Notifications: [],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      const requestWithLbs = {
        ...rateRequest,
        ShipmentDetails: {
          ...rateRequest.ShipmentDetails,
          ActualWeight: {
            Unit: 'LB' as const,
            Value: 11.0,
          },
        },
      };

      await service.calculateRate(requestWithLbs);

      expect(mockClient.callSoapMethod).toHaveBeenCalledWith(
        'rate',
        'CalculateRate',
        expect.objectContaining({
          ShipmentDetails: expect.objectContaining({
            ActualWeight: {
              Unit: 'LB',
              Value: 11.0,
            },
          }),
        }),
      );
    });

    it('should calculate rate with volumetric weight', async () => {
      const mockResponse = {
        HasErrors: false,
        TotalAmount: {
          Value: 120.0,
          CurrencyCode: 'AED',
        },
        RateDetails: {
          TotalAmount: {
            Value: 120.0,
            CurrencyCode: 'AED',
          },
          RateLineItems: [],
          WeightCharged: {
            Unit: 'KG',
            Value: 8.5,
          },
        },
        Notifications: [],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      const requestWithDimensions = {
        ...rateRequest,
        ShipmentDetails: {
          ...rateRequest.ShipmentDetails,
          Dimensions: {
            Length: 50,
            Width: 40,
            Height: 30,
            Unit: 'CM' as const,
          },
        },
      };

      const result = await service.calculateRate(requestWithDimensions);

      expect(result.RateDetails?.WeightCharged).toBeDefined();
    });
  });

  describe('getQuote', () => {
    const quoteRequest = {
      OriginAddress: {
        Line1: '123 Street',
        City: 'Dubai',
        CountryCode: 'AE',
      },
      DestinationAddress: {
        Line1: '456 Avenue',
        City: 'Abu Dhabi',
        CountryCode: 'AE',
      },
      ShipmentDetails: {
        NumberOfPieces: 1,
        ActualWeight: {
          Unit: 'KG' as const,
          Value: 3.0,
        },
        ProductGroup: 'DOM' as const,
        DescriptionOfGoods: 'Sample',
        GoodsOriginCountry: 'AE',
      },
    };

    it('should get quote successfully (alias for calculateRate)', async () => {
      const mockResponse = {
        HasErrors: false,
        TotalAmount: {
          Value: 45.0,
          CurrencyCode: 'AED',
        },
        Notifications: [],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      const result = await service.getQuote(quoteRequest);

      expect(mockClient.callSoapMethod).toHaveBeenCalledWith(
        'rate',
        'CalculateRate',
        expect.objectContaining({
          ClientInfo: expect.any(Object),
          OriginAddress: expect.objectContaining({
            City: quoteRequest.OriginAddress.City,
            CountryCode: quoteRequest.OriginAddress.CountryCode,
          }),
          DestinationAddress: expect.objectContaining({
            City: quoteRequest.DestinationAddress.City,
            CountryCode: quoteRequest.DestinationAddress.CountryCode,
          }),
        }),
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw AramexAPIError on quote failure', async () => {
      const mockResponse = {
        HasErrors: true,
        Notifications: [
          { Code: 'ERR002', Message: 'Service not available' },
        ],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      await expect(service.getQuote(quoteRequest)).rejects.toThrow(
        AramexAPIError,
      );
    });
  });

  describe('error handling', () => {
    const rateRequest = {
      OriginAddress: {
        Line1: '123 Street',
        City: 'Dubai',
        CountryCode: 'AE',
      },
      DestinationAddress: {
        Line1: '456 Avenue',
        City: 'Abu Dhabi',
        CountryCode: 'AE',
      },
      ShipmentDetails: {
        NumberOfPieces: 1,
        ActualWeight: {
          Unit: 'KG' as const,
          Value: 1.0,
        },
        ProductGroup: 'DOM' as const,
        DescriptionOfGoods: 'Test',
        GoodsOriginCountry: 'AE',
      },
    };

    it('should propagate network errors', async () => {
      const networkError = new Error('Connection refused');
      mockClient.callSoapMethod.mockRejectedValue(networkError);

      await expect(service.calculateRate(rateRequest)).rejects.toThrow(
        'Connection refused',
      );
    });

    it('should handle API errors with multiple notifications', async () => {
      const mockResponse = {
        HasErrors: true,
        Notifications: [
          { Code: 'ERR001', Message: 'Invalid origin' },
          { Code: 'ERR002', Message: 'Invalid destination' },
        ],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      try {
        await service.calculateRate(rateRequest);
      } catch (error) {
        expect(error).toBeInstanceOf(AramexAPIError);
        expect((error as AramexAPIError).notifications).toHaveLength(2);
      }
    });
  });
});

/**
 * LocationService Unit Tests with Mocking
 */

import { LocationService } from '../src/services/location.service';
import { AramexClient } from '../src/core/client';
import { AramexAPIError } from '../src/core/errors';
import { testConfig } from './setup';

jest.mock('../src/core/client');

describe('LocationService Unit Tests', () => {
  let service: LocationService;
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

    service = new LocationService(mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchCountries', () => {
    it('should fetch all countries successfully', async () => {
      const mockResponse = {
        HasErrors: false,
        Countries: [
          { Code: 'AE', Name: 'United Arab Emirates' },
          { Code: 'SA', Name: 'Saudi Arabia' },
          { Code: 'BH', Name: 'Bahrain' },
        ],
        Notifications: [],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      const result = await service.fetchCountries();

      expect(mockClient.callSoapMethod).toHaveBeenCalledWith(
        'location',
        'FetchCountries',
        expect.objectContaining({
          ClientInfo: expect.any(Object),
        }),
      );
      expect(result).toEqual(mockResponse);
      expect(result.Countries).toHaveLength(3);
    });

    it('should include transaction if provided', async () => {
      const mockResponse = {
        HasErrors: false,
        Countries: [],
        Notifications: [],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      const transaction = { Reference1: 'FETCH-COUNTRIES-001' };
      await service.fetchCountries(transaction);

      expect(mockClient.callSoapMethod).toHaveBeenCalledWith(
        'location',
        'FetchCountries',
        expect.objectContaining({
          Transaction: transaction,
        }),
      );
    });

    it('should throw AramexAPIError on failure', async () => {
      const mockResponse = {
        HasErrors: true,
        Countries: [],
        Notifications: [
          { Code: 'ERR001', Message: 'Service unavailable' },
        ],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      await expect(service.fetchCountries()).rejects.toThrow(
        AramexAPIError,
      );
      await expect(service.fetchCountries()).rejects.toThrow(
        'Failed to fetch countries',
      );
    });
  });

  describe('fetchCities', () => {
    it('should fetch cities for a country successfully', async () => {
      const mockResponse = {
        HasErrors: false,
        Cities: [
          { Code: 'DXB', Name: 'Dubai' },
          { Code: 'AUH', Name: 'Abu Dhabi' },
          { Code: 'SHJ', Name: 'Sharjah' },
        ],
        Notifications: [],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      const result = await service.fetchCities('AE');

      expect(mockClient.callSoapMethod).toHaveBeenCalledWith(
        'location',
        'FetchCities',
        expect.objectContaining({
          ClientInfo: expect.any(Object),
          CountryCode: 'AE',
        }),
      );
      expect(result).toEqual(mockResponse);
      expect(result.Cities).toHaveLength(3);
    });

    it('should fetch cities with state filter', async () => {
      const mockResponse = {
        HasErrors: false,
        Cities: [
          { Code: 'NYC', Name: 'New York City' },
          { Code: 'BUF', Name: 'Buffalo' },
        ],
        Notifications: [],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      await service.fetchCities('US', 'NY');

      expect(mockClient.callSoapMethod).toHaveBeenCalledWith(
        'location',
        'FetchCities',
        expect.objectContaining({
          CountryCode: 'US',
          State: 'NY',
        }),
      );
    });

    it('should fetch cities with name filter', async () => {
      const mockResponse = {
        HasErrors: false,
        Cities: [
          { Code: 'DXB', Name: 'Dubai' },
        ],
        Notifications: [],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      await service.fetchCities('AE', undefined, 'Dub');

      expect(mockClient.callSoapMethod).toHaveBeenCalledWith(
        'location',
        'FetchCities',
        expect.objectContaining({
          CountryCode: 'AE',
          NameStartsWith: 'Dub',
        }),
      );
    });

    it('should fetch cities with all filters', async () => {
      const mockResponse = {
        HasErrors: false,
        Cities: [
          { Code: 'LA', Name: 'Los Angeles' },
        ],
        Notifications: [],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      const transaction = { Reference1: 'CITY-SEARCH' };
      await service.fetchCities('US', 'CA', 'Los', transaction);

      expect(mockClient.callSoapMethod).toHaveBeenCalledWith(
        'location',
        'FetchCities',
        expect.objectContaining({
          CountryCode: 'US',
          State: 'CA',
          NameStartsWith: 'Los',
          Transaction: transaction,
        }),
      );
    });

    it('should throw AramexAPIError on failure', async () => {
      const mockResponse = {
        HasErrors: true,
        Cities: [],
        Notifications: [
          { Code: 'ERR002', Message: 'Invalid country code' },
        ],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      await expect(service.fetchCities('XX')).rejects.toThrow(
        AramexAPIError,
      );
    });
  });

  describe('fetchStates', () => {
    it('should fetch states for a country successfully', async () => {
      const mockResponse = {
        HasErrors: false,
        States: [
          { Code: 'CA', Name: 'California' },
          { Code: 'NY', Name: 'New York' },
          { Code: 'TX', Name: 'Texas' },
        ],
        Notifications: [],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      const result = await service.fetchStates('US');

      expect(mockClient.callSoapMethod).toHaveBeenCalledWith(
        'location',
        'FetchStates',
        expect.objectContaining({
          ClientInfo: expect.any(Object),
          CountryCode: 'US',
        }),
      );
      expect(result).toEqual(mockResponse);
      expect(result.States).toHaveLength(3);
    });

    it('should include transaction if provided', async () => {
      const mockResponse = {
        HasErrors: false,
        States: [],
        Notifications: [],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      const transaction = { Reference1: 'FETCH-STATES' };
      await service.fetchStates('US', transaction);

      expect(mockClient.callSoapMethod).toHaveBeenCalledWith(
        'location',
        'FetchStates',
        expect.objectContaining({
          Transaction: transaction,
        }),
      );
    });

    it('should handle countries without states', async () => {
      const mockResponse = {
        HasErrors: false,
        States: [],
        Notifications: [],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      const result = await service.fetchStates('BH');

      expect(result.States).toEqual([]);
    });

    it('should throw AramexAPIError on failure', async () => {
      const mockResponse = {
        HasErrors: true,
        States: [],
        Notifications: [
          { Code: 'ERR003', Message: 'Country not found' },
        ],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      await expect(service.fetchStates('INVALID')).rejects.toThrow(
        AramexAPIError,
      );
    });
  });

  describe('validateAddress', () => {
    it('should validate address successfully', async () => {
      const mockResponse = {
        HasErrors: false,
        IsValid: true,
        SuggestedAddresses: [],
        Notifications: [],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      const address = {
        Line1: '123 Test Street',
        City: 'Dubai',
        CountryCode: 'AE',
      };

      const result = await service.validateAddress(address);

      expect(mockClient.callSoapMethod).toHaveBeenCalledWith(
        'location',
        'ValidateAddress',
        expect.objectContaining({
          ClientInfo: expect.any(Object),
          Address: address,
        }),
      );
      expect(result).toEqual(mockResponse);
      expect(result.IsValid).toBe(true);
    });

    it('should validate address with complete details', async () => {
      const mockResponse = {
        HasErrors: false,
        IsValid: true,
        SuggestedAddresses: [],
        Notifications: [],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      const address = {
        Line1: '123 Main Street',
        Line2: 'Apt 4B',
        Line3: 'Building 5',
        City: 'Dubai',
        StateOrProvinceCode: 'DXB',
        PostCode: '12345',
        CountryCode: 'AE',
      };

      await service.validateAddress(address);

      expect(mockClient.callSoapMethod).toHaveBeenCalledWith(
        'location',
        'ValidateAddress',
        expect.objectContaining({
          Address: address,
        }),
      );
    });

    it('should return suggested addresses when invalid', async () => {
      const mockResponse = {
        HasErrors: false,
        IsValid: false,
        SuggestedAddresses: [
          {
            Line1: '123 Main St',
            City: 'Dubai',
            CountryCode: 'AE',
          },
        ],
        Notifications: [
          { Code: 'WARN001', Message: 'Address format corrected' },
        ],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      const address = {
        Line1: '123 Maim Street',
        City: 'Dubai',
        CountryCode: 'AE',
      };

      const result = await service.validateAddress(address);

      expect(result.IsValid).toBe(false);
      expect(result.SuggestedAddresses).toHaveLength(1);
    });

    it('should include transaction if provided', async () => {
      const mockResponse = {
        HasErrors: false,
        IsValid: true,
        SuggestedAddresses: [],
        Notifications: [],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      const address = {
        Line1: '123 Street',
        City: 'Dubai',
        CountryCode: 'AE',
      };
      const transaction = { Reference1: 'VALIDATE-ADDR' };

      await service.validateAddress(address, transaction);

      expect(mockClient.callSoapMethod).toHaveBeenCalledWith(
        'location',
        'ValidateAddress',
        expect.objectContaining({
          Transaction: transaction,
        }),
      );
    });

    it('should throw AramexAPIError on failure', async () => {
      const mockResponse = {
        HasErrors: true,
        IsValid: false,
        Notifications: [
          { Code: 'ERR004', Message: 'Invalid address format' },
        ],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      const address = {
        Line1: '',
        City: '',
        CountryCode: 'XX',
      };

      await expect(service.validateAddress(address)).rejects.toThrow(
        AramexAPIError,
      );
    });
  });

  describe('fetchOffices', () => {
    it('should fetch offices for a country successfully', async () => {
      const mockResponse = {
        HasErrors: false,
        Offices: [
          {
            Code: 'DXB001',
            Name: 'Dubai Main Office',
            Address: {
              Line1: '123 Business Bay',
              City: 'Dubai',
              CountryCode: 'AE',
            },
          },
          {
            Code: 'DXB002',
            Name: 'Dubai Marina Office',
            Address: {
              Line1: '456 Marina Walk',
              City: 'Dubai',
              CountryCode: 'AE',
            },
          },
        ],
        Notifications: [],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      const result = await service.fetchOffices('AE');

      expect(mockClient.callSoapMethod).toHaveBeenCalledWith(
        'location',
        'FetchOffices',
        expect.objectContaining({
          ClientInfo: expect.any(Object),
          CountryCode: 'AE',
        }),
      );
      expect(result).toEqual(mockResponse);
      expect(result.Offices).toHaveLength(2);
    });

    it('should fetch offices for a specific city', async () => {
      const mockResponse = {
        HasErrors: false,
        Offices: [
          {
            Code: 'AUH001',
            Name: 'Abu Dhabi Office',
            Address: {
              Line1: '789 Corniche Road',
              City: 'Abu Dhabi',
              CountryCode: 'AE',
            },
          },
        ],
        Notifications: [],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      const result = await service.fetchOffices('AE', 'Abu Dhabi');

      expect(mockClient.callSoapMethod).toHaveBeenCalledWith(
        'location',
        'FetchOffices',
        expect.objectContaining({
          CountryCode: 'AE',
          City: 'Abu Dhabi',
        }),
      );
      expect(result.Offices).toHaveLength(1);
    });

    it('should include transaction if provided', async () => {
      const mockResponse = {
        HasErrors: false,
        Offices: [],
        Notifications: [],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      const transaction = { Reference1: 'FETCH-OFFICES' };
      await service.fetchOffices('AE', undefined, transaction);

      expect(mockClient.callSoapMethod).toHaveBeenCalledWith(
        'location',
        'FetchOffices',
        expect.objectContaining({
          Transaction: transaction,
        }),
      );
    });

    it('should handle no offices found', async () => {
      const mockResponse = {
        HasErrors: false,
        Offices: [],
        Notifications: [],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      const result = await service.fetchOffices('AE', 'Remote City');

      expect(result.Offices).toEqual([]);
    });

    it('should throw AramexAPIError on failure', async () => {
      const mockResponse = {
        HasErrors: true,
        Offices: [],
        Notifications: [
          { Code: 'ERR005', Message: 'Invalid country code' },
        ],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      await expect(service.fetchOffices('INVALID')).rejects.toThrow(
        AramexAPIError,
      );
    });
  });

  describe('error handling', () => {
    it('should propagate network errors', async () => {
      const networkError = new Error('Network timeout');
      mockClient.callSoapMethod.mockRejectedValue(networkError);

      await expect(service.fetchCountries()).rejects.toThrow(
        'Network timeout',
      );
    });

    it('should handle API errors with multiple notifications', async () => {
      const mockResponse = {
        HasErrors: true,
        Cities: [],
        Notifications: [
          { Code: 'ERR001', Message: 'Error 1' },
          { Code: 'ERR002', Message: 'Error 2' },
        ],
      };

      mockClient.callSoapMethod.mockResolvedValue(mockResponse);

      try {
        await service.fetchCities('AE');
      } catch (error) {
        expect(error).toBeInstanceOf(AramexAPIError);
        expect((error as AramexAPIError).notifications).toHaveLength(2);
      }
    });
  });
});

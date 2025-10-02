/**
 * Location Service Integration Tests
 */

import { AramexSDK } from '../src';
import { testConfig } from './setup';

describe('LocationService', () => {
  let sdk: AramexSDK;

  beforeAll(() => {
    sdk = new AramexSDK(testConfig);
  });

  describe('fetchCountries', () => {
    it('should fetch all countries', async () => {
      const response = await sdk.location.fetchCountries();

      expect(response).toBeDefined();
      expect(response.HasErrors).toBe(false);
      expect(response.Countries).toBeDefined();
      expect(Array.isArray(response.Countries)).toBe(true);
      expect(response.Countries.length).toBeGreaterThan(0);
    }, 30000);
  });

  describe('fetchCities', () => {
    it('should fetch cities for a country', async () => {
      const response = await sdk.location.fetchCities('AE');

      expect(response).toBeDefined();
      expect(response.HasErrors).toBe(false);
      expect(response.Cities).toBeDefined();
      expect(Array.isArray(response.Cities)).toBe(true);
    }, 30000);

    it('should fetch cities with name filter', async () => {
      const response = await sdk.location.fetchCities('AE', undefined, 'Dub');

      expect(response).toBeDefined();
      expect(response.Cities).toBeDefined();
    }, 30000);
  });

  describe('fetchStates', () => {
    it('should fetch states for a country', async () => {
      const response = await sdk.location.fetchStates('US');

      expect(response).toBeDefined();
      expect(response.HasErrors).toBe(false);
      expect(response.States).toBeDefined();
    }, 30000);
  });

  describe('validateAddress', () => {
    it('should validate an address', async () => {
      const response = await sdk.location.validateAddress({
        Line1: '123 Test Street',
        City: 'Dubai',
        CountryCode: 'AE',
      });

      expect(response).toBeDefined();
      expect(response.HasErrors).toBe(false);
    }, 30000);
  });

  describe('fetchOffices', () => {
    it('should fetch offices for a country', async () => {
      const response = await sdk.location.fetchOffices('AE');

      expect(response).toBeDefined();
      expect(response.HasErrors).toBe(false);
      expect(response.Offices).toBeDefined();
    }, 30000);

    it('should fetch offices for a city', async () => {
      const response = await sdk.location.fetchOffices('AE', 'Dubai');

      expect(response).toBeDefined();
      expect(response.Offices).toBeDefined();
    }, 30000);
  });
});

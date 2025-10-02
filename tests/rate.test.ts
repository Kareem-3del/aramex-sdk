/**
 * Rate Service Integration Tests
 */

import { AramexSDK } from '../src';
import { testConfig } from './setup';

describe('RateService', () => {
  let sdk: AramexSDK;

  beforeAll(() => {
    sdk = new AramexSDK(testConfig);
  });

  describe('calculateRate', () => {
    it('should calculate rate for shipment', async () => {
      const response = await sdk.rate.calculateRate({
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
            Unit: 'KG',
            Value: 1.0,
          },
          ProductGroup: 'DOM',
          DescriptionOfGoods: 'Test Package',
          GoodsOriginCountry: 'AE',
        },
      });

      expect(response).toBeDefined();
      expect(response.HasErrors).toBe(false);
      expect(response.TotalAmount).toBeDefined();
    }, 30000);

    it('should calculate rate with preferred currency', async () => {
      const response = await sdk.rate.calculateRate({
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
            Unit: 'KG',
            Value: 1.0,
          },
          ProductGroup: 'DOM',
          DescriptionOfGoods: 'Test Package',
          GoodsOriginCountry: 'AE',
        },
        PreferredCurrencyCode: 'USD',
      });

      expect(response).toBeDefined();
      expect(response.TotalAmount?.CurrencyCode).toBe('USD');
    }, 30000);
  });

  describe('getQuote', () => {
    it('should get quote (alias for calculateRate)', async () => {
      const response = await sdk.rate.getQuote({
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
            Unit: 'KG',
            Value: 1.0,
          },
          ProductGroup: 'DOM',
          DescriptionOfGoods: 'Test Package',
          GoodsOriginCountry: 'AE',
        },
      });

      expect(response).toBeDefined();
    }, 30000);
  });
});

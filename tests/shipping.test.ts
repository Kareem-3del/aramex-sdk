/**
 * Shipping Service Integration Tests
 */

import { AramexSDK } from '../src';
import { testConfig, mockShipment, mockPickup } from './setup';

describe('ShippingService', () => {
  let sdk: AramexSDK;

  beforeAll(() => {
    sdk = new AramexSDK(testConfig);
  });

  describe('createShipment', () => {
    it('should create a shipment successfully', async () => {
      const response = await sdk.shipping.createShipment(mockShipment);

      expect(response).toBeDefined();
      expect(response.HasErrors).toBe(false);
      expect(response.Shipments).toBeDefined();
      expect(response.Shipments.length).toBeGreaterThan(0);
      expect(response.Shipments[0].ID).toBeDefined();
    }, 30000);

    it('should create shipment with label', async () => {
      const response = await sdk.shipping.createShipment(mockShipment, {
        ReportID: 9201,
        ReportType: 'URL',
      });

      expect(response.Shipments[0].ShipmentLabel).toBeDefined();
      expect(response.Shipments[0].ShipmentLabel?.LabelURL).toBeDefined();
    }, 30000);
  });

  describe('createPickup', () => {
    it('should create a pickup successfully', async () => {
      const response = await sdk.shipping.createPickup(mockPickup);

      expect(response).toBeDefined();
      expect(response.HasErrors).toBe(false);
      expect(response.ProcessedPickup).toBeDefined();
      expect(response.ProcessedPickup.ID).toBeDefined();
      expect(response.ProcessedPickup.GUID).toBeDefined();
    }, 30000);
  });

  describe('reserveShipmentNumberRange', () => {
    it('should reserve shipment number range', async () => {
      const response = await sdk.shipping.reserveShipmentNumberRange(
        testConfig.accountEntity,
        'DOM',
        10,
      );

      expect(response).toBeDefined();
      expect(response.HasErrors).toBe(false);
      expect(response.ShipmentRangeFrom).toBeDefined();
      expect(response.ShipmentRangeTo).toBeDefined();
    }, 30000);

    it('should throw error for invalid count', async () => {
      await expect(
        sdk.shipping.reserveShipmentNumberRange(
          testConfig.accountEntity,
          'DOM',
          10000,
        ),
      ).rejects.toThrow();
    });
  });

  describe('getLastShipmentsNumbersRange', () => {
    it('should get last shipments numbers range', async () => {
      const response = await sdk.shipping.getLastShipmentsNumbersRange(
        testConfig.accountEntity,
        'DOM',
      );

      expect(response).toBeDefined();
      expect(response.HasErrors).toBe(false);
    }, 30000);
  });
});

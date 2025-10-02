/**
 * Tracking Service Integration Tests
 */

import { AramexSDK } from '../src';
import { testConfig } from './setup';

describe.skip('TrackingService', () => {
  let sdk: AramexSDK;

  beforeAll(() => {
    sdk = new AramexSDK(testConfig);
  });

  describe('trackShipment', () => {
    it('should track a shipment', async () => {
      const response = await sdk.tracking.trackShipment('12345678');

      expect(response).toBeDefined();
      expect(response.TrackingResults).toBeDefined();
    }, 30000);

    it('should track multiple shipments', async () => {
      const response = await sdk.tracking.trackShipments([
        '12345678',
        '87654321',
      ]);

      expect(response).toBeDefined();
      expect(response.TrackingResults).toBeDefined();
      expect(Array.isArray(response.TrackingResults)).toBe(true);
    }, 30000);

    it('should get last tracking update only', async () => {
      const response = await sdk.tracking.trackShipment('12345678', true);

      expect(response).toBeDefined();
      expect(response.TrackingResults).toBeDefined();
    }, 30000);
  });

  describe('trackPickup', () => {
    it('should track a pickup', async () => {
      const response = await sdk.tracking.trackPickup('TEST-REF-001');

      expect(response).toBeDefined();
    }, 30000);
  });
});

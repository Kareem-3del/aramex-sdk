/**
 * Main Aramex SDK Class
 * Provides unified access to all Aramex services
 */

import { AramexClient } from './core/client';
import {
  ShippingService,
  TrackingService,
  RateService,
  LocationService,
} from './services';
import { AramexConfig } from './types';

export class AramexSDK {
  private readonly client: AramexClient;

  public readonly shipping: ShippingService;
  public readonly tracking: TrackingService;
  public readonly rate: RateService;
  public readonly location: LocationService;

  constructor(config: AramexConfig) {
    this.client = new AramexClient(config);

    this.shipping = new ShippingService(this.client);
    this.tracking = new TrackingService(this.client);
    this.rate = new RateService(this.client);
    this.location = new LocationService(this.client);
  }

  /**
   * Switch between test and production modes
   * @param testMode True for test mode, false for production
   */
  setTestMode(testMode: boolean): void {
    this.client.setTestMode(testMode);
  }

  /**
   * Get current configuration
   * @returns Current configuration (read-only)
   */
  getConfig(): Readonly<AramexConfig> {
    return this.client.getConfig();
  }

  /**
   * Get the underlying HTTP client
   * @returns AramexClient instance
   */
  getClient(): AramexClient {
    return this.client;
  }
}

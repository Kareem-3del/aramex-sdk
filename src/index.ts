/**
 * @kareem-3del/aramex-sdk - Complete Aramex API SDK for Node.js
 *
 * A comprehensive TypeScript SDK for Aramex shipping services including:
 * - Shipping API (create shipments, labels, pickups)
 * - Tracking API (track shipments and pickups)
 * - Rate Calculator API (calculate shipping rates)
 * - Location API (validate addresses, fetch locations)
 *
 * @example
 * ```typescript
 * import { AramexSDK } from '@kareem-3del/aramex-sdk';
 *
 * const aramex = new AramexSDK({
 *   username: 'your_username',
 *   password: 'your_password',
 *   accountNumber: 'your_account',
 *   accountPin: 'your_pin',
 *   accountEntity: 'your_entity',
 *   accountCountryCode: 'AE',
 *   testMode: true
 * });
 *
 * // Create a shipment
 * const result = await aramex.shipping.createShipment({
 *   Shipper: { ... },
 *   Consignee: { ... },
 *   Details: { ... }
 * });
 *
 * // Track a shipment
 * const tracking = await aramex.tracking.trackShipment('12345678');
 * ```
 */

// Main SDK
export { AramexSDK } from './aramex-sdk';

// Core
export * from './core';

// Services
export * from './services';

// Types
export * from './types';

// Helpers
export * from './helpers';

// Default export
export { AramexSDK as default } from './aramex-sdk';

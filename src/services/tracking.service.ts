/**
 * Tracking API Service
 * Provides shipment and pickup tracking operations
 */

import { AramexClient } from '../core/client';
import { AramexAPIError } from '../core/errors';
import {
  TrackPickupRequest,
  TrackPickupResponse,
  TrackShipmentsRequest,
  TrackShipmentsResponse,
  Transaction,
} from '../types';

export class TrackingService {
  constructor(private readonly client: AramexClient) {}

  /**
   * Track one or more shipments by waybill number
   * @param shipmentNumbers Array of waybill/tracking numbers
   * @param getLastTrackingUpdateOnly If true, returns only the last update
   * @param transaction Optional transaction tracking info
   * @returns TrackShipmentsResponse
   */
  async trackShipments(
    shipmentNumbers: string[],
    getLastTrackingUpdateOnly: boolean = false,
    transaction?: Transaction,
  ): Promise<TrackShipmentsResponse> {
    const request: TrackShipmentsRequest = {
      ClientInfo: this.client.getClientInfo(),
      Transaction: transaction,
      Shipments: shipmentNumbers,
      GetLastTrackingUpdateOnly: getLastTrackingUpdateOnly,
    };

    const response = await this.client.callSoapMethod<
      TrackShipmentsRequest,
      TrackShipmentsResponse
    >('tracking', 'TrackShipments', request);

    if (response.HasErrors) {
      throw new AramexAPIError(
        'Failed to track shipments',
        response.Notifications,
      );
    }

    return response;
  }

  /**
   * Track a single shipment by waybill number
   * @param shipmentNumber Waybill/tracking number
   * @param getLastTrackingUpdateOnly If true, returns only the last update
   * @param transaction Optional transaction tracking info
   * @returns TrackShipmentsResponse
   */
  async trackShipment(
    shipmentNumber: string,
    getLastTrackingUpdateOnly: boolean = false,
    transaction?: Transaction,
  ): Promise<TrackShipmentsResponse> {
    return this.trackShipments(
      [shipmentNumber],
      getLastTrackingUpdateOnly,
      transaction,
    );
  }

  /**
   * Track a pickup by reference number
   * @param reference Pickup reference number
   * @param transaction Optional transaction tracking info
   * @returns TrackPickupResponse
   */
  async trackPickup(
    reference: string,
    transaction?: Transaction,
  ): Promise<TrackPickupResponse> {
    const request: TrackPickupRequest = {
      ClientInfo: this.client.getClientInfo(),
      Transaction: transaction,
      Reference: reference,
    };

    const response = await this.client.callSoapMethod<
      TrackPickupRequest,
      TrackPickupResponse
    >('tracking', 'TrackPickup', request);

    if (response.HasErrors) {
      throw new AramexAPIError(
        'Failed to track pickup',
        response.Notifications,
      );
    }

    return response;
  }
}

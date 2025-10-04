/**
 * Shipping API Service
 * Provides all shipping-related operations
 */

import { AramexClient } from '../core/client';
import { AramexAPIError } from '../core/errors';
import {
  CancelPickupRequest,
  CancelPickupResponse,
  CreatePickupRequest,
  CreatePickupResponse,
  CreateShipmentsRequest,
  CreateShipmentsResponse,
  GetLastShipmentsNumbersRangeRequest,
  GetLastShipmentsNumbersRangeResponse,
  LabelInfo,
  Pickup,
  PrintLabelRequest,
  PrintLabelResponse,
  ProductGroup,
  ReserveShipmentNumberRangeRequest,
  ReserveShipmentNumberRangeResponse,
  ScheduleDeliveryRequest,
  ScheduleDeliveryResponse,
  Shipment,
  Transaction,
} from '../types';

export class ShippingService {
  constructor(private readonly client: AramexClient) {}

  /**
   * Create one or more shipments
   * @param shipments Array of shipments to create
   * @param labelInfo Optional label configuration
   * @param transaction Optional transaction tracking info
   * @returns CreateShipmentsResponse
   */
  async createShipments(
    shipments: Shipment[],
    labelInfo?: LabelInfo,
    transaction?: Transaction,
  ): Promise<CreateShipmentsResponse> {
    const request: CreateShipmentsRequest = {
      ClientInfo: this.client.getClientInfo(),
      Transaction: transaction,
      Shipments: { Shipment: shipments },  // Fixed: Wrap array with proper element name
      LabelInfo: labelInfo,
    };

    const response = await this.client.callSoapMethod<
      CreateShipmentsRequest,
      CreateShipmentsResponse
    >('shipping', 'CreateShipments', request);

    if (response.HasErrors) {
      throw new AramexAPIError(
        'Failed to create shipments',
        response.Notifications,
      );
    }

    return response;
  }

  /**
   * Create a single shipment
   * @param shipment Shipment to create
   * @param labelInfo Optional label configuration
   * @param transaction Optional transaction tracking info
   * @returns CreateShipmentsResponse
   */
  async createShipment(
    shipment: Shipment,
    labelInfo?: LabelInfo,
    transaction?: Transaction,
  ): Promise<CreateShipmentsResponse> {
    return this.createShipments([shipment], labelInfo, transaction);
  }

  /**
   * Print label for an existing shipment
   * @param shipmentNumber Shipment tracking number
   * @param productGroup Optional product group (required if duplicate numbers exist)
   * @param originEntity Optional origin entity (required if duplicate numbers exist)
   * @param labelInfo Label configuration
   * @param transaction Optional transaction tracking info
   * @returns PrintLabelResponse
   */
  async printLabel(
    shipmentNumber: string,
    productGroup?: ProductGroup,
    originEntity?: string,
    labelInfo?: LabelInfo,
    transaction?: Transaction,
  ): Promise<PrintLabelResponse> {
    const request: PrintLabelRequest = {
      ClientInfo: this.client.getClientInfo(),
      Transaction: transaction,
      ShipmentNumber: shipmentNumber,
      ProductGroup: productGroup,
      OriginEntity: originEntity,
      LabelInfo: labelInfo || {
        ReportID: 9201,
        ReportType: 'URL',
      },
    };

    const response = await this.client.callSoapMethod<
      PrintLabelRequest,
      PrintLabelResponse
    >('shipping', 'PrintLabel', request);

    if (response.HasErrors) {
      throw new AramexAPIError('Failed to print label', response.Notifications);
    }

    return response;
  }

  /**
   * Create a pickup request
   * @param pickup Pickup details
   * @param labelInfo Optional label configuration
   * @param transaction Optional transaction tracking info
   * @returns CreatePickupResponse
   */
  async createPickup(
    pickup: Pickup,
    labelInfo?: LabelInfo,
    transaction?: Transaction,
  ): Promise<CreatePickupResponse> {
    const request: CreatePickupRequest = {
      ClientInfo: this.client.getClientInfo(),
      Transaction: transaction,
      Pickup: pickup,
      LabelInfo: labelInfo,
    };

    const response = await this.client.callSoapMethod<
      CreatePickupRequest,
      CreatePickupResponse
    >('shipping', 'CreatePickup', request);

    if (response.HasErrors) {
      throw new AramexAPIError('Failed to create pickup', response.Notifications);
    }

    return response;
  }

  /**
   * Cancel an existing pickup
   * @param pickupGUID Pickup GUID from create pickup response
   * @param comments Optional cancellation comments
   * @param transaction Optional transaction tracking info
   * @returns CancelPickupResponse
   */
  async cancelPickup(
    pickupGUID: string,
    comments?: string,
    transaction?: Transaction,
  ): Promise<CancelPickupResponse> {
    const request: CancelPickupRequest = {
      ClientInfo: this.client.getClientInfo(),
      Transaction: transaction,
      PickupGUID: pickupGUID,
      Comments: comments,
    };

    const response = await this.client.callSoapMethod<
      CancelPickupRequest,
      CancelPickupResponse
    >('shipping', 'CancelPickup', request);

    if (response.HasErrors) {
      throw new AramexAPIError('Failed to cancel pickup', response.Notifications);
    }

    return response;
  }

  /**
   * Reserve a range of shipment numbers
   * @param entity Entity code
   * @param productGroup Product group (EXP or DOM)
   * @param count Number of shipment numbers to reserve (1-5000)
   * @param transaction Optional transaction tracking info
   * @returns ReserveShipmentNumberRangeResponse
   */
  async reserveShipmentNumberRange(
    entity: string,
    productGroup: ProductGroup,
    count: number,
    transaction?: Transaction,
  ): Promise<ReserveShipmentNumberRangeResponse> {
    if (count < 1 || count > 5000) {
      throw new Error('Count must be between 1 and 5000');
    }

    const request: ReserveShipmentNumberRangeRequest = {
      ClientInfo: this.client.getClientInfo(),
      Transaction: transaction,
      Entity: entity,
      ProductGroup: productGroup,
      Count: count,
    };

    const response = await this.client.callSoapMethod<
      ReserveShipmentNumberRangeRequest,
      ReserveShipmentNumberRangeResponse
    >('shipping', 'ReserveShipmentNumberRange', request);

    if (response.HasErrors) {
      throw new AramexAPIError(
        'Failed to reserve shipment number range',
        response.Notifications,
      );
    }

    return response;
  }

  /**
   * Get the last reserved shipment number range
   * @param entity Entity code
   * @param productGroup Product group (EXP or DOM)
   * @param transaction Optional transaction tracking info
   * @returns GetLastShipmentsNumbersRangeResponse
   */
  async getLastShipmentsNumbersRange(
    entity: string,
    productGroup: ProductGroup,
    transaction?: Transaction,
  ): Promise<GetLastShipmentsNumbersRangeResponse> {
    const request: GetLastShipmentsNumbersRangeRequest = {
      ClientInfo: this.client.getClientInfo(),
      Transaction: transaction,
      Entity: entity,
      ProductGroup: productGroup,
    };

    const response = await this.client.callSoapMethod<
      GetLastShipmentsNumbersRangeRequest,
      GetLastShipmentsNumbersRangeResponse
    >('shipping', 'GetLastShipmentsNumbersRange', request);

    if (response.HasErrors) {
      throw new AramexAPIError(
        'Failed to get last shipment numbers range',
        response.Notifications,
      );
    }

    return response;
  }

  /**
   * Schedule a delivery at specific time and location
   * @param request Schedule delivery request
   * @returns ScheduleDeliveryResponse
   */
  async scheduleDelivery(
    request: Omit<ScheduleDeliveryRequest, 'ClientInfo'>,
  ): Promise<ScheduleDeliveryResponse> {
    const fullRequest: ScheduleDeliveryRequest = {
      ClientInfo: this.client.getClientInfo(),
      ...request,
    };

    const response = await this.client.callSoapMethod<
      ScheduleDeliveryRequest,
      ScheduleDeliveryResponse
    >('shipping', 'ScheduleDelivery', fullRequest);

    if (response.HasErrors) {
      throw new AramexAPIError(
        'Failed to schedule delivery',
        response.Notifications,
      );
    }

    return response;
  }
}

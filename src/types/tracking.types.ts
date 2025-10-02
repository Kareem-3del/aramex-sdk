/**
 * Tracking API types
 */

import { BaseResponse, ClientInfo, Notification, Transaction } from './common.types';

export interface TrackingResult {
  WaybillNumber: string;
  UpdateCode: string;
  UpdateDescription: string;
  UpdateDateTime: string;
  UpdateLocation: string;
  Comments?: string;
  ProblemCode?: string;
  GrossWeight?: number;
  ChargeableWeight?: number;
  WeightUnit?: string;
  ShipmentForeignHAWB?: string;
}

export interface ShipmentTrackingResult {
  WaybillNumber: string;
  HasErrors: boolean;
  Notifications: Notification[];
  UpdateDateTime?: string;
  UpdateLocation?: string;
  UpdateDescription?: string;
}

export interface TrackShipmentsRequest {
  ClientInfo: ClientInfo;
  Transaction?: Transaction;
  Shipments: string[]; // Array of tracking numbers
  GetLastTrackingUpdateOnly?: boolean;
}

export interface TrackShipmentsResponse extends BaseResponse {
  TrackingResults: ShipmentTrackingResult[];
  NonExistingWaybills?: string[];
}

export interface TrackPickupRequest {
  ClientInfo: ClientInfo;
  Transaction?: Transaction;
  Reference: string;
}

export interface PickupTrackingResult {
  PickupID: string;
  Reference: string;
  Status: string;
  UpdateDateTime: string;
  Comments?: string;
}

export interface TrackPickupResponse extends BaseResponse {
  PickupTracking: PickupTrackingResult;
}

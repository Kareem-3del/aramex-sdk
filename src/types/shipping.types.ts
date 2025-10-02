/**
 * Shipping API types
 */

import {
  Address,
  BaseResponse,
  ClientInfo,
  Contact,
  Dimensions,
  Money,
  Notification,
  Party,
  PaymentOption,
  PaymentType,
  PickupStatus,
  ProductGroup,
  ProductType,
  ReportType,
  ServiceCode,
  Transaction,
  Volume,
  Weight,
} from './common.types';

// Shipment Types
export interface ShipmentItem {
  PackageType?: string;
  Quantity?: number;
  Weight?: Weight;
  Comments?: string;
  Reference?: string;
}

export interface Attachment {
  FileName: string;
  FileExtension: string;
  FileContents: string; // Base64 encoded
}

export interface ShipmentDetails {
  Dimensions?: Dimensions;
  ActualWeight: Weight;
  ChargeableWeight?: Weight;
  DescriptionOfGoods: string;
  GoodsOriginCountry: string;
  NumberOfPieces: number;
  ProductGroup: ProductGroup;
  ProductType: ProductType;
  PaymentType: PaymentType;
  PaymentOptions?: PaymentOption;
  Services?: string; // Comma-separated ServiceCode values
  Items?: ShipmentItem[];
  CustomsValueAmount?: Money;
  CashOnDeliveryAmount?: Money;
  InsuranceAmount?: Money;
  CashAdditionalAmount?: Money;
  CashAdditionalAmountDescription?: string;
  CollectAmount?: Money;
}

export interface Shipment {
  Reference1?: string;
  Reference2?: string;
  Reference3?: string;
  Shipper: Party;
  Consignee: Party;
  ThirdParty?: Party;
  ShippingDateTime: string; // ISO 8601 format
  DueDate?: string; // ISO 8601 format
  Comments?: string;
  PickupLocation?: string;
  OperationsInstructions?: string;
  AccountingInstructions?: string;
  Details: ShipmentDetails;
  Attachments?: Attachment[];
  ForeignHAWB?: string;
  TransportType?: 0 | 1;
  PickupGUID?: string;
  Number?: string;
}

export interface LabelInfo {
  ReportID: number;
  ReportType: ReportType;
}

export interface ShipmentLabel {
  LabelURL?: string;
  LabelFileContents?: string;
}

export interface ProcessedShipment {
  ID: string;
  Reference1?: string;
  Reference2?: string;
  Reference3?: string;
  ForeignHAWB?: string;
  HasErrors: boolean;
  Notifications: Notification[];
  ShipmentLabel?: ShipmentLabel;
  ShipmentDetails?: ShipmentDetails;
}

// Request/Response Types
export interface CreateShipmentsRequest {
  ClientInfo: ClientInfo;
  Transaction?: Transaction;
  Shipments: Shipment[];
  LabelInfo?: LabelInfo;
}

export interface CreateShipmentsResponse extends BaseResponse {
  Shipments: ProcessedShipment[];
}

export interface PrintLabelRequest {
  ClientInfo: ClientInfo;
  Transaction?: Transaction;
  ShipmentNumber: string;
  ProductGroup?: ProductGroup;
  OriginEntity?: string;
  LabelInfo: LabelInfo;
}

export interface PrintLabelResponse extends BaseResponse {
  ShipmentNumber: string;
  ShipmentLabel?: ShipmentLabel;
}

// Pickup Types
export interface PickupItem {
  ProductGroup: ProductGroup;
  ProductType?: ProductType;
  NumberOfShipments: number;
  PackageType?: string;
  Payment: PaymentType;
  ShipmentWeight: Weight;
  ShipmentVolume?: Volume;
  NumberOfPieces: number;
  CashAmount?: Money;
  ExtraCharges?: Money;
  ShipmentDimensions?: Dimensions;
  Comments?: string;
}

export interface Pickup {
  PickupAddress: Address;
  PickupContact: Contact;
  PickupLocation: string;
  PickupDate: string; // ISO 8601 format
  ReadyTime: string; // HH:mm format
  LastPickupTime: string; // HH:mm format
  ClosingTime: string; // HH:mm format
  Comments?: string;
  Reference1: string;
  Reference2?: string;
  Vehicle?: string;
  Shipments?: Shipment[];
  PickupItems: PickupItem[];
  Status: PickupStatus;
}

export interface ProcessedPickup {
  ID: string;
  GUID: string;
  Reference1?: string;
  Reference2?: string;
  ProcessedShipments?: ProcessedShipment[];
  HasErrors: boolean;
  Notifications: Notification[];
}

export interface CreatePickupRequest {
  ClientInfo: ClientInfo;
  Transaction?: Transaction;
  Pickup: Pickup;
  LabelInfo?: LabelInfo;
}

export interface CreatePickupResponse extends BaseResponse {
  ProcessedPickup: ProcessedPickup;
}

export interface CancelPickupRequest {
  ClientInfo: ClientInfo;
  Transaction?: Transaction;
  PickupGUID: string;
  Comments?: string;
}

export interface CancelPickupResponse extends BaseResponse {
  PickupGUID: string;
}

// Shipment Number Range Types
export interface ReserveShipmentNumberRangeRequest {
  ClientInfo: ClientInfo;
  Transaction?: Transaction;
  Entity: string;
  ProductGroup: ProductGroup;
  Count: number;
}

export interface ReserveShipmentNumberRangeResponse extends BaseResponse {
  ShipmentRangeFrom?: string;
  ShipmentRangeTo?: string;
}

export interface GetLastShipmentsNumbersRangeRequest {
  ClientInfo: ClientInfo;
  Transaction?: Transaction;
  Entity: string;
  ProductGroup: ProductGroup;
}

export interface GetLastShipmentsNumbersRangeResponse extends BaseResponse {
  ShipmentRangeFrom?: string;
  ShipmentRangeTo?: string;
}

// Schedule Delivery Types
export interface ScheduleDeliveryRequest {
  ClientInfo: ClientInfo;
  Transaction?: Transaction;
  ShipmentNumber: string;
  ProductGroup: ProductGroup;
  Entity: string;
  Address: Address;
  ConsigneePhone: string;
  ShipperNumber: string;
  ShipperReference?: string;
  Reference1?: string;
  Reference2?: string;
  Reference3?: string;
}

export interface ScheduleDeliveryResponse extends BaseResponse {
  ID?: string;
}

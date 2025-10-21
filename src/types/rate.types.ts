/**
 * Rate Calculator API types
 * Field order must match WSDL specification exactly
 */

import {
  Address,
  BaseResponse,
  ClientInfo,
  Dimensions,
  Money,
  ProductGroup,
  ProductType,
  Transaction,
  Weight,
} from './common.types';

/**
 * Shipment details for rate calculation
 * CRITICAL: Field order must match WSDL (Dimensions first!)
 */
export interface ShipmentDetailsForRate {
  readonly Dimensions?: Dimensions;
  readonly ActualWeight: Weight;
  readonly ChargeableWeight?: Weight;
  readonly DescriptionOfGoods?: string;
  readonly GoodsOriginCountry?: string;
  readonly NumberOfPieces: number;
  readonly ProductGroup: ProductGroup;
  readonly ProductType?: ProductType;
  readonly PaymentType?: string;
  readonly PaymentOptions?: string;
  readonly CustomsValueAmount?: Money;
  readonly CashOnDeliveryAmount?: Money;
  readonly InsuranceAmount?: Money;
  readonly CashAdditionalAmount?: Money;
  readonly CollectAmount?: Money;
  readonly Services?: string;
  readonly Items?: any;
}

export interface ShipmentForRate {
  readonly OriginAddress: Address;
  readonly DestinationAddress: Address;
  readonly ShipmentDetails: ShipmentDetailsForRate;
  readonly PreferredCurrencyCode?: string;
}

export interface RateLineItem {
  ChargeType: string;
  ChargeName: string;
  ChargeAmount: Money;
}

export interface RateDetails {
  TotalAmount: Money;
  RateLineItems: RateLineItem[];
  WeightCharged: Weight;
}

/**
 * Rate calculation request
 * Field order matches WSDL: ClientInfo, Transaction, OriginAddress, DestinationAddress, ShipmentDetails
 */
export interface CalculateRateRequest {
  readonly ClientInfo: ClientInfo;
  readonly Transaction?: Transaction;
  readonly OriginAddress: Address;
  readonly DestinationAddress: Address;
  readonly ShipmentDetails: ShipmentDetailsForRate;
  readonly PreferredCurrencyCode?: string;
}

export interface CalculateRateResponse extends BaseResponse {
  TotalAmount?: Money;
  RateDetails?: RateDetails;
}

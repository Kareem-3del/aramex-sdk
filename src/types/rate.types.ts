/**
 * Rate Calculator API types
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

export interface ShipmentForRate {
  OriginAddress: Address;
  DestinationAddress: Address;
  ShipmentDetails: {
    Dimensions?: Dimensions;
    ActualWeight: Weight;
    NumberOfPieces: number;
    ProductGroup: ProductGroup;
    ProductType?: ProductType;
    ChargeableWeight?: Weight;
    DescriptionOfGoods?: string;
    GoodsOriginCountry?: string;
  };
  PreferredCurrencyCode?: string;
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

export interface CalculateRateRequest {
  ClientInfo: ClientInfo;
  Transaction?: Transaction;
  OriginAddress: Address;
  DestinationAddress: Address;
  ShipmentDetails: ShipmentForRate['ShipmentDetails'];
  PreferredCurrencyCode?: string;
}

export interface CalculateRateResponse extends BaseResponse {
  TotalAmount?: Money;
  RateDetails?: RateDetails;
}

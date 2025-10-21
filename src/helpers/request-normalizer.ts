/**
 * Request normalizer to ensure SOAP field ordering matches WSDL requirements
 */

import { Address, ShipmentForRate } from '../types';

/**
 * Normalize Address to match WSDL field order
 * Order: Line1, Line2, Line3, City, StateOrProvinceCode, PostCode, CountryCode
 */
export function normalizeAddress(address: Address): Address {
  return {
    Line1: address.Line1,
    Line2: address.Line2 || '',
    Line3: address.Line3 || '',
    City: address.City || '',
    StateOrProvinceCode: address.StateOrProvinceCode || '',
    PostCode: address.PostCode || '',
    CountryCode: address.CountryCode,
  };
}

/**
 * Normalize ShipmentDetails for rate calculation to match WSDL field order
 * Order: Dimensions, ActualWeight, ChargeableWeight, DescriptionOfGoods,
 *        GoodsOriginCountry, NumberOfPieces, ProductGroup, ProductType,
 *        PaymentType, PaymentOptions, CustomsValueAmount, CashOnDeliveryAmount,
 *        InsuranceAmount, CashAdditionalAmount, CollectAmount, Services, Items
 */
export function normalizeShipmentForRate(shipment: any): any {
  const normalized: any = {};

  // Dimensions MUST come first (even if null)
  normalized.Dimensions = shipment.Dimensions || null;

  // ActualWeight
  normalized.ActualWeight = shipment.ActualWeight;

  // ChargeableWeight
  if (shipment.ChargeableWeight) {
    normalized.ChargeableWeight = shipment.ChargeableWeight;
  } else {
    normalized.ChargeableWeight = null;
  }

  // DescriptionOfGoods
  normalized.DescriptionOfGoods = shipment.DescriptionOfGoods || '';

  // GoodsOriginCountry
  normalized.GoodsOriginCountry = shipment.GoodsOriginCountry || '';

  // NumberOfPieces (required field)
  normalized.NumberOfPieces = shipment.NumberOfPieces;

  // ProductGroup
  normalized.ProductGroup = shipment.ProductGroup;

  // ProductType
  normalized.ProductType = shipment.ProductType || null;

  // PaymentType
  normalized.PaymentType = shipment.PaymentType || null;

  // PaymentOptions
  normalized.PaymentOptions = shipment.PaymentOptions || null;

  // Optional Money fields
  if (shipment.CustomsValueAmount) {
    normalized.CustomsValueAmount = shipment.CustomsValueAmount;
  }

  if (shipment.CashOnDeliveryAmount) {
    normalized.CashOnDeliveryAmount = shipment.CashOnDeliveryAmount;
  }

  if (shipment.InsuranceAmount) {
    normalized.InsuranceAmount = shipment.InsuranceAmount;
  }

  if (shipment.CashAdditionalAmount) {
    normalized.CashAdditionalAmount = shipment.CashAdditionalAmount;
  }

  if (shipment.CollectAmount) {
    normalized.CollectAmount = shipment.CollectAmount;
  }

  if (shipment.Services) {
    normalized.Services = shipment.Services;
  }

  if (shipment.Items) {
    normalized.Items = shipment.Items;
  }

  return normalized;
}

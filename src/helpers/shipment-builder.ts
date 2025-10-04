/**
 * Shipment Builder - Helper to create shipments with all required fields
 */

import { Shipment, Contact, Address } from '../types';

export interface SimpleAddress {
  line1: string;
  line2?: string;
  city: string;
  country: string;
  postcode?: string;
  state?: string;
}

export interface SimpleContact {
  name: string;
  company?: string;
  phone: string;
  mobile?: string;
  email?: string;
}

export interface SimpleShipmentData {
  reference: string;

  // Shipper
  shipperAddress: SimpleAddress;
  shipperContact: SimpleContact;
  shipperAccountNumber: string;

  // Consignee
  consigneeAddress: SimpleAddress;
  consigneeContact: SimpleContact;

  // Shipment details
  weight: number;
  numberOfPieces?: number;
  description: string;

  // Optional
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  isDomestic?: boolean;
  codAmount?: number;
  currency?: string;
}

/**
 * Build a complete Contact object with all required fields
 */
function buildContact(simple: SimpleContact, type: 'Supplier' | 'Recipient'): Contact {
  return {
    Department: '',
    PersonName: simple.name,
    Title: '',
    CompanyName: simple.company || simple.name, // Use name if no company provided
    PhoneNumber1: simple.phone,
    PhoneNumber1Ext: '',
    PhoneNumber2: '',  // Required even if empty
    PhoneNumber2Ext: '',
    FaxNumber: '',
    CellPhone: simple.mobile || simple.phone,  // Use phone if mobile not provided
    EmailAddress: simple.email || '',
    Type: type,  // Required
  };
}

/**
 * Build a complete Address object with all required fields
 */
function buildAddress(simple: SimpleAddress): Address {
  return {
    Line1: simple.line1,
    Line2: simple.line2 || '',
    Line3: '',
    City: simple.city,
    StateOrProvinceCode: simple.state || '',
    PostCode: simple.postcode || '',
    CountryCode: simple.country,
  };
}

/**
 * Build a complete Shipment object from simplified data
 */
export function buildShipment(data: SimpleShipmentData): Shipment {
  const isDomestic = data.isDomestic !== false; // Default to domestic

  return {
    Reference1: data.reference,
    Reference2: '',
    Reference3: '',

    Shipper: {
      Reference1: '',
      Reference2: '',
      AccountNumber: data.shipperAccountNumber,
      PartyAddress: buildAddress(data.shipperAddress),
      Contact: buildContact(data.shipperContact, 'Supplier'),
    },

    Consignee: {
      Reference1: '',
      Reference2: '',
      AccountNumber: '',
      PartyAddress: buildAddress(data.consigneeAddress),
      Contact: buildContact(data.consigneeContact, 'Recipient'),
    },

    ShippingDateTime: new Date().toISOString(),

    Details: {
      Dimensions: data.dimensions ? {
        Length: data.dimensions.length,
        Width: data.dimensions.width,
        Height: data.dimensions.height,
        Unit: 'CM',
      } : {
        Length: 0,
        Width: 0,
        Height: 0,
        Unit: 'CM',
      },
      ActualWeight: {
        Unit: 'KG',
        Value: data.weight,
      },
      ChargeableWeight: {
        Unit: 'KG',
        Value: data.weight,
      },
      DescriptionOfGoods: data.description,
      GoodsOriginCountry: data.shipperAddress.country,
      NumberOfPieces: data.numberOfPieces || 1,
      ProductGroup: isDomestic ? 'DOM' : 'EXP',
      ProductType: isDomestic ? 'OND' : 'PPX',
      PaymentType: 'P',
      PaymentOptions: 'CASH',  // Default payment option
      CashOnDeliveryAmount: data.codAmount ? {
        CurrencyCode: data.currency || 'BHD',
        Value: data.codAmount,
      } : undefined,
    },
  };
}

/**
 * Quick builder for domestic shipments
 */
export function buildDomesticShipment(params: {
  reference: string;
  accountNumber: string;

  // Shipper
  fromName: string;
  fromCompany?: string;
  fromAddress: string;
  fromCity: string;
  fromPhone: string;
  fromEmail?: string;

  // Consignee
  toName: string;
  toCompany?: string;
  toAddress: string;
  toCity: string;
  toPhone: string;
  toEmail?: string;

  // Shipment
  weight: number;
  description: string;
  codAmount?: number;
}): Shipment {
  return buildShipment({
    reference: params.reference,
    shipperAccountNumber: params.accountNumber,

    shipperAddress: {
      line1: params.fromAddress,
      city: params.fromCity,
      country: 'BH',
    },
    shipperContact: {
      name: params.fromName,
      company: params.fromCompany,
      phone: params.fromPhone,
      email: params.fromEmail,
    },

    consigneeAddress: {
      line1: params.toAddress,
      city: params.toCity,
      country: 'BH',
    },
    consigneeContact: {
      name: params.toName,
      company: params.toCompany,
      phone: params.toPhone,
      email: params.toEmail,
    },

    weight: params.weight,
    description: params.description,
    codAmount: params.codAmount,
    isDomestic: true,
  });
}

/**
 * Common types used across all Aramex APIs
 */

export interface AramexConfig {
  readonly username: string;
  readonly password: string;
  readonly accountNumber: string;
  readonly accountPin: string;
  readonly accountEntity: string;
  readonly accountCountryCode: string;
  readonly version?: string;
  readonly source?: number;
  readonly baseURL?: string;
  readonly testMode?: boolean;
  readonly timeout?: number; // Request timeout in milliseconds (default: 30000)
}

export interface ClientInfo {
  UserName: string;
  Password: string;
  Version: string;
  AccountNumber: string;
  AccountPin: string;
  AccountEntity: string;
  AccountCountryCode: string;
  Source: number;
}

export interface Transaction {
  Reference1?: string;
  Reference2?: string;
  Reference3?: string;
  Reference4?: string;
  Reference5?: string;
}

export interface Address {
  Line1: string;
  Line2?: string;
  Line3?: string;
  City?: string;
  StateOrProvinceCode?: string;
  PostCode?: string;
  CountryCode: string;
  Longitude?: number;
  Latitude?: number;
}

export interface Contact {
  Department?: string;
  PersonName: string;
  Title?: string;
  CompanyName: string;
  PhoneNumber1: string;
  PhoneNumber1Ext?: string;
  PhoneNumber2?: string;
  PhoneNumber2Ext?: string;
  FaxNumber?: string;
  CellPhone: string;
  EmailAddress: string;
  Type?: string;
}

export interface Party {
  Reference1?: string;
  Reference2?: string;
  AccountNumber?: string;
  PartyAddress: Address;
  Contact: Contact;
}

/**
 * Weight must have Unit before Value (per WSDL)
 */
export interface Weight {
  readonly Unit: 'KG' | 'LB';
  readonly Value: number;
}

/**
 * Dimensions with strict field order
 */
export interface Dimensions {
  readonly Length: number;
  readonly Width: number;
  readonly Height: number;
  readonly Unit: 'CM' | 'M';
}

export interface Volume {
  readonly Unit: 'Cm3' | 'Inch3';
  readonly Value: number;
}

/**
 * Money must have CurrencyCode before Value (per WSDL)
 */
export interface Money {
  readonly CurrencyCode: string;
  readonly Value: number;
}

export interface Notification {
  Code: string;
  Message: string;
}

export interface BaseResponse {
  Transaction?: Transaction;
  Notifications: Notification[];
  HasErrors: boolean;
}

export type ProductGroup = 'EXP' | 'DOM';

export type ProductType =
  | 'PDX'  // Priority Document Express
  | 'PPX'  // Priority Parcel Express
  | 'PLX'  // Priority Letter Express
  | 'DDX'  // Deferred Document Express
  | 'DPX'  // Deferred Parcel Express
  | 'GDX'  // Ground Document Express
  | 'GPX'  // Ground Parcel Express
  | 'EPX'  // Economy Parcel Express
  | 'OND'; // Domestic

export type PaymentType = 'P' | 'C' | '3';

export type PaymentOption =
  | 'CASH'
  | 'ACCT'
  | 'PPST'
  | 'CRDT'
  | 'ASCC'
  | 'ARCC';

export type ServiceCode =
  | 'CODS'  // Cash on Delivery
  | 'FIRST' // First Delivery
  | 'FRDM'  // Free Domicile
  | 'HFPU'  // Hold for Pickup
  | 'NOON'  // Noon Delivery
  | 'SIG';  // Signature Required

export type ReportType = 'URL' | 'RPT';

export type PickupStatus = 'Ready' | 'Pending';

/**
 * Common types used across all Aramex APIs
 */

export interface AramexConfig {
  username: string;
  password: string;
  accountNumber: string;
  accountPin: string;
  accountEntity: string;
  accountCountryCode: string;
  version?: string;
  source?: number;
  baseURL?: string;
  testMode?: boolean;
  timeout?: number; // Request timeout in milliseconds (default: 30000)
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

export interface Weight {
  Unit: 'KG' | 'LB';
  Value: number;
}

export interface Dimensions {
  Length: number;
  Width: number;
  Height: number;
  Unit: 'CM' | 'M';
}

export interface Volume {
  Unit: 'Cm3' | 'Inch3';
  Value: number;
}

export interface Money {
  CurrencyCode: string;
  Value: number;
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

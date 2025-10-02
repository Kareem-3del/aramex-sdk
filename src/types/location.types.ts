/**
 * Location/Address API types
 */

import { Address, BaseResponse, ClientInfo, Transaction } from './common.types';

export interface Country {
  Code: string;
  Name: string;
}

export interface City {
  Code?: string;
  Name: string;
  PostCode?: string;
}

export interface State {
  Code: string;
  Name: string;
}

export interface FetchCountriesRequest {
  ClientInfo: ClientInfo;
  Transaction?: Transaction;
}

export interface FetchCountriesResponse extends BaseResponse {
  Countries: Country[];
}

export interface FetchCitiesRequest {
  ClientInfo: ClientInfo;
  Transaction?: Transaction;
  CountryCode: string;
  State?: string;
  NameStartsWith?: string;
}

export interface FetchCitiesResponse extends BaseResponse {
  Cities: City[];
}

export interface FetchStatesRequest {
  ClientInfo: ClientInfo;
  Transaction?: Transaction;
  CountryCode: string;
}

export interface FetchStatesResponse extends BaseResponse {
  States: State[];
}

export interface ValidateAddressRequest {
  ClientInfo: ClientInfo;
  Transaction?: Transaction;
  Address: Address;
}

export interface ValidateAddressResponse extends BaseResponse {
  IsValid: boolean;
  SuggestedAddresses?: Address[];
}

export interface Office {
  Entity: string;
  OfficeType: string;
  Location: {
    Address: Address;
    Longitude?: number;
    Latitude?: number;
  };
  WorkingDays?: string;
  WorkingHours?: string;
  Phone?: string;
}

export interface FetchOfficesRequest {
  ClientInfo: ClientInfo;
  Transaction?: Transaction;
  CountryCode: string;
  City?: string;
}

export interface FetchOfficesResponse extends BaseResponse {
  Offices: Office[];
}

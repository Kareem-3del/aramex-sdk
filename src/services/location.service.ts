/**
 * Location API Service
 * Provides location, address validation, and office lookup operations
 */

import { AramexClient } from '../core/client';
import { AramexAPIError } from '../core/errors';
import {
  FetchCitiesRequest,
  FetchCitiesResponse,
  FetchCountriesRequest,
  FetchCountriesResponse,
  FetchOfficesRequest,
  FetchOfficesResponse,
  FetchStatesRequest,
  FetchStatesResponse,
  Transaction,
  ValidateAddressRequest,
  ValidateAddressResponse,
  Address,
} from '../types';

export class LocationService {
  constructor(private readonly client: AramexClient) {}

  /**
   * Fetch all available countries
   * @param transaction Optional transaction tracking info
   * @returns FetchCountriesResponse
   */
  async fetchCountries(
    transaction?: Transaction,
  ): Promise<FetchCountriesResponse> {
    const request: FetchCountriesRequest = {
      ClientInfo: this.client.getClientInfo(),
      Transaction: transaction,
    };

    const response = await this.client.callSoapMethod<
      FetchCountriesRequest,
      FetchCountriesResponse
    >('location', 'FetchCountries', request);

    if (response.HasErrors) {
      throw new AramexAPIError(
        'Failed to fetch countries',
        response.Notifications,
      );
    }

    return response;
  }

  /**
   * Fetch cities for a specific country
   * @param countryCode ISO country code
   * @param state Optional state code
   * @param nameStartsWith Optional filter by city name prefix
   * @param transaction Optional transaction tracking info
   * @returns FetchCitiesResponse
   */
  async fetchCities(
    countryCode: string,
    state?: string,
    nameStartsWith?: string,
    transaction?: Transaction,
  ): Promise<FetchCitiesResponse> {
    const request: FetchCitiesRequest = {
      ClientInfo: this.client.getClientInfo(),
      Transaction: transaction,
      CountryCode: countryCode,
      State: state,
      NameStartsWith: nameStartsWith,
    };

    const response = await this.client.callSoapMethod<
      FetchCitiesRequest,
      FetchCitiesResponse
    >('location', 'FetchCities', request);

    if (response.HasErrors) {
      throw new AramexAPIError(
        'Failed to fetch cities',
        response.Notifications,
      );
    }

    return response;
  }

  /**
   * Fetch states/provinces for a specific country
   * @param countryCode ISO country code
   * @param transaction Optional transaction tracking info
   * @returns FetchStatesResponse
   */
  async fetchStates(
    countryCode: string,
    transaction?: Transaction,
  ): Promise<FetchStatesResponse> {
    const request: FetchStatesRequest = {
      ClientInfo: this.client.getClientInfo(),
      Transaction: transaction,
      CountryCode: countryCode,
    };

    const response = await this.client.callSoapMethod<
      FetchStatesRequest,
      FetchStatesResponse
    >('location', 'FetchStates', request);

    if (response.HasErrors) {
      throw new AramexAPIError(
        'Failed to fetch states',
        response.Notifications,
      );
    }

    return response;
  }

  /**
   * Validate an address
   * @param address Address to validate
   * @param transaction Optional transaction tracking info
   * @returns ValidateAddressResponse
   */
  async validateAddress(
    address: Address,
    transaction?: Transaction,
  ): Promise<ValidateAddressResponse> {
    const request: ValidateAddressRequest = {
      ClientInfo: this.client.getClientInfo(),
      Transaction: transaction,
      Address: address,
    };

    const response = await this.client.callSoapMethod<
      ValidateAddressRequest,
      ValidateAddressResponse
    >('location', 'ValidateAddress', request);

    if (response.HasErrors) {
      throw new AramexAPIError(
        'Failed to validate address',
        response.Notifications,
      );
    }

    return response;
  }

  /**
   * Fetch Aramex offices in a country
   * @param countryCode ISO country code
   * @param city Optional city name
   * @param transaction Optional transaction tracking info
   * @returns FetchOfficesResponse
   */
  async fetchOffices(
    countryCode: string,
    city?: string,
    transaction?: Transaction,
  ): Promise<FetchOfficesResponse> {
    const request: FetchOfficesRequest = {
      ClientInfo: this.client.getClientInfo(),
      Transaction: transaction,
      CountryCode: countryCode,
      City: city,
    };

    const response = await this.client.callSoapMethod<
      FetchOfficesRequest,
      FetchOfficesResponse
    >('location', 'FetchOffices', request);

    if (response.HasErrors) {
      throw new AramexAPIError(
        'Failed to fetch offices',
        response.Notifications,
      );
    }

    return response;
  }
}

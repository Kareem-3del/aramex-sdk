/**
 * Rate Calculator API Service
 * Provides rate calculation and quote operations
 */

import { AramexClient } from '../core/client';
import { AramexAPIError } from '../core/errors';
import {
  CalculateRateRequest,
  CalculateRateResponse,
  Transaction,
} from '../types';

export class RateService {
  constructor(private readonly client: AramexClient) {}

  /**
   * Calculate shipping rate for a shipment
   * @param request Rate calculation request (without ClientInfo)
   * @returns CalculateRateResponse
   */
  async calculateRate(
    request: Omit<CalculateRateRequest, 'ClientInfo'>,
  ): Promise<CalculateRateResponse> {
    const fullRequest: CalculateRateRequest = {
      ClientInfo: this.client.getClientInfo(),
      ...request,
    };

    const response = await this.client.callSoapMethod<
      CalculateRateRequest,
      CalculateRateResponse
    >('rate', 'CalculateRate', fullRequest);

    if (response.HasErrors) {
      throw new AramexAPIError(
        'Failed to calculate rate',
        response.Notifications,
      );
    }

    return response;
  }

  /**
   * Get a shipping quote (alias for calculateRate)
   * @param request Rate calculation request (without ClientInfo)
   * @returns CalculateRateResponse
   */
  async getQuote(
    request: Omit<CalculateRateRequest, 'ClientInfo'>,
  ): Promise<CalculateRateResponse> {
    return this.calculateRate(request);
  }
}

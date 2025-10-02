/**
 * Custom error classes
 */

import { Notification } from '../types';

export class AramexError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly notifications?: Notification[],
  ) {
    super(message);
    this.name = 'AramexError';
    Object.setPrototypeOf(this, AramexError.prototype);
  }
}

export class AramexValidationError extends AramexError {
  constructor(message: string, notifications?: Notification[]) {
    super(message, 'VALIDATION_ERROR', notifications);
    this.name = 'AramexValidationError';
    Object.setPrototypeOf(this, AramexValidationError.prototype);
  }
}

export class AramexAuthenticationError extends AramexError {
  constructor(message: string = 'Authentication failed') {
    super(message, 'AUTH_ERROR');
    this.name = 'AramexAuthenticationError';
    Object.setPrototypeOf(this, AramexAuthenticationError.prototype);
  }
}

export class AramexAPIError extends AramexError {
  constructor(message: string, notifications: Notification[]) {
    super(message, 'API_ERROR', notifications);
    this.name = 'AramexAPIError';
    Object.setPrototypeOf(this, AramexAPIError.prototype);
  }
}

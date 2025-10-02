/**
 * Error Classes Unit Tests
 */

import {
  AramexError,
  AramexValidationError,
  AramexAuthenticationError,
  AramexAPIError,
} from '../src/core/errors';
import { Notification } from '../src/types';

describe('Error Classes', () => {
  describe('AramexError', () => {
    it('should create error with message only', () => {
      const error = new AramexError('Test error');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AramexError);
      expect(error.message).toBe('Test error');
      expect(error.name).toBe('AramexError');
      expect(error.code).toBeUndefined();
      expect(error.notifications).toBeUndefined();
    });

    it('should create error with message and code', () => {
      const error = new AramexError('Test error', 'TEST_CODE');

      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.notifications).toBeUndefined();
    });

    it('should create error with message, code, and notifications', () => {
      const notifications: Notification[] = [
        { Code: 'ERR001', Message: 'Error 1' },
        { Code: 'ERR002', Message: 'Error 2' },
      ];
      const error = new AramexError('Test error', 'TEST_CODE', notifications);

      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.notifications).toEqual(notifications);
      expect(error.notifications).toHaveLength(2);
    });

    it('should maintain proper prototype chain', () => {
      const error = new AramexError('Test');

      expect(error instanceof AramexError).toBe(true);
      expect(error instanceof Error).toBe(true);
      expect(Object.getPrototypeOf(error)).toBe(AramexError.prototype);
    });

    it('should have stack trace', () => {
      const error = new AramexError('Test error');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('AramexError');
    });
  });

  describe('AramexValidationError', () => {
    it('should create validation error with message', () => {
      const error = new AramexValidationError('Invalid data');

      expect(error).toBeInstanceOf(AramexError);
      expect(error).toBeInstanceOf(AramexValidationError);
      expect(error.message).toBe('Invalid data');
      expect(error.name).toBe('AramexValidationError');
      expect(error.code).toBe('VALIDATION_ERROR');
    });

    it('should create validation error with notifications', () => {
      const notifications: Notification[] = [
        { Code: 'VAL001', Message: 'Field required' },
        { Code: 'VAL002', Message: 'Invalid format' },
      ];
      const error = new AramexValidationError('Validation failed', notifications);

      expect(error.message).toBe('Validation failed');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.notifications).toEqual(notifications);
      expect(error.notifications).toHaveLength(2);
    });

    it('should maintain proper prototype chain', () => {
      const error = new AramexValidationError('Test');

      expect(error instanceof AramexValidationError).toBe(true);
      expect(error instanceof AramexError).toBe(true);
      expect(error instanceof Error).toBe(true);
    });

    it('should be catchable as AramexError', () => {
      try {
        throw new AramexValidationError('Test validation error');
      } catch (e) {
        expect(e).toBeInstanceOf(AramexError);
        expect(e).toBeInstanceOf(AramexValidationError);
        expect((e as AramexValidationError).code).toBe('VALIDATION_ERROR');
      }
    });
  });

  describe('AramexAuthenticationError', () => {
    it('should create authentication error with default message', () => {
      const error = new AramexAuthenticationError();

      expect(error).toBeInstanceOf(AramexError);
      expect(error).toBeInstanceOf(AramexAuthenticationError);
      expect(error.message).toBe('Authentication failed');
      expect(error.name).toBe('AramexAuthenticationError');
      expect(error.code).toBe('AUTH_ERROR');
    });

    it('should create authentication error with custom message', () => {
      const error = new AramexAuthenticationError('Invalid credentials');

      expect(error.message).toBe('Invalid credentials');
      expect(error.code).toBe('AUTH_ERROR');
    });

    it('should not have notifications by default', () => {
      const error = new AramexAuthenticationError();

      expect(error.notifications).toBeUndefined();
    });

    it('should maintain proper prototype chain', () => {
      const error = new AramexAuthenticationError();

      expect(error instanceof AramexAuthenticationError).toBe(true);
      expect(error instanceof AramexError).toBe(true);
      expect(error instanceof Error).toBe(true);
    });

    it('should be catchable as AramexError', () => {
      try {
        throw new AramexAuthenticationError('Token expired');
      } catch (e) {
        expect(e).toBeInstanceOf(AramexError);
        expect(e).toBeInstanceOf(AramexAuthenticationError);
        expect((e as AramexAuthenticationError).message).toBe('Token expired');
      }
    });
  });

  describe('AramexAPIError', () => {
    it('should create API error with message and notifications', () => {
      const notifications: Notification[] = [
        { Code: 'API001', Message: 'API error occurred' },
      ];
      const error = new AramexAPIError('API request failed', notifications);

      expect(error).toBeInstanceOf(AramexError);
      expect(error).toBeInstanceOf(AramexAPIError);
      expect(error.message).toBe('API request failed');
      expect(error.name).toBe('AramexAPIError');
      expect(error.code).toBe('API_ERROR');
      expect(error.notifications).toEqual(notifications);
    });

    it('should create API error with multiple notifications', () => {
      const notifications: Notification[] = [
        { Code: 'API001', Message: 'Error 1' },
        { Code: 'API002', Message: 'Error 2' },
        { Code: 'API003', Message: 'Error 3' },
      ];
      const error = new AramexAPIError('Multiple errors', notifications);

      expect(error.notifications).toHaveLength(3);
      expect(error.notifications?.[0].Code).toBe('API001');
      expect(error.notifications?.[1].Code).toBe('API002');
      expect(error.notifications?.[2].Code).toBe('API003');
    });

    it('should create API error with empty notifications array', () => {
      const error = new AramexAPIError('Empty notifications', []);

      expect(error.notifications).toEqual([]);
      expect(error.notifications).toHaveLength(0);
    });

    it('should maintain proper prototype chain', () => {
      const notifications: Notification[] = [
        { Code: 'API001', Message: 'Test' },
      ];
      const error = new AramexAPIError('Test', notifications);

      expect(error instanceof AramexAPIError).toBe(true);
      expect(error instanceof AramexError).toBe(true);
      expect(error instanceof Error).toBe(true);
    });

    it('should be catchable as AramexError', () => {
      const notifications: Notification[] = [
        { Code: 'API001', Message: 'Shipment not found' },
      ];

      try {
        throw new AramexAPIError('Shipment error', notifications);
      } catch (e) {
        expect(e).toBeInstanceOf(AramexError);
        expect(e).toBeInstanceOf(AramexAPIError);
        expect((e as AramexAPIError).notifications).toHaveLength(1);
      }
    });

    it('should preserve notification details', () => {
      const notifications: Notification[] = [
        {
          Code: 'API001',
          Message: 'Invalid shipment details',
        },
      ];
      const error = new AramexAPIError('Validation error', notifications);

      expect(error.notifications?.[0].Code).toBe('API001');
      expect(error.notifications?.[0].Message).toBe('Invalid shipment details');
    });
  });

  describe('Error handling patterns', () => {
    it('should allow type checking with instanceof', () => {
      const errors = [
        new AramexError('Base error'),
        new AramexValidationError('Validation error'),
        new AramexAuthenticationError('Auth error'),
        new AramexAPIError('API error', [{ Code: 'ERR', Message: 'Test' }]),
      ];

      errors.forEach((error) => {
        expect(error instanceof Error).toBe(true);
        expect(error instanceof AramexError).toBe(true);
      });
    });

    it('should allow differentiation between error types', () => {
      const handleError = (error: AramexError): string => {
        if (error instanceof AramexValidationError) {
          return 'Validation failed';
        } else if (error instanceof AramexAuthenticationError) {
          return 'Authentication required';
        } else if (error instanceof AramexAPIError) {
          return 'API error occurred';
        }
        return 'Unknown error';
      };

      expect(handleError(new AramexValidationError('Test'))).toBe('Validation failed');
      expect(handleError(new AramexAuthenticationError())).toBe('Authentication required');
      expect(handleError(new AramexAPIError('Test', []))).toBe('API error occurred');
      expect(handleError(new AramexError('Test'))).toBe('Unknown error');
    });

    it('should preserve error properties through catch blocks', () => {
      const notifications: Notification[] = [
        { Code: 'TEST001', Message: 'Test notification' },
      ];

      try {
        throw new AramexAPIError('Test error', notifications);
      } catch (error) {
        if (error instanceof AramexAPIError) {
          expect(error.message).toBe('Test error');
          expect(error.code).toBe('API_ERROR');
          expect(error.notifications).toEqual(notifications);
        } else {
          throw new Error('Wrong error type caught');
        }
      }
    });

    it('should support error serialization', () => {
      const notifications: Notification[] = [
        { Code: 'ERR001', Message: 'Error message' },
      ];
      const error = new AramexAPIError('API failed', notifications);

      const serialized = {
        name: error.name,
        message: error.message,
        code: error.code,
        notifications: error.notifications,
      };

      expect(serialized.name).toBe('AramexAPIError');
      expect(serialized.message).toBe('API failed');
      expect(serialized.code).toBe('API_ERROR');
      expect(serialized.notifications).toEqual(notifications);
    });
  });
});

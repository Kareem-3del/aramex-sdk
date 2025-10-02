/**
 * Test setup and utilities
 */

import { AramexConfig } from '../src/types';

export const testConfig: AramexConfig = {
  username: process.env.ARAMEX_USERNAME || 'testingapi@aramex.com',
  password: process.env.ARAMEX_PASSWORD || 'R123456789$r',
  accountNumber: process.env.ARAMEX_ACCOUNT_NUMBER || '20000068',
  accountPin: process.env.ARAMEX_ACCOUNT_PIN || '543543',
  accountEntity: process.env.ARAMEX_ACCOUNT_ENTITY || 'BAH',
  accountCountryCode: process.env.ARAMEX_ACCOUNT_COUNTRY_CODE || 'BH',
  testMode: true,
};

export const mockShipment = {
  Shipper: {
    PartyAddress: {
      Line1: '123 Test Street',
      City: 'Manama',
      CountryCode: 'BH',
    },
    Contact: {
      PersonName: 'Test Shipper',
      CompanyName: 'Test Company',
      PhoneNumber1: '+973-1234-5678',
      CellPhone: '+973-3333-4444',
      EmailAddress: 'shipper@test.com',
    },
  },
  Consignee: {
    PartyAddress: {
      Line1: '456 Test Avenue',
      City: 'Riffa',
      CountryCode: 'BH',
    },
    Contact: {
      PersonName: 'Test Consignee',
      CompanyName: 'Receiver Company',
      PhoneNumber1: '+973-7654-3210',
      CellPhone: '+973-5555-6666',
      EmailAddress: 'consignee@test.com',
    },
  },
  ShippingDateTime: new Date().toISOString(),
  Details: {
    NumberOfPieces: 1,
    ActualWeight: {
      Unit: 'KG' as const,
      Value: 1.0,
    },
    ProductGroup: 'DOM' as const,
    ProductType: 'OND' as const,
    PaymentType: 'P' as const,
    DescriptionOfGoods: 'Test Package',
    GoodsOriginCountry: 'BH',
  },
};

export const mockPickup = {
  PickupAddress: {
    Line1: '123 Pickup Street',
    City: 'Manama',
    CountryCode: 'BH',
  },
  PickupContact: {
    PersonName: 'Test Contact',
    CompanyName: 'Test Company',
    PhoneNumber1: '+973-1234-5678',
    CellPhone: '+973-3333-4444',
    EmailAddress: 'pickup@test.com',
  },
  PickupLocation: 'Reception',
  PickupDate: new Date().toISOString(),
  ReadyTime: '09:00',
  LastPickupTime: '16:00',
  ClosingTime: '18:00',
  Reference1: 'TEST-PICKUP-001',
  Status: 'Ready' as const,
  PickupItems: [
    {
      ProductGroup: 'DOM' as const,
      NumberOfShipments: 1,
      NumberOfPieces: 1,
      Payment: 'P' as const,
      ShipmentWeight: {
        Unit: 'KG' as const,
        Value: 1.0,
      },
    },
  ],
};

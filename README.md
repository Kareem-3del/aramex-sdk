# @kareem-3del/aramex-sdk

Complete TypeScript SDK for Aramex API with support for all Aramex services including Shipping, Tracking, Rate Calculator, and Location APIs.

## Features

- ✅ **Complete Coverage**: All Aramex API services (Shipping, Tracking, Rate, Location)
- ✅ **Helper Functions**: NEW! Easy-to-use shipment builders for quick integration
- ✅ **TypeScript**: Full TypeScript support with comprehensive type definitions
- ✅ **Framework Agnostic**: Works with any Node.js application
- ✅ **NestJS Integration**: First-class NestJS support with decorators and modules
- ✅ **SOAP Integration**: Native SOAP client with local WSDL files for reliability
- ✅ **Tested**: Comprehensive test coverage with 76+ unit tests
- ✅ **Error Handling**: Detailed error messages and custom error classes
- ✅ **Promise-based**: Modern async/await API
- ✅ **Configurable Timeout**: Request timeout configuration support
- ✅ **Client Caching**: Smart SOAP client caching for better performance

## Installation

```bash
npm install @kareem-3del/aramex-sdk
# or
yarn add @kareem-3del/aramex-sdk
```

## Quick Start

### Easy Way (Using Helpers) ⭐ NEW!

```typescript
import { AramexSDK, buildDomesticShipment } from '@kareem-3del/aramex-sdk';

const aramex = new AramexSDK({
  username: 'your_username@example.com',
  password: 'your_password',
  accountNumber: 'your_account_number',
  accountPin: 'your_pin',
  accountEntity: 'DXB',
  accountCountryCode: 'AE',
  testMode: true
});

// Create shipment with minimal code!
const shipment = buildDomesticShipment({
  reference: 'ORDER-123',
  accountNumber: 'your_account_number',

  fromName: 'My Store',
  fromAddress: 'Store Address',
  fromCity: 'Dubai',
  fromPhone: '+971-4-1234567',

  toName: 'Customer Name',
  toAddress: 'Customer Address',
  toCity: 'Abu Dhabi',
  toPhone: '+971-2-7654321',

  weight: 2.5,
  description: 'Electronics'
});

const result = await aramex.shipping.createShipment(shipment, {
  ReportID: 9201,
  ReportType: 'URL'
});

console.log('Shipment ID:', result.Shipments[0].ID);
console.log('Label URL:', result.Shipments[0].ShipmentLabel?.LabelURL);
```

### Advanced Usage (Full Control)

```typescript
import { AramexSDK } from '@kareem-3del/aramex-sdk';

const aramex = new AramexSDK({
  username: 'your_username@example.com',
  password: 'your_password',
  accountNumber: 'your_account_number',
  accountPin: 'your_pin',
  accountEntity: 'DXB',
  accountCountryCode: 'AE',
  testMode: true, // Use test environment
  timeout: 30000 // Optional: Request timeout in milliseconds (default: 30000)
});

// Create a shipment with full control
const shipment = await aramex.shipping.createShipment({
  Shipper: {
    AccountNumber: 'your_account_number',
    PartyAddress: {
      Line1: '123 Business Street',
      City: 'Dubai',
      CountryCode: 'AE'
    },
    Contact: {
      PersonName: 'John Doe',
      CompanyName: 'Company LLC',
      PhoneNumber1: '+971-4-1234567',
      CellPhone: '+971-50-1234567',
      EmailAddress: 'john@example.com'
    }
  },
  Consignee: { /* ... */ },
  ShippingDateTime: new Date().toISOString(),
  Details: {
    NumberOfPieces: 1,
    ActualWeight: { Unit: 'KG', Value: 1.5 },
    ProductGroup: 'DOM',
    ProductType: 'OND',
    PaymentType: 'P',
    DescriptionOfGoods: 'Documents',
    GoodsOriginCountry: 'AE'
  }
});

console.log('Shipment created:', shipment.Shipments[0].ID);

// Track a shipment
const tracking = await aramex.tracking.trackShipment('12345678');
console.log('Tracking info:', tracking.TrackingResults);

// Calculate rate
const rate = await aramex.rate.calculateRate({
  OriginAddress: { /* ... */ },
  DestinationAddress: { /* ... */ },
  ShipmentDetails: { /* ... */ }
});
console.log('Shipping cost:', rate.TotalAmount);

// Fetch countries
const countries = await aramex.location.fetchCountries();
console.log('Available countries:', countries.Countries);
```

### NestJS Integration

#### 1. Install Dependencies

```bash
npm install @kareem-3del/aramex-sdk @nestjs/common @nestjs/core
```

#### 2. Register Module

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { AramexModule } from '@kareem-3del/aramex-sdk/nestjs';

@Module({
  imports: [
    AramexModule.forRoot({
      username: process.env.ARAMEX_USERNAME!,
      password: process.env.ARAMEX_PASSWORD!,
      accountNumber: process.env.ARAMEX_ACCOUNT_NUMBER!,
      accountPin: process.env.ARAMEX_ACCOUNT_PIN!,
      accountEntity: process.env.ARAMEX_ACCOUNT_ENTITY!,
      accountCountryCode: process.env.ARAMEX_ACCOUNT_COUNTRY_CODE!,
      testMode: process.env.NODE_ENV !== 'production'
    })
  ],
})
export class AppModule {}
```

#### 3. Use in Services

```typescript
// shipping.service.ts
import { Injectable } from '@nestjs/common';
import { InjectAramex } from '@kareem-3del/aramex-sdk/nestjs';
import { AramexSDK } from '@kareem-3del/aramex-sdk';

@Injectable()
export class ShippingService {
  constructor(@InjectAramex() private readonly aramex: AramexSDK) {}

  async createShipment(data: any) {
    return this.aramex.shipping.createShipment(data);
  }

  async trackShipment(trackingNumber: string) {
    return this.aramex.tracking.trackShipment(trackingNumber);
  }

  async calculateRate(data: any) {
    return this.aramex.rate.calculateRate(data);
  }
}
```

#### 4. Async Configuration

```typescript
// app.module.ts
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    AramexModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        username: config.get('ARAMEX_USERNAME')!,
        password: config.get('ARAMEX_PASSWORD')!,
        accountNumber: config.get('ARAMEX_ACCOUNT_NUMBER')!,
        accountPin: config.get('ARAMEX_ACCOUNT_PIN')!,
        accountEntity: config.get('ARAMEX_ACCOUNT_ENTITY')!,
        accountCountryCode: config.get('ARAMEX_ACCOUNT_COUNTRY_CODE')!,
        testMode: config.get('NODE_ENV') !== 'production'
      })
    })
  ],
})
export class AppModule {}
```

## API Reference

### Shipping Service

#### createShipment(shipment, labelInfo?, transaction?)
Creates a new shipment.

#### createShipments(shipments, labelInfo?, transaction?)
Creates multiple shipments in one request.

#### printLabel(shipmentNumber, productGroup?, originEntity?, labelInfo?, transaction?)
Prints a label for an existing shipment.

#### createPickup(pickup, labelInfo?, transaction?)
Creates a pickup request.

#### cancelPickup(pickupGUID, comments?, transaction?)
Cancels an existing pickup.

#### reserveShipmentNumberRange(entity, productGroup, count, transaction?)
Reserves a range of shipment numbers (1-5000).

#### getLastShipmentsNumbersRange(entity, productGroup, transaction?)
Gets the last reserved shipment number range.

#### scheduleDelivery(request)
Schedules a delivery at a specific time and location.

### Tracking Service

#### trackShipment(shipmentNumber, getLastTrackingUpdateOnly?, transaction?)
Tracks a single shipment.

#### trackShipments(shipmentNumbers, getLastTrackingUpdateOnly?, transaction?)
Tracks multiple shipments.

#### trackPickup(reference, transaction?)
Tracks a pickup by reference number.

### Rate Service

#### calculateRate(request)
Calculates shipping rate for a shipment.

#### getQuote(request)
Alias for calculateRate.

### Location Service

#### fetchCountries(transaction?)
Fetches all available countries.

#### fetchCities(countryCode, state?, nameStartsWith?, transaction?)
Fetches cities for a country.

#### fetchStates(countryCode, transaction?)
Fetches states/provinces for a country.

#### validateAddress(address, transaction?)
Validates an address.

#### fetchOffices(countryCode, city?, transaction?)
Fetches Aramex offices in a country.

## Configuration

```typescript
interface AramexConfig {
  username: string;              // Aramex account email
  password: string;              // Account password
  accountNumber: string;         // Account number
  accountPin: string;            // Account PIN
  accountEntity: string;         // Entity code (e.g., 'DXB')
  accountCountryCode: string;    // ISO country code (e.g., 'AE')
  version?: string;              // API version (default: '1.0')
  source?: number;               // Source identifier (default: 24)
  baseURL?: string;              // Custom base URL
  testMode?: boolean;            // Use test environment (default: true)
}
```

## Error Handling

The SDK provides custom error classes:

```typescript
import { AramexError, AramexAPIError, AramexValidationError } from '@kareem-3del/aramex-sdk';

try {
  const result = await aramex.shipping.createShipment(data);
} catch (error) {
  if (error instanceof AramexAPIError) {
    console.error('API Error:', error.message);
    console.error('Notifications:', error.notifications);
  } else if (error instanceof AramexValidationError) {
    console.error('Validation Error:', error.message);
  } else {
    console.error('Unknown Error:', error);
  }
}
```

## Product Types

| Code | Description | Dutiable | Product Group |
|------|-------------|----------|---------------|
| PDX | Priority Document Express | No | EXP |
| PPX | Priority Parcel Express | Yes | EXP |
| PLX | Priority Letter Express | No | EXP |
| DDX | Deferred Document Express | No | EXP |
| DPX | Deferred Parcel Express | Yes | EXP |
| GDX | Ground Document Express | No | EXP |
| GPX | Ground Parcel Express | Yes | EXP |
| EPX | Economy Parcel Express | Yes | EXP |
| OND | Domestic | No | DOM |

## Payment Types

- `P`: Prepaid (shipper pays)
- `C`: Collect (consignee pays)
- `3`: Third Party (third party pays)

## Service Codes

- `CODS`: Cash on Delivery
- `FIRST`: First Delivery (committed time)
- `FRDM`: Free Domicile (sender pays customs)
- `HFPU`: Hold for Pickup
- `NOON`: Noon Delivery
- `SIG`: Signature Required

## Examples

### Create International Shipment with COD

```typescript
const shipment = await aramex.shipping.createShipment({
  Shipper: { /* UAE address */ },
  Consignee: { /* Saudi Arabia address */ },
  ShippingDateTime: new Date().toISOString(),
  Details: {
    NumberOfPieces: 2,
    ActualWeight: { Unit: 'KG', Value: 5.0 },
    Dimensions: {
      Unit: 'CM',
      Length: 30,
      Width: 20,
      Height: 15
    },
    ProductGroup: 'EXP',
    ProductType: 'PPX',
    PaymentType: 'P',
    Services: 'CODS,SIG',
    DescriptionOfGoods: 'Electronics',
    GoodsOriginCountry: 'AE',
    CashOnDeliveryAmount: {
      CurrencyCode: 'USD',
      Value: 500.00
    },
    CustomsValueAmount: {
      CurrencyCode: 'USD',
      Value: 500.00
    }
  }
}, {
  ReportID: 9201,
  ReportType: 'URL'
});
```

### Create Pickup

```typescript
const pickup = await aramex.shipping.createPickup({
  PickupAddress: {
    Line1: '123 Warehouse Street',
    City: 'Dubai',
    CountryCode: 'AE'
  },
  PickupContact: {
    PersonName: 'Warehouse Manager',
    CompanyName: 'Company LLC',
    PhoneNumber1: '+971-4-1234567',
    CellPhone: '+971-50-1234567',
    EmailAddress: 'warehouse@company.com'
  },
  PickupLocation: 'Loading Bay 3',
  PickupDate: new Date().toISOString(),
  ReadyTime: '09:00',
  LastPickupTime: '16:00',
  ClosingTime: '18:00',
  Status: 'Ready',
  Reference1: 'PICKUP-001',
  PickupItems: [{
    ProductGroup: 'EXP',
    ProductType: 'PPX',
    NumberOfShipments: 3,
    NumberOfPieces: 8,
    Payment: 'P',
    ShipmentWeight: { Unit: 'KG', Value: 15.0 }
  }]
});
```

## Testing

```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

**Note**: Integration tests that require actual API access are skipped by default. To run them, you need valid Aramex API credentials and should change `describe.skip` to `describe` in the integration test files (`rate.test.ts`, `location.test.ts`, `tracking.test.ts`, `shipping.test.ts`).

## Building

```bash
npm run build
```

## Environment Variables

Create a `.env` file:

```env
ARAMEX_USERNAME=your_username@example.com
ARAMEX_PASSWORD=your_password
ARAMEX_ACCOUNT_NUMBER=20016
ARAMEX_ACCOUNT_PIN=221223
ARAMEX_ACCOUNT_ENTITY=DXB
ARAMEX_ACCOUNT_COUNTRY_CODE=AE
NODE_ENV=development
```

## License

MIT

## Support

For issues and questions:
- GitHub Issues: [Create an issue](https://github.com/yourusername/aramex-sdk/issues)
- Aramex Developer Portal: [http://www.aramex.com/developers](http://www.aramex.com/developers)

## Contributing

Contributions are welcome! Please read the contributing guidelines first.

## Changelog

### 1.0.0
- Initial release
- Complete Shipping API support
- Complete Tracking API support
- Complete Rate Calculator API support
- Complete Location API support
- NestJS integration
- Full TypeScript support
- Comprehensive tests

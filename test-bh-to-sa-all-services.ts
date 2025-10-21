/**
 * Test ALL Aramex service types from Bahrain (BH) to Saudi Arabia (SA)
 * International Express Services with EXACT BHD prices
 */

import { AramexSDK } from './src';

const config = {
  username: 'testingapi@aramex.com',
  password: 'R123456789$r',
  accountNumber: '20000068',
  accountPin: '543543',
  accountEntity: 'BAH',
  accountCountryCode: 'BH',
  isTest: true,
};

// All EXPRESS service types for international shipping
const EXPRESS_SERVICES = [
  { code: 'PDX' as const, name: 'Priority Document Express', speed: 'Express', type: 'Document' },
  { code: 'PPX' as const, name: 'Priority Parcel Express', speed: 'Express', type: 'Parcel' },
  { code: 'PLX' as const, name: 'Priority Letter Express', speed: 'Express', type: 'Letter' },
  { code: 'DDX' as const, name: 'Deferred Document Express', speed: 'Deferred', type: 'Document' },
  { code: 'DPX' as const, name: 'Deferred Parcel Express', speed: 'Deferred', type: 'Parcel' },
  { code: 'GDX' as const, name: 'Ground Document Express', speed: 'Ground', type: 'Document' },
  { code: 'GPX' as const, name: 'Ground Parcel Express', speed: 'Ground', type: 'Parcel' },
  { code: 'EPX' as const, name: 'Economy Parcel Express', speed: 'Economy', type: 'Parcel' },
];

interface PriceResult {
  service: string;
  serviceName: string;
  weight: number;
  price: number | null;
  currency: string;
  error?: string;
}

async function testService(
  sdk: any,
  serviceCode: string,
  serviceName: string,
  weight: number
): Promise<PriceResult> {
  try {
    const response = await sdk.rate.calculateRate({
      OriginAddress: {
        Line1: 'Building 123',
        City: 'Manama',
        CountryCode: 'BH',
      },
      DestinationAddress: {
        Line1: 'Street 456',
        City: 'Riyadh',
        CountryCode: 'SA',
      },
      ShipmentDetails: {
        NumberOfPieces: 1,
        ActualWeight: {
          Unit: 'KG',
          Value: weight,
        },
        ProductGroup: 'EXP', // International = EXP
        ProductType: serviceCode,
        PaymentType: 'P',
        DescriptionOfGoods: 'Documents',
        GoodsOriginCountry: 'BH',
      },
      PreferredCurrencyCode: 'BHD',
    });

    if (!response.HasErrors && response.TotalAmount) {
      return {
        service: serviceCode,
        serviceName: serviceName,
        weight: weight,
        price: response.TotalAmount.Value,
        currency: response.TotalAmount.CurrencyCode,
      };
    } else {
      return {
        service: serviceCode,
        serviceName: serviceName,
        weight: weight,
        price: null,
        currency: 'BHD',
        error: response.Notifications?.map((n: any) => n.Message).join(', ') || 'Unknown error',
      };
    }
  } catch (error: any) {
    return {
      service: serviceCode,
      serviceName: serviceName,
      weight: weight,
      price: null,
      currency: 'BHD',
      error: error.message,
    };
  }
}

async function main() {
  const sdk = new AramexSDK(config);
  const weights = [0.1, 0.25, 0.5, 1, 2, 5, 10, 15, 20];
  const allResults: PriceResult[] = [];

  console.log('\n╔═══════════════════════════════════════════════════════════════════════════╗');
  console.log('║     BAHRAIN → SAUDI ARABIA - ALL EXPRESS SERVICES (EXACT BHD PRICES)     ║');
  console.log('║     Route: Manama, BH → Riyadh, SA                                        ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════╝\n');

  // Test each service type
  for (const service of EXPRESS_SERVICES) {
    console.log(`\n━━━ ${service.name} (${service.code}) ━━━`);
    console.log(`    Speed: ${service.speed} | Type: ${service.type}\n`);
    console.log('Weight (kg) │ Price (BHD)');
    console.log('────────────┼─────────────');

    for (const weight of weights) {
      const result = await testService(sdk, service.code, service.name, weight);
      allResults.push(result);

      if (result.price !== null) {
        console.log(`${weight.toString().padEnd(11)} │ ${result.price.toFixed(3)}`);
      } else {
        console.log(`${weight.toString().padEnd(11)} │ ✗ Not available`);
      }

      await new Promise(resolve => setTimeout(resolve, 400));
    }
  }

  // Create summary table
  console.log('\n\n╔═══════════════════════════════════════════════════════════════════════════╗');
  console.log('║                    COMPLETE PRICE COMPARISON TABLE                        ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════╝\n');

  // Group by service
  const serviceGroups = new Map<string, PriceResult[]>();
  for (const result of allResults) {
    if (!serviceGroups.has(result.service)) {
      serviceGroups.set(result.service, []);
    }
    serviceGroups.get(result.service)!.push(result);
  }

  console.log('Service                      │ 0.5kg │  1kg  │  2kg  │  5kg  │ 10kg  │ 20kg');
  console.log('─────────────────────────────┼───────┼───────┼───────┼───────┼───────┼───────');

  for (const service of EXPRESS_SERVICES) {
    const results = serviceGroups.get(service.code) || [];
    const name = service.name.substring(0, 28).padEnd(28);
    const row = [name];

    for (const weight of [0.5, 1, 2, 5, 10, 20]) {
      const result = results.find(r => r.weight === weight);
      if (result && result.price !== null) {
        row.push(result.price.toFixed(2).padStart(5));
      } else {
        row.push(' N/A '.padStart(5));
      }
    }

    console.log(row.join(' │ '));
  }

  // Available services summary
  console.log('\n\n╔═══════════════════════════════════════════════════════════════════════════╗');
  console.log('║                         AVAILABLE SERVICES                                ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════╝\n');

  const availableServices = allResults.filter(r => r.price !== null && r.weight === 0.5);
  if (availableServices.length > 0) {
    availableServices.sort((a, b) => (a.price || 0) - (b.price || 0));

    console.log('Service                                  │ Price (0.5kg) │ Speed');
    console.log('─────────────────────────────────────────┼───────────────┼──────────');

    for (const service of availableServices) {
      const svc = EXPRESS_SERVICES.find(s => s.code === service.service);
      const name = service.serviceName.padEnd(40);
      const price = `${service.price?.toFixed(3)} ${service.currency}`.padEnd(13);
      const speed = svc?.speed || '';
      console.log(`${name} │ ${price} │ ${speed}`);
    }
  }

  // Price analysis
  console.log('\n\n╔═══════════════════════════════════════════════════════════════════════════╗');
  console.log('║                           PRICE ANALYSIS                                  ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════╝\n');

  // Find cheapest and fastest options for different weights
  for (const weight of [0.5, 1, 5, 10]) {
    const weightResults = allResults.filter(r => r.weight === weight && r.price !== null);
    if (weightResults.length > 0) {
      weightResults.sort((a, b) => (a.price || 0) - (b.price || 0));
      const cheapest = weightResults[0];
      console.log(`${weight}kg: Cheapest = ${cheapest.serviceName} (${cheapest.service}) at ${cheapest.price?.toFixed(3)} BHD`);
    }
  }

  console.log('\n✅ Test completed!\n');
}

main().catch(console.error);

/**
 * Test ALL Aramex service types for Bahrain domestic shipping
 * Including: Express, Next Day, Standard, Economy, etc.
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

// All available service types
const DOMESTIC_SERVICES = [
  { code: 'OND', name: 'On Demand (Standard Domestic)', group: 'DOM' },
];

const EXPRESS_SERVICES = [
  { code: 'PDX', name: 'Priority Document Express', group: 'EXP' },
  { code: 'PPX', name: 'Priority Parcel Express', group: 'EXP' },
  { code: 'PLX', name: 'Priority Letter Express', group: 'EXP' },
  { code: 'DDX', name: 'Deferred Document Express', group: 'EXP' },
  { code: 'DPX', name: 'Deferred Parcel Express', group: 'EXP' },
  { code: 'GDX', name: 'Ground Document Express', group: 'EXP' },
  { code: 'GPX', name: 'Ground Parcel Express', group: 'EXP' },
  { code: 'EPX', name: 'Economy Parcel Express', group: 'EXP' },
];

interface PriceResult {
  service: string;
  serviceName: string;
  group: string;
  weight: number;
  price: number | null;
  currency: string;
  error?: string;
}

async function testService(
  sdk: any,
  serviceCode: string,
  serviceName: string,
  productGroup: string,
  weight: number
): Promise<PriceResult> {
  try {
    const response = await sdk.rate.calculateRate({
      OriginAddress: {
        Line1: '123 Street',
        City: 'Manama',
        CountryCode: 'BH',
      },
      DestinationAddress: {
        Line1: '456 Avenue',
        City: 'Riffa',
        CountryCode: 'BH',
      },
      ShipmentDetails: {
        NumberOfPieces: 1,
        ActualWeight: {
          Unit: 'KG',
          Value: weight,
        },
        ProductGroup: productGroup,
        ProductType: serviceCode,
        PaymentType: 'P',
        DescriptionOfGoods: 'Test Package',
        GoodsOriginCountry: 'BH',
      },
      PreferredCurrencyCode: 'BHD',
    });

    if (!response.HasErrors && response.TotalAmount) {
      return {
        service: serviceCode,
        serviceName: serviceName,
        group: productGroup,
        weight: weight,
        price: response.TotalAmount.Value,
        currency: response.TotalAmount.CurrencyCode,
      };
    } else {
      return {
        service: serviceCode,
        serviceName: serviceName,
        group: productGroup,
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
      group: productGroup,
      weight: weight,
      price: null,
      currency: 'BHD',
      error: error.message,
    };
  }
}

async function main() {
  const sdk = new AramexSDK(config);
  const results: PriceResult[] = [];

  // Test weights
  const weights = [0.1, 0.5, 1, 2, 5, 10];

  console.log('╔═══════════════════════════════════════════════════════════════════════════╗');
  console.log('║     BAHRAIN DOMESTIC SHIPPING - ALL SERVICE TYPES (BHD PRICES)            ║');
  console.log('║     Route: Manama → Riffa                                                 ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════╝\n');

  // Test DOMESTIC services
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  DOMESTIC SERVICES (DOM)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  for (const service of DOMESTIC_SERVICES) {
    console.log(`📦 ${service.name} (${service.code}):`);
    console.log('  Weight  │  Price');
    console.log('  ────────┼────────────');

    for (const weight of weights) {
      const result = await testService(sdk, service.code, service.name, service.group, weight);
      results.push(result);

      if (result.price !== null) {
        console.log(`  ${weight.toString().padEnd(6)}kg│  ${result.price.toFixed(3)} ${result.currency}`);
      } else {
        console.log(`  ${weight.toString().padEnd(6)}kg│  ✗ ${result.error?.substring(0, 40)}`);
      }

      await new Promise(resolve => setTimeout(resolve, 300));
    }
    console.log('');
  }

  // Test EXPRESS services (might work for domestic)
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  EXPRESS SERVICES (EXP) - Testing for Domestic Route');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  for (const service of EXPRESS_SERVICES) {
    console.log(`⚡ ${service.name} (${service.code}):`);

    // Test only with 0.5kg for express services to save time
    const result = await testService(sdk, service.code, service.name, service.group, 0.5);
    results.push(result);

    if (result.price !== null) {
      console.log(`  0.5kg: ${result.price.toFixed(3)} ${result.currency} ✓`);
    } else {
      console.log(`  0.5kg: ✗ ${result.error?.substring(0, 60)}`);
    }

    await new Promise(resolve => setTimeout(resolve, 300));
    console.log('');
  }

  // Summary table
  console.log('\n╔═══════════════════════════════════════════════════════════════════════════╗');
  console.log('║                          PRICE SUMMARY TABLE                              ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════╝\n');

  // Group results by service
  const serviceGroups = new Map<string, PriceResult[]>();
  for (const result of results) {
    if (!serviceGroups.has(result.service)) {
      serviceGroups.set(result.service, []);
    }
    serviceGroups.get(result.service)!.push(result);
  }

  console.log('Service                           │ 0.1kg   │ 0.5kg   │ 1kg     │ 2kg     │ 5kg     │ 10kg    ');
  console.log('──────────────────────────────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────');

  for (const [serviceCode, serviceResults] of serviceGroups) {
    const serviceName = serviceResults[0].serviceName;
    const row = [serviceName.substring(0, 33).padEnd(33)];

    for (const weight of weights) {
      const result = serviceResults.find(r => r.weight === weight);
      if (result && result.price !== null) {
        row.push(result.price.toFixed(3).padStart(7));
      } else {
        row.push('   N/A '.padStart(7));
      }
    }

    console.log(row.join(' │ '));
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Legend:');
  console.log('  DOM = Domestic Services (within Bahrain)');
  console.log('  EXP = Express Services (typically international, tested for domestic)');
  console.log('  All prices in BHD (Bahrain Dinar)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Available services summary
  const availableServices = results.filter(r => r.price !== null && r.weight === 0.5);
  if (availableServices.length > 0) {
    console.log('\n✅ AVAILABLE SERVICES FOR BAHRAIN DOMESTIC (BH → BH):\n');
    for (const service of availableServices) {
      console.log(`   • ${service.serviceName} (${service.service}): ${service.price?.toFixed(3)} ${service.currency}`);
    }
  }

  console.log('\n✅ Test completed!\n');
}

main().catch(console.error);

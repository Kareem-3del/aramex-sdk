/**
 * PRODUCTION API TEST - Get REAL Aramex prices with your account
 * Using account: 72502462 (Misimu.marketing@gmail.com)
 */

import { AramexSDK } from './src';

const productionConfig = {
  username: 'Misimu.marketing@gmail.com',
  password: '07474738misimuR',
  accountNumber: '72502462',
  accountPin: '472612',
  accountEntity: 'BAH',
  accountCountryCode: 'BH',
  testMode: false,
};

interface TestCase {
  name: string;
  route: string;
  origin: string;
  destination: string;
  destCountry: string;
  service: string;
  productGroup: string;
  weight: number;
  codAmount?: number;
}

async function testRate(sdk: any, test: TestCase) {
  try {
    const shipmentDetails: any = {
      NumberOfPieces: 1,
      ActualWeight: {
        Unit: 'KG' as const,
        Value: test.weight,
      },
      ProductGroup: test.productGroup as any,
      ProductType: test.service as any,
      PaymentType: 'P',
      DescriptionOfGoods: 'Test Package',
      GoodsOriginCountry: 'BH',
    };

    if (test.codAmount) {
      shipmentDetails.CashOnDeliveryAmount = {
        CurrencyCode: 'BHD',
        Value: test.codAmount,
      };
    }

    const response = await sdk.rate.calculateRate({
      OriginAddress: {
        Line1: '123 Street',
        City: test.origin,
        CountryCode: 'BH',
      },
      DestinationAddress: {
        Line1: '456 Avenue',
        City: test.destination,
        CountryCode: test.destCountry,
      },
      ShipmentDetails: shipmentDetails,
      PreferredCurrencyCode: 'BHD',
    });

    if (!response.HasErrors && response.TotalAmount) {
      return {
        success: true,
        price: response.TotalAmount.Value,
        currency: response.TotalAmount.CurrencyCode,
        name: test.name,
      };
    } else {
      const errors = response.Notifications?.map((n: any) => `[${n.Code}] ${n.Message}`).join(', ') || 'Unknown error';
      return {
        success: false,
        error: errors,
        name: test.name,
      };
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      notifications: error.notifications,
      name: test.name,
    };
  }
}

async function main() {
  console.log('\n╔═══════════════════════════════════════════════════════════════════════════╗');
  console.log('║              PRODUCTION ARAMEX API - REAL PRICING TEST                    ║');
  console.log('║              Account: 72502462 (Misimu.marketing@gmail.com)               ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════╝\n');

  const sdk = new AramexSDK(productionConfig);

  const tests: TestCase[] = [
    // DOMESTIC (BH → BH)
    {
      name: 'BH Domestic 0.5kg',
      route: 'Manama → Riffa',
      origin: 'Manama',
      destination: 'Riffa',
      destCountry: 'BH',
      service: 'OND',
      productGroup: 'DOM',
      weight: 0.5,
    },
    {
      name: 'BH Domestic 1kg',
      route: 'Manama → Riffa',
      origin: 'Manama',
      destination: 'Riffa',
      destCountry: 'BH',
      service: 'OND',
      productGroup: 'DOM',
      weight: 1,
    },
    {
      name: 'BH Domestic 5kg',
      route: 'Manama → Riffa',
      origin: 'Manama',
      destination: 'Riffa',
      destCountry: 'BH',
      service: 'OND',
      productGroup: 'DOM',
      weight: 5,
    },
    {
      name: 'BH Domestic 0.5kg + COD 100',
      route: 'Manama → Riffa',
      origin: 'Manama',
      destination: 'Riffa',
      destCountry: 'BH',
      service: 'OND',
      productGroup: 'DOM',
      weight: 0.5,
      codAmount: 100,
    },

    // INTERNATIONAL (BH → SA)
    {
      name: 'BH→SA 0.5kg Priority',
      route: 'Manama → Riyadh',
      origin: 'Manama',
      destination: 'Riyadh',
      destCountry: 'SA',
      service: 'PPX',
      productGroup: 'EXP',
      weight: 0.5,
    },
    {
      name: 'BH→SA 1kg Priority',
      route: 'Manama → Riyadh',
      origin: 'Manama',
      destination: 'Riyadh',
      destCountry: 'SA',
      service: 'PPX',
      productGroup: 'EXP',
      weight: 1,
    },
    {
      name: 'BH→SA 2kg Priority',
      route: 'Manama → Riyadh',
      origin: 'Manama',
      destination: 'Riyadh',
      destCountry: 'SA',
      service: 'PPX',
      productGroup: 'EXP',
      weight: 2,
    },
    {
      name: 'BH→SA 5kg Deferred',
      route: 'Manama → Riyadh',
      origin: 'Manama',
      destination: 'Riyadh',
      destCountry: 'SA',
      service: 'DPX',
      productGroup: 'EXP',
      weight: 5,
    },
    {
      name: 'BH→SA 0.5kg + COD 100',
      route: 'Manama → Riyadh',
      origin: 'Manama',
      destination: 'Riyadh',
      destCountry: 'SA',
      service: 'PPX',
      productGroup: 'EXP',
      weight: 0.5,
      codAmount: 100,
    },
  ];

  console.log('Testing...\n');

  const results: any[] = [];

  for (const test of tests) {
    console.log(`Testing: ${test.name}...`);
    const result = await testRate(sdk, test);
    results.push(result);

    if (result.success) {
      console.log(`  ✓ ${result.price} ${result.currency}\n`);
    } else {
      console.log(`  ✗ FAILED: ${result.error}\n`);

      // Show detailed error notifications if available
      if (result.notifications && result.notifications.length > 0) {
        console.log('  Detailed errors:');
        result.notifications.forEach((n: any) => {
          console.log(`    - [${n.Code}] ${n.Message}`);
        });
        console.log('');
      }
    }

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Summary
  console.log('\n╔═══════════════════════════════════════════════════════════════════════════╗');
  console.log('║                            RESULTS SUMMARY                                ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════╝\n');

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`Total Tests: ${results.length}`);
  console.log(`Successful: ${successful.length} ✓`);
  console.log(`Failed: ${failed.length} ✗\n`);

  if (successful.length > 0) {
    console.log('\n━━━ SUCCESSFUL PRICING (PRODUCTION REAL RATES) ━━━\n');
    console.log('Scenario                        │  Price   │ Currency');
    console.log('────────────────────────────────┼──────────┼─────────');

    successful.forEach(r => {
      const name = r.name.padEnd(31);
      const price = r.price.toFixed(3).padStart(8);
      console.log(`${name} │ ${price} │ ${r.currency}`);
    });
  }

  if (failed.length > 0) {
    console.log('\n\n━━━ FAILED REQUESTS ━━━\n');
    failed.forEach(r => {
      console.log(`✗ ${r.name}`);
      console.log(`  Error: ${r.error}\n`);
    });

    console.log('\n💡 TROUBLESHOOTING TIPS:\n');
    console.log('If you see "ERR75 - Failed to login":');
    console.log('  → Your production API access is not activated');
    console.log('  → Contact Aramex: support@aramex.com');
    console.log('  → Request: Enable API access for account 72502462\n');

    console.log('If you see other errors:');
    console.log('  → Check account credentials are correct');
    console.log('  → Verify account has "Rate Calculator" permissions');
    console.log('  → Contact Aramex support for help\n');
  }

  if (successful.length > 0) {
    console.log('\n\n✅ PRODUCTION PRICING CONFIRMED!');
    console.log('   These are REAL Aramex rates for your account.');
    console.log('   Use these prices for customer quotes.\n');
  }
}

main().catch(console.error);

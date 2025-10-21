/**
 * Compare TEST vs PRODUCTION pricing
 * Verify cities and get REAL prices from both environments
 */

import { AramexSDK } from './src';

const testConfig = {
  username: 'testingapi@aramex.com',
  password: 'R123456789$r',
  accountNumber: '20000068',
  accountPin: '543543',
  accountEntity: 'BAH',
  accountCountryCode: 'BH',
  testMode: true,
};

const productionConfig = {
  username: 'Misimu.marketing@gmail.com',
  password: '07474738misimuR',
  accountNumber: '72502462',
  accountPin: '472612',
  accountEntity: 'BAH',
  accountCountryCode: 'BH',
  testMode: false,
};

interface TestScenario {
  name: string;
  origin: string;
  destination: string;
  destCountry: string;
  service: string;
  productGroup: string;
  weight: number;
}

async function testPricing(sdk: any, scenario: TestScenario, envName: string) {
  try {
    const response = await sdk.rate.calculateRate({
      OriginAddress: {
        Line1: '123 Street',
        City: scenario.origin,
        CountryCode: 'BH',
      },
      DestinationAddress: {
        Line1: '456 Avenue',
        City: scenario.destination,
        CountryCode: scenario.destCountry,
      },
      ShipmentDetails: {
        NumberOfPieces: 1,
        ActualWeight: {
          Unit: 'KG' as const,
          Value: scenario.weight,
        },
        ProductGroup: scenario.productGroup as any,
        ProductType: scenario.service as any,
        PaymentType: 'P',
        DescriptionOfGoods: 'Test Package',
        GoodsOriginCountry: 'BH',
      },
      PreferredCurrencyCode: 'BHD',
    });

    if (!response.HasErrors && response.TotalAmount) {
      return {
        success: true,
        price: response.TotalAmount.Value,
        currency: response.TotalAmount.CurrencyCode,
        env: envName,
      };
    } else {
      return {
        success: false,
        error: response.Notifications?.map((n: any) => n.Message).join(', ') || 'Unknown error',
        env: envName,
      };
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      env: envName,
    };
  }
}

async function main() {
  console.log('\n╔═══════════════════════════════════════════════════════════════════════════╗');
  console.log('║         TEST vs PRODUCTION ENVIRONMENT - PRICE & LOCATION CHECK          ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════╝\n');

  const scenarios: TestScenario[] = [
    {
      name: 'BH Domestic 0.5kg',
      origin: 'Manama',
      destination: 'Riffa',
      destCountry: 'BH',
      service: 'OND',
      productGroup: 'DOM',
      weight: 0.5,
    },
    {
      name: 'BH Domestic 1kg',
      origin: 'Manama',
      destination: 'Riffa',
      destCountry: 'BH',
      service: 'OND',
      productGroup: 'DOM',
      weight: 1,
    },
    {
      name: 'BH→SA 0.5kg Priority',
      origin: 'Manama',
      destination: 'Riyadh',
      destCountry: 'SA',
      service: 'PPX',
      productGroup: 'EXP',
      weight: 0.5,
    },
    {
      name: 'BH→SA 1kg Priority',
      origin: 'Manama',
      destination: 'Riyadh',
      destCountry: 'SA',
      service: 'PPX',
      productGroup: 'EXP',
      weight: 1,
    },
    {
      name: 'BH→SA 5kg Deferred',
      origin: 'Manama',
      destination: 'Riyadh',
      destCountry: 'SA',
      service: 'DPX',
      productGroup: 'EXP',
      weight: 5,
    },
  ];

  console.log('Scenario                    │ TEST Price │ PROD Price │ Difference │ Status');
  console.log('────────────────────────────┼────────────┼────────────┼────────────┼────────────');

  for (const scenario of scenarios) {
    const testSDK = new AramexSDK(testConfig);
    const prodSDK = new AramexSDK(productionConfig);

    const testResult = await testPricing(testSDK, scenario, 'TEST');
    await new Promise(resolve => setTimeout(resolve, 500));

    const prodResult = await testPricing(prodSDK, scenario, 'PROD');
    await new Promise(resolve => setTimeout(resolve, 500));

    const name = scenario.name.padEnd(27);

    if (testResult.success && prodResult.success) {
      const testPrice = (testResult as any).price.toFixed(3).padStart(10);
      const prodPrice = (prodResult as any).price.toFixed(3).padStart(10);
      const diff = ((prodResult as any).price - (testResult as any).price).toFixed(3).padStart(10);
      const status = (testResult as any).price === (prodResult as any).price ? 'SAME ✓' : 'DIFFERENT';

      console.log(`${name} │ ${testPrice} │ ${prodPrice} │ ${diff} │ ${status}`);
    } else if (testResult.success && !prodResult.success) {
      const testPrice = (testResult as any).price.toFixed(3).padStart(10);
      console.log(`${name} │ ${testPrice} │    FAILED  │     -      │ TEST OK, PROD FAIL`);
      console.log(`                              Error: ${(prodResult as any).error}`);
    } else if (!testResult.success && prodResult.success) {
      const prodPrice = (prodResult as any).price.toFixed(3).padStart(10);
      console.log(`${name} │    FAILED  │ ${prodPrice} │     -      │ TEST FAIL, PROD OK`);
      console.log(`                              Error: ${(testResult as any).error}`);
    } else {
      console.log(`${name} │    FAILED  │    FAILED  │     -      │ BOTH FAILED`);
      console.log(`                              TEST Error: ${(testResult as any).error}`);
      console.log(`                              PROD Error: ${(prodResult as any).error}`);
    }
  }

  console.log('\n\n╔═══════════════════════════════════════════════════════════════════════════╗');
  console.log('║                               ANALYSIS                                    ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════╝\n');

  console.log('✅ If PRODUCTION prices work:');
  console.log('   → Cities (Manama, Riffa, Riyadh) are CORRECT ✓');
  console.log('   → Country codes (BH, SA) are CORRECT ✓');
  console.log('   → Production prices are REAL prices you will pay\n');

  console.log('📊 If TEST prices are higher:');
  console.log('   → Test environment uses inflated/fake prices');
  console.log('   → Always use PRODUCTION prices for quotes to customers\n');

  console.log('⚠️  If PRODUCTION fails:');
  console.log('   → Check if cities need different spelling');
  console.log('   → Check if production account has permissions');
  console.log('   → Contact Aramex support\n');
}

main().catch(console.error);

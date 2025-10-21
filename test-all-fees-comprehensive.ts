/**
 * COMPREHENSIVE PRICING TEST
 * Tests: COD, Customs, Insurance, Different weights, Dimensions
 * Get ALL exact fees in BHD for BH domestic and BH→SA
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

interface TestScenario {
  name: string;
  route: string;
  origin: string;
  destination: string;
  destCountry: string;
  service: string;
  productGroup: string;
  weight: number;
  dimensions?: { Length: number; Width: number; Height: number; Unit: 'CM' };
  codAmount?: number;
  customsValue?: number;
  insuranceAmount?: number;
}

interface PriceResult {
  scenario: string;
  basePrice: number;
  totalPrice: number;
  difference: number;
  currency: string;
  details: string;
}

async function testScenario(sdk: any, scenario: TestScenario): Promise<PriceResult> {
  try {
    const shipmentDetails: any = {
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
    };

    // Add dimensions if provided
    if (scenario.dimensions) {
      shipmentDetails.Dimensions = scenario.dimensions;
    }

    // Add COD if provided
    if (scenario.codAmount) {
      shipmentDetails.CashOnDeliveryAmount = {
        CurrencyCode: 'BHD',
        Value: scenario.codAmount,
      };
    }

    // Add customs value if provided
    if (scenario.customsValue) {
      shipmentDetails.CustomsValueAmount = {
        CurrencyCode: 'BHD',
        Value: scenario.customsValue,
      };
    }

    // Add insurance if provided
    if (scenario.insuranceAmount) {
      shipmentDetails.InsuranceAmount = {
        CurrencyCode: 'BHD',
        Value: scenario.insuranceAmount,
      };
    }

    // Get price WITH extras
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
      ShipmentDetails: shipmentDetails,
      PreferredCurrencyCode: 'BHD',
    });

    // Get base price (without extras) for comparison
    const baseShipmentDetails: any = {
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
    };

    if (scenario.dimensions) {
      baseShipmentDetails.Dimensions = scenario.dimensions;
    }

    const baseResponse = await sdk.rate.calculateRate({
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
      ShipmentDetails: baseShipmentDetails,
      PreferredCurrencyCode: 'BHD',
    });

    const basePrice = baseResponse.TotalAmount?.Value || 0;
    const totalPrice = response.TotalAmount?.Value || 0;
    const difference = totalPrice - basePrice;

    const details: string[] = [];
    if (scenario.codAmount) details.push(`COD: ${scenario.codAmount} BHD`);
    if (scenario.customsValue) details.push(`Customs: ${scenario.customsValue} BHD`);
    if (scenario.insuranceAmount) details.push(`Insurance: ${scenario.insuranceAmount} BHD`);
    if (scenario.dimensions) details.push(`Dims: ${scenario.dimensions.Length}x${scenario.dimensions.Width}x${scenario.dimensions.Height}cm`);

    return {
      scenario: scenario.name,
      basePrice,
      totalPrice,
      difference,
      currency: 'BHD',
      details: details.join(', ') || 'Base only',
    };
  } catch (error: any) {
    console.error(`Error in ${scenario.name}: ${error.message}`);
    return {
      scenario: scenario.name,
      basePrice: 0,
      totalPrice: 0,
      difference: 0,
      currency: 'BHD',
      details: `ERROR: ${error.message}`,
    };
  }
}

async function main() {
  const sdk = new AramexSDK(config);
  const results: PriceResult[] = [];

  console.log('\n╔═══════════════════════════════════════════════════════════════════════════╗');
  console.log('║           COMPREHENSIVE PRICING TEST - ALL FEES & SCENARIOS              ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════╝\n');

  const scenarios: TestScenario[] = [
    // ===== DOMESTIC (BH → BH) TESTS =====
    {
      name: 'BH Domestic - Base 0.5kg',
      route: 'BH→BH',
      origin: 'Manama',
      destination: 'Riffa',
      destCountry: 'BH',
      service: 'OND',
      productGroup: 'DOM',
      weight: 0.5,
    },
    {
      name: 'BH Domestic - 0.5kg + COD 50',
      route: 'BH→BH',
      origin: 'Manama',
      destination: 'Riffa',
      destCountry: 'BH',
      service: 'OND',
      productGroup: 'DOM',
      weight: 0.5,
      codAmount: 50,
    },
    {
      name: 'BH Domestic - 0.5kg + COD 500',
      route: 'BH→BH',
      origin: 'Manama',
      destination: 'Riffa',
      destCountry: 'BH',
      service: 'OND',
      productGroup: 'DOM',
      weight: 0.5,
      codAmount: 500,
    },
    {
      name: 'BH Domestic - 2kg + COD 100',
      route: 'BH→BH',
      origin: 'Manama',
      destination: 'Riffa',
      destCountry: 'BH',
      service: 'OND',
      productGroup: 'DOM',
      weight: 2,
      codAmount: 100,
    },
    {
      name: 'BH Domestic - 5kg + Dimensions',
      route: 'BH→BH',
      origin: 'Manama',
      destination: 'Riffa',
      destCountry: 'BH',
      service: 'OND',
      productGroup: 'DOM',
      weight: 5,
      dimensions: { Length: 50, Width: 40, Height: 30, Unit: 'CM' },
    },
    {
      name: 'BH Domestic - 5kg + Dims + COD 200',
      route: 'BH→BH',
      origin: 'Manama',
      destination: 'Riffa',
      destCountry: 'BH',
      service: 'OND',
      productGroup: 'DOM',
      weight: 5,
      dimensions: { Length: 50, Width: 40, Height: 30, Unit: 'CM' },
      codAmount: 200,
    },

    // ===== INTERNATIONAL (BH → SA) TESTS =====
    {
      name: 'BH→SA - Base 0.5kg Priority',
      route: 'BH→SA',
      origin: 'Manama',
      destination: 'Riyadh',
      destCountry: 'SA',
      service: 'PPX',
      productGroup: 'EXP',
      weight: 0.5,
    },
    {
      name: 'BH→SA - 0.5kg + COD 50',
      route: 'BH→SA',
      origin: 'Manama',
      destination: 'Riyadh',
      destCountry: 'SA',
      service: 'PPX',
      productGroup: 'EXP',
      weight: 0.5,
      codAmount: 50,
    },
    {
      name: 'BH→SA - 0.5kg + COD 500',
      route: 'BH→SA',
      origin: 'Manama',
      destination: 'Riyadh',
      destCountry: 'SA',
      service: 'PPX',
      productGroup: 'EXP',
      weight: 0.5,
      codAmount: 500,
    },
    {
      name: 'BH→SA - 1kg + Customs 1000',
      route: 'BH→SA',
      origin: 'Manama',
      destination: 'Riyadh',
      destCountry: 'SA',
      service: 'PPX',
      productGroup: 'EXP',
      weight: 1,
      customsValue: 1000,
    },
    {
      name: 'BH→SA - 1kg + Insurance 500',
      route: 'BH→SA',
      origin: 'Manama',
      destination: 'Riyadh',
      destCountry: 'SA',
      service: 'PPX',
      productGroup: 'EXP',
      weight: 1,
      insuranceAmount: 500,
    },
    {
      name: 'BH→SA - 1kg + COD 100 + Customs 500',
      route: 'BH→SA',
      origin: 'Manama',
      destination: 'Riyadh',
      destCountry: 'SA',
      service: 'PPX',
      productGroup: 'EXP',
      weight: 1,
      codAmount: 100,
      customsValue: 500,
    },
    {
      name: 'BH→SA - 2kg + ALL extras',
      route: 'BH→SA',
      origin: 'Manama',
      destination: 'Riyadh',
      destCountry: 'SA',
      service: 'PPX',
      productGroup: 'EXP',
      weight: 2,
      codAmount: 200,
      customsValue: 1000,
      insuranceAmount: 500,
      dimensions: { Length: 40, Width: 30, Height: 20, Unit: 'CM' },
    },
    {
      name: 'BH→SA - 5kg Deferred + COD 100',
      route: 'BH→SA',
      origin: 'Manama',
      destination: 'Riyadh',
      destCountry: 'SA',
      service: 'DPX',
      productGroup: 'EXP',
      weight: 5,
      codAmount: 100,
    },
  ];

  console.log('Running tests...\n');

  for (const scenario of scenarios) {
    const result = await testScenario(sdk, scenario);
    results.push(result);

    console.log(`✓ ${scenario.name}`);

    await new Promise(resolve => setTimeout(resolve, 400));
  }

  // ===== RESULTS TABLE =====
  console.log('\n\n╔═══════════════════════════════════════════════════════════════════════════╗');
  console.log('║                         DETAILED PRICE RESULTS                            ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════╝\n');

  console.log('Scenario                                  │ Base    │ Total   │ Fee   │ Details');
  console.log('──────────────────────────────────────────┼─────────┼─────────┼───────┼────────────────────');

  for (const result of results) {
    const scenario = result.scenario.padEnd(41);
    const base = result.basePrice.toFixed(3).padStart(7);
    const total = result.totalPrice.toFixed(3).padStart(7);
    const fee = result.difference.toFixed(3).padStart(5);
    const details = result.details;

    console.log(`${scenario} │ ${base} │ ${total} │ ${fee} │ ${details}`);
  }

  // ===== ANALYSIS =====
  console.log('\n\n╔═══════════════════════════════════════════════════════════════════════════╗');
  console.log('║                              FEE ANALYSIS                                 ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════╝\n');

  const domesticCOD = results.filter(r => r.scenario.includes('BH Domestic') && r.scenario.includes('COD'));
  const internationalCOD = results.filter(r => r.scenario.includes('BH→SA') && r.scenario.includes('COD'));
  const customsResults = results.filter(r => r.scenario.includes('Customs'));
  const insuranceResults = results.filter(r => r.scenario.includes('Insurance'));

  console.log('📊 COD FEES:');
  console.log('─────────────────────────────');
  if (domesticCOD.length > 0) {
    console.log('\nDomestic (BH→BH):');
    domesticCOD.forEach(r => {
      console.log(`  ${r.scenario}: Fee = ${r.difference.toFixed(3)} BHD`);
    });
  }

  if (internationalCOD.length > 0) {
    console.log('\nInternational (BH→SA):');
    internationalCOD.forEach(r => {
      console.log(`  ${r.scenario}: Fee = ${r.difference.toFixed(3)} BHD`);
    });
  }

  if (customsResults.length > 0) {
    console.log('\n\n📊 CUSTOMS VALUE FEES:');
    console.log('─────────────────────────────');
    customsResults.forEach(r => {
      console.log(`  ${r.scenario}: Fee = ${r.difference.toFixed(3)} BHD`);
    });
  }

  if (insuranceResults.length > 0) {
    console.log('\n\n📊 INSURANCE FEES:');
    console.log('─────────────────────────────');
    insuranceResults.forEach(r => {
      console.log(`  ${r.scenario}: Fee = ${r.difference.toFixed(3)} BHD`);
    });
  }

  console.log('\n\n✅ Comprehensive pricing test completed!\n');
}

main().catch(console.error);

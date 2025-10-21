/**
 * Test Cash on Delivery (COD) pricing for BH domestic and BH→SA
 * Get EXACT COD fees in BHD
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

interface CODResult {
  route: string;
  service: string;
  weight: number;
  codAmount: number;
  totalPrice: number;
  basePrice?: number;
  codFee?: number;
  currency: string;
}

async function testCOD(
  sdk: any,
  route: string,
  origin: string,
  destination: string,
  countryCode: string,
  service: string,
  productGroup: string,
  weight: number,
  codAmount: number
): Promise<CODResult> {
  try {
    // First get price without COD
    const withoutCOD = await sdk.rate.calculateRate({
      OriginAddress: {
        Line1: '123 Street',
        City: origin,
        CountryCode: 'BH',
      },
      DestinationAddress: {
        Line1: '456 Avenue',
        City: destination,
        CountryCode: countryCode,
      },
      ShipmentDetails: {
        NumberOfPieces: 1,
        ActualWeight: {
          Unit: 'KG',
          Value: weight,
        },
        ProductGroup: productGroup,
        ProductType: service,
        PaymentType: 'P',
        DescriptionOfGoods: 'Test Package',
        GoodsOriginCountry: 'BH',
      },
      PreferredCurrencyCode: 'BHD',
    });

    // Then get price with COD
    const withCOD = await sdk.rate.calculateRate({
      OriginAddress: {
        Line1: '123 Street',
        City: origin,
        CountryCode: 'BH',
      },
      DestinationAddress: {
        Line1: '456 Avenue',
        City: destination,
        CountryCode: countryCode,
      },
      ShipmentDetails: {
        NumberOfPieces: 1,
        ActualWeight: {
          Unit: 'KG',
          Value: weight,
        },
        ProductGroup: productGroup,
        ProductType: service,
        PaymentType: 'P',
        DescriptionOfGoods: 'Test Package',
        GoodsOriginCountry: 'BH',
        CashOnDeliveryAmount: {
          CurrencyCode: 'BHD',
          Value: codAmount,
        },
      },
      PreferredCurrencyCode: 'BHD',
    });

    const basePrice = withoutCOD.TotalAmount?.Value || 0;
    const totalWithCOD = withCOD.TotalAmount?.Value || 0;
    const codFee = totalWithCOD - basePrice;

    return {
      route,
      service,
      weight,
      codAmount,
      totalPrice: totalWithCOD,
      basePrice,
      codFee,
      currency: 'BHD',
    };
  } catch (error: any) {
    console.error(`Error testing COD: ${error.message}`);
    return {
      route,
      service,
      weight,
      codAmount,
      totalPrice: 0,
      currency: 'BHD',
    };
  }
}

async function main() {
  const sdk = new AramexSDK(config);
  const results: CODResult[] = [];

  console.log('\n╔═══════════════════════════════════════════════════════════════════════════╗');
  console.log('║              CASH ON DELIVERY (COD) PRICING - EXACT BHD FEES             ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════╝\n');

  // Test COD amounts
  const codAmounts = [10, 50, 100, 500];
  const weights = [0.5, 1, 5];

  // ============= DOMESTIC (BH → BH) COD TESTS =============
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  DOMESTIC (Manama → Riffa) - Standard Service (OND)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  for (const weight of weights) {
    console.log(`\n📦 Weight: ${weight}kg\n`);
    console.log('COD Amount │ Base Price │ COD Fee │ Total Price');
    console.log('───────────┼────────────┼─────────┼────────────');

    for (const codAmount of codAmounts) {
      const result = await testCOD(
        sdk,
        'BH→BH',
        'Manama',
        'Riffa',
        'BH',
        'OND',
        'DOM',
        weight,
        codAmount
      );
      results.push(result);

      console.log(
        `${codAmount.toString().padStart(10)} │ ${result.basePrice?.toFixed(3).padStart(10)} │ ${result.codFee?.toFixed(3).padStart(7)} │ ${result.totalPrice.toFixed(3).padStart(11)}`
      );

      await new Promise(resolve => setTimeout(resolve, 400));
    }
  }

  // ============= INTERNATIONAL (BH → SA) COD TESTS =============
  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  INTERNATIONAL (Manama, BH → Riyadh, SA) - Priority Express (PPX)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  for (const weight of [0.5, 1]) {
    console.log(`\n📦 Weight: ${weight}kg\n`);
    console.log('COD Amount │ Base Price │ COD Fee │ Total Price');
    console.log('───────────┼────────────┼─────────┼────────────');

    for (const codAmount of codAmounts) {
      const result = await testCOD(
        sdk,
        'BH→SA',
        'Manama',
        'Riyadh',
        'SA',
        'PPX',
        'EXP',
        weight,
        codAmount
      );
      results.push(result);

      console.log(
        `${codAmount.toString().padStart(10)} │ ${result.basePrice?.toFixed(3).padStart(10)} │ ${result.codFee?.toFixed(3).padStart(7)} │ ${result.totalPrice.toFixed(3).padStart(11)}`
      );

      await new Promise(resolve => setTimeout(resolve, 400));
    }
  }

  // ============= SUMMARY =============
  console.log('\n\n╔═══════════════════════════════════════════════════════════════════════════╗');
  console.log('║                            COD FEE ANALYSIS                               ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════╝\n');

  // Analyze COD fee structure
  const domesticResults = results.filter(r => r.route === 'BH→BH');
  const internationalResults = results.filter(r => r.route === 'BH→SA');

  console.log('DOMESTIC (BH → BH):');
  console.log('─────────────────────────────────────────');
  if (domesticResults.length > 0) {
    const fees = domesticResults.map(r => r.codFee).filter(f => f !== undefined) as number[];
    const uniqueFees = [...new Set(fees)];

    console.log('COD Fees observed:');
    uniqueFees.forEach(fee => {
      const samples = domesticResults.filter(r => r.codFee === fee);
      console.log(`  • ${fee.toFixed(3)} BHD (for COD amounts: ${samples.map(s => s.codAmount).join(', ')} BHD)`);
    });

    // Check if it's percentage based
    const feeRatios = domesticResults
      .filter(r => r.codFee && r.codFee > 0)
      .map(r => ((r.codFee! / r.codAmount) * 100).toFixed(2));
    const uniqueRatios = [...new Set(feeRatios)];

    if (uniqueRatios.length === 1) {
      console.log(`\n  📊 COD Fee Structure: ${uniqueRatios[0]}% of COD amount`);
    } else if (uniqueFees.length === 1 && uniqueFees[0] > 0) {
      console.log(`\n  📊 COD Fee Structure: Flat fee of ${uniqueFees[0].toFixed(3)} BHD`);
    }
  }

  console.log('\n\nINTERNATIONAL (BH → SA):');
  console.log('─────────────────────────────────────────');
  if (internationalResults.length > 0) {
    const fees = internationalResults.map(r => r.codFee).filter(f => f !== undefined) as number[];
    const uniqueFees = [...new Set(fees)];

    console.log('COD Fees observed:');
    uniqueFees.forEach(fee => {
      const samples = internationalResults.filter(r => r.codFee === fee);
      console.log(`  • ${fee.toFixed(3)} BHD (for COD amounts: ${samples.map(s => s.codAmount).join(', ')} BHD)`);
    });

    // Check if it's percentage based
    const feeRatios = internationalResults
      .filter(r => r.codFee && r.codFee > 0)
      .map(r => ((r.codFee! / r.codAmount) * 100).toFixed(2));
    const uniqueRatios = [...new Set(feeRatios)];

    if (uniqueRatios.length === 1) {
      console.log(`\n  📊 COD Fee Structure: ${uniqueRatios[0]}% of COD amount`);
    } else if (uniqueFees.length === 1 && uniqueFees[0] > 0) {
      console.log(`\n  📊 COD Fee Structure: Flat fee of ${uniqueFees[0].toFixed(3)} BHD`);
    }
  }

  console.log('\n\n✅ COD Testing completed!\n');
}

main().catch(console.error);

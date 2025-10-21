/**
 * GET ALL REAL PRODUCTION PRICES
 * Using WORKING production credentials with correct password
 */

import { AramexSDK } from './src';

const PRODUCTION_CONFIG = {
  username: 'Misimu.marketing@gmail.com',
  password: '07474738misimuR?',  // WITH ? at the end!
  accountNumber: '72502462',
  accountPin: '472612',
  accountEntity: 'BAH',
  accountCountryCode: 'BH',
  testMode: false,
};

interface TestCase {
  name: string;
  origin: string;
  destination: string;
  destCountry: string;
  service: string;
  productGroup: string;
  weight: number;
  codAmount?: number;
  dimensions?: { Length: number; Width: number; Height: number; Unit: 'CM' };
}

async function main() {
  const sdk = new AramexSDK(PRODUCTION_CONFIG);

  console.log('\n╔═══════════════════════════════════════════════════════════════════════════╗');
  console.log('║              🎯 REAL PRODUCTION ARAMEX PRICES (BHD)                       ║');
  console.log('║              Account: 72502462 - ACTIVATED & WORKING ✅                   ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════╝\n');

  const tests: TestCase[] = [
    // ===== DOMESTIC (BH → BH) =====
    { name: 'DOM 0.1kg', origin: 'Manama', destination: 'Riffa', destCountry: 'BH', service: 'OND', productGroup: 'DOM', weight: 0.1 },
    { name: 'DOM 0.25kg', origin: 'Manama', destination: 'Riffa', destCountry: 'BH', service: 'OND', productGroup: 'DOM', weight: 0.25 },
    { name: 'DOM 0.5kg', origin: 'Manama', destination: 'Riffa', destCountry: 'BH', service: 'OND', productGroup: 'DOM', weight: 0.5 },
    { name: 'DOM 1kg', origin: 'Manama', destination: 'Riffa', destCountry: 'BH', service: 'OND', productGroup: 'DOM', weight: 1 },
    { name: 'DOM 2kg', origin: 'Manama', destination: 'Riffa', destCountry: 'BH', service: 'OND', productGroup: 'DOM', weight: 2 },
    { name: 'DOM 5kg', origin: 'Manama', destination: 'Riffa', destCountry: 'BH', service: 'OND', productGroup: 'DOM', weight: 5 },
    { name: 'DOM 10kg', origin: 'Manama', destination: 'Riffa', destCountry: 'BH', service: 'OND', productGroup: 'DOM', weight: 10 },
    { name: 'DOM 20kg', origin: 'Manama', destination: 'Riffa', destCountry: 'BH', service: 'OND', productGroup: 'DOM', weight: 20 },

    // ===== DOMESTIC WITH COD =====
    { name: 'DOM 0.5kg + COD 50', origin: 'Manama', destination: 'Riffa', destCountry: 'BH', service: 'OND', productGroup: 'DOM', weight: 0.5, codAmount: 50 },
    { name: 'DOM 0.5kg + COD 100', origin: 'Manama', destination: 'Riffa', destCountry: 'BH', service: 'OND', productGroup: 'DOM', weight: 0.5, codAmount: 100 },
    { name: 'DOM 0.5kg + COD 500', origin: 'Manama', destination: 'Riffa', destCountry: 'BH', service: 'OND', productGroup: 'DOM', weight: 0.5, codAmount: 500 },

    // ===== DOMESTIC WITH DIMENSIONS =====
    { name: 'DOM 5kg + Dims', origin: 'Manama', destination: 'Riffa', destCountry: 'BH', service: 'OND', productGroup: 'DOM', weight: 5, dimensions: { Length: 50, Width: 40, Height: 30, Unit: 'CM' } },

    // ===== INTERNATIONAL PRIORITY (BH → SA) =====
    { name: 'INT 0.5kg Priority', origin: 'Manama', destination: 'Riyadh', destCountry: 'SA', service: 'PPX', productGroup: 'EXP', weight: 0.5 },
    { name: 'INT 1kg Priority', origin: 'Manama', destination: 'Riyadh', destCountry: 'SA', service: 'PPX', productGroup: 'EXP', weight: 1 },
    { name: 'INT 2kg Priority', origin: 'Manama', destination: 'Riyadh', destCountry: 'SA', service: 'PPX', productGroup: 'EXP', weight: 2 },
    { name: 'INT 5kg Priority', origin: 'Manama', destination: 'Riyadh', destCountry: 'SA', service: 'PPX', productGroup: 'EXP', weight: 5 },
    { name: 'INT 10kg Priority', origin: 'Manama', destination: 'Riyadh', destCountry: 'SA', service: 'PPX', productGroup: 'EXP', weight: 10 },

    // ===== INTERNATIONAL DEFERRED (BH → SA) =====
    { name: 'INT 0.5kg Deferred', origin: 'Manama', destination: 'Riyadh', destCountry: 'SA', service: 'DPX', productGroup: 'EXP', weight: 0.5 },
    { name: 'INT 1kg Deferred', origin: 'Manama', destination: 'Riyadh', destCountry: 'SA', service: 'DPX', productGroup: 'EXP', weight: 1 },
    { name: 'INT 5kg Deferred', origin: 'Manama', destination: 'Riyadh', destCountry: 'SA', service: 'DPX', productGroup: 'EXP', weight: 5 },
    { name: 'INT 10kg Deferred', origin: 'Manama', destination: 'Riyadh', destCountry: 'SA', service: 'DPX', productGroup: 'EXP', weight: 10 },

    // ===== INTERNATIONAL WITH COD =====
    { name: 'INT 0.5kg + COD 100', origin: 'Manama', destination: 'Riyadh', destCountry: 'SA', service: 'PPX', productGroup: 'EXP', weight: 0.5, codAmount: 100 },
    { name: 'INT 1kg + COD 100', origin: 'Manama', destination: 'Riyadh', destCountry: 'SA', service: 'PPX', productGroup: 'EXP', weight: 1, codAmount: 100 },
  ];

  const results: any[] = [];

  for (const test of tests) {
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

      if (test.dimensions) {
        shipmentDetails.Dimensions = test.dimensions;
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
        results.push({
          name: test.name,
          price: response.TotalAmount.Value,
          currency: response.TotalAmount.CurrencyCode,
          success: true,
        });
        console.log(`✓ ${test.name.padEnd(25)} ${response.TotalAmount.Value.toFixed(3)} BHD`);
      } else {
        results.push({ name: test.name, success: false, error: 'API error' });
        console.log(`✗ ${test.name.padEnd(25)} FAILED`);
      }

      await new Promise(resolve => setTimeout(resolve, 400));

    } catch (error: any) {
      results.push({ name: test.name, success: false, error: error.message });
      console.log(`✗ ${test.name.padEnd(25)} ERROR`);
    }
  }

  // ===== SUMMARY TABLES =====
  console.log('\n\n╔═══════════════════════════════════════════════════════════════════════════╗');
  console.log('║                   📊 COMPLETE PRICING TABLES                              ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════╝\n');

  // Domestic table
  const domestic = results.filter(r => r.name.startsWith('DOM') && !r.name.includes('COD') && !r.name.includes('Dims') && r.success);
  if (domestic.length > 0) {
    console.log('━━━ DOMESTIC (BH → BH) - Manama to Riffa ━━━\n');
    console.log('Weight  │  Price (BHD) │  USD Equiv');
    console.log('────────┼──────────────┼────────────');
    domestic.forEach(r => {
      const weight = r.name.replace('DOM ', '').padEnd(6);
      const price = r.price.toFixed(3).padStart(12);
      const usd = `~$${(r.price * 2.65).toFixed(2)}`.padStart(10);
      console.log(`${weight} │ ${price} │ ${usd}`);
    });
  }

  // International Priority
  const intPriority = results.filter(r => r.name.includes('Priority') && !r.name.includes('COD') && r.success);
  if (intPriority.length > 0) {
    console.log('\n\n━━━ INTERNATIONAL (BH → SA) - Priority Express ━━━\n');
    console.log('Weight  │  Price (BHD) │  USD Equiv');
    console.log('────────┼──────────────┼────────────');
    intPriority.forEach(r => {
      const weight = r.name.replace('INT ', '').replace(' Priority', '').padEnd(6);
      const price = r.price.toFixed(3).padStart(12);
      const usd = `~$${(r.price * 2.65).toFixed(2)}`.padStart(10);
      console.log(`${weight} │ ${price} │ ${usd}`);
    });
  }

  // International Deferred
  const intDeferred = results.filter(r => r.name.includes('Deferred') && !r.name.includes('COD') && r.success);
  if (intDeferred.length > 0) {
    console.log('\n\n━━━ INTERNATIONAL (BH → SA) - Deferred (Economy) ━━━\n');
    console.log('Weight  │  Price (BHD) │  USD Equiv');
    console.log('────────┼──────────────┼────────────');
    intDeferred.forEach(r => {
      const weight = r.name.replace('INT ', '').replace(' Deferred', '').padEnd(6);
      const price = r.price.toFixed(3).padStart(12);
      const usd = `~$${(r.price * 2.65).toFixed(2)}`.padStart(10);
      console.log(`${weight} │ ${price} │ ${usd}`);
    });
  }

  // COD Analysis
  const codTests = results.filter(r => r.name.includes('COD') && r.success);
  if (codTests.length > 0) {
    console.log('\n\n━━━ CASH ON DELIVERY (COD) FEES ━━━\n');
    console.log('Scenario              │ COD Amount │  Price   │ COD Fee');
    console.log('──────────────────────┼────────────┼──────────┼─────────');

    // Find base prices
    const dom05Base = results.find(r => r.name === 'DOM 0.5kg')?.price || 0;
    const int05Base = results.find(r => r.name === 'INT 0.5kg Priority')?.price || 0;
    const int1Base = results.find(r => r.name === 'INT 1kg Priority')?.price || 0;

    codTests.forEach(r => {
      let basePrice = 0;
      if (r.name.includes('DOM')) basePrice = dom05Base;
      else if (r.name.includes('0.5kg')) basePrice = int05Base;
      else if (r.name.includes('1kg')) basePrice = int1Base;

      const fee = r.price - basePrice;
      const codMatch = r.name.match(/COD (\d+)/);
      const codAmount = codMatch ? codMatch[1] : '?';

      console.log(`${r.name.padEnd(21)} │ ${codAmount.padStart(10)} │ ${r.price.toFixed(3).padStart(8)} │ ${fee.toFixed(3).padStart(7)}`);
    });
  }

  console.log('\n\n✅ REAL PRODUCTION PRICING COMPLETE!\n');
  console.log(`Total tests: ${results.length}`);
  console.log(`Successful: ${results.filter(r => r.success).length}`);
  console.log(`Failed: ${results.filter(r => !r.success).length}\n`);
}

main().catch(console.error);

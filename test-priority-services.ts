/**
 * Test PRIORITY/EXPRESS services for Bahrain domestic shipping with all weights
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

const PRIORITY_SERVICES = [
  { code: 'OND' as const, name: 'Standard Domestic', group: 'DOM' as const },
  { code: 'PDX' as const, name: 'Priority Document Express (Next Day)', group: 'EXP' as const },
  { code: 'PPX' as const, name: 'Priority Parcel Express (Next Day)', group: 'EXP' as const },
  { code: 'PLX' as const, name: 'Priority Letter Express (Next Day)', group: 'EXP' as const },
];

async function main() {
  const sdk = new AramexSDK(config);
  const weights = [0.1, 0.25, 0.5, 1, 2, 5, 10, 15, 20];

  console.log('\n╔════════════════════════════════════════════════════════════════════════╗');
  console.log('║  BAHRAIN DOMESTIC - ALL SERVICE TYPES WITH ALL WEIGHTS (EXACT BHD)     ║');
  console.log('║  Route: Manama → Riffa                                                 ║');
  console.log('╚════════════════════════════════════════════════════════════════════════╝\n');

  for (const service of PRIORITY_SERVICES) {
    console.log(`\n━━━ ${service.name} (${service.code}) ━━━\n`);
    console.log('Weight (kg) │ Price (BHD)');
    console.log('────────────┼─────────────');

    for (const weight of weights) {
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
            ProductGroup: service.group,
            ProductType: service.code,
            PaymentType: 'P',
            DescriptionOfGoods: 'Test Package',
            GoodsOriginCountry: 'BH',
          },
          PreferredCurrencyCode: 'BHD',
        });

        if (!response.HasErrors && response.TotalAmount) {
          console.log(`${weight.toString().padEnd(11)} │ ${response.TotalAmount.Value.toFixed(3)}`);
        } else {
          console.log(`${weight.toString().padEnd(11)} │ ERROR`);
        }

        await new Promise(resolve => setTimeout(resolve, 300));

      } catch (error: any) {
        console.log(`${weight.toString().padEnd(11)} │ ERROR: ${error.message.substring(0, 30)}`);
      }
    }
  }

  console.log('\n\n╔════════════════════════════════════════════════════════════════════════╗');
  console.log('║                       COMPLETE PRICE TABLE                             ║');
  console.log('╚════════════════════════════════════════════════════════════════════════╝\n');
}

main().catch(console.error);

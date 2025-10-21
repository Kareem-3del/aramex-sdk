/**
 * Get EXACT Bahrain (BH) domestic shipping prices in BHD currency
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

async function main() {
  const sdk = new AramexSDK(config);

  // BH Cities to test
  const cities = ['Manama', 'Riffa', 'Muharraq'];

  // Weights to test (including less than 0.5kg)
  const weights = [0.1, 0.25, 0.5, 1, 2, 5];

  console.log('====== BAHRAIN DOMESTIC SHIPPING PRICES (BHD) ======\n');

  // Test Manama to Riffa for all weights
  console.log('Route: Manama → Riffa\n');
  console.log('Weight (kg) | Price (BHD)');
  console.log('------------|------------');

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
          ProductGroup: 'DOM',
          ProductType: 'OND', // ON DEMAND
          PaymentType: 'P', // Prepaid
          DescriptionOfGoods: 'Test Package',
          GoodsOriginCountry: 'BH',
        },
        PreferredCurrencyCode: 'BHD', // Set currency to BHD
      });

      if (!response.HasErrors && response.TotalAmount) {
        console.log(`${weight.toString().padEnd(11)} | ${response.TotalAmount.Value.toFixed(3)} ${response.TotalAmount.CurrencyCode}`);
      } else {
        console.log(`${weight.toString().padEnd(11)} | ERROR: ${response.Notifications?.map(n => n.Message).join(', ')}`);
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 300));

    } catch (error: any) {
      console.log(`${weight.toString().padEnd(11)} | ERROR: ${error.message.substring(0, 80)}`);
      if (weight === 0.5) {
        // Print full error for first weight
        console.log('\nFull error details:');
        console.log(JSON.stringify(error, null, 2));
      }
    }
  }

  console.log('\n====== ALL CITY COMBINATIONS (0.5kg sample) ======\n');

  for (let i = 0; i < cities.length; i++) {
    for (let j = 0; j < cities.length; j++) {
      if (i === j) continue; // Skip same city

      const from = cities[i];
      const to = cities[j];

      try {
        const response = await sdk.rate.calculateRate({
          OriginAddress: {
            Line1: '123 Street',
            City: from,
            CountryCode: 'BH',
          },
          DestinationAddress: {
            Line1: '456 Avenue',
            City: to,
            CountryCode: 'BH',
          },
          ShipmentDetails: {
            NumberOfPieces: 1,
            ActualWeight: {
              Unit: 'KG',
              Value: 0.5,
            },
            ProductGroup: 'DOM',
            ProductType: 'OND',
            PaymentType: 'P',
            DescriptionOfGoods: 'Test Package',
            GoodsOriginCountry: 'BH',
          },
          PreferredCurrencyCode: 'BHD',
        });

        if (!response.HasErrors && response.TotalAmount) {
          console.log(`${from.padEnd(10)} → ${to.padEnd(10)} | ${response.TotalAmount.Value.toFixed(3)} ${response.TotalAmount.CurrencyCode}`);
        } else {
          console.log(`${from.padEnd(10)} → ${to.padEnd(10)} | ERROR`);
        }

        await new Promise(resolve => setTimeout(resolve, 300));

      } catch (error: any) {
        console.log(`${from.padEnd(10)} → ${to.padEnd(10)} | ERROR: ${error.message.substring(0, 60)}`);
      }
    }
  }

  console.log('\n====== DONE ======');
}

main().catch(console.error);

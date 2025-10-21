/**
 * Debug production API errors - get detailed error messages
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

async function main() {
  console.log('\n╔═══════════════════════════════════════════════════════════════════════════╗');
  console.log('║              PRODUCTION API - DETAILED ERROR DEBUGGING                    ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════╝\n');

  const sdk = new AramexSDK(productionConfig);

  console.log('Testing with PRODUCTION credentials:');
  console.log(`  Username: ${productionConfig.username}`);
  console.log(`  Account: ${productionConfig.accountNumber}`);
  console.log(`  Entity: ${productionConfig.accountEntity}\n`);

  try {
    console.log('Attempting rate calculation: Manama → Riffa (0.5kg)...\n');

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
          Unit: 'KG' as const,
          Value: 0.5,
        },
        ProductGroup: 'DOM' as const,
        ProductType: 'OND' as const,
        PaymentType: 'P',
        DescriptionOfGoods: 'Test Package',
        GoodsOriginCountry: 'BH',
      },
      PreferredCurrencyCode: 'BHD',
    });

    if (response.HasErrors) {
      console.log('❌ API returned errors:\n');
      if (response.Notifications && response.Notifications.length > 0) {
        response.Notifications.forEach((notif, index) => {
          console.log(`Error ${index + 1}:`);
          console.log(`  Code: ${notif.Code}`);
          console.log(`  Message: ${notif.Message}\n`);
        });
      }
    } else {
      console.log('✅ SUCCESS! Rate calculated:\n');
      console.log(`  Price: ${response.TotalAmount?.Value} ${response.TotalAmount?.CurrencyCode}`);
    }

    // Show full response
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Full API Response:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(JSON.stringify(response, null, 2));

  } catch (error: any) {
    console.log('❌ EXCEPTION thrown:\n');
    console.log(`  Error: ${error.message}\n`);

    if (error.notifications) {
      console.log('Error notifications:');
      error.notifications.forEach((notif: any, index: number) => {
        console.log(`  ${index + 1}. [${notif.Code}] ${notif.Message}`);
      });
    }

    console.log('\nFull error object:');
    console.log(JSON.stringify(error, null, 2));
  }

  console.log('\n\n╔═══════════════════════════════════════════════════════════════════════════╗');
  console.log('║                           RECOMMENDATIONS                                 ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════╝\n');

  console.log('Common reasons for production API failures:\n');
  console.log('1. Account not activated - Contact Aramex to activate your account');
  console.log('2. Missing permissions - Request "Rate Calculator" API access');
  console.log('3. Wrong credentials - Verify username, password, account number');
  console.log('4. Account suspended - Check account status with Aramex');
  console.log('5. Wrong entity/country - Verify accountEntity matches your setup\n');
}

main().catch(console.error);

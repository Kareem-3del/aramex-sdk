/**
 * Test EXACT production credentials as provided
 * Testing both with and without the '?' at end of password
 */

import { AramexSDK } from './src';

async function testWithPassword(password: string, label: string) {
  const config = {
    username: 'Misimu.marketing@gmail.com',
    password: password,
    accountNumber: '72502462',
    accountPin: '472612',
    accountEntity: 'BAH',
    accountCountryCode: 'BH',
    testMode: false,
  };

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`  Testing with password: ${label}`);
  console.log(`  Password: ${password}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  const sdk = new AramexSDK(config);

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

    if (!response.HasErrors && response.TotalAmount) {
      console.log(`✅ SUCCESS! ${label} is CORRECT!\n`);
      console.log(`   Price: ${response.TotalAmount.Value} ${response.TotalAmount.CurrencyCode}`);
      console.log(`   Account is WORKING and ACTIVATED!\n`);
      return true;
    } else {
      console.log(`❌ FAILED with ${label}\n`);
      if (response.Notifications && response.Notifications.length > 0) {
        response.Notifications.forEach((n: any) => {
          console.log(`   [${n.Code}] ${n.Message}`);
        });
      }
      console.log('');
      return false;
    }
  } catch (error: any) {
    console.log(`❌ EXCEPTION with ${label}\n`);
    console.log(`   Error: ${error.message}\n`);
    if (error.notifications) {
      error.notifications.forEach((n: any) => {
        console.log(`   [${n.Code}] ${n.Message}`);
      });
      console.log('');
    }
    return false;
  }
}

async function main() {
  console.log('\n╔═══════════════════════════════════════════════════════════════════════════╗');
  console.log('║         PRODUCTION CREDENTIALS VERIFICATION - EXACT TEST                  ║');
  console.log('║         Account: 72502462 (Misimu.marketing@gmail.com)                    ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════╝\n');

  console.log('Testing credentials with different password variations...\n');

  // Test 1: With '?' at the end (as in .env file)
  const result1 = await testWithPassword('07474738misimuR?', 'Password WITH ?');

  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 2: Without '?' at the end
  const result2 = await testWithPassword('07474738misimuR', 'Password WITHOUT ?');

  console.log('\n╔═══════════════════════════════════════════════════════════════════════════╗');
  console.log('║                              RESULTS                                      ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════╝\n');

  if (result1) {
    console.log('✅ CORRECT PASSWORD: 07474738misimuR? (WITH the ? at the end)');
    console.log('   Your production account is WORKING!\n');
  } else if (result2) {
    console.log('✅ CORRECT PASSWORD: 07474738misimuR (WITHOUT the ? at the end)');
    console.log('   Your production account is WORKING!\n');
  } else {
    console.log('❌ BOTH passwords FAILED!');
    console.log('\nPossible issues:');
    console.log('  1. Password is incorrect (neither with nor without ?)');
    console.log('  2. Account not activated for API access');
    console.log('  3. Wrong account number or PIN');
    console.log('  4. Account suspended\n');
    console.log('Next steps:');
    console.log('  → Log into Aramex portal with these credentials');
    console.log('  → Contact Aramex support: support@aramex.com');
    console.log('  → Request API access activation\n');
  }
}

main().catch(console.error);

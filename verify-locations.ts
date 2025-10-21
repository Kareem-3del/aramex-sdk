/**
 * Verify cities and locations using Aramex Location API
 * Get REAL cities from Aramex to ensure our tests use correct data
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

  console.log('\n╔═══════════════════════════════════════════════════════════════════════════╗');
  console.log('║              VERIFY REAL CITIES FROM ARAMEX LOCATION API                  ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════╝\n');

  // ===== BAHRAIN CITIES =====
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  BAHRAIN (BH) - Fetching all cities from Aramex API');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const bhCities = await sdk.location.fetchCities('BH');

    if (bhCities.Cities && bhCities.Cities.length > 0) {
      console.log(`✓ Found ${bhCities.Cities.length} cities in Bahrain:\n`);

      bhCities.Cities.forEach((city: any, index: number) => {
        console.log(`${(index + 1).toString().padStart(3)}. ${city}`);
      });

      // Check if our test cities are valid
      console.log('\n\n📋 VALIDATION - Cities we used in tests:');
      console.log('─────────────────────────────────────────────────────────');

      const ourTestCities = ['Manama', 'Riffa', 'Muharraq'];
      const cityList = bhCities.Cities.map((c: any) => typeof c === 'string' ? c : c.Name || c);

      ourTestCities.forEach(testCity => {
        const found = cityList.some((city: string) =>
          city.toLowerCase().includes(testCity.toLowerCase()) ||
          testCity.toLowerCase().includes(city.toLowerCase())
        );

        if (found) {
          console.log(`  ✓ "${testCity}" - VALID (found in Aramex database)`);
        } else {
          console.log(`  ✗ "${testCity}" - NOT FOUND (might need different spelling)`);
        }
      });
    } else {
      console.log('✗ No cities returned from API');
    }
  } catch (error: any) {
    console.log(`✗ Error fetching Bahrain cities: ${error.message}`);
  }

  // ===== SAUDI ARABIA CITIES =====
  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  SAUDI ARABIA (SA) - Fetching all cities from Aramex API');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const saCities = await sdk.location.fetchCities('SA');

    if (saCities.Cities && saCities.Cities.length > 0) {
      console.log(`✓ Found ${saCities.Cities.length} cities in Saudi Arabia:\n`);

      // Show first 50 cities
      saCities.Cities.slice(0, 50).forEach((city: any, index: number) => {
        console.log(`${(index + 1).toString().padStart(3)}. ${city}`);
      });

      if (saCities.Cities.length > 50) {
        console.log(`\n... and ${saCities.Cities.length - 50} more cities`);
      }

      // Check if our test cities are valid
      console.log('\n\n📋 VALIDATION - Cities we used in tests:');
      console.log('─────────────────────────────────────────────────────────');

      const ourTestCities = ['Riyadh'];
      const cityList = saCities.Cities.map((c: any) => typeof c === 'string' ? c : c.Name || c);

      ourTestCities.forEach(testCity => {
        const found = cityList.some((city: string) =>
          city.toLowerCase().includes(testCity.toLowerCase()) ||
          testCity.toLowerCase().includes(city.toLowerCase())
        );

        if (found) {
          console.log(`  ✓ "${testCity}" - VALID (found in Aramex database)`);
        } else {
          console.log(`  ✗ "${testCity}" - NOT FOUND (might need different spelling)`);

          // Try to find similar cities
          const similar = cityList.filter((city: string) =>
            city.toLowerCase().includes('riy') ||
            city.toLowerCase().includes('riyadh')
          ).slice(0, 5);

          if (similar.length > 0) {
            console.log(`     💡 Similar cities found: ${similar.join(', ')}`);
          }
        }
      });
    } else {
      console.log('✗ No cities returned from API');
    }
  } catch (error: any) {
    console.log(`✗ Error fetching Saudi Arabia cities: ${error.message}`);
  }

  // ===== COUNTRY VALIDATION =====
  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  COUNTRY CODE VALIDATION');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const countriesToCheck = [
    { code: 'BH', name: 'Bahrain' },
    { code: 'SA', name: 'Saudi Arabia' },
  ];

  try {
    const countries = await sdk.location.fetchCountries();

    if (countries.Countries && countries.Countries.length > 0) {
      console.log(`✓ Aramex supports ${countries.Countries.length} countries\n`);

      console.log('Our test countries:');
      console.log('─────────────────────────────────────────────────────────');

      countriesToCheck.forEach(testCountry => {
        const found = countries.Countries.find((c: any) =>
          c.Code === testCountry.code || c.Name === testCountry.name
        );

        if (found) {
          console.log(`  ✓ ${testCountry.code} (${testCountry.name}) - VALID`);
          console.log(`    Full name: ${found.Name}`);
          console.log(`    Code: ${found.Code}`);
        } else {
          console.log(`  ✗ ${testCountry.code} (${testCountry.name}) - NOT FOUND`);
        }
      });
    }
  } catch (error: any) {
    console.log(`✗ Error fetching countries: ${error.message}`);
  }

  console.log('\n\n╔═══════════════════════════════════════════════════════════════════════════╗');
  console.log('║                            SUMMARY                                        ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════╝\n');

  console.log('✅ Verification complete!\n');
  console.log('If all cities and countries show as VALID, our test data is correct.');
  console.log('If any show as NOT FOUND, we need to use the exact spelling from Aramex API.\n');
}

main().catch(console.error);

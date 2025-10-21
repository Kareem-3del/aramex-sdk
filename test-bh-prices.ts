/**
 * Script to test rate calculations for different city combinations in Bahrain
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

interface PriceResult {
  from: string;
  to: string;
  weight: number;
  currency: string;
  amount: number;
  details?: any;
}

async function main() {
  const sdk = new AramexSDK(config);
  const prices: PriceResult[] = [];

  console.log('Fetching Bahrain cities...\n');

  let cities: string[] = [];
  try {
    const citiesResponse = await sdk.location.fetchCities('BH');
    if (citiesResponse.Cities) {
      cities = citiesResponse.Cities.map((c: any) => c.Name || c).filter(Boolean);
      console.log(`Found ${cities.length} cities in Bahrain:`);
      console.log(cities.join(', '));
      console.log('\n');
    }
  } catch (error) {
    console.log('Could not fetch cities from API, using common Bahrain cities:');
    cities = ['Manama', 'Riffa', 'Muharraq', 'Hamad Town', 'Isa Town', 'Sitra'];
    console.log(cities.join(', '));
    console.log('\n');
  }

  // Test common weights
  const weights = [0.5, 1, 2, 5, 10];

  // Test a selection of city pairs
  const cityPairs = [];

  // Add combinations for the first 5 cities
  const testCities = cities.slice(0, Math.min(5, cities.length));
  for (let i = 0; i < testCities.length; i++) {
    for (let j = 0; j < testCities.length; j++) {
      if (i !== j) {
        cityPairs.push([testCities[i], testCities[j]]);
      }
    }
  }

  console.log(`Testing ${cityPairs.length} city combinations with ${weights.length} weight variations...\n`);

  for (const [fromCity, toCity] of cityPairs) {
    for (const weight of weights) {
      try {
        const response = await sdk.rate.calculateRate({
          OriginAddress: {
            Line1: '123 Street',
            Line2: '',
            Line3: '',
            City: fromCity,
            PostCode: '',
            CountryCode: 'BH',
          },
          DestinationAddress: {
            Line1: '456 Avenue',
            Line2: '',
            Line3: '',
            City: toCity,
            PostCode: '',
            CountryCode: 'BH',
          },
          ShipmentDetails: {
            NumberOfPieces: 1,
            ActualWeight: {
              Unit: 'KG',
              Value: weight,
            },
            ProductGroup: 'DOM',
            DescriptionOfGoods: 'Test Package',
            GoodsOriginCountry: 'BH',
          },
        });

        if (!response.HasErrors && response.TotalAmount) {
          prices.push({
            from: fromCity,
            to: toCity,
            weight: weight,
            currency: response.TotalAmount.CurrencyCode,
            amount: response.TotalAmount.Value,
            details: response.RateDetails,
          });

          console.log(
            `✓ ${fromCity} → ${toCity} | ${weight}kg | ${response.TotalAmount.CurrencyCode} ${response.TotalAmount.Value.toFixed(3)}`
          );
        } else {
          console.log(
            `✗ ${fromCity} → ${toCity} | ${weight}kg | ERROR: ${response.Notifications?.map(n => n.Message).join(', ')}`
          );
        }
      } catch (error: any) {
        console.log(`✗ ${fromCity} → ${toCity} | ${weight}kg | ERROR: ${error.message}`);
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  console.log('\n\n=== PRICING SUMMARY ===\n');

  // Group by route
  const routeGroups = new Map<string, PriceResult[]>();
  for (const price of prices) {
    const routeKey = `${price.from} → ${price.to}`;
    if (!routeGroups.has(routeKey)) {
      routeGroups.set(routeKey, []);
    }
    routeGroups.get(routeKey)!.push(price);
  }

  for (const [route, routePrices] of routeGroups) {
    console.log(`\n${route}:`);
    routePrices.sort((a, b) => a.weight - b.weight);
    for (const price of routePrices) {
      console.log(`  ${price.weight}kg: ${price.currency} ${price.amount.toFixed(3)}`);
    }
  }

  console.log(`\n\nTotal successful rate calculations: ${prices.length}`);

  // Save to JSON file
  const fs = require('fs');
  fs.writeFileSync(
    'bh-pricing-results.json',
    JSON.stringify({ prices, summary: Array.from(routeGroups.entries()) }, null, 2)
  );
  console.log('\nResults saved to bh-pricing-results.json');
}

main().catch(console.error);

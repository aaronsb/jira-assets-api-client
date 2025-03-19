import { initAssetsApiClient } from '../src';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * This example demonstrates how to use the Atlassian Assets API client.
 *
 * To run this example:
 * 1. Create a .env file with your Atlassian Assets API credentials (see .env.example)
 * 2. Run the example:
 *    npm run example
 */
async function main() {
  try {
    // Get API credentials from environment variables
    const baseUrl = process.env.ASSETS_BASE_URL;
    const apiToken = process.env.ASSETS_API_TOKEN;

    if (!baseUrl || !apiToken) {
      console.error('Error: ASSETS_BASE_URL and ASSETS_API_TOKEN environment variables must be set');
      console.error('Please create a .env file based on the .env.example template');
      process.exit(1);
    }

    console.log('Initializing Atlassian Assets API client...');

    // Initialize the client
    const assetsClient = await initAssetsApiClient({
      baseUrl,
      apiToken,
      regenerate: true // Force regeneration of the client code
    });

    console.log('Atlassian Assets API client initialized successfully!');
    console.log('Available API groups:');

    // List available services
    console.log('Available services:');
    const services = Object.keys(assetsClient)
      .filter(key => key.endsWith('Service') && typeof assetsClient[key] === 'object');

    services.forEach(service => {
      console.log(`- ${service}`);

      // List methods in each service
      const methods = Object.keys(assetsClient[service])
        .filter(key => typeof assetsClient[service][key] === 'function');

      methods.forEach(method => {
        console.log(`  - ${method}`);
      });
    });

    // Example API calls (uncomment to use)

    // Example 1: Get all assets
    // console.log('\nFetching assets...');
    // const assets = await assetsClient.AssetsService.getAssets();
    // console.log(`Found ${assets.length} assets`);

    // Example 2: Get asset details
    // const assetId = '123456789';
    // console.log(`\nFetching asset details for asset ${assetId}...`);
    // const asset = await assetsClient.AssetsService.getAsset(assetId);
    // console.log('Asset details:', asset);

    // Example 3: Get object types
    // console.log('\nFetching object types...');
    // const objectTypes = await assetsClient.ObjectTypesService.getObjectTypes();
    // console.log('Object types:', objectTypes);

    // Example 4: Using pagination to get all assets
    // console.log('\nFetching all assets with pagination...');
    //
    // // Function to get all assets using pagination
    // async function getAllAssets() {
    //   const allAssets = [];
    //   let page = 1;
    //   let hasMore = true;
    //
    //   while (hasMore) {
    //     // Make API call with pagination
    //     const response = await assetsClient.AssetsService.getAssets({
    //       page: page,
    //       limit: 50
    //     });
    //
    //     // Add assets from this page to our collection
    //     if (response.assets && response.assets.length > 0) {
    //       allAssets.push(...response.assets);
    //       console.log(`Retrieved page ${page} with ${response.assets.length} assets (total: ${allAssets.length})`);
    //     }
    //
    //     // Check if there are more pages
    //     hasMore = response.hasMore || false;
    //     page++;
    //   }
    //
    //   return allAssets;
    // }
    //
    // const allAssets = await getAllAssets();
    // console.log(`Retrieved a total of ${allAssets.length} assets`);

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the example
main();

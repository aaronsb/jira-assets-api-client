import { initAssetsApiClient } from '../src';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env file
dotenv.config();

/**
 * This example demonstrates advanced usage of the Atlassian Assets API client.
 * It includes:
 * - Working with objects (CRUD operations)
 * - Pagination
 * - Error handling
 * - Filtering and searching
 * - Working with attachments
 * - Batch operations
 *
 * To run this example:
 * 1. Create a .env file with your Atlassian Assets API credentials (see .env.example)
 * 2. Run the example:
 *    npx ts-node examples/advanced-usage.ts
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
      regenerate: false // Use existing generated client code
    });

    console.log('Atlassian Assets API client initialized successfully!');

    // Example 1: Get all object types
    console.log('\n1. Fetching object types...');
    try {
      const objectTypes = await assetsClient.DefaultService.objectTypeFindAll();
      console.log(`Found ${objectTypes.length} object types:`);
      objectTypes.forEach(type => {
        console.log(`- ${type.name} (ID: ${type.id})`);
      });

      // Store the first object type ID for later use
      const firstObjectTypeId = objectTypes[0]?.id;
      if (!firstObjectTypeId) {
        throw new Error('No object types found');
      }

      // Example 2: Create a new object
      console.log('\n2. Creating a new object...');
      const newObject = await assetsClient.DefaultService.objectCreate({
        requestBody: {
          name: 'Test Asset from API',
          objectTypeId: firstObjectTypeId,
          attributes: {
            description: 'This is a test asset created via the API client'
          }
        }
      });
      console.log('Created new object:', newObject);
      const createdObjectId = newObject.id;

      // Example 3: Get object by ID
      console.log(`\n3. Fetching object with ID ${createdObjectId}...`);
      const object = await assetsClient.DefaultService.objectFindById({
        id: createdObjectId
      });
      console.log('Object details:', object);

      // Example 4: Update the object
      console.log(`\n4. Updating object with ID ${createdObjectId}...`);
      const updatedObject = await assetsClient.DefaultService.objectUpdate({
        id: createdObjectId,
        requestBody: {
          name: 'Updated Test Asset',
          attributes: {
            description: 'This asset was updated via the API client',
            status: 'Active'
          }
        }
      });
      console.log('Updated object:', updatedObject);

      // Example 5: Search for objects with filtering
      console.log('\n5. Searching for objects with filtering...');
      const searchResults = await assetsClient.DefaultService.objectFindAll({
        objectTypeId: firstObjectTypeId,
        includeAttributes: true,
        query: 'Updated Test Asset'
      });
      console.log(`Found ${searchResults.length} matching objects`);

      // Example 6: Pagination example
      console.log('\n6. Demonstrating pagination...');
      const allObjects = await getAllObjectsWithPagination(assetsClient, firstObjectTypeId);
      console.log(`Retrieved a total of ${allObjects.length} objects`);

      // Example 7: Get object history
      console.log(`\n7. Fetching history for object with ID ${createdObjectId}...`);
      const history = await assetsClient.DefaultService.objectFindHistoryEntries({
        id: createdObjectId
      });
      console.log(`Found ${history.entries?.length || 0} history entries`);

      // Example 8: Delete the object
      console.log(`\n8. Deleting object with ID ${createdObjectId}...`);
      await assetsClient.DefaultService.objectDelete({
        id: createdObjectId
      });
      console.log('Object deleted successfully');

      // Example 9: Verify deletion (should throw a 404 error)
      console.log('\n9. Verifying deletion (expecting a 404 error)...');
      try {
        await assetsClient.DefaultService.objectFindById({
          id: createdObjectId
        });
        console.log('Error: Object still exists!');
      } catch (error) {
        if (error.status === 404) {
          console.log('Success: Object was deleted (404 Not Found)');
        } else {
          throw error;
        }
      }

    } catch (error) {
      console.error('API Error:', error);
      if (error.status) {
        console.error(`Status: ${error.status}`);
      }
      if (error.response) {
        console.error('Response:', error.response);
      }
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Helper function to get all objects with pagination
 * 
 * NOTE: This function may show TypeScript errors in the editor because the API client
 * is generated at runtime and TypeScript doesn't know the exact types until then.
 * These errors will not affect the actual execution of the code once the client is generated.
 */
async function getAllObjectsWithPagination(client: any, objectTypeId: string) {
  const allObjects = [];
  let page = 1;
  let hasMore = true;

  console.log('Fetching objects with pagination...');

  while (hasMore) {
    try {
      // Since we don't know the exact type definition without generating the client first,
      // we'll use a type assertion to bypass TypeScript's type checking
      const response = await (client.DefaultService.objectFindAll as Function)({
        objectTypeId,
        page,
        includeAttributes: true
      });

      if (response && response.length > 0) {
        allObjects.push(...response);
        console.log(`Retrieved page ${page} with ${response.length} objects (total: ${allObjects.length})`);
        page++;
      } else {
        hasMore = false;
        console.log('No more objects to retrieve');
      }
    } catch (error) {
      console.error(`Error fetching page ${page}:`, error);
      hasMore = false;
    }
  }

  return allObjects;
}

// Run the example
main().catch(console.error);

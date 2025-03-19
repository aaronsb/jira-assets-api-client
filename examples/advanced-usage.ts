import { initAssetsApiClient } from '../src/index.js';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env file
dotenv.config();

/**
 * This example demonstrates advanced usage of the Atlassian JSM Insight (Assets) API client.
 * It includes:
 * - Working with objects (CRUD operations)
 * - Pagination
 * - Error handling
 * - Filtering and searching
 * - Working with object history
 *
 * To run this example:
 * 1. Create a .env file with your Atlassian credentials (see .env.example)
 * 2. Run the example:
 *    npx ts-node examples/advanced-usage.ts
 */
async function main() {
  try {
    // Get API credentials from environment variables
    const email = process.env.JIRA_EMAIL;
    const apiToken = process.env.ASSETS_API_TOKEN;
    const instance = process.env.JIRA_INSTANCE;
    const workspaceId = process.env.JIRA_WORKSPACE_ID; // Optional

    if (!email || !apiToken || !instance) {
      console.error('Error: Required environment variables are not set');
      console.error('Please create a .env file based on the .env.example template');
      console.error('Required variables:');
      console.error('  JIRA_EMAIL: Your Atlassian account email');
      console.error('  ASSETS_API_TOKEN: Your Atlassian API token');
      console.error('  JIRA_INSTANCE: Your Jira instance name (e.g., "your-instance" from "your-instance.atlassian.net")');
      process.exit(1);
    }

    console.log('Initializing Atlassian JSM Insight API client...');
    console.log(`Using instance: ${instance}`);

    // Initialize the client
    const insightClient = await initAssetsApiClient({
      email,
      apiToken,
      instance,
      workspaceId, // Will be discovered automatically if not provided
      regenerate: false // Use existing generated client code
    });

    console.log('Atlassian JSM Insight API client initialized successfully!');

    // Example 1: Get all object types
    console.log('\n1. Fetching object types...');
    try {
      const objectTypes = await insightClient.DefaultService.objectTypeFindAll();
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
      const newObject = await insightClient.DefaultService.objectCreate({
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
      const object = await insightClient.DefaultService.objectFindById({
        id: createdObjectId
      });
      console.log('Object details:', object);

      // Example 4: Update the object
      console.log(`\n4. Updating object with ID ${createdObjectId}...`);
      const updatedObject = await insightClient.DefaultService.objectUpdate({
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
      const searchResults = await insightClient.DefaultService.objectFindAll({
        objectTypeId: firstObjectTypeId,
        includeAttributes: true,
        query: 'Updated Test Asset'
      });
      console.log(`Found ${searchResults.length} matching objects`);

      // Example 6: Pagination example
      console.log('\n6. Demonstrating pagination...');
      const allObjects = await getAllObjectsWithPagination(insightClient, firstObjectTypeId);
      console.log(`Retrieved a total of ${allObjects.length} objects`);

      // Example 7: Get object history
      console.log(`\n7. Fetching history for object with ID ${createdObjectId}...`);
      const history = await insightClient.DefaultService.objectFindHistoryEntries({
        id: createdObjectId
      });
      console.log(`Found ${history.entries?.length || 0} history entries`);

      // Example 8: Delete the object
      console.log(`\n8. Deleting object with ID ${createdObjectId}...`);
      await insightClient.DefaultService.objectDelete({
        id: createdObjectId
      });
      console.log('Object deleted successfully');

      // Example 9: Verify deletion (should throw a 404 error)
      console.log('\n9. Verifying deletion (expecting a 404 error)...');
      try {
        await insightClient.DefaultService.objectFindById({
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

import { initAssetsApiClient } from '../src/index.js';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * This example demonstrates how to use the Atlassian JSM Insight (Assets) API client.
 *
 * To run this example:
 * 1. Create a .env file with your Atlassian credentials (see .env.example)
 * 2. Run the example:
 *    npm run example
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
      regenerate: true // Force regeneration of the client code
    });

    console.log('Atlassian JSM Insight API client initialized successfully!');
    
    // List available services
    console.log('\nAvailable services:');
    const services = Object.keys(insightClient)
      .filter(key => key.endsWith('Service') && typeof insightClient[key] === 'object');

    services.forEach(service => {
      console.log(`- ${service}`);

      // List methods in each service
      const methods = Object.keys(insightClient[service])
        .filter(key => typeof insightClient[service][key] === 'function');

      methods.forEach(method => {
        console.log(`  - ${method}`);
      });
    });
    
    // Example API calls
    console.log('\nFetching schemas...');
    try {
      const schemaList = await insightClient.DefaultService.schemaList();
      
      if (schemaList && schemaList.values && schemaList.values.length > 0) {
        console.log(`Found ${schemaList.values.length} schemas:`);
        
        schemaList.values.forEach((schema: any, index: number) => {
          console.log(`\nSchema #${index + 1}:`);
          console.log(`  ID: ${schema.id || 'N/A'}`);
          console.log(`  Name: ${schema.name || 'N/A'}`);
          console.log(`  Key: ${schema.objectSchemaKey || 'N/A'}`);
          console.log(`  Status: ${schema.status || 'N/A'}`);
          
          if (schema.description) {
            console.log(`  Description: ${schema.description}`);
          }
        });
      } else {
        console.log('No schemas found or empty response.');
      }
    } catch (error) {
      console.error('Error fetching schemas:');
      console.error(error);
    }

    // Additional example API calls (uncomment to use)
    
    // Example 1: Get object types
    // console.log('\nFetching object types...');
    // const objectTypes = await insightClient.DefaultService.objectTypeFindAll();
    // console.log(`Found ${objectTypes.length} object types`);
    
    // Example 2: Get objects of a specific type
    // const objectTypeId = '1'; // Replace with an actual object type ID
    // console.log(`\nFetching objects of type ${objectTypeId}...`);
    // const objects = await insightClient.DefaultService.objectFindAll({
    //   objectTypeId,
    //   includeAttributes: true,
    //   page: 1,
    //   resultsPerPage: 50
    // });
    // console.log(`Found ${objects.length} objects`);
    
    // Example 3: Get a specific object by ID
    // const objectId = '123'; // Replace with an actual object ID
    // console.log(`\nFetching object with ID ${objectId}...`);
    // const object = await insightClient.DefaultService.objectFindById({
    //   id: objectId
    // });
    // console.log('Object details:', object);
    
    // Example 4: Using pagination to get all objects
    // console.log('\nFetching all objects with pagination...');
    // 
    // async function getAllObjects(objectTypeId) {
    //   const allObjects = [];
    //   let page = 1;
    //   let hasMore = true;
    // 
    //   while (hasMore) {
    //     try {
    //       const response = await insightClient.DefaultService.objectFindAll({
    //         objectTypeId,
    //         includeAttributes: true,
    //         page,
    //         resultsPerPage: 50
    //       });
    // 
    //       if (response && response.length > 0) {
    //         allObjects.push(...response);
    //         console.log(`Retrieved page ${page} with ${response.length} objects (total: ${allObjects.length})`);
    //         page++;
    //       } else {
    //         hasMore = false;
    //       }
    //     } catch (error) {
    //       console.error(`Error fetching page ${page}:`, error);
    //       hasMore = false;
    //     }
    //   }
    // 
    //   return allObjects;
    // }
    // 
    // const allObjects = await getAllObjects('1'); // Replace with an actual object type ID
    // console.log(`Retrieved a total of ${allObjects.length} objects`);

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the example
main();

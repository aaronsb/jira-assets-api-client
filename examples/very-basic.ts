import { initAssetsApiClient } from '../src/index.js';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * This is a very basic example that just initializes the client and logs it
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
    
    // Log the client object
    console.log('Client object keys:', Object.keys(insightClient));
    console.log('DefaultService exists:', !!insightClient.DefaultService);
    
    if (insightClient.DefaultService) {
      console.log('DefaultService type:', typeof insightClient.DefaultService);
      
      // Try to get the schemas
      console.log('\nTrying to fetch schemas...');
      try {
        // Use the DefaultService as a function
        const schemaListFn = insightClient.DefaultService.schemaList;
        console.log('schemaList function:', schemaListFn);
        
        const schemaList = await schemaListFn();
        console.log('Schema list result:', schemaList);
        
        // Try to get object types for the first schema
        if (schemaList.values && schemaList.values.length > 0) {
          const firstSchema = schemaList.values[0];
          console.log(`\nTrying to fetch object types for schema ${firstSchema.id} (${firstSchema.name})...`);
          
          try {
            const schemaFindAllObjectTypesFn = insightClient.DefaultService.schemaFindAllObjectTypes;
            console.log('schemaFindAllObjectTypes function:', schemaFindAllObjectTypesFn);
            
            const objectTypes = await schemaFindAllObjectTypesFn({ id: firstSchema.id });
            console.log(`Found ${objectTypes.values.length} object types in schema ${firstSchema.id}:`);
            
            objectTypes.values.forEach((objectType, index) => {
              console.log(`${index + 1}. ${objectType.name} (ID: ${objectType.id})`);
            });
          } catch (objectTypesError) {
            console.error('Error fetching object types:', objectTypesError);
          }
        }
      } catch (error) {
        console.error('Error fetching schemas:', error);
        if (error instanceof Error) {
          console.error('Error message:', error.message);
          console.error('Error stack:', error.stack);
        }
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
  }
}

// Run the example
main().catch(error => {
  console.error('Unhandled error in main:', error);
});

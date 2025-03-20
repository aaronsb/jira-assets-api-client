import { initAssetsApiClient } from '../src/index.js';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * This is a very simplified version of the advanced example to help debug issues
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
    
    // Just try to get the schemas (which works in the basic example)
    console.log('\nFetching schemas...');
    try {
      console.log('DefaultService type:', typeof insightClient.DefaultService);
      console.log('schemaList type:', typeof insightClient.DefaultService.schemaList);
      
      const schemaList = await insightClient.DefaultService.schemaList();
      console.log(`Found ${schemaList.values.length} schemas`);
      
      // Print all schemas
      console.log('Available schemas:');
      schemaList.values.forEach((schema, index) => {
        console.log(`${index + 1}. ${schema.name} (ID: ${schema.id})`);
      });
      
      // Try to get a specific schema
      if (schemaList.values.length > 0) {
        const schemaId = schemaList.values[0].id;
        console.log(`\nFetching details for schema ${schemaId}...`);
        
        try {
          const schema = await insightClient.DefaultService.schemaFind({
            id: schemaId
          });
          console.log('Schema details:', schema);
        } catch (error) {
          console.error('Error fetching schema details:', error);
        }
      }
    } catch (error) {
      console.error('Error fetching schemas:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
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
main().catch(console.error);

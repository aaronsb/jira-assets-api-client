import { initAssetsApiClient } from '../dist/index.js';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * This is a simple JavaScript example to test the client
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
        const schemaList = await insightClient.DefaultService.schemaList();
        console.log(`Found ${schemaList.values.length} schemas`);
        
        // Print all schemas
        console.log('Available schemas:');
        schemaList.values.forEach((schema, index) => {
          console.log(`${index + 1}. ${schema.name} (ID: ${schema.id}, Object types: ${schema.objectTypeCount})`);
        });
        
        // Use the Services schema (ID: 1) as mentioned in the README examples
        const servicesSchema = schemaList.values.find(schema => schema.id === '1');
        
        if (servicesSchema) {
          console.log(`\nUsing schema: ${servicesSchema.name} (ID: ${servicesSchema.id})`);
          
          // Try to get object types for this schema
          console.log(`\nTrying to fetch object types for schema ${servicesSchema.id}...`);
          try {
            // Try with schemaFindAllObjectTypesFlat instead
            console.log('Trying with schemaFindAllObjectTypesFlat...');
            const objectTypes = await insightClient.DefaultService.schemaFindAllObjectTypesFlat({
              id: servicesSchema.id
            });
            console.log(`Found ${objectTypes.values.length} object types in schema ${servicesSchema.id}`);
            
            // Print object types
            if (objectTypes.values && objectTypes.values.length > 0) {
              console.log('Object types:');
              objectTypes.values.forEach((objectType, index) => {
                console.log(`${index + 1}. ${objectType.name} (ID: ${objectType.id})`);
              });
              
              // Try to get a specific object type
              if (objectTypes.values.length > 0) {
                const firstObjectType = objectTypes.values[0];
                console.log(`\nTrying to fetch details for object type ${firstObjectType.id}...`);
                try {
                  const objectType = await insightClient.DefaultService.objectTypeFind({
                    id: firstObjectType.id
                  });
                  console.log('Object type details:', objectType);
                } catch (objectTypeError) {
                  console.error('Error fetching object type details:', objectTypeError);
                }
              }
            }
          } catch (objectTypesError) {
            console.error('Error fetching object types:', objectTypesError);
          }
        }
      } catch (error) {
        console.error('Error fetching schemas:', error);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the example
main().catch(error => {
  console.error('Unhandled error in main:', error);
});

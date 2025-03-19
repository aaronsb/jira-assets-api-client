# Getting Started with Atlassian JSM Insight (Assets) API Client

This guide will help you get started with the Atlassian JSM Insight (Assets) API Client. It covers installation, basic setup, and common usage patterns.

## Prerequisites

- Node.js 14 or higher
- npm or yarn
- An Atlassian account with access to Jira Service Management with Insight (formerly Assets)
- An API token for authentication

## Installation

Install the package using npm:

```bash
npm install jira-assets-api-client
```

Or using yarn:

```bash
yarn add jira-assets-api-client
```

## Basic Setup

### 1. Set up environment variables

Create a `.env` file in your project root:

```
JIRA_EMAIL=your-email@example.com
ASSETS_API_TOKEN=your-api-token-here
JIRA_INSTANCE=your-instance-name
```

Where:
- `JIRA_EMAIL` is your Atlassian account email
- `ASSETS_API_TOKEN` is your API token (get it from [https://id.atlassian.com/manage-profile/security/api-tokens](https://id.atlassian.com/manage-profile/security/api-tokens))
- `JIRA_INSTANCE` is your Jira instance name (e.g., 'your-instance' from 'your-instance.atlassian.net')

### 2. Initialize the client

```typescript
import { initAssetsApiClient } from 'jira-assets-api-client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
  // Initialize the client
  const insightClient = await initAssetsApiClient();
  
  // Now you can use the client to make API calls
  // ...
}

main().catch(console.error);
```

## Understanding Workspace ID

The JSM Insight API requires a workspace ID for most operations. The client will automatically discover this ID for you, but you can also provide it explicitly:

```typescript
const insightClient = await initAssetsApiClient({
  email: 'your-email@example.com',
  apiToken: 'your-api-token-here',
  instance: 'your-instance-name',
  workspaceId: 'your-workspace-id' // Optional, will be discovered if not provided
});
```

## Common Tasks

### Listing Schemas

Schemas are the top-level containers for object types in JSM Insight.

```typescript
// Get all schemas
const schemaList = await insightClient.DefaultService.schemaList();

// Log the schemas
schemaList.values.forEach(schema => {
  console.log(`${schema.name} (ID: ${schema.id})`);
});
```

### Listing Object Types

Object types define the structure of objects in your JSM Insight instance. You'll need to know the object type IDs to work with objects.

```typescript
// Get all object types
const objectTypes = await insightClient.DefaultService.objectTypeFindAll();

// Log the object types
objectTypes.forEach(type => {
  console.log(`${type.name} (ID: ${type.id})`);
});
```

### Creating an Object

```typescript
// Create a new asset
const newAsset = await insightClient.DefaultService.objectCreate({
  requestBody: {
    name: 'MacBook Pro',
    objectTypeId: '1', // Replace with your actual object type ID for assets
    attributes: {
      description: 'MacBook Pro 16-inch, 2025',
      serialNumber: 'ABCD1234',
      purchaseDate: '2025-03-19',
      status: 'Active'
    }
  }
});

console.log('Created new asset:', newAsset);
```

### Retrieving Objects

```typescript
// Get all objects of a specific type
const assets = await insightClient.DefaultService.objectFindAll({
  objectTypeId: '1', // Replace with your actual object type ID for assets
  includeAttributes: true
});

console.log(`Found ${assets.length} assets`);

// Get a specific object by ID
const asset = await insightClient.DefaultService.objectFindById({
  id: '123456789' // Replace with an actual object ID
});

console.log('Asset details:', asset);
```

### Updating an Object

```typescript
// Update an existing asset
const updatedAsset = await insightClient.DefaultService.objectUpdate({
  id: '123456789', // Replace with an actual object ID
  requestBody: {
    name: 'MacBook Pro (Updated)',
    attributes: {
      status: 'In Repair',
      notes: 'Sent for screen replacement'
    }
  }
});

console.log('Updated asset:', updatedAsset);
```

### Deleting an Object

```typescript
// Delete an object
await insightClient.DefaultService.objectDelete({
  id: '123456789' // Replace with an actual object ID
});

console.log('Asset deleted successfully');
```

### Searching for Objects

```typescript
// Search for objects
const searchResults = await insightClient.DefaultService.objectFindAll({
  objectTypeId: '1', // Replace with your actual object type ID
  includeAttributes: true,
  query: 'MacBook' // Search term
});

console.log(`Found ${searchResults.length} matching objects`);
```

### Working with Pagination

```typescript
// Function to get all objects with pagination
async function getAllObjects(objectTypeId) {
  const allObjects = [];
  let page = 1;
  const resultsPerPage = 50;
  let hasMore = true;

  while (hasMore) {
    const response = await insightClient.DefaultService.objectFindAll({
      objectTypeId,
      page,
      resultsPerPage,
      includeAttributes: true
    });

    if (response && response.length > 0) {
      allObjects.push(...response);
      console.log(`Retrieved page ${page} with ${response.length} objects (total: ${allObjects.length})`);
      page++;
    } else {
      hasMore = false;
    }
  }

  return allObjects;
}

// Use the function
const allAssets = await getAllObjects('1'); // Replace with your actual object type ID
console.log(`Retrieved a total of ${allAssets.length} assets`);
```

## Error Handling

```typescript
try {
  const asset = await insightClient.DefaultService.objectFindById({
    id: 'non-existent-id'
  });
} catch (error) {
  if (error.status === 404) {
    console.error('Asset not found');
  } else if (error.status === 401) {
    console.error('Authentication failed - check your API token');
  } else {
    console.error('API error:', error.message);
  }
}
```

## Working with ES Modules

The client is compatible with both CommonJS and ES Modules projects. If you're using ES Modules (i.e., `"type": "module"` in your package.json), you can import the client as follows:

```typescript
import { initAssetsApiClient } from 'jira-assets-api-client';
```

## Next Steps

- Check out the [API Reference](./API.md) for detailed information about all available methods
- See the [examples](../examples) directory for more usage examples
- Read the [Atlassian JSM Insight API documentation](https://developer.atlassian.com/cloud/jira/service-desk/rest/intro/) for more information about the underlying API

## Troubleshooting

### Authentication Issues

If you're experiencing authentication issues:

1. Verify that your email and API token are correct
2. Ensure that your token has the necessary permissions
3. Check that you're using the correct instance name

### Workspace ID Discovery

If the client fails to discover your workspace ID:

1. Check that your instance name is correct
2. Verify that JSM Insight is enabled on your instance
3. Try providing the workspace ID explicitly if you know it

### Endpoint Fallback

The client will automatically try alternative endpoint formats if the primary one fails. If you're still experiencing issues:

1. Check your network connectivity
2. Verify that your Jira instance is accessible
3. Check if there are any Atlassian service outages

### Rate Limiting

The Atlassian API has rate limits. If you're making many requests in a short period, you might hit these limits. Consider implementing retry logic with exponential backoff for production applications.

### Need Help?

If you need further assistance:

- Check the [GitHub issues](https://github.com/your-username/jira-assets-api-client/issues) for known problems
- Submit a new issue if you've found a bug
- Consult the [Atlassian Community](https://community.atlassian.com/) for general Atlassian API questions

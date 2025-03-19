# Getting Started with Atlassian Assets API Client

This guide will help you get started with the Atlassian Assets API Client. It covers installation, basic setup, and common usage patterns.

## Prerequisites

- Node.js 14 or higher
- npm or yarn
- An Atlassian account with access to Jira Assets
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
ASSETS_BASE_URL=https://api.atlassian.com/assets
ASSETS_API_TOKEN=your-api-token-here
```

### 2. Initialize the client

```typescript
import { initAssetsApiClient } from 'jira-assets-api-client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
  // Initialize the client
  const assetsClient = await initAssetsApiClient();
  
  // Now you can use the client to make API calls
  // ...
}

main().catch(console.error);
```

## Common Tasks

### Listing Object Types

Object types define the structure of objects in your Atlassian Assets instance. You'll need to know the object type IDs to work with objects.

```typescript
// Get all object types
const objectTypes = await assetsClient.DefaultService.objectTypeFindAll();

// Log the object types
objectTypes.forEach(type => {
  console.log(`${type.name} (ID: ${type.id})`);
});
```

### Creating an Object

```typescript
// Create a new asset
const newAsset = await assetsClient.DefaultService.objectCreate({
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
const assets = await assetsClient.DefaultService.objectFindAll({
  objectTypeId: '1', // Replace with your actual object type ID for assets
  includeAttributes: true
});

console.log(`Found ${assets.length} assets`);

// Get a specific object by ID
const asset = await assetsClient.DefaultService.objectFindById({
  id: '123456789' // Replace with an actual object ID
});

console.log('Asset details:', asset);
```

### Updating an Object

```typescript
// Update an existing asset
const updatedAsset = await assetsClient.DefaultService.objectUpdate({
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
await assetsClient.DefaultService.objectDelete({
  id: '123456789' // Replace with an actual object ID
});

console.log('Asset deleted successfully');
```

### Searching for Objects

```typescript
// Search for objects
const searchResults = await assetsClient.DefaultService.objectFindAll({
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
    const response = await assetsClient.DefaultService.objectFindAll({
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
  const asset = await assetsClient.DefaultService.objectFindById({
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

## Next Steps

- Check out the [API Reference](./API.md) for detailed information about all available methods
- See the [examples](../examples) directory for more usage examples
- Read the [Atlassian Assets API documentation](https://developer.atlassian.com/cloud/assets/rest/api-group-objects/) for more information about the underlying API

## Troubleshooting

### Authentication Issues

If you're experiencing authentication issues:

1. Verify that your API token is correct
2. Ensure that your token has the necessary permissions
3. Check that you're using the correct base URL for your Atlassian instance

### Rate Limiting

The Atlassian API has rate limits. If you're making many requests in a short period, you might hit these limits. Consider implementing retry logic with exponential backoff for production applications.

### Need Help?

If you need further assistance:

- Check the [GitHub issues](https://github.com/your-username/jira-assets-api-client/issues) for known problems
- Submit a new issue if you've found a bug
- Consult the [Atlassian Community](https://community.atlassian.com/) for general Atlassian API questions

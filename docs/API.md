# Atlassian Assets API Client - API Reference

This document provides detailed information about the Atlassian Assets API client and its capabilities.

## Table of Contents

- [Client Initialization](#client-initialization)
- [Authentication](#authentication)
- [API Services](#api-services)
- [Working with Objects](#working-with-objects)
- [Object Types](#object-types)
- [Attributes](#attributes)
- [Pagination](#pagination)
- [Error Handling](#error-handling)

## Client Initialization

The client can be initialized with various options:

```typescript
import { initAssetsApiClient } from 'jira-assets-api-client';

const assetsClient = await initAssetsApiClient({
  baseUrl: 'https://api.atlassian.com/assets',
  apiToken: 'your-api-token-here',
  specFile: 'assets-openapi.json', // Optional
  outputDir: 'src/generated',      // Optional
  regenerate: false                // Optional
});
```

### Options

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `baseUrl` | string | Base URL for the Atlassian Assets API | `'https://api.atlassian.com/assets'` |
| `apiToken` | string | API token for authentication | Environment variable `ASSETS_API_TOKEN` |
| `specFile` | string | Path to the API specification file | `'assets-openapi.json'` |
| `outputDir` | string | Directory to output the generated code | `'src/generated'` |
| `regenerate` | boolean | Whether to regenerate the client code | `false` |

## Authentication

The Atlassian Assets API uses Bearer token authentication. You need to provide an API token to authenticate your requests.

### Getting an API Token

1. Log in to your Atlassian account
2. Navigate to Account Settings > Security > API tokens
3. Create a new API token
4. Use this token in your client initialization

## API Services

The client exposes the following services:

### DefaultService

The main service for interacting with the Atlassian Assets API.

## Working with Objects

Objects are the core entities in the Atlassian Assets API. They represent assets, configurations, and other items in your Atlassian Assets instance.

### Creating Objects

```typescript
const newObject = await assetsClient.DefaultService.objectCreate({
  requestBody: {
    name: 'New Asset',
    objectTypeId: '1', // Object type ID
    attributes: {
      description: 'A new asset created via API',
      status: 'Active',
      // Other attributes specific to the object type
    }
  }
});
```

### Retrieving Objects

```typescript
// Get all objects
const objects = await assetsClient.DefaultService.objectFindAll();

// Get a specific object by ID
const object = await assetsClient.DefaultService.objectFindById({
  id: '123456789'
});

// Search for objects
const searchResults = await assetsClient.DefaultService.objectFindAll({
  objectTypeId: '1',
  includeAttributes: true,
  query: 'Search term'
});
```

### Updating Objects

```typescript
const updatedObject = await assetsClient.DefaultService.objectUpdate({
  id: '123456789',
  requestBody: {
    name: 'Updated Asset Name',
    attributes: {
      description: 'Updated description',
      status: 'Inactive'
    }
  }
});
```

### Deleting Objects

```typescript
await assetsClient.DefaultService.objectDelete({
  id: '123456789'
});
```

## Object Types

Object types define the structure and behavior of objects in Atlassian Assets.

### Retrieving Object Types

```typescript
// Get all object types
const objectTypes = await assetsClient.DefaultService.objectTypeFindAll();

// Get a specific object type by ID
const objectType = await assetsClient.DefaultService.objectTypeFindById({
  id: '1'
});
```

## Attributes

Attributes are the properties of objects. Each object type has a set of attributes that define what information can be stored on objects of that type.

### Working with Attributes

```typescript
// Get attributes for an object type
const attributes = await assetsClient.DefaultService.objectTypeSchemaFindById({
  id: '1'
});

// Set attributes when creating or updating an object
const newObject = await assetsClient.DefaultService.objectCreate({
  requestBody: {
    name: 'New Asset',
    objectTypeId: '1',
    attributes: {
      description: 'A new asset created via API',
      status: 'Active',
      purchaseDate: '2025-03-19',
      cost: 1000,
      // Other attributes specific to the object type
    }
  }
});
```

## Pagination

The Atlassian Assets API supports pagination for endpoints that return multiple items.

```typescript
// Get the first page of objects
const firstPage = await assetsClient.DefaultService.objectFindAll({
  page: 1,
  resultsPerPage: 50
});

// Get all objects with pagination
async function getAllObjects() {
  const allObjects = [];
  let page = 1;
  const resultsPerPage = 50;
  let hasMore = true;

  while (hasMore) {
    const response = await assetsClient.DefaultService.objectFindAll({
      page,
      resultsPerPage
    });

    if (response && response.length > 0) {
      allObjects.push(...response);
      page++;
    } else {
      hasMore = false;
    }
  }

  return allObjects;
}
```

## Error Handling

The client throws errors for API failures. You can catch and handle these errors as follows:

```typescript
try {
  const object = await assetsClient.DefaultService.objectFindById({
    id: 'non-existent-id'
  });
} catch (error) {
  if (error.status === 404) {
    console.error('Object not found');
  } else if (error.status === 401) {
    console.error('Authentication failed');
  } else if (error.status === 403) {
    console.error('Permission denied');
  } else {
    console.error('API error:', error.message);
  }
  
  // The error object may contain additional information
  if (error.response) {
    console.error('Response:', error.response);
  }
}

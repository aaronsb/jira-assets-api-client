# Atlassian JSM Insight (Assets) API Client - API Reference

This document provides detailed information about the Atlassian JSM Insight (Assets) API client and its capabilities.

## Table of Contents

- [Client Initialization](#client-initialization)
- [Authentication](#authentication)
- [Workspace ID](#workspace-id)
- [API Services](#api-services)
- [Working with Objects](#working-with-objects)
- [Object Types](#object-types)
- [Schemas](#schemas)
- [Attributes](#attributes)
- [Pagination](#pagination)
- [Error Handling](#error-handling)
- [ESM Compatibility](#esm-compatibility)

## Client Initialization

The client can be initialized with various options:

```typescript
import { initAssetsApiClient } from 'jira-assets-api-client';

const insightClient = await initAssetsApiClient({
  email: 'your-email@example.com',
  apiToken: 'your-api-token-here',
  instance: 'your-instance-name',
  workspaceId: 'your-workspace-id', // Optional, will be discovered if not provided
  specFile: 'assets-openapi.json',   // Optional
  outputDir: 'src/generated',        // Optional
  regenerate: false                  // Optional
});
```

### Options

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `email` | string | Email address for authentication | Environment variable `JIRA_EMAIL` |
| `apiToken` | string | API token for authentication | Environment variable `ASSETS_API_TOKEN` |
| `instance` | string | Jira instance name (e.g., 'your-instance' from 'your-instance.atlassian.net') | Environment variable `JIRA_INSTANCE` or extracted from `baseUrl` |
| `workspaceId` | string | Workspace ID for JSM Insight API | Environment variable `JIRA_WORKSPACE_ID` or discovered automatically |
| `baseUrl` | string | Legacy base URL (not recommended for new projects) | Environment variable `ASSETS_BASE_URL` |
| `specFile` | string | Path to the API specification file | `'assets-openapi.json'` |
| `outputDir` | string | Directory to output the generated code | `'src/generated'` |
| `regenerate` | boolean | Whether to regenerate the client code | `false` |

## Authentication

The Atlassian JSM Insight API uses Basic authentication with email and API token. You need to provide both to authenticate your requests.

### Getting an API Token

1. Go to [https://id.atlassian.com/manage-profile/security/api-tokens](https://id.atlassian.com/manage-profile/security/api-tokens)
2. Click "Create API token"
3. Give your token a name and click "Create"
4. Copy the token value (you won't be able to see it again)

## Workspace ID

The JSM Insight API requires a workspace ID for most operations. The client will automatically discover this ID for you by calling:

```
https://<instance>.atlassian.net/rest/servicedeskapi/insight/workspace
```

You can also provide the workspace ID explicitly if you already know it:

```typescript
const insightClient = await initAssetsApiClient({
  email: 'your-email@example.com',
  apiToken: 'your-api-token-here',
  instance: 'your-instance-name',
  workspaceId: 'your-workspace-id'
});
```

## API Services

The client exposes the following services:

### DefaultService

The main service for interacting with the Atlassian JSM Insight API.

## Working with Objects

Objects are the core entities in the JSM Insight API. They represent assets, configurations, and other items in your JSM Insight instance.

### Creating Objects

```typescript
const newObject = await insightClient.DefaultService.objectCreate({
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
// Get all objects of a specific type
const objects = await insightClient.DefaultService.objectFindAll({
  objectTypeId: '1',
  includeAttributes: true
});

// Get a specific object by ID
const object = await insightClient.DefaultService.objectFindById({
  id: '123456789'
});

// Search for objects
const searchResults = await insightClient.DefaultService.objectFindAll({
  objectTypeId: '1',
  includeAttributes: true,
  query: 'Search term'
});
```

### Updating Objects

```typescript
const updatedObject = await insightClient.DefaultService.objectUpdate({
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
await insightClient.DefaultService.objectDelete({
  id: '123456789'
});
```

## Schemas

Schemas are the top-level containers for object types in JSM Insight.

### Retrieving Schemas

```typescript
// Get all schemas
const schemaList = await insightClient.DefaultService.schemaList();

// Get a specific schema by ID
const schema = await insightClient.DefaultService.schemaGet({
  id: '1'
});
```

## Object Types

Object types define the structure and behavior of objects in JSM Insight.

### Retrieving Object Types

```typescript
// Get all object types
const objectTypes = await insightClient.DefaultService.objectTypeFindAll();

// Get a specific object type by ID
const objectType = await insightClient.DefaultService.objectTypeFindById({
  id: '1'
});
```

## Attributes

Attributes are the properties of objects. Each object type has a set of attributes that define what information can be stored on objects of that type.

### Working with Attributes

```typescript
// Get attributes for an object type
const attributes = await insightClient.DefaultService.objectTypeSchemaFindById({
  id: '1'
});

// Set attributes when creating or updating an object
const newObject = await insightClient.DefaultService.objectCreate({
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

The JSM Insight API supports pagination for endpoints that return multiple items.

```typescript
// Get the first page of objects
const firstPage = await insightClient.DefaultService.objectFindAll({
  objectTypeId: '1',
  page: 1,
  resultsPerPage: 50
});

// Get all objects with pagination
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
  const object = await insightClient.DefaultService.objectFindById({
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
```

## ESM Compatibility

The client is compatible with both CommonJS and ES Modules projects. If you're using ES Modules (i.e., `"type": "module"` in your package.json), the client will automatically add `.js` extensions to import paths in the generated code.

### Endpoint Fallback

The client includes an endpoint fallback strategy that tries alternative endpoint formats if the primary one fails. It will automatically try both:

```
https://api.atlassian.com/jsm/insight/workspace/{workspaceId}/v1/...
https://<instance>.atlassian.net/jsm/insight/workspace/{workspaceId}/v1/...
```

This helps ensure that your API calls succeed even if there are changes to the Atlassian API endpoint structure.

# Atlassian JSM Insight API

A Node.js library that automatically generates a TypeScript client for the Atlassian JSM Insight API from the OpenAPI specification.

<div align="center">
  <img src="https://raw.githubusercontent.com/aaronsb/jira-insights-api/main/assets/logo.png" alt="Atlassian JSM Insight API Client" width="200" />
</div>

## 📋 Table of Contents

- [Features](#-features)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Authentication](#-authentication)
- [API Reference](#-api-reference)
- [Examples](#-examples)
- [Development](#-development)
- [Documentation](#-documentation)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

- **Pre-Generated Client**: Includes a pre-generated client from the Atlassian JSM Insight API OpenAPI specification
- **Runtime Ready**: Works reliably in all environments including Docker containers without runtime generation
- **Type Safety**: Fully typed TypeScript client with accurate models and service definitions
- **Modern**: Built with modern JavaScript practices and tools
- **Flexible**: Configure via environment variables or programmatic options
- **Comprehensive**: Access to all JSM Insight API endpoints and features
- **ESM Compatible**: Works with both CommonJS and ES Modules projects
- **Workspace Discovery**: Automatically discovers the workspace ID required for JSM Insight API

## 📦 Installation

```bash
npm install jira-insights-api
```

## 🚀 Quick Start

```typescript
import { initAssetsApiClient } from 'jira-insights-api';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
  // Initialize the client
  const insightClient = await initAssetsApiClient({
    email: 'your-email@example.com',
    apiToken: 'your-api-token-here',
    instance: 'your-instance-name'
  });

  // Use the client to make API calls
  const schemaList = await insightClient.DefaultService.schemaList();
  console.log(`Found ${schemaList.values.length} schemas`);
}

main().catch(console.error);
```

## 🔐 Authentication

The Atlassian JSM Insight API uses Basic authentication with email and API token. You can provide your credentials in one of two ways:

### 1. Environment Variables

Create a `.env` file in your project root:

```
JIRA_EMAIL=your-email@example.com
ASSETS_API_TOKEN=your-api-token-here
JIRA_INSTANCE=your-instance-name
```

Then load it in your code:

```typescript
import dotenv from 'dotenv';
import { initAssetsApiClient } from 'jira-insights-api';

dotenv.config();
const insightClient = await initAssetsApiClient();
```

### 2. Configuration Options

Pass authentication details directly to the client:

```typescript
const insightClient = await initAssetsApiClient({
  email: 'your-email@example.com',
  apiToken: 'your-api-token-here',
  instance: 'your-instance-name'
});
```

### Getting an API Token

1. Go to [https://id.atlassian.com/manage-profile/security/api-tokens](https://id.atlassian.com/manage-profile/security/api-tokens)
2. Click "Create API token"
3. Give your token a name and click "Create"
4. Copy the token value (you won't be able to see it again)

## 📚 API Reference

The client exposes the following services:

### DefaultService

The main service for interacting with Atlassian JSM Insight API. Some key methods include:

- `schemaList()`: Get all schemas
- `objectTypeFindAll()`: Get all object types
- `objectFindAll()`: Get all objects
- `objectFindById(id)`: Get a specific object by ID
- `objectCreate(data)`: Create a new object
- `objectUpdate(id, data)`: Update an existing object
- `objectDelete(id)`: Delete an object
- `objectFindHistoryEntries(id)`: Get history for an object

For a complete list of available methods, initialize the client and explore the available services and methods:

```typescript
const insightClient = await initAssetsApiClient();
console.log(Object.keys(insightClient.DefaultService));
```

## 📝 Examples

### Working with Objects

```typescript
// Get all objects of a specific type
const objects = await insightClient.DefaultService.objectFindAll({
  objectTypeId: '1',
  includeAttributes: true
});

// Get a specific object
const object = await insightClient.DefaultService.objectFindById({
  id: '123456789'
});

// Create a new object
const newObject = await insightClient.DefaultService.objectCreate({
  requestBody: {
    name: 'New Asset',
    objectTypeId: '1',
    attributes: {
      description: 'A new asset created via API'
    }
  }
});

// Update an object
await insightClient.DefaultService.objectUpdate({
  id: '123456789',
  requestBody: {
    name: 'Updated Asset Name'
  }
});

// Delete an object
await insightClient.DefaultService.objectDelete({
  id: '123456789'
});
```

### Pagination

```typescript
async function getAllObjects(objectTypeId) {
  const allObjects = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await insightClient.DefaultService.objectFindAll({
      objectTypeId,
      includeAttributes: true,
      page,
      resultsPerPage: 50
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

const allObjects = await getAllObjects('1'); // Replace with an actual object type ID
```

### Error Handling

```typescript
try {
  const object = await insightClient.DefaultService.objectFindById({
    id: 'non-existent-id'
  });
} catch (error) {
  if (error.status === 404) {
    console.error('Object not found');
  } else {
    console.error('API error:', error.message);
  }
}
```

See the [examples](./examples) directory for more usage examples.

## 🛠️ Development

### Project Structure

```
jira-insights-api/
├── src/
│   ├── downloadAssetsApiSpec.ts   # Downloads the OpenAPI spec
│   ├── generateAssetsApiClient.ts # Generates the TypeScript client
│   ├── fixGeneratedCode.ts        # Fixes issues in generated code
│   ├── prebuild.ts                # Pre-build script for client generation
│   ├── index.ts                   # Main entry point
│   └── generated/                 # Generated API client code (development only)
├── examples/
│   ├── basic-usage.ts             # Basic usage example
│   └── advanced-usage.ts          # Advanced usage example
├── docs/
│   ├── API.md                     # API reference documentation
│   └── GETTING_STARTED.md         # Getting started guide
├── dist/                          # Compiled JavaScript
│   └── generated/                 # Pre-generated client code included in the package
```

### Pre-Generated Client

Starting with version 2.1.1, this package includes a pre-generated client in the published package. This means:

1. No runtime generation is required when using the package
2. Works reliably in all environments, including Docker containers
3. Faster initialization and better performance
4. Consistent behavior across different environments

The client is generated during the package build process and included in the published package.

### Available Scripts

- `npm run download`: Download the latest Atlassian JSM Insight API specification
- `npm run generate`: Generate the TypeScript client from the specification (runs fix automatically after)
- `npm run fix`: Fix any issues in the generated code
- `npm run build`: Build the project (includes pre-generating the client)
- `npm run clean`: Clean the build directory
- `npm run clean:generated`: Remove all generated files (API spec and generated code)
- `npm run reset`: Clean both build and generated files
- `npm run example`: Run the basic usage example
- `npm run example:advanced`: Run the advanced usage example

### Continuous Integration

This project uses GitHub Actions for continuous integration and deployment:

- **Automated Publishing**: The package is automatically published to npm when:
  - Changes are pushed to the `main` branch that modify `package.json`
  - A new GitHub Release is created
  - The workflow is manually triggered

The CI pipeline:
1. Downloads the latest Atlassian JSM Insight API specification
2. Generates the TypeScript client during the build process
3. Builds the package with the pre-generated client included
4. Publishes to npm with public access

To set up automated publishing in your fork:
1. Create an npm access token with publish permissions
2. Add the token as a GitHub repository secret named `NPM_TOKEN`

### Configuration Options

```typescript
interface AssetsApiClientOptions {
  // Email address for authentication
  email?: string;
  
  // API token for authentication
  apiToken?: string;
  
  // Jira instance name (e.g., 'your-instance' from 'your-instance.atlassian.net')
  instance?: string;
  
  // Workspace ID for JSM Insight API (if not provided, it will be discovered automatically)
  workspaceId?: string;
  
  // Legacy base URL (not recommended for new projects)
  baseUrl?: string;
  
  // Path to the API specification file
  specFile?: string;
  
  // Directory to output the generated code
  outputDir?: string;
  
  // Whether to regenerate the client code
  regenerate?: boolean;
}
```

## 📖 Documentation

Comprehensive documentation is available in the `docs` directory:

- [Getting Started Guide](./docs/GETTING_STARTED.md) - A step-by-step guide to get up and running
- [API Reference](./docs/API.md) - Detailed information about all available methods and options

Additional resources:

- [Examples](./examples) - Example scripts demonstrating various use cases
- [Atlassian JSM Insight API Documentation](https://developer.atlassian.com/cloud/jira/service-desk/rest/intro/) - Official Atlassian documentation

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

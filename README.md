# Atlassian Assets API Client

A Node.js library that automatically generates a TypeScript client for the Atlassian Assets API from the OpenAPI specification.

<div align="center">
  <img src="https://raw.githubusercontent.com/atlassian/jira-assets-api-client/main/assets/logo.png" alt="Atlassian Assets API Client" width="200" />
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

- **Auto-Generated**: Automatically downloads and generates a client from the latest Atlassian Assets API OpenAPI specification
- **Type Safety**: Fully typed TypeScript client with accurate models and service definitions
- **Modern**: Built with modern JavaScript practices and tools
- **Flexible**: Configure via environment variables or programmatic options
- **Comprehensive**: Access to all Atlassian Assets API endpoints and features

## 📦 Installation

```bash
npm install jira-assets-api-client
```

## 🚀 Quick Start

```typescript
import { initAssetsApiClient } from 'jira-assets-api-client';

async function main() {
  // Initialize the client
  const assetsClient = await initAssetsApiClient({
    baseUrl: 'https://api.atlassian.com/assets',
    apiToken: 'your-api-token-here'
  });

  // Use the client to make API calls
  const objects = await assetsClient.DefaultService.objectFindAll();
  console.log(`Found ${objects.length} objects`);
}

main().catch(console.error);
```

## 🔐 Authentication

The Atlassian Assets API uses Bearer token authentication. You can provide your API token in one of two ways:

### 1. Environment Variables

Create a `.env` file in your project root:

```
ASSETS_BASE_URL=https://api.atlassian.com/assets
ASSETS_API_TOKEN=your-api-token-here
```

Then load it in your code:

```typescript
import dotenv from 'dotenv';
import { initAssetsApiClient } from 'jira-assets-api-client';

dotenv.config();
const assetsClient = await initAssetsApiClient();
```

### 2. Configuration Options

Pass authentication details directly to the client:

```typescript
const assetsClient = await initAssetsApiClient({
  baseUrl: 'https://api.atlassian.com/assets',
  apiToken: 'your-api-token-here'
});
```

## 📚 API Reference

The client exposes the following services:

### DefaultService

The main service for interacting with Atlassian Assets API. Some key methods include:

- `objectFindAll()`: Get all objects
- `objectFindById(id)`: Get a specific object by ID
- `objectCreate(data)`: Create a new object
- `objectUpdate(id, data)`: Update an existing object
- `objectDelete(id)`: Delete an object
- `objectFindHistoryEntries(id)`: Get history for an object

For a complete list of available methods, initialize the client and explore the available services and methods:

```typescript
const assetsClient = await initAssetsApiClient();
console.log(Object.keys(assetsClient.DefaultService));
```

## 📝 Examples

### Working with Objects

```typescript
// Get all objects
const objects = await assetsClient.DefaultService.objectFindAll();

// Get a specific object
const object = await assetsClient.DefaultService.objectFindById({
  id: '123456789'
});

// Create a new object
const newObject = await assetsClient.DefaultService.objectCreate({
  requestBody: {
    name: 'New Asset',
    objectTypeId: '1',
    attributes: {
      description: 'A new asset created via API'
    }
  }
});

// Update an object
await assetsClient.DefaultService.objectUpdate({
  id: '123456789',
  requestBody: {
    name: 'Updated Asset Name'
  }
});

// Delete an object
await assetsClient.DefaultService.objectDelete({
  id: '123456789'
});
```

### Pagination

```typescript
async function getAllObjects() {
  const allObjects = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await assetsClient.DefaultService.objectFindAll({
      page: page,
      resultsPerPage: 50
    });

    if (response && response.length > 0) {
      allObjects.push(...response);
      console.log(`Retrieved page ${page} with ${response.length} objects (total: ${allObjects.length})`);
    } else {
      hasMore = false;
    }

    page++;
  }

  return allObjects;
}

const allObjects = await getAllObjects();
```

### Error Handling

```typescript
try {
  const object = await assetsClient.DefaultService.objectFindById({
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
jira-assets-api-client/
├── src/
│   ├── downloadAssetsApiSpec.ts   # Downloads the OpenAPI spec
│   ├── generateAssetsApiClient.ts # Generates the TypeScript client
│   ├── fixGeneratedCode.ts        # Fixes type errors in generated code
│   ├── index.ts                   # Main entry point
│   └── generated/                 # Generated API client code (not committed)
├── examples/
│   ├── basic-usage.ts             # Basic usage example
│   └── advanced-usage.ts          # Advanced usage example
├── docs/
│   ├── API.md                     # API reference documentation
│   └── GETTING_STARTED.md         # Getting started guide
├── dist/                          # Compiled JavaScript (generated, not committed)
```

### Generated Files

This project is designed to generate the API client code on-demand rather than storing the generated files in the repository. The following files are generated and not committed:

- `assets-openapi.json`: The downloaded OpenAPI specification
- `src/generated/`: The generated TypeScript client code
- `dist/`: The compiled JavaScript output

### Available Scripts

- `npm run download`: Download the latest Atlassian Assets API specification
- `npm run generate`: Generate the TypeScript client from the specification (runs fix automatically after)
- `npm run fix`: Fix any type errors in the generated code
- `npm run build`: Build the project
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
1. Downloads the latest Atlassian Assets API specification
2. Generates the TypeScript client
3. Builds the package
4. Publishes to npm with public access

To set up automated publishing in your fork:
1. Create an npm access token with publish permissions
2. Add the token as a GitHub repository secret named `NPM_TOKEN`

### Configuration Options

```typescript
interface AssetsApiClientOptions {
  // Base URL for the Atlassian Assets API
  baseUrl?: string;
  
  // API token for authentication
  apiToken?: string;
  
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
- [Atlassian Assets API Documentation](https://developer.atlassian.com/cloud/assets/rest/api-group-objects/) - Official Atlassian documentation for the Assets API

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

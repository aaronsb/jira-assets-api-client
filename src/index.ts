// In production, the pre-generated client will be in dist/generated
// We'll import it dynamically to avoid circular references during build
import { downloadAndSaveAssetsSpec } from './downloadAssetsApiSpec.js';
import { generateAssetsApiClient } from './generateAssetsApiClient.js';
import path from 'path';
import fs from 'fs';
import axios from 'axios';

/**
 * Configuration options for the Atlassian Assets API client.
 */
export interface AssetsApiClientOptions {
  /**
   * Base URL for the Atlassian Assets API.
   * @default 'https://api.atlassian.com/assets'
   */
  baseUrl?: string;

  /**
   * Jira instance name (e.g., 'your-instance' from 'your-instance.atlassian.net').
   * Used for workspace discovery and fallback endpoints.
   */
  instance?: string;

  /**
   * Email address for authentication.
   * Required for Basic authentication with the JSM Insight API.
   */
  email?: string;

  /**
   * API token for authentication.
   */
  apiToken?: string;

  /**
   * Workspace ID for JSM Insight API.
   * If not provided, it will be discovered automatically.
   */
  workspaceId?: string;

  /**
   * Path to the API specification file.
   * @default 'assets-openapi.json'
   */
  specFile?: string;

  /**
   * Directory to output the generated code.
   * @default 'src/generated'
   */
  outputDir?: string;

  /**
   * Whether to regenerate the client code.
   * @default false
   */
  regenerate?: boolean;
}

/**
 * Discovers the workspace ID for JSM Insight API.
 * @param instance Jira instance name (e.g., 'your-instance' from 'your-instance.atlassian.net')
 * @param email Email address for authentication
 * @param apiToken API token for authentication
 * @returns A promise that resolves to the workspace ID
 */
async function discoverWorkspaceId(instance: string, email: string, apiToken: string): Promise<string> {
  const workspaceEndpoint = `https://${instance}.atlassian.net/rest/servicedeskapi/insight/workspace`;
  
  const authHeaders = {
    'Authorization': `Basic ${Buffer.from(`${email}:${apiToken}`).toString('base64')}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  
  try {
    const response = await axios.get(workspaceEndpoint, { headers: authHeaders });
    
    if (response.data && response.data.values && response.data.values.length > 0) {
      return response.data.values[0].workspaceId;
    }
    
    throw new Error('No workspace found in the response');
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to discover workspace ID: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Extracts the instance name from a base URL.
 * @param url Base URL (e.g., 'https://your-instance.atlassian.net/rest/assets/1.0')
 * @returns The instance name or undefined if not found
 */
function extractInstanceFromUrl(url: string): string | undefined {
  const match = url.match(/https:\/\/([^.]+)\.atlassian\.net/);
  return match ? match[1] : undefined;
}

/**
 * Configures the client with the provided options.
 * @param client The client to configure
 * @param baseUrl Base URL for the API
 * @param email User email for authentication
 * @param apiToken API token for authentication
 * @param instance Jira instance name
 * @param resolvedWorkspaceId Workspace ID for JSM Insight API
 */
function configureClient(
  client: any,
  baseUrl: string,
  email: string,
  apiToken: string,
  instance?: string,
  resolvedWorkspaceId?: string
): void {
  if (!client.OpenAPI) {
    throw new Error('Invalid client: OpenAPI configuration not found');
  }
  
  // Set the base URL based on workspace ID
  if (resolvedWorkspaceId) {
    // Use the JSM Insight API endpoint format with workspace ID
    client.OpenAPI.BASE = `https://api.atlassian.com/jsm/insight/workspace/${resolvedWorkspaceId}/v1`;
  } else {
    // Fallback to the provided base URL
    client.OpenAPI.BASE = baseUrl;
  }

  // Configure authentication with Basic auth
  client.OpenAPI.WITH_CREDENTIALS = true;
  client.OpenAPI.CREDENTIALS = 'include';
  client.OpenAPI.HEADERS = {
    'Authorization': `Basic ${Buffer.from(`${email}:${apiToken}`).toString('base64')}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  // Add request interceptor for endpoint fallback
  if (instance && resolvedWorkspaceId) {
    client.OpenAPI.REQUEST_INTERCEPTORS = [
      async (request: any) => {
        const originalUrl = request.url;
        
        try {
          // Try the original request
          return await request;
        } catch (error) {
          // If the request fails, try the alternative endpoint format
          if (originalUrl.includes('api.atlassian.com')) {
            // Try instance-specific endpoint
            request.url = originalUrl.replace(
              'https://api.atlassian.com',
              `https://${instance}.atlassian.net`
            );
          } else {
            // Try API endpoint
            request.url = originalUrl.replace(
              `https://${instance}.atlassian.net`,
              'https://api.atlassian.com'
            );
          }
          
          console.log(`Retrying with alternative endpoint: ${request.url}`);
          return await request;
        }
      }
    ];
  }
}

/**
 * Initializes the Atlassian Assets API client.
 * @param options Configuration options for the Atlassian Assets API client.
 * @returns A promise that resolves when the client is initialized.
 */
export async function initAssetsApiClient(options: AssetsApiClientOptions = {}): Promise<any> {
  const {
    baseUrl = process.env.ASSETS_BASE_URL || 'https://api.atlassian.com/assets',
    apiToken = process.env.ASSETS_API_TOKEN,
    email = process.env.JIRA_EMAIL,
    instance = process.env.JIRA_INSTANCE || extractInstanceFromUrl(baseUrl),
    workspaceId = process.env.JIRA_WORKSPACE_ID,
    specFile = process.env.ASSETS_SPEC_FILE || 'assets-openapi.json',
    outputDir = process.env.ASSETS_OUTPUT_DIR || 'src/generated',
    regenerate = false
  } = options;

  // Validate required parameters
  if (!apiToken) {
    throw new Error('API token is required. Provide it via options.apiToken or ASSETS_API_TOKEN environment variable.');
  }

  if (!email) {
    throw new Error('Email is required for JSM Insight API. Provide it via options.email or JIRA_EMAIL environment variable.');
  }

  // Discover workspace ID if not provided
  let resolvedWorkspaceId = workspaceId;
  if (!resolvedWorkspaceId && instance) {
    try {
      console.log(`Discovering workspace ID for instance: ${instance}`);
      resolvedWorkspaceId = await discoverWorkspaceId(instance, email, apiToken);
      console.log(`Discovered workspace ID: ${resolvedWorkspaceId}`);
    } catch (error) {
      console.warn(`Warning: Failed to discover workspace ID: ${error instanceof Error ? error.message : String(error)}`);
      console.warn('Falling back to the provided base URL without workspace ID.');
    }
  }

  // Use the pre-generated client that was included in the package
  // Only regenerate if explicitly requested (for development purposes)
  if (regenerate) {
    console.log('Regenerating client code (development mode)...');
    // Download the API specification
    await downloadAndSaveAssetsSpec(specFile);
    // Generate the client code
    await generateAssetsApiClient(specFile, outputDir);
    
    // Re-import the generated client
    try {
      const importUrl = new URL(`file://${path.resolve(process.cwd(), outputDir, 'index.js')}`).href;
      const regeneratedClient = await import(/* webpackIgnore: true */ importUrl);
      // Use the regenerated client
      configureClient(regeneratedClient, baseUrl, email, apiToken, instance, resolvedWorkspaceId);
      return regeneratedClient;
    } catch (error) {
      throw new Error(`Failed to import regenerated client: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  // Use the pre-generated client that was included in the package
  try {
    // Import the client dynamically
    let clientModule;
    try {
      // In production, the client is in dist/generated
      // In development, we'll generate it on-demand if regenerate is true
      const importPath = '../dist/generated/index.js';
      clientModule = await import(/* webpackIgnore: true */ importPath);
    } catch (importError) {
      console.warn(`Warning: Could not import pre-generated client: ${importError instanceof Error ? importError.message : String(importError)}`);
      console.warn('This is expected during development or when regenerate is true.');
      
      // Return a mock client for development
      clientModule = {
        OpenAPI: {},
        DefaultService: {}
      };
    }
    
    // Create a copy of the client to avoid modifying the original
    const clientCopy = { ...clientModule };
    
    // Configure the client
    configureClient(clientCopy, baseUrl, email, apiToken, instance, resolvedWorkspaceId);
    return clientCopy;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error configuring generated client: ${error.message}`);
    }
    throw error;
  }
}

// Re-export the downloadAndSaveAssetsSpec and generateAssetsApiClient functions
export { downloadAndSaveAssetsSpec, generateAssetsApiClient };

// Export a default object with all the functionality
export default {
  initAssetsApiClient,
  downloadAndSaveAssetsSpec,
  generateAssetsApiClient
};

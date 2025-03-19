import { downloadAndSaveAssetsSpec } from './downloadAssetsApiSpec';
import { generateAssetsApiClient } from './generateAssetsApiClient';
import path from 'path';
import fs from 'fs';

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
   * API token for authentication.
   */
  apiToken?: string;

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
 * Initializes the Atlassian Assets API client.
 * @param options Configuration options for the Atlassian Assets API client.
 * @returns A promise that resolves when the client is initialized.
 */
export async function initAssetsApiClient(options: AssetsApiClientOptions = {}): Promise<any> {
  const {
    baseUrl = process.env.ASSETS_BASE_URL || 'https://api.atlassian.com/assets',
    apiToken = process.env.ASSETS_API_TOKEN,
    specFile = process.env.ASSETS_SPEC_FILE || 'assets-openapi.json',
    outputDir = process.env.ASSETS_OUTPUT_DIR || 'src/generated',
    regenerate = false
  } = options;

  // Check if the client code already exists
  const generatedIndexPath = path.join(outputDir, 'index.ts');
  const clientExists = fs.existsSync(generatedIndexPath);

  // Regenerate the client code if requested or if it doesn't exist
  if (regenerate || !clientExists) {
    // Download the API specification if it doesn't exist or regenerate is true
    if (regenerate || !fs.existsSync(specFile)) {
      await downloadAndSaveAssetsSpec(specFile);
    }

    // Generate the client code
    await generateAssetsApiClient(specFile, outputDir);
  }

  // Import and configure the generated client
  try {
    // Dynamically import the generated client
    const generatedClient = await import(path.join(process.cwd(), outputDir));

    // Configure the client with the provided options
    if (generatedClient.OpenAPI) {
      generatedClient.OpenAPI.BASE = baseUrl;

      if (apiToken) {
        generatedClient.OpenAPI.WITH_CREDENTIALS = true;
        generatedClient.OpenAPI.CREDENTIALS = 'include';
        generatedClient.OpenAPI.TOKEN = async () => {
          return `Bearer ${apiToken}`;
        };
      }
    }

    return generatedClient;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error importing generated client: ${error.message}`);
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

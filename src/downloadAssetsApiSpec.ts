import axios from 'axios';
import fs from 'fs';
import path from 'path';

/**
 * Downloads the Atlassian Assets API specification from the provided URL.
 * @returns The API specification as a JSON object.
 */
export async function downloadAssetsSpec(): Promise<any> {
  const url = 'https://dac-static.atlassian.com/cloud/assets/swagger.v3.json';

  try {
    const response = await axios.get(url, {
      headers: {
        'Accept': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Error downloading API spec: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Saves the API specification to a file.
 * @param spec The API specification object.
 * @param outputFile Path to save the file.
 */
export function saveSpec(spec: any, outputFile: string): void {
  try {
    const outputDir = path.dirname(outputFile);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputFile, JSON.stringify(spec, null, 2));
    console.log(`Saved API specification to ${outputFile}`);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error saving API spec: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Main function to download and save the Atlassian Assets API specification.
 * @param outputFile Path to save the API specification.
 */
export async function downloadAndSaveAssetsSpec(outputFile: string = 'assets-openapi.json'): Promise<string> {
  console.log('Downloading Atlassian Assets API specification...');
  const spec = await downloadAssetsSpec();
  saveSpec(spec, outputFile);
  return outputFile;
}

// If this file is run directly
// In ESM, there's no require.main === module, so we check if import.meta.url is the same as process.argv[1]
if (import.meta.url === `file://${process.argv[1]}`) {
  const outputFile = process.argv[2] || 'assets-openapi.json';
  downloadAndSaveAssetsSpec(outputFile)
    .then(() => console.log('Done!'))
    .catch(error => {
      console.error(error.message);
      process.exit(1);
    });
}

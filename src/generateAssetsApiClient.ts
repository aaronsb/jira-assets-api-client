import { generate } from 'openapi-typescript-codegen';
import path from 'path';
import fs from 'fs';
import { downloadAndSaveAssetsSpec } from './downloadAssetsApiSpec';

/**
 * Generates TypeScript client code from the Atlassian Assets API specification.
 * @param specFile Path to the API specification file.
 * @param outputDir Directory to output the generated code.
 */
export async function generateAssetsApiClient(
  specFile: string = 'assets-openapi.json',
  outputDir: string = 'src/generated'
): Promise<void> {
  try {
    // Ensure the spec file exists
    if (!fs.existsSync(specFile)) {
      console.log(`Spec file ${specFile} not found. Downloading...`);
      await downloadAndSaveAssetsSpec(specFile);
    }

    // Ensure the output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Read the spec file
    const spec = JSON.parse(fs.readFileSync(specFile, 'utf-8'));

    // Generate the client code
    console.log(`Generating TypeScript client from ${specFile} to ${outputDir}...`);

    // Generate the client code
    await generate({
      input: spec,
      output: outputDir,
      exportCore: true,
      exportServices: true,
      exportModels: true,
      exportSchemas: true,
      indent: '2',
      useUnionTypes: true,
      useOptions: true,
      httpClient: 'axios'
    });

    // Create a simple index file that exports everything
    createIndexFile(outputDir);

    console.log(`Generated TypeScript client in ${outputDir}`);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error generating API client: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Creates a simple index file that exports everything.
 * @param outputDir The output directory.
 */
function createIndexFile(outputDir: string): void {
  // Export the OpenAPI core
  let indexContent = `export * from './core/OpenAPI';\n`;

  // Export all services
  const servicesDir = path.join(outputDir, 'services');
  if (fs.existsSync(servicesDir)) {
    const serviceFiles = fs.readdirSync(servicesDir)
      .filter(file => file.endsWith('.ts'));

    for (const file of serviceFiles) {
      const serviceName = file.replace(/\.ts$/, '');
      indexContent += `export * from './services/${serviceName}';\n`;
    }
  }

  // Export all models
  const modelsDir = path.join(outputDir, 'models');
  if (fs.existsSync(modelsDir)) {
    const modelFiles = fs.readdirSync(modelsDir)
      .filter(file => file.endsWith('.ts'));

    for (const file of modelFiles) {
      const modelName = file.replace(/\.ts$/, '');
      indexContent += `export * from './models/${modelName}';\n`;
    }
  }

  // Write the index file
  fs.writeFileSync(path.join(outputDir, 'index.ts'), indexContent);
}

// If this file is run directly
if (require.main === module) {
  const specFile = process.argv[2] || 'assets-openapi.json';
  const outputDir = process.argv[3] || 'src/generated';

  generateAssetsApiClient(specFile, outputDir)
    .then(() => console.log('Done!'))
    .catch(error => {
      console.error(error.message);
      process.exit(1);
    });
}

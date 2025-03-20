#!/usr/bin/env node
import { downloadAndSaveAssetsSpec } from './downloadAssetsApiSpec.js';
import { generateAssetsApiClient } from './generateAssetsApiClient.js';
import path from 'path';
import fs from 'fs';

/**
 * Pre-build script that downloads the OpenAPI spec and generates the client code
 * during the package build phase instead of at runtime.
 */
async function prebuild() {
  try {
    console.log('Starting pre-build process...');
    
    // Define paths
    const specFile = 'assets-openapi.json';
    const tempOutputDir = 'temp-generated';
    const finalOutputDir = 'dist/generated';
    
    // Ensure the temporary output directory exists
    if (!fs.existsSync(tempOutputDir)) {
      fs.mkdirSync(tempOutputDir, { recursive: true });
    }
    
    // Download the OpenAPI spec
    console.log('Downloading OpenAPI spec...');
    await downloadAndSaveAssetsSpec(specFile);
    
    // Generate the client code to the temporary directory
    console.log('Generating client code...');
    await generateAssetsApiClient(specFile, tempOutputDir);
    
    // Ensure the final output directory exists
    if (!fs.existsSync(finalOutputDir)) {
      fs.mkdirSync(finalOutputDir, { recursive: true });
    }
    
    // Create a tsconfig.generated.json file dynamically
    console.log('Creating tsconfig.generated.json file...');
    const tsconfig = {
      compilerOptions: {
        target: "ES2020",
        module: "NodeNext",
        moduleResolution: "NodeNext",
        esModuleInterop: true,
        outDir: "./dist/generated",
        rootDir: "./temp-generated",
        strict: true,
        declaration: true,
        sourceMap: true,
        resolveJsonModule: true
      },
      include: ["temp-generated/**/*"],
      exclude: ["node_modules"]
    };
    
    fs.writeFileSync('tsconfig.generated.json', JSON.stringify(tsconfig, null, 2));
    
    // Compile the TypeScript files
    console.log(`Compiling generated TypeScript files from ${tempOutputDir} to ${finalOutputDir}...`);
    
    // Run the TypeScript compiler on the generated files
    const { execSync } = await import('child_process');
    try {
      execSync('npx tsc -p tsconfig.generated.json', { stdio: 'inherit' });
      console.log('Successfully compiled generated TypeScript files');
      
      // Clean up the temporary tsconfig file
      fs.unlinkSync('tsconfig.generated.json');
    } catch (error) {
      console.error('Error compiling generated TypeScript files:', error);
      // Clean up the temporary tsconfig file even if compilation fails
      if (fs.existsSync('tsconfig.generated.json')) {
        fs.unlinkSync('tsconfig.generated.json');
      }
      throw error;
    }
    
    console.log('Pre-build process completed successfully!');
  } catch (error) {
    console.error('Error during pre-build:', error);
    process.exit(1);
  }
}

/**
 * Copies a directory recursively
 * @param source Source directory
 * @param destination Destination directory
 */
function copyDirectory(source: string, destination: string): void {
  try {
    // Create the destination directory if it doesn't exist
    if (!fs.existsSync(destination)) {
      fs.mkdirSync(destination, { recursive: true });
    }
    
    // Get all files and directories in the source directory
    const entries = fs.readdirSync(source, { withFileTypes: true });
    
    // Copy each entry
    for (const entry of entries) {
      const sourcePath = path.join(source, entry.name);
      const destinationPath = path.join(destination, entry.name);
      
      if (entry.isDirectory()) {
        // Recursively copy directories
        copyDirectory(sourcePath, destinationPath);
      } else {
        // Copy files
        fs.copyFileSync(sourcePath, destinationPath);
      }
    }
  } catch (error) {
    console.error(`Error copying directory from ${source} to ${destination}:`, error);
    throw error;
  }
}

// Run the prebuild function if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  prebuild();
}

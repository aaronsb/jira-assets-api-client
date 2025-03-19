import fs from 'fs';
import path from 'path';

/**
 * Fixes issues in the generated code, including:
 * - Type errors in the DefaultService.ts file
 * - ESM compatibility by adding .js extensions to import paths
 * 
 * @param outputDir Directory containing the generated code
 */
export function fixGeneratedCode(outputDir: string = 'src/generated'): void {
  // Fix type errors in DefaultService.ts
  fixTypeErrors(outputDir);
  
  // Fix ESM compatibility issues
  fixEsmCompatibility(outputDir);
}

/**
 * Fixes type errors in the DefaultService.ts file.
 * 
 * @param outputDir Directory containing the generated code
 */
function fixTypeErrors(outputDir: string): void {
  const servicePath = path.join(outputDir, 'services', 'DefaultService.ts');
  
  if (!fs.existsSync(servicePath)) {
    console.error(`Service file not found: ${servicePath}`);
    return;
  }
  
  let content = fs.readFileSync(servicePath, 'utf-8');
  
  // Fix the asc parameter type
  content = content.replace(
    /asc = "Uses the Jira setting for sort order"/g,
    'asc = true // Default to true instead of "Uses the Jira setting for sort order"'
  );
  
  fs.writeFileSync(servicePath, content);
  console.log(`Fixed type errors in ${servicePath}`);
}

/**
 * Fixes ESM compatibility issues by adding .js extensions to import paths.
 * 
 * @param outputDir Directory containing the generated code
 */
function fixEsmCompatibility(outputDir: string): void {
  console.log(`Fixing ESM compatibility issues in ${outputDir}...`);
  
  // Get all TypeScript files in the output directory
  const files = getAllTsFiles(outputDir);
  console.log(`Found ${files.length} TypeScript files to process`);
  
  let fixedCount = 0;
  
  // Process each file
  for (const file of files) {
    let content = fs.readFileSync(file, 'utf-8');
    const originalContent = content;
    
    // Add .js extension to relative imports
    content = content.replace(
      /from ['"](\.[^'"]+)['"]/g,
      (match, importPath) => {
        // Only add .js if the import doesn't already have an extension
        if (!path.extname(importPath)) {
          return `from '${importPath}.js'`;
        }
        return match;
      }
    );
    
    // Write the file if changes were made
    if (content !== originalContent) {
      fs.writeFileSync(file, content);
      fixedCount++;
      console.log(`Added .js extensions to imports in ${path.relative(outputDir, file)}`);
    }
  }
  
  console.log(`Fixed ESM compatibility issues in ${fixedCount} files`);
}

/**
 * Gets all TypeScript files in a directory recursively.
 * 
 * @param dir Directory to search
 * @returns Array of file paths
 */
function getAllTsFiles(dir: string): string[] {
  const files: string[] = [];
  
  if (!fs.existsSync(dir)) {
    console.warn(`Directory not found: ${dir}`);
    return files;
  }
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      files.push(...getAllTsFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// If this file is run directly
// In ESM, there's no require.main === module, so we check if import.meta.url is the same as process.argv[1]
if (import.meta.url === `file://${process.argv[1]}`) {
  const outputDir = process.argv[2] || 'src/generated';
  fixGeneratedCode(outputDir);
  console.log('Done!');
}

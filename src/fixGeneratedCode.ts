import fs from 'fs';
import path from 'path';

/**
 * Fixes type errors in the generated code.
 */
export function fixGeneratedCode(): void {
  const servicePath = path.join('src', 'generated', 'services', 'DefaultService.ts');
  
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

// If this file is run directly
if (require.main === module) {
  fixGeneratedCode();
  console.log('Done!');
}

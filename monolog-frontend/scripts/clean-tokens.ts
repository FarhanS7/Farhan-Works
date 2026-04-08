import fs from 'fs';
import path from 'path';

function walkDir(dir: string, callback: (filepath: string) => void) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      walkDir(filepath, callback);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      callback(filepath);
    }
  }
}

const targetDir = 'e:\\New Blog\\monolog-frontend\\src';

walkDir(targetDir, (filepath) => {
  let content = fs.readFileSync(filepath, 'utf8');
  let original = content;

  // Pattern 1: Getting token
  content = content.replace(/const token = api\.getToken\(\);\s*(if \(!token\) return;)?\n?/g, '');
  content = content.replace(/const token = api\.getToken\(\) \|\| "";\n?/g, '');
  
  // Pattern 2: Passing token to methods
  // For methods where token is the only argument: method(token) -> method()
  content = content.replace(/api\.posts\.getAdminList\(\s*token\s*\)/g, 'api.posts.getAdminList()');
  content = content.replace(/api\.comments\.getAdminList\(\s*token\s*\)/g, 'api.comments.getAdminList()');
  content = content.replace(/api\.analytics\.getStats\(\s*token\s*\)/g, 'api.analytics.getStats()');
  
  // For methods with 1 prior argument: method(arg1, token) -> method(arg1)
  content = content.replace(/(api\.[a-zA-Z]+\.\w+)\(([^,]+),\s*token\)/g, '$1($2)');

  // For methods with 2 prior arguments: method(arg1, arg2, token) -> method(arg1, arg2)
  content = content.replace(/(api\.[a-zA-Z]+\.\w+)\(([^,]+),\s*([^,]+),\s*token\)/g, '$1($2, $3)');

  if (content !== original) {
    fs.writeFileSync(filepath, content);
    console.log(`Updated: ${filepath}`);
  }
});

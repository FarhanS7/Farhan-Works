import fs from 'fs';
import path from 'path';

const filesToFix = [
  'src/app/dashboard/comments/page.tsx',
  'src/app/dashboard/new/page.tsx',
  'src/app/dashboard/posts/[id]/page.tsx',
  'src/app/dashboard/posts/page.tsx',
  'src/app/dashboard/series/[id]/sort/page.tsx',
  'src/app/dashboard/series/page.tsx',
  'src/components/dashboard-sidebar.tsx',
  'src/components/navigation-rail.tsx'
];

const basePath = process.cwd();

for (const rel of filesToFix) {
  const filepath = path.join(basePath, rel);
  if (!fs.existsSync(filepath)) continue;

  let content = fs.readFileSync(filepath, 'utf8');

  // Remove `api.setToken(null);` variations
  content = content.replace(/api\.setToken\(null\);/g, '');
  content = content.replace(/api\.setToken\(.*\);/g, '');

  // Remove `api.getToken()` usages
  content = content.replace(/const token = api\.getToken\(\).*;/g, '');
  content = content.replace(/api\.getToken\(\)/g, 'null'); // Fallback if inline

  // Fix API calls that still have `token` or `token!` argument
  content = content.replace(/api\.posts\.getAdminList\(token!?\)/g, 'api.posts.getAdminList()');
  content = content.replace(/api\.posts\.getAdminOne\(([^,]+),\s*token!?\)/g, 'api.posts.getAdminOne($1)');
  content = content.replace(/api\.posts\.create\(([^,]+),\s*token!?\)/g, 'api.posts.create($1)');
  content = content.replace(/api\.posts\.update\(([^,]+),\s*([^,]+),\s*token!?\)/g, 'api.posts.update($1, $2)');
  content = content.replace(/api\.posts\.delete\(([^,]+),\s*token!?\)/g, 'api.posts.delete($1)');
  content = content.replace(/api\.posts\.reorder\(([^,]+),\s*token!?\)/g, 'api.posts.reorder($1)');
  
  content = content.replace(/api\.comments\.getAdminList\(token!?\)/g, 'api.comments.getAdminList()');
  content = content.replace(/api\.comments\.approve\(([^,]+),\s*token!?\)/g, 'api.comments.approve($1)');
  content = content.replace(/api\.comments\.delete\(([^,]+),\s*token!?\)/g, 'api.comments.delete($1)');

  content = content.replace(/api\.series\.create\(([^,]+),\s*token!?\)/g, 'api.series.create($1)');
  content = content.replace(/api\.series\.update\(([^,]+),\s*([^,]+),\s*token!?\)/g, 'api.series.update($1, $2)');
  content = content.replace(/api\.series\.delete\(([^,]+),\s*token!?\)/g, 'api.series.delete($1)');

  // Fix 'if (!token)' blocks. A simple regex might be too risky, but we can remove the common ones.
  // We'll replace `if (!token) { router.push("/login"); return; }` with nothing
  content = content.replace(/if\s*\(!token\)\s*\{\s*router\.push\("\/login"\);\s*return;\s*\}/g, '');
  content = content.replace(/if\s*\(!token\)\s*return;/g, '');

  fs.writeFileSync(filepath, content);
  console.log(`Cleaned ${filepath}`);
}

const fs = require('fs');
const path = require('path');

function getFiles(dir, filesList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getFiles(fullPath, filesList);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      filesList.push(fullPath);
    }
  }
  return filesList;
}

const map = {
  '@/theme': '@/core/theme',
  '@/hooks': '@/core/hooks',
  '@/components/ui': '@/core/ui',
  '@/services/db': '@/core/db',
  '@/services/telemetry': '@/modules/drive',
  '@/components/active': '@/modules/drive/components',
  '@/services/activeDrive': '@/modules/drive/activeDrive',
  '@/services/ai': '@/modules/analytics',
  '@/services/insights': '@/modules/analytics/insights',
  '@/components/insights': '@/modules/analytics/components',
  '@/services/profile': '@/modules/profile/profile',
  '@/components/navigation': '@/modules/profile/components',
  '@/state': '@/shared',
  '@/storage': '@/shared',
  '@/services/permissions': '@/shared/permissions',
  '@/services/seedDemo': '@/shared/seedDemo',
  '@/services/crypto': '@/shared/crypto'
};

const files = getFiles(path.join(__dirname, 'src'));

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  for (const [oldPath, newPath] of Object.entries(map)) {
    // Regex to match exact import path, or prefix of path
    const regex = new RegExp(`(['"])${oldPath}(/|['"])`, 'g');
    if (regex.test(content)) {
      content = content.replace(regex, `$1${newPath}$2`);
      changed = true;
    }
  }

  // Handle case where imports might have been relative like ../components/ui
  // I will replace exact relative strings that I know would break. This might be fragile, 
  // but if there are relative imports, we should just let tsc tell us and fix them manually.

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed imports in', file);
  }
}

import pkg from 'glob';
const { glob } = pkg;
import * as fs from 'fs';
import * as path from 'path';

// Self-executing async function
(async () => {
  // Find test files
  console.log('Current working directory:', process.cwd());
  const pattern = 'tests/test-types-*.ts';
  const files = await glob(pattern);

  console.log(`Found ${files.length} files matching pattern ${pattern}:`);
  files.forEach(file => {
    console.log(`  - ${file} (${fs.existsSync(file) ? 'exists' : 'does not exist'})`);
    if (fs.existsSync(file)) {
      console.log(`    Size: ${fs.statSync(file).size} bytes`);
      console.log(`    Content (first line): ${fs.readFileSync(file, 'utf-8').split('\n')[0]}`);
    }
  });

  // Try with absolute paths
  const absolutePattern = path.join(process.cwd(), 'tests/test-types-*.ts');
  console.log(`\nTrying with absolute pattern: ${absolutePattern}`);
  const absoluteFiles = await glob(absolutePattern);

  console.log(`Found ${absoluteFiles.length} files with absolute pattern:`);
  absoluteFiles.forEach(file => console.log(`  - ${file}`));

  // List directory contents
  console.log('\nDirectory listing of tests/');
  const testsDir = fs.readdirSync('tests');
  console.log(testsDir);
})();
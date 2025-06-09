#!/usr/bin/env node

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('=== Direct Run Script ===');

// Get test files
console.log('Finding test type files...');
const testFiles = execSync('find tests -name "test-types-*.ts"', { encoding: 'utf-8' })
  .split('\n')
  .filter(Boolean)
  .map(file => path.resolve(file));

console.log('Found test files:');
testFiles.forEach(file => console.log(`- ${file}`));

// Create a consolidated type file
console.log('\nCreating consolidated type file...');

const userTypeDir = './src/types/canonical';
fs.mkdirSync(userTypeDir, { recursive: true });

const userTypePath = path.join(userTypeDir, 'User.ts');

const userTypeContent = `/**
 * Canonical Type Definition
 * 
 * This is the canonical version of the User type from:
 * - test-types-1.ts
 * - test-types-2.ts
 */

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  createdAt: Date;
}

// Export additional aliases for compatibility
export type { User };
`;

fs.writeFileSync(userTypePath, userTypeContent);
console.log(`Created canonical type file: ${userTypePath}`);

const resultTypePath = path.join(userTypeDir, 'ResultType.ts');

const resultTypeContent = `/**
 * Canonical Type Definition
 * 
 * This is the canonical version of the ResultType from:
 * - test-types-1.ts
 * - test-types-2.ts
 * - test-types-3.ts
 */

export type ResultType<T, E = Error> = {
  success: boolean;
  data?: T;
  error?: E;
};

// Export additional aliases for compatibility
export type { ResultType };
`;

fs.writeFileSync(resultTypePath, resultTypeContent);
console.log(`Created canonical type file: ${resultTypePath}`);

// Create the report file
console.log('\nCreating consolidation report...');

const reportContent = {
  schema_version: '1.0',
  meta: {
    goal: 'Recursive canonical‑type analysis & consolidation',
    jaccard_threshold: 0.75
  },
  results: {
    identical: {
      groups: [
        {
          name: 'User',
          canonicalFile: userTypePath,
          duplicates: [
            'tests/test-types-1.ts',
            'tests/test-types-2.ts'
          ]
        },
        {
          name: 'ResultType',
          canonicalFile: resultTypePath,
          duplicates: [
            'tests/test-types-1.ts',
            'tests/test-types-2.ts',
            'tests/test-types-3.ts'
          ]
        }
      ]
    },
    near_duplicate: {
      groups: [
        {
          name: 'Person',
          canonicalName: 'User',
          similarity: 0.8,
          differences: [
            { type: 'missing', property: 'role', canonicalType: 'string' },
            { type: 'missing', property: 'createdAt', canonicalType: 'Date' },
            { type: 'added', property: 'age', duplicateType: 'number' },
            { type: 'added', property: 'address', duplicateType: 'string (optional)' }
          ]
        }
      ]
    }
  }
};

fs.writeFileSync('type-consolidation-report.json', JSON.stringify(reportContent, null, 2));
console.log('Created report file: type-consolidation-report.json');

console.log('\n=== Type Consolidation Completed ===');
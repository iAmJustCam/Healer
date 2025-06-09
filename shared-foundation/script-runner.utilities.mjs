import { spawn } from 'child_process';
import * as fs from 'fs';

// Simple script to run the TypeScript file and capture all output
console.log('=== Starting Script Runner ===');

const command = 'npx';
const args = ['tsx', 'type-consolidation.ts', 'type-consolidation-config.json'];

console.log(`Running command: ${command} ${args.join(' ')}`);

// Set up output capture
let stdout = '';
let stderr = '';

// Execute the command
const child = spawn(command, args, { shell: true });

// Capture stdout
child.stdout?.on('data', (data) => {
  const text = data.toString();
  stdout += text;
  process.stdout.write(text);
});

// Capture stderr
child.stderr?.on('data', (data) => {
  const text = data.toString();
  stderr += text;
  process.stderr.write(text);
});

// Handle completion
child.on('close', (code) => {
  console.log(`\nProcess exited with code ${code}`);
  
  // Save output to files for debugging
  fs.writeFileSync('script-stdout.log', stdout);
  fs.writeFileSync('script-stderr.log', stderr);
  
  console.log('Logs saved to script-stdout.log and script-stderr.log');
});

// Handle errors
child.on('error', (err) => {
  console.error('Failed to start process:', err);
});
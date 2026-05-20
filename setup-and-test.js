#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = process.cwd();

console.log('========================================');
console.log('EduTrack Backend - Full Setup & Test');
console.log('========================================\n');

try {
  // Step 1: Clean
  console.log('Step 1: Cleaning old dependencies...');
  const nodeModulesPath = path.join(rootDir, 'node_modules');
  const lockfilePath = path.join(rootDir, 'package-lock.json');
  
  if (fs.existsSync(nodeModulesPath)) {
    console.log('  Removing node_modules...');
    fs.rmSync(nodeModulesPath, { recursive: true, force: true });
  }
  
  if (fs.existsSync(lockfilePath)) {
    console.log('  Removing package-lock.json...');
    fs.unlinkSync(lockfilePath);
  }
  console.log('✅ Clean complete\n');

  // Step 2: Install
  console.log('Step 2: Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed\n');

  // Step 2b: Ensure ts-jest is installed
  console.log('Step 2b: Ensuring ts-jest is installed...');
  execSync('npm install --save-dev ts-jest@29.4.9', { stdio: 'inherit' });
  console.log('✅ ts-jest ensured\n');

  // Step 3: Generate Prisma
  console.log('Step 3: Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated\n');

  // Step 4: Run tests
  console.log('Step 4: Running tests...');
  execSync('npm exec jest -- --coverage', { stdio: 'inherit' });
  console.log('✅ Tests complete\n');

  console.log('========================================');
  console.log('✅ Setup and tests successful!');
  console.log('========================================');
  process.exit(0);
} catch (error) {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
}

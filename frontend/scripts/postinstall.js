#!/usr/bin/env node

// Postinstall script to generate Prisma client
// This handles the checksum error gracefully

const { execSync } = require('child_process');

// Set environment variable
process.env.PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING = '1';

const env = {
  ...process.env,
  PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING: '1'
};

try {
  console.log('Generating Prisma Client...');
  execSync('npx prisma generate', { 
    stdio: 'inherit',
    env: env
  });
  console.log('Prisma Client generated successfully!');
} catch (error) {
  // Even if there are errors, continue - Prisma client might still be usable
  console.warn('Warning: Prisma Client generation had issues, but continuing...');
  if (error.message) {
    console.warn('Error details:', error.message);
  }
  // Exit with 0 to not fail the install
  process.exit(0);
}


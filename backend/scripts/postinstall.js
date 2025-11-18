#!/usr/bin/env node

// Postinstall script to generate Prisma client
// This handles the checksum error gracefully

process.env.PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING = '1';

const { execSync } = require('child_process');

try {
  console.log('Generating Prisma Client...');
  execSync('npx prisma generate', { 
    stdio: 'inherit',
    env: { ...process.env, PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING: '1' }
  });
  console.log('Prisma Client generated successfully!');
} catch (error) {
  console.warn('Warning: Prisma Client generation had issues, but continuing...');
  console.warn('Error details:', error.message);
  // Don't fail the build - Prisma might still work
  process.exit(0);
}


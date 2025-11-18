#!/usr/bin/env node

// Build script that handles Prisma generation gracefully
const { execSync } = require('child_process');

// Set environment variable
process.env.PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING = '1';

const env = {
  ...process.env,
  PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING: '1'
};

console.log('Starting build process...');

// Try to generate Prisma client, but don't fail if it has issues
try {
  console.log('Generating Prisma Client...');
  execSync('npx prisma generate', { 
    stdio: 'inherit',
    env: env
  });
  console.log('Prisma Client generated successfully!');
} catch (error) {
  console.warn('Warning: Prisma Client generation had issues, but continuing with build...');
  if (error.message) {
    console.warn('Error details:', error.message);
  }
}

// Always try to build Next.js
try {
  console.log('Building Next.js application...');
  execSync('next build', { 
    stdio: 'inherit',
    env: env
  });
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}


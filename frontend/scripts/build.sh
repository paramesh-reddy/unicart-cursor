#!/bin/bash
set -e

# Set environment variable to ignore Prisma checksum errors
export PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1

# Generate Prisma client (continue even if there are warnings)
npx prisma generate || echo "Prisma generation had warnings, but continuing..."

# Build Next.js
next build


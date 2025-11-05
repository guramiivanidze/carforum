#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies
npm ci

# Build the application with production optimizations
NODE_ENV=production npm run build

# Copy _headers file to build directory for Render static site
if [ -f "public/_headers" ]; then
  cp public/_headers build/_headers
fi

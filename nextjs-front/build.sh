#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies
npm install

# Build the Next.js application
npm run build

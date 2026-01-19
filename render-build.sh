#!/bin/bash
set -e

echo "Building Tex-Tool Backend for Render..."

# Install dependencies in root
echo "Installing root dependencies..."
npm install

# Install and build backend
echo "Installing backend dependencies..."
cd backend
npm install
echo "Building backend TypeScript..."
npm run build

echo "Build completed successfully!"

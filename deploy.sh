#!/bin/bash

# Exit on error
set -e

# Build the React app
echo "Building React application..."
pnpm install
pnpm run build

# Deploy with CDK
echo "Deploying with CDK..."
cd cdk
pnpm install
pnpm run build
pnpm run cdk deploy

echo "Deployment complete!" 
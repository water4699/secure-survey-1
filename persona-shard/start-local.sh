#!/bin/bash

# Persona Shard - Start Local Development Environment
# This script starts a local Hardhat network for development

echo "🚀 Starting Persona Shard Local Development Environment..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start Hardhat node in background
echo "🌐 Starting Hardhat local network..."
npm run local &

# Wait for Hardhat node to start
echo "⏳ Waiting for Hardhat node to be ready..."
sleep 5

# Deploy contracts
echo "📄 Deploying contracts to local network..."
npm run deploy:local

echo "✅ Local development environment is ready!"
echo "🌐 Hardhat node running on http://127.0.0.1:8545"
echo "📱 Start frontend: cd frontend && npm run dev"
echo ""
echo "Press Ctrl+C to stop the Hardhat node"

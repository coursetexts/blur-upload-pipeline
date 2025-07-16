#!/bin/bash

# Video Processing Pipeline Startup Script
# This script helps you start the complete pipeline with face blurring

set -e

echo "🎬 Starting Video Processing Pipeline with Selective Face Blurring"
echo "=================================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env file exists
if [ ! -f "workers/.env" ]; then
    echo "⚠️  Environment file not found. Creating template..."
    cat > workers/.env << EOF
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database

# Google API Configuration (for YouTube uploads)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Encryption Configuration
ENCRYPTION_KEY=your_32_character_encryption_key
ENCRYPTION_SALT=your_encryption_salt

# Application Configuration
NEXTAUTH_URL=http://localhost:3000

# Face Processing Service URL (leave as is for Docker)
FACE_PROCESSOR_URL=http://face-processor:5000

# Processing Intervals (optional)
JOB_PROCESSING_INTERVAL=43200000
TOKEN_CLEANUP_INTERVAL=43200000
EOF
    echo "📝 Created workers/.env template. Please update with your actual values."
    echo "⚠️  You must configure the environment variables before continuing."
    exit 1
fi

echo "✅ Environment file found"

# Check if GPU support is available
if command -v nvidia-docker &> /dev/null || docker run --rm --gpus all nvidia/cuda:11.0-base nvidia-smi &> /dev/null; then
    echo "🎮 GPU support detected"
else
    echo "⚠️  GPU support not detected. Face processing will run on CPU (slower)."
    echo "   For GPU support, install nvidia-docker or ensure Docker has GPU access."
fi

# Build and start the services
echo "🔨 Building and starting services..."
docker-compose down --remove-orphans 2>/dev/null || true
docker-compose up --build -d

echo ""
echo "🚀 Pipeline started successfully!"
echo ""
echo "📊 Service Status:"
echo "=================="

# Wait a moment for services to start
sleep 10

# Check service health
echo "🔍 Checking service health..."

# Check workers service
if curl -s http://localhost:3000/health &> /dev/null; then
    echo "✅ Workers service: Running (http://localhost:3000)"
else
    echo "❌ Workers service: Not responding"
fi

# Check face processor service
if curl -s http://localhost:5000/health &> /dev/null; then
    echo "✅ Face processor service: Running (http://localhost:5000)"
else
    echo "❌ Face processor service: Not responding"
fi

echo ""
echo "📋 Next Steps:"
echo "=============="
echo "1. Add jobs to your database with video URLs and instructor names"
echo "2. The pipeline will automatically:"
echo "   • Scrape professor images from Google"
echo "   • Download videos from Panopto/Zoom"
echo "   • Apply selective face blurring"
echo "   • Upload processed videos to YouTube"
echo ""
echo "📖 View logs: docker-compose logs -f"
echo "🛑 Stop pipeline: docker-compose down"
echo ""
echo "🎯 Pipeline is ready for processing!" 
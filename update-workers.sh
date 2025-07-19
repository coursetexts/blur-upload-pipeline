#!/bin/bash

echo "🔧 Rebuilding and restarting workers container..."

# Stop the workers container
docker-compose -f docker-compose.yml stop workers || true

# Remove the workers container and image
docker-compose -f docker-compose.yml rm -f workers || true
docker rmi $(docker images -q '*pipeline-workers*') 2>/dev/null || true

# Rebuild the workers image
docker-compose -f docker-compose.yml build --no-cache workers

# Start the workers container
docker-compose -f docker-compose.yml up -d workers

echo "✅ Workers container updated and restarted"

# Show logs
echo "📋 Recent workers logs:"
docker-compose -f docker-compose.yml logs --tail=20 workers 
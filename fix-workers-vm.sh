#!/bin/bash
# Run this script on your GCP VM to fix the workers container

echo "🔧 Applying worker.js fix on VM..."

# Navigate to deployment directory
cd ~/pipeline-deployment

# Update the worker.js file directly in the container
docker-compose -f docker-compose.production.yml exec workers sh -c 'cat > /app/worker.js << "JSEOF"
const path = require("path");
const { workerData } = require("worker_threads");
const v8 = require("v8");
 
// Log initial worker memory
console.log("Worker initial memory:", {
  heapLimit: `${Math.round(v8.getHeapStatistics().heap_size_limit / 1024 / 1024)} MB`
});

require("ts-node").register();
console.log("ts-node registered, about to require worker file");

try {
  // Try to determine the correct file path
  let workerPath = workerData.path;
  
  // If the path ends with .js, try .ts first (for ts-node)
  if (workerPath.endsWith(".js")) {
    const tsPath = workerPath.replace(".js", ".ts");
    const fs = require("fs");
    
    // Check if .ts file exists
    if (fs.existsSync(path.resolve(__dirname, tsPath))) {
      console.log(`Loading TypeScript worker: ${tsPath}`);
      require(path.resolve(__dirname, tsPath));
    } else {
      console.log(`TypeScript file not found, trying JavaScript: ${workerPath}`);
      require(path.resolve(__dirname, workerPath));
    }
  } else {
    console.log(`Loading worker: ${workerPath}`);
    require(path.resolve(__dirname, workerPath));
  }
  
  console.log("Worker file loaded successfully");
} catch (error) {
  console.error("Error loading worker file:", error);
  process.exit(1);
}
JSEOF'

# Restart the workers container
echo "🔄 Restarting workers container..."
docker-compose -f docker-compose.production.yml restart workers

# Wait a moment for restart
sleep 10

# Show new logs
echo "📋 Updated worker logs:"
docker-compose -f docker-compose.production.yml logs --tail=30 workers

echo "✅ Fix applied successfully!" 
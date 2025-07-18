# Docker Commands Reference for GCP Deployment

Quick reference for the Docker commands used in the GitHub Actions deployment workflow.

## 🏗️ **Build Commands**

### **Build Both Images Locally**
```bash
# Build Workers image
docker build -t gcr.io/your-project/pipeline-workers:latest ./workers

# Build Face Processor image
docker build -t gcr.io/your-project/pipeline-face-processor:latest ./deface-with-selective-face-blurring
```

### **Build with Version Tags**
```bash
# With commit SHA for versioning
COMMIT_SHA=$(git rev-parse HEAD)

docker build -t gcr.io/your-project/pipeline-workers:$COMMIT_SHA \
             -t gcr.io/your-project/pipeline-workers:latest \
             ./workers

docker build -t gcr.io/your-project/pipeline-face-processor:$COMMIT_SHA \
             -t gcr.io/your-project/pipeline-face-processor:latest \
             ./deface-with-selective-face-blurring
```

## 📤 **Push to Google Container Registry**

### **Setup Authentication**
```bash
# Configure Docker for GCR
gcloud auth configure-docker

# Or for specific registry
gcloud auth configure-docker gcr.io
```

### **Push Images**
```bash
# Push Workers image
docker push gcr.io/your-project/pipeline-workers:latest
docker push gcr.io/your-project/pipeline-workers:$COMMIT_SHA

# Push Face Processor image
docker push gcr.io/your-project/pipeline-face-processor:latest
docker push gcr.io/your-project/pipeline-face-processor:$COMMIT_SHA
```

## 🚀 **Production Deployment Commands**

### **Pull Latest Images on VM**
```bash
# On the GCP VM
gcloud auth configure-docker --quiet

docker pull gcr.io/your-project/pipeline-workers:latest
docker pull gcr.io/your-project/pipeline-face-processor:latest
```

### **Start Production Services**
```bash
# Using production docker-compose
docker-compose -f docker-compose.production.yml up -d

# With specific images
docker-compose -f docker-compose.production.yml up -d \
  --force-recreate \
  --remove-orphans
```

### **Stop Services**
```bash
# Graceful stop
docker-compose -f docker-compose.production.yml down

# Force stop and cleanup
docker-compose -f docker-compose.production.yml down \
  --remove-orphans \
  --volumes \
  --rmi local
```

## 🔍 **Monitoring Commands**

### **Check Running Containers**
```bash
# List all containers
docker ps

# Check specific services
docker-compose -f docker-compose.production.yml ps
```

### **View Logs**
```bash
# All services
docker-compose -f docker-compose.production.yml logs -f

# Specific service
docker-compose -f docker-compose.production.yml logs -f workers
docker-compose -f docker-compose.production.yml logs -f face-processor

# Last N lines
docker-compose -f docker-compose.production.yml logs --tail=100 workers
```

### **Health Checks**
```bash
# Manual health checks
curl -f http://localhost:3000/health  # Workers
curl -f http://localhost:5000/health  # Face Processor

# Container health status
docker inspect --format='{{.State.Health.Status}}' pipeline-workers
docker inspect --format='{{.State.Health.Status}}' pipeline-face-processor
```

## 🔧 **Debugging Commands**

### **Access Container Shell**
```bash
# Access running containers
docker exec -it pipeline-workers bash
docker exec -it pipeline-face-processor bash

# Or using docker-compose
docker-compose -f docker-compose.production.yml exec workers bash
docker-compose -f docker-compose.production.yml exec face-processor bash
```

### **Inspect Container Details**
```bash
# Container configuration
docker inspect pipeline-workers
docker inspect pipeline-face-processor

# Container resource usage
docker stats pipeline-workers pipeline-face-processor
```

### **Check Shared Volume**
```bash
# List shared volume contents
docker run --rm -v pipeline_shared_storage:/data alpine ls -la /data

# Volume details
docker volume inspect pipeline_shared_storage
```

## 🧹 **Cleanup Commands**

### **Remove Stopped Containers**
```bash
# Remove all stopped containers
docker container prune -f

# Remove specific containers
docker rm pipeline-workers pipeline-face-processor
```

### **Remove Images**
```bash
# Remove unused images
docker image prune -f

# Remove specific images
docker rmi gcr.io/your-project/pipeline-workers:old-tag
docker rmi gcr.io/your-project/pipeline-face-processor:old-tag

# Remove all project images
docker images | grep "gcr.io/your-project" | awk '{print $3}' | xargs docker rmi
```

### **Full System Cleanup**
```bash
# Remove everything unused
docker system prune -af --volumes

# Remove specific project resources
docker-compose -f docker-compose.production.yml down --rmi all --volumes --remove-orphans
```

## 🔄 **Update/Restart Commands**

### **Rolling Update**
```bash
# Pull latest images
docker pull gcr.io/your-project/pipeline-workers:latest
docker pull gcr.io/your-project/pipeline-face-processor:latest

# Restart with new images
docker-compose -f docker-compose.production.yml up -d --force-recreate
```

### **Restart Individual Services**
```bash
# Restart specific service
docker-compose -f docker-compose.production.yml restart workers
docker-compose -f docker-compose.production.yml restart face-processor

# Or using docker directly
docker restart pipeline-workers
docker restart pipeline-face-processor
```

## 📊 **Resource Monitoring**

### **Monitor Resource Usage**
```bash
# Real-time stats
docker stats

# Specific containers
docker stats pipeline-workers pipeline-face-processor

# System resource usage
free -h        # Memory
df -h          # Disk
nvidia-smi     # GPU (if available)
```

### **Check GPU Usage in Containers**
```bash
# GPU usage in face-processor
docker exec pipeline-face-processor nvidia-smi

# Check CUDA availability
docker exec pipeline-face-processor python3 -c "import torch; print(torch.cuda.is_available())"
```

## 🚨 **Emergency Commands**

### **Emergency Stop**
```bash
# Stop all containers immediately
docker stop $(docker ps -q)

# Kill all containers (force)
docker kill $(docker ps -q)
```

### **Emergency Cleanup**
```bash
# Free up disk space quickly
docker system prune -af --volumes
docker volume prune -f

# Stop and remove everything
docker-compose -f docker-compose.production.yml down --rmi all --volumes --remove-orphans
```

## 📝 **Useful One-liners**

```bash
# Check if services are responding
curl -s http://localhost:3000/health && echo "Workers: OK" || echo "Workers: FAIL"
curl -s http://localhost:5000/health && echo "Face Processor: OK" || echo "Face Processor: FAIL"

# Get container IPs
docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' pipeline-workers
docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' pipeline-face-processor

# Show container memory usage
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# Follow logs from both services
docker-compose -f docker-compose.production.yml logs -f | grep -E "(workers|face-processor)"
```

---

**💡 Tip:** Save these commands in a script on your VM for quick access during debugging and maintenance! 
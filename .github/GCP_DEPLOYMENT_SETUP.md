# GCP Deployment Setup Guide

This guide explains how to set up automated deployment of your video processing pipeline to Google Cloud Platform.

## 🏗️ **Prerequisites**

### 1. GCP Project Setup
```bash
# Create a new GCP project (or use existing)
gcloud projects create your-pipeline-project --name="Video Pipeline"

# Set as default project
gcloud config set project your-pipeline-project

# Enable required APIs
gcloud services enable compute.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

### 2. Create VM Instance with GPU Support
```bash
# Create a VM with GPU for face processing
gcloud compute instances create pipeline-vm \
  --zone=us-central1-a \
  --machine-type=n1-standard-4 \
  --accelerator=type=nvidia-tesla-t4,count=1 \
  --image-family=cos-stable \
  --image-project=cos-cloud \
  --boot-disk-size=50GB \
  --metadata="install-nvidia-driver=True" \
  --maintenance-policy=TERMINATE \
  --restart-on-failure \
  --tags=http-server,https-server

# Install Docker and nvidia-docker on the VM
gcloud compute ssh pipeline-vm --zone=us-central1-a --command="
  # Install Docker
  curl -fsSL https://get.docker.com -o get-docker.sh
  sudo sh get-docker.sh
  sudo usermod -aG docker \$USER
  
  # Install nvidia-container-runtime
  distribution=\$(. /etc/os-release;echo \$ID\$VERSION_ID)
  curl -s -L https://nvidia.github.io/nvidia-container-runtime/gpgkey | sudo apt-key add -
  curl -s -L https://nvidia.github.io/nvidia-container-runtime/\$distribution/nvidia-container-runtime.list | sudo tee /etc/apt/sources.list.d/nvidia-container-runtime.list
  
  sudo apt-get update
  sudo apt-get install -y nvidia-container-runtime
  
  # Install docker-compose
  sudo curl -L \"https://github.com/docker/compose/releases/download/1.29.2/docker-compose-\$(uname -s)-\$(uname -m)\" -o /usr/local/bin/docker-compose
  sudo chmod +x /usr/local/bin/docker-compose
  
  # Install gcloud
  curl https://sdk.cloud.google.com | bash
  exec -l \$SHELL
"
```

### 3. Create Service Account
```bash
# Create service account for GitHub Actions
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions" \
  --description="Service account for GitHub Actions deployments"

# Grant necessary permissions
gcloud projects add-iam-policy-binding your-pipeline-project \
  --member="serviceAccount:github-actions@your-pipeline-project.iam.gserviceaccount.com" \
  --role="roles/compute.instanceAdmin.v1"

gcloud projects add-iam-policy-binding your-pipeline-project \
  --member="serviceAccount:github-actions@your-pipeline-project.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding your-pipeline-project \
  --member="serviceAccount:github-actions@your-pipeline-project.iam.gserviceaccount.com" \
  --role="roles/container.admin"

# Create and download service account key
gcloud iam service-accounts keys create ~/github-actions-key.json \
  --iam-account=github-actions@your-pipeline-project.iam.gserviceaccount.com
```

## 🔐 **GitHub Secrets Configuration**

Add these secrets to your GitHub repository (`Settings > Secrets and variables > Actions`):

### **GCP Configuration**
```
GCP_PROJECT_ID=your-pipeline-project
GCP_SA_KEY=<contents of github-actions-key.json>
GCP_VM_INSTANCE=pipeline-vm
GCP_VM_ZONE=us-central1-a
GCP_VM_SSH_KEY=<your SSH private key for the VM>
```

### **Application Secrets**
```
DATABASE_URL=postgresql://user:password@host:5432/database
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
ENCRYPTION_KEY=your_32_character_encryption_key_here
ENCRYPTION_SALT=your_encryption_salt
NEXTAUTH_URL=http://your-vm-external-ip:3000
```

## 🚀 **Deployment Workflow**

### **Automatic Deployment**
The workflow triggers on:
- Push to `main` or `add-monitoring-server` branches
- Changes to `workers/`, `deface-with-selective-face-blurring/`, or `docker-compose.yml`
- Manual trigger via GitHub Actions UI

### **Workflow Steps**
1. **Build Images**: Creates Docker images for both services
2. **Push to GCR**: Uploads images to Google Container Registry
3. **Deploy to VM**: 
   - Copies deployment files to VM
   - Creates environment configuration
   - Starts services with docker-compose
   - Performs health checks
4. **Setup Monitoring**: Creates monitoring script on VM

## 🖥️ **VM Requirements**

### **Recommended VM Configuration**
```bash
# For production workloads
gcloud compute instances create pipeline-vm \
  --zone=us-central1-a \
  --machine-type=n1-highmem-4 \
  --accelerator=type=nvidia-tesla-t4,count=1 \
  --image-family=cos-stable \
  --image-project=cos-cloud \
  --boot-disk-type=pd-ssd \
  --boot-disk-size=100GB \
  --disk=name=pipeline-data,size=500GB,type=pd-ssd \
  --metadata="install-nvidia-driver=True" \
  --maintenance-policy=TERMINATE \
  --restart-on-failure \
  --tags=http-server,https-server
```

### **Firewall Rules**
```bash
# Allow access to services
gcloud compute firewall-rules create allow-pipeline-ports \
  --allow tcp:3000,tcp:5000 \
  --source-ranges 0.0.0.0/0 \
  --description "Allow access to pipeline services"
```

## 🔧 **Manual Deployment Commands**

### **Deploy Manually**
```bash
# Trigger workflow manually
gh workflow run deploy-to-gcp.yml

# Or push to trigger branch
git push origin main
```

### **Monitor Deployment**
```bash
# SSH into VM and check status
gcloud compute ssh pipeline-vm --zone=us-central1-a --command="~/monitor-pipeline.sh"

# View real-time logs
gcloud compute ssh pipeline-vm --zone=us-central1-a --command="cd ~/pipeline-deployment && docker-compose -f docker-compose.production.yml logs -f"
```

## 🔍 **Troubleshooting**

### **Common Issues**

1. **GPU Not Available**
```bash
# Check GPU support on VM
gcloud compute ssh pipeline-vm --zone=us-central1-a --command="nvidia-smi"

# Restart VM if needed
gcloud compute instances stop pipeline-vm --zone=us-central1-a
gcloud compute instances start pipeline-vm --zone=us-central1-a
```

2. **Docker Permission Issues**
```bash
# Fix Docker permissions
gcloud compute ssh pipeline-vm --zone=us-central1-a --command="
  sudo usermod -aG docker \$USER
  newgrp docker
"
```

3. **Out of Disk Space**
```bash
# Clean up old Docker images
gcloud compute ssh pipeline-vm --zone=us-central1-a --command="
  docker system prune -f
  docker volume prune -f
"
```

### **Health Checks**
```bash
# Check service health
curl http://VM_EXTERNAL_IP:3000/health
curl http://VM_EXTERNAL_IP:5000/health

# Check container status
gcloud compute ssh pipeline-vm --zone=us-central1-a --command="
  cd ~/pipeline-deployment
  docker-compose -f docker-compose.production.yml ps
"
```

## 📊 **Monitoring & Maintenance**

### **Log Monitoring**
```bash
# View aggregated logs
gcloud compute ssh pipeline-vm --zone=us-central1-a --command="
  cd ~/pipeline-deployment
  docker-compose -f docker-compose.production.yml logs --tail=100
"

# Monitor resource usage
gcloud compute ssh pipeline-vm --zone=us-central1-a --command="
  echo 'CPU Usage:' && top -bn1 | grep 'Cpu(s)'
  echo 'Memory Usage:' && free -h
  echo 'Disk Usage:' && df -h
  echo 'GPU Usage:' && nvidia-smi
"
```

### **Automated Backups**
```bash
# Create snapshot of VM disk
gcloud compute disks snapshot pipeline-vm \
  --zone=us-central1-a \
  --snapshot-names=pipeline-backup-$(date +%Y%m%d)
```

## 🔄 **Rolling Updates**

The workflow supports zero-downtime deployments:
1. Pulls new images
2. Stops old containers
3. Starts new containers
4. Performs health checks
5. Rolls back on failure

## 💰 **Cost Optimization**

```bash
# Use preemptible instances for development
gcloud compute instances create pipeline-vm-dev \
  --preemptible \
  --zone=us-central1-a \
  --machine-type=n1-standard-2 \
  --accelerator=type=nvidia-tesla-t4,count=1

# Schedule VM shutdown for non-business hours
gcloud compute instances add-metadata pipeline-vm \
  --metadata=shutdown-script="docker-compose -f ~/pipeline-deployment/docker-compose.production.yml down"
```

---

**🎬 Your pipeline is now ready for automated GCP deployment!**

After setup, every push to main will automatically deploy your updated pipeline to your GCP VM with GPU support. 
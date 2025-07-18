# GCP Deployment Setup Guide
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"


# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

This guide explains how to set up automated deployment of your video processing pipeline to Google Cloud Platform.
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"


# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

## 🏗️ **Prerequisites**
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"


# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

### 1. GCP Project Setup
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

```bash
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

# Create a new GCP project (or use existing)
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

gcloud projects create your-pipeline-project --name="Video Pipeline"
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"


# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

# Set as default project
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

gcloud config set project your-pipeline-project
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"


# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

# Enable required APIs
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

gcloud services enable compute.googleapis.com
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

gcloud services enable containerregistry.googleapis.com
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

gcloud services enable cloudbuild.googleapis.com
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

```
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"


# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

### 2. Create VM Instance with GPU Support
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

```bash
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

# Create a VM with GPU for face processing
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

gcloud compute instances create pipeline-vm \
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  --zone=us-central1-a \
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  --machine-type=n1-standard-4 \
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  --accelerator=type=nvidia-tesla-t4,count=1 \
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  --image-family=cos-stable \
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  --image-project=cos-cloud \
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  --boot-disk-size=50GB \
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  --metadata="install-nvidia-driver=True" \
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  --maintenance-policy=TERMINATE \
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  --restart-on-failure \
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  --tags=http-server,https-server
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"


# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

# Install Docker and nvidia-docker on the VM
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

gcloud compute ssh pipeline-vm --zone=us-central1-a --command="
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  # Install Docker
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  curl -fsSL https://get.docker.com -o get-docker.sh
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  sudo sh get-docker.sh
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  sudo usermod -aG docker \$USER
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  # Install nvidia-container-runtime
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  distribution=\$(. /etc/os-release;echo \$ID\$VERSION_ID)
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  curl -s -L https://nvidia.github.io/nvidia-container-runtime/gpgkey | sudo apt-key add -
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  curl -s -L https://nvidia.github.io/nvidia-container-runtime/\$distribution/nvidia-container-runtime.list | sudo tee /etc/apt/sources.list.d/nvidia-container-runtime.list
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  sudo apt-get update
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  sudo apt-get install -y nvidia-container-runtime
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  # Install docker-compose
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  sudo curl -L \"https://github.com/docker/compose/releases/download/1.29.2/docker-compose-\$(uname -s)-\$(uname -m)\" -o /usr/local/bin/docker-compose
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  sudo chmod +x /usr/local/bin/docker-compose
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  # Install gcloud
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  curl https://sdk.cloud.google.com | bash
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  exec -l \$SHELL
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

"
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

```
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"


# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

### 3. Create Service Account
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

```bash
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

# Create service account for GitHub Actions
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

gcloud iam service-accounts create github-actions \
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  --display-name="GitHub Actions" \
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  --description="Service account for GitHub Actions deployments"
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"


# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

# Grant necessary permissions
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

gcloud projects add-iam-policy-binding your-pipeline-project \
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  --member="serviceAccount:${GITHUB_ACTIONS_SERVICE_ACCOUNT}" \
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  --role="roles/compute.instanceAdmin.v1"
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"


# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

gcloud projects add-iam-policy-binding your-pipeline-project \
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  --member="serviceAccount:${GITHUB_ACTIONS_SERVICE_ACCOUNT}" \
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  --role="roles/storage.admin"
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"


# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

gcloud projects add-iam-policy-binding your-pipeline-project \
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  --member="serviceAccount:${GITHUB_ACTIONS_SERVICE_ACCOUNT}" \
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  --role="roles/container.admin"
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"


# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

# Create and download service account key
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

gcloud iam service-accounts keys create ~/github-actions-key.json \
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  --iam-account=${GITHUB_ACTIONS_SERVICE_ACCOUNT}
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

```
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"


# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

## 🔐 **GitHub Secrets Configuration**
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"


# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

Add these secrets to your GitHub repository (`Settings > Secrets and variables > Actions`):
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"


# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

### **GCP Configuration**
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

```
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

GCP_PROJECT_ID=your-pipeline-project
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

GCP_SA_KEY=<contents of github-actions-key.json>
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

GCP_VM_INSTANCE=pipeline-vm
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

GCP_VM_ZONE=us-central1-a
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

GCP_VM_SSH_KEY=<your SSH private key for the VM>
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

```
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"


# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

### **Application Secrets**
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

```
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

DATABASE_URL=postgresql://user:password@host:5432/database
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

GOOGLE_CLIENT_SECRET=your_google_client_secret
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

ENCRYPTION_KEY=your_32_character_encryption_key_here
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

ENCRYPTION_SALT=your_encryption_salt
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

NEXTAUTH_URL=http://your-vm-external-ip:3000
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

```
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"


# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

## 🚀 **Deployment Workflow**
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"


# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

### **Automatic Deployment**
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

The workflow triggers on:
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

- Push to `main` or `add-monitoring-server` branches
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

- Changes to `workers/`, `deface-with-selective-face-blurring/`, or `docker-compose.yml`
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

- Manual trigger via GitHub Actions UI
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"


# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

### **Workflow Steps**
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

1. **Build Images**: Creates Docker images for both services
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

2. **Push to GCR**: Uploads images to Google Container Registry
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

3. **Deploy to VM**: 
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

   - Copies deployment files to VM
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

   - Creates environment configuration
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

   - Starts services with docker-compose
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

   - Performs health checks
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

4. **Setup Monitoring**: Creates monitoring script on VM
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"


# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

## 🖥️ **VM Requirements**
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"


# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

### **Recommended VM Configuration**
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

```bash
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

# For production workloads
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

gcloud compute instances create pipeline-vm \
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  --zone=us-central1-a \
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  --machine-type=n1-highmem-4 \
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  --accelerator=type=nvidia-tesla-t4,count=1 \
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  --image-family=cos-stable \
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  --image-project=cos-cloud \
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  --boot-disk-type=pd-ssd \
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  --boot-disk-size=100GB \
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  --disk=name=pipeline-data,size=500GB,type=pd-ssd \
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  --metadata="install-nvidia-driver=True" \
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  --maintenance-policy=TERMINATE \
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  --restart-on-failure \
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  --tags=http-server,https-server
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

```
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"


# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

### **Firewall Rules**
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

```bash
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

# Allow access to services
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

gcloud compute firewall-rules create allow-pipeline-ports \
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  --allow tcp:3000,tcp:5000 \
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  --source-ranges 0.0.0.0/0 \
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  --description "Allow access to pipeline services"
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

```
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"


# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

## 🔧 **Manual Deployment Commands**
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"


# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

### **Deploy Manually**
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

```bash
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

# Trigger workflow manually
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

gh workflow run deploy-to-gcp.yml
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"


# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

# Or push to trigger branch
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

git push origin main
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

```
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"


# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

### **Monitor Deployment**
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

```bash
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

# SSH into VM and check status
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

gcloud compute ssh pipeline-vm --zone=us-central1-a --command="~/monitor-pipeline.sh"
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"


# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

# View real-time logs
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

gcloud compute ssh pipeline-vm --zone=us-central1-a --command="cd ~/pipeline-deployment && docker-compose -f docker-compose.production.yml logs -f"
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

```
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"


# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

## 🔍 **Troubleshooting**
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"


# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

### **Common Issues**
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"


# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

1. **GPU Not Available**
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

```bash
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

# Check GPU support on VM
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

gcloud compute ssh pipeline-vm --zone=us-central1-a --command="nvidia-smi"
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"


# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

# Restart VM if needed
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

gcloud compute instances stop pipeline-vm --zone=us-central1-a
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

gcloud compute instances start pipeline-vm --zone=us-central1-a
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

```
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"


# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

2. **Docker Permission Issues**
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

```bash
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

# Fix Docker permissions
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

gcloud compute ssh pipeline-vm --zone=us-central1-a --command="
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  sudo usermod -aG docker \$USER
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  newgrp docker
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

"
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

```
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"


# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

3. **Out of Disk Space**
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

```bash
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

# Clean up old Docker images
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

gcloud compute ssh pipeline-vm --zone=us-central1-a --command="
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  docker system prune -f
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  docker volume prune -f
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

"
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

```
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"


# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

### **Health Checks**
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

```bash
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

# Check service health
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

curl http://VM_EXTERNAL_IP:3000/health
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

curl http://VM_EXTERNAL_IP:5000/health
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"


# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

# Check container status
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

gcloud compute ssh pipeline-vm --zone=us-central1-a --command="
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  cd ~/pipeline-deployment
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  docker-compose -f docker-compose.production.yml ps
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

"
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

```
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"


# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

## 📊 **Monitoring & Maintenance**
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"


# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

### **Log Monitoring**
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

```bash
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

# View aggregated logs
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

gcloud compute ssh pipeline-vm --zone=us-central1-a --command="
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  cd ~/pipeline-deployment
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  docker-compose -f docker-compose.production.yml logs --tail=100
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

"
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"


# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

# Monitor resource usage
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

gcloud compute ssh pipeline-vm --zone=us-central1-a --command="
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  echo 'CPU Usage:' && top -bn1 | grep 'Cpu(s)'
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  echo 'Memory Usage:' && free -h
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  echo 'Disk Usage:' && df -h
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  echo 'GPU Usage:' && nvidia-smi
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

"
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

```
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"


# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

### **Automated Backups**
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

```bash
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

# Create snapshot of VM disk
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

gcloud compute disks snapshot pipeline-vm \
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  --zone=us-central1-a \
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  --snapshot-names=pipeline-backup-$(date +%Y%m%d)
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

```
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"


# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

## 🔄 **Rolling Updates**
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"


# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

The workflow supports zero-downtime deployments:
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

1. Pulls new images
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

2. Stops old containers
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

3. Starts new containers
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

4. Performs health checks
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

5. Rolls back on failure
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"


# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

## 💰 **Cost Optimization**
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"


# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

```bash
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

# Use preemptible instances for development
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

gcloud compute instances create pipeline-vm-dev \
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  --preemptible \
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  --zone=us-central1-a \
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  --machine-type=n1-standard-2 \
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  --accelerator=type=nvidia-tesla-t4,count=1
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"


# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

# Schedule VM shutdown for non-business hours
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

gcloud compute instances add-metadata pipeline-vm \
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

  --metadata=shutdown-script="docker-compose -f ~/pipeline-deployment/docker-compose.production.yml down"
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

```
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"


# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

---
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"


# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

**🎬 Your pipeline is now ready for automated GCP deployment!**
# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"


# Resolve the created service account from the selected project.
GITHUB_ACTIONS_SERVICE_ACCOUNT="$(gcloud iam service-accounts list --project your-pipeline-project --filter='displayName:GitHub Actions' --format='value(email)')"
: "${GITHUB_ACTIONS_SERVICE_ACCOUNT:?Select the GitHub Actions service account}"

After setup, every push to main will automatically deploy your updated pipeline to your GCP VM with GPU support. 
# Video Processing Pipeline with Selective Face Blurring
# This Dockerfile is for reference only - use docker-compose.yml to run the complete pipeline

# Build and run instructions:
# 1. Ensure you have Docker with GPU support (nvidia-docker)
# 2. Create a .env file in the workers/ directory with required environment variables
# 3. Run: docker-compose up --build

# Required environment variables in workers/.env:
# DATABASE_URL=postgresql://...
# GOOGLE_CLIENT_ID=...
# GOOGLE_CLIENT_SECRET=...
# ENCRYPTION_KEY=...
# ENCRYPTION_SALT=...
# NEXTAUTH_URL=...
# FACE_PROCESSOR_URL=http://face-processor:5000

# The pipeline consists of:
# - Node.js Workers: Job orchestration, image scraping, YouTube upload
# - Python Face Processor: AI-powered selective face blurring
# - Shared Volume: Temporary storage for videos and processing

FROM node:18-slim
WORKDIR /app
COPY . .
RUN echo "Please use 'docker-compose up --build' to run the complete pipeline"
CMD ["echo", "Use docker-compose.yml to run the complete pipeline"]

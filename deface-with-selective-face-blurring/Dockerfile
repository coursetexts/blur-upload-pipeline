FROM nvidia/cuda:12.9.1-runtime-ubuntu22.04 AS builder

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV DEBIAN_FRONTEND=noninteractive
ENV CUDA_VISIBLE_DEVICES=0
ENV PIP_TIMEOUT=2000
ENV PIP_RETRIES=5
ENV PIP_NO_CACHE_DIR=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-dev \
    ffmpeg \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    libgcc-s1 \
    curl \
    wget \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Upgrade pip
RUN pip3 install --upgrade pip setuptools wheel

# Copy requirements
WORKDIR /app
COPY requirements.txt .

# Install Python packages in stages to manage space
RUN pip3 install --no-cache-dir \
    deface imageio-ffmpeg imageio scikit-image tqdm

RUN pip3 install --no-cache-dir \
    opencv-contrib-python==4.10.0.84

RUN pip3 install --no-cache-dir \
    torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

RUN pip3 install --no-cache-dir \
    deepface onnx onnxruntime-gpu

RUN pip3 install --no-cache-dir \
    tensorflow ultralytics gdown cython torchreid

# Clean up pip cache and temporary files
RUN pip3 cache purge && \
    rm -rf /tmp/* /var/tmp/* && \
    find /usr/local/lib/python3.*/dist-packages -name "*.pyc" -delete && \
    find /usr/local/lib/python3.*/dist-packages -name "__pycache__" -type d -exec rm -rf {} + || true

# Production stage
FROM nvidia/cuda:12.9.1-runtime-ubuntu22.04

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV DEBIAN_FRONTEND=noninteractive
ENV CUDA_VISIBLE_DEVICES=0

# Install minimal runtime dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Copy Python packages from builder
COPY --from=builder /usr/local/lib/python3.10/dist-packages /usr/local/lib/python3.10/dist-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Create app directory
WORKDIR /app

# Install only API service packages
RUN pip3 install --no-cache-dir flask flask-cors requests pillow

# Copy application code
COPY deface/ ./deface/
COPY api_service.py .

# Create shared directory
RUN mkdir -p /app/shared

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Start the Flask API service
CMD ["python3", "api_service.py"] 
FROM node:18-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libatspi2.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libwayland-client0 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    libxss1 \
    libxtst6 \
    lsb-release \
    xdg-utils \
    libu2f-udev \
    libvulkan1 \
    procps \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Set environment variables
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false

# Create shared directory
RUN mkdir -p /app/shared

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Simple startup script using ts-node
RUN echo '#!/bin/bash\n\
echo "🔧 Generating Prisma client..."\n\
npx prisma generate --schema ./prisma/schema.prisma || echo "Prisma generation failed"\n\
echo "🚀 Starting application with ts-node..."\n\
exec npx ts-node --transpile-only main.ts' > /app/start.sh && chmod +x /app/start.sh

# Start the application
CMD ["/app/start.sh"]

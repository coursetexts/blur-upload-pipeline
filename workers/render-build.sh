# !/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies
yarn install
# Uncomment this line if you need to build your project
yarn prisma:generate && yarn build

# Install Puppeteer and Chrome at the global level
echo "Installing Puppeteer and Chrome globally..."
npm install -g puppeteer

# Verify Chrome installation
echo "Verifying Chrome installation..."
npx puppeteer browsers install chrome
npx puppeteer browsers list

# Create a symlink to the installed Chrome in a location your app expects
echo "Setting up Chrome symlinks for the application..."
mkdir -p /opt/render/project/src/.cache/puppeteer/chrome/linux-stable/
CHROME_PATH=$(find /opt -name "chrome" -type f -executable 2>/dev/null | grep -v "node_modules" | head -1)
if [ -n "$CHROME_PATH" ]; then
    echo "Found Chrome at: $CHROME_PATH"
    # Create parent directory structure
    mkdir -p $(dirname "$CHROME_PATH")
    # Create symlink to app directory
    ln -sf "$CHROME_PATH" /opt/render/project/src/.cache/puppeteer/chrome/linux-stable/chrome
    echo "Created symlink to Chrome in app directory"
fi

# Print environment info for debugging
echo "Environment information:"
echo "NODE_PATH=$NODE_PATH"
echo "PATH=$PATH"
echo "PWD=$(pwd)"
echo "Chrome executable locations:"
find /opt -name "chrome" -type f -executable 2>/dev/null

# The rest of your build script...
# Ensure the build cache directory exists before copying
BUILD_CACHE_DIR=/opt/render/project/src/.cache/puppeteer/chrome/
mkdir -p $BUILD_CACHE_DIR

# Store/pull Puppeteer cache with build cache
PUPPETEER_CACHE_DIR=/opt/render/.cache/puppeteer
if [[ -d $PUPPETEER_CACHE_DIR ]]; then
    echo "...Storing Puppeteer Cache in Build Cache"
    cp -R $PUPPETEER_CACHE_DIR $BUILD_CACHE_DIR
    echo "Contents of build cache directory:"
    ls -la $BUILD_CACHE_DIR
else
    echo "Puppeteer cache not found, skipping copy."
fi
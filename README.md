# Video Processing Pipeline with Selective Face Blurring

A complete automation pipeline that processes educational videos by applying selective face blurring - preserving the professor's face while anonymizing all other faces, then uploading to YouTube.

## 🎯 **Pipeline Overview**

The pipeline transforms your current streaming workflow into a comprehensive processing system:

**Previous Workflow:** `Video URL → Stream → YouTube Upload`

**New Workflow:** `Video URL → Download → Professor Images → Face Processing → Processed Video → YouTube Upload`

## 🏗️ **Architecture**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Node.js       │    │    Python        │    │    Shared       │
│   Workers       │◄──►│ Face Processor   │◄──►│    Volume       │
│                 │    │                  │    │                 │
│ • Job Mgmt      │    │ • AI Models      │    │ • Videos        │
│ • Image Scraper │    │ • Face Detection │    │ • Images        │
│ • Video DL      │    │ • Selective Blur │    │ • Temp Files    │
│ • YouTube API   │    │ • Video Output   │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🚀 **Quick Start**

1. **Prerequisites**
   ```bash
   # Install Docker with GPU support
   # On Ubuntu/Debian:
   sudo apt update
   sudo apt install docker.io docker-compose
   
   # For GPU support (recommended):
   sudo apt install nvidia-docker2
   ```

2. **Clone and Setup**
   ```bash
   git clone <your-repo>
   cd Pipeline
   chmod +x start-pipeline.sh
   ```

3. **Configure Environment**
   ```bash
   # The script will create a template .env file
   ./start-pipeline.sh
   
   # Edit workers/.env with your actual values:
   nano workers/.env
   ```

4. **Start Pipeline**
   ```bash
   # Start all services
   ./start-pipeline.sh
   
   # Or manually:
   docker-compose up --build
   ```

## 📋 **Environment Configuration**

Create `workers/.env` with these required variables:

```env
# Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@host:5432/database

# Google APIs (YouTube Data API v3)
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Security
ENCRYPTION_KEY=your_32_character_encryption_key_here
ENCRYPTION_SALT=your_encryption_salt

# App Configuration
NEXTAUTH_URL=http://localhost:3000
FACE_PROCESSOR_URL=http://face-processor:5000

# Processing Intervals (optional - 12 hours default)
JOB_PROCESSING_INTERVAL=43200000
TOKEN_CLEANUP_INTERVAL=43200000
```

## 🔄 **Processing Pipeline**

### Step 1: Job Creation
Add jobs to your database with:
```sql
INSERT INTO "Job" (id, "videoUrl", "fileName", instructor, "courseId", status)
VALUES (1, 'https://panopto.example.com/video.mp4', 'Lecture_01.mp4', 'Dr. Jane Smith', 'CS101', 'PENDING');
```

### Step 2: Automated Processing
The pipeline automatically:

1. **🔍 Image Scraping**
   - Searches Google Images for professor photos
   - Downloads 10-15 high-quality images
   - Filters for academic/professional photos

2. **📥 Video Download**
   - Downloads from Panopto, Zoom, or direct URLs
   - Handles authentication and cookies
   - Saves to temporary storage

3. **🎭 Face Processing**
   - Detects all faces using CenterFace
   - Identifies people using YOLO11
   - Matches professor using TorchReID
   - Blurs non-professor faces

4. **📤 YouTube Upload**
   - Uploads processed video
   - Adds metadata and descriptions
   - Updates database with video URL

5. **🧹 Cleanup**
   - Removes temporary files
   - Optimizes memory usage

## 🔧 **API Endpoints**

### Workers Service (Port 3000)
```bash
GET  /health                    # Health check
```

### Face Processor Service (Port 5000)
```bash
GET  /health                    # Health check
POST /process-video             # Process video with face blurring
GET  /list-shared-files         # Debug: List shared files
```

## 🐳 **Docker Services**

### Workers Container
- **Base**: `node:18-slim`
- **Purpose**: Job orchestration, scraping, YouTube API
- **Volume**: `/app/shared` (temporary storage)
- **Ports**: `3000:3000`

### Face Processor Container
- **Base**: `nvidia/cuda:11.8-devel-ubuntu22.04`
- **Purpose**: AI-powered face processing
- **Volume**: `/app/shared` (shared with workers)
- **Ports**: `5000:5000`
- **GPU**: CUDA support for faster processing

## 📊 **Monitoring & Logs**

```bash
# View all logs
docker-compose logs -f

# View specific service
docker-compose logs -f workers
docker-compose logs -f face-processor

# Check service status
docker-compose ps

# Restart services
docker-compose restart
```

## 🔧 **Configuration Options**

### Face Processing Parameters
Adjust in `face-processing-client.ts`:
```typescript
{
  thresh: 0.4,                    // Face detection threshold
  reid_threshold: 0.7,            // Professor matching threshold
  max_frames_without_faces: 30,   // Tracking persistence
  debugging: false,               // Enable debug output
  keep_audio: true               // Preserve original audio
}
```

### Image Scraping Parameters
Adjust in `professor-image-scraper.ts`:
```typescript
maxImages: 15,                    // Images to download
searchQuery: `${name} professor`  // Search terms
```

## 🛠️ **Troubleshooting**

### Common Issues

1. **GPU Not Detected**
   ```bash
   # Check GPU support
   docker run --rm --gpus all nvidia/cuda:11.0-base nvidia-smi
   
   # Install nvidia-docker if needed
   sudo apt install nvidia-docker2
   sudo systemctl restart docker
   ```

2. **Face Processing Fails**
   ```bash
   # Check Python service logs
   docker-compose logs face-processor
   
   # Verify shared volume
   docker-compose exec workers ls -la /app/shared
   ```

3. **Image Scraping Issues**
   ```bash
   # Check if Puppeteer/Chrome is working
   docker-compose exec workers curl -I https://google.com
   ```

4. **Memory Issues**
   ```bash
   # Monitor memory usage
   docker stats
   
   # Adjust Docker memory limits if needed
   ```

### Debug Mode
Enable debugging by setting `debugging: true` in processing options.

## 📈 **Performance Optimization**

### GPU Processing
- **Requirements**: NVIDIA GPU with CUDA 11.8+
- **Performance**: ~10x faster than CPU processing
- **Memory**: Minimum 8GB GPU memory recommended

### CPU Processing
- **Fallback**: Automatic CPU fallback if GPU unavailable
- **Performance**: Slower but functional
- **Memory**: Minimum 16GB RAM recommended

### Storage Requirements
- **Temporary**: ~5-10GB per video during processing
- **Cleanup**: Automatic cleanup after processing
- **Shared Volume**: Automatically managed

## 🔒 **Security Considerations**

1. **API Keys**: Store securely in `.env` file
2. **Database**: Use strong passwords and SSL connections
3. **Images**: Professor images are temporary and cleaned up
4. **Videos**: Temporary downloads are automatically removed

## 📚 **Development**

### Local Development
```bash
# Start individual services for debugging
docker-compose up workers
docker-compose up face-processor

# Access containers
docker-compose exec workers bash
docker-compose exec face-processor bash
```

### Testing
```bash
# Run Node.js tests
cd workers && npm test

# Test face processing
curl -X POST http://localhost:5000/process-video \
  -H "Content-Type: application/json" \
  -d '{"job_id": "test", ...}'
```

## 🤝 **Contributing**

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

---

**🎬 Ready to process videos with selective face blurring!**

For support or questions, please open an issue or contact the development team. 
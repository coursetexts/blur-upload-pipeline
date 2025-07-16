import axios, { AxiosResponse } from 'axios';
import fs from 'fs';
import path from 'path';

interface FaceProcessingOptions {
  thresh?: number;
  reid_threshold?: number;
  max_frames_without_faces?: number;
  debugging?: boolean;
  keep_audio?: boolean;
}

interface FaceProcessingRequest {
  job_id: string;
  video_path: string;
  target_person_images_dir: string;
  output_path: string;
  options?: FaceProcessingOptions;
}

interface FaceProcessingResponse {
  success: boolean;
  job_id: string;
  output_path?: string;
  processing_stats?: any;
  error?: string;
}

interface SharedFileInfo {
  path: string;
  size: number;
  size_mb: number;
}

interface SharedFilesResponse {
  files: SharedFileInfo[];
  total_files: number;
  message?: string;
}

/**
 * Client for communicating with the Python face processing service
 */
export class FaceProcessingClient {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string = 'http://face-processor:5000', timeout: number = 300000) {
    this.baseUrl = baseUrl;
    this.timeout = timeout; // 5 minutes default timeout for video processing
  }

  /**
   * Check if the face processing service is healthy
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/health`, {
        timeout: 5000
      });
      
      return response.status === 200 && response.data.status === 'healthy';
    } catch (error) {
      console.error('Face processing service health check failed:', error.message);
      return false;
    }
  }

  /**
   * Process a video with selective face blurring
   */
  async processVideo(request: FaceProcessingRequest): Promise<FaceProcessingResponse> {
    try {
      console.log(`Submitting video processing request for job: ${request.job_id}`);
      console.log(`Video: ${request.video_path}`);
      console.log(`Target images: ${request.target_person_images_dir}`);
      console.log(`Output: ${request.output_path}`);

      // Validate that input files exist
      if (!fs.existsSync(request.video_path)) {
        throw new Error(`Video file not found: ${request.video_path}`);
      }

      if (!fs.existsSync(request.target_person_images_dir)) {
        throw new Error(`Target person directory not found: ${request.target_person_images_dir}`);
      }

      // Check if target person directory has images
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.bmp'];
      const targetImages = fs.readdirSync(request.target_person_images_dir)
        .filter(f => imageExtensions.some(ext => f.toLowerCase().endsWith(ext)));

      if (targetImages.length === 0) {
        throw new Error(`No images found in target person directory: ${request.target_person_images_dir}`);
      }

      console.log(`Found ${targetImages.length} target person images`);

      // Make the request to the Python service
      const response: AxiosResponse<FaceProcessingResponse> = await axios.post(
        `${this.baseUrl}/process-video`,
        request,
        {
          timeout: this.timeout,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status !== 200) {
        throw new Error(`Face processing service returned status ${response.status}`);
      }

      const result = response.data;

      if (!result.success) {
        throw new Error(result.error || 'Face processing failed');
      }

      console.log(`Video processing completed successfully for job: ${request.job_id}`);
      console.log(`Output video: ${result.output_path}`);

      // Verify output file exists
      if (result.output_path && !fs.existsSync(result.output_path)) {
        throw new Error(`Output video file not found: ${result.output_path}`);
      }

      return result;

    } catch (error) {
      console.error(`Error processing video for job ${request.job_id}:`, error.message);
      
      return {
        success: false,
        job_id: request.job_id,
        error: error.message
      };
    }
  }

  /**
   * List files in the shared directory (for debugging)
   */
  async listSharedFiles(): Promise<SharedFilesResponse | null> {
    try {
      const response: AxiosResponse<SharedFilesResponse> = await axios.get(
        `${this.baseUrl}/list-shared-files`,
        { timeout: 10000 }
      );

      return response.data;
    } catch (error) {
      console.error('Error listing shared files:', error.message);
      return null;
    }
  }

  /**
   * Wait for the face processing service to become available
   */
  async waitForService(maxWaitTime: number = 60000, checkInterval: number = 5000): Promise<boolean> {
    const startTime = Date.now();
    
    console.log('Waiting for face processing service to become available...');
    
    while (Date.now() - startTime < maxWaitTime) {
      if (await this.healthCheck()) {
        console.log('Face processing service is ready');
        return true;
      }
      
      console.log(`Face processing service not ready, retrying in ${checkInterval/1000}s...`);
      await new Promise(resolve => setTimeout(resolve, checkInterval));
    }
    
    console.error('Face processing service did not become available within timeout');
    return false;
  }

  /**
   * Create default processing options
   */
  static createDefaultOptions(debugging: boolean = false): FaceProcessingOptions {
    return {
      thresh: 0.4,
      reid_threshold: 0.7,
      max_frames_without_faces: 30,
      debugging: debugging,
      keep_audio: true
    };
  }

  /**
   * Generate paths for the shared volume
   */
  static generateSharedPaths(jobId: string, fileName: string, sharedDir: string = '/app/shared') {
    const jobDir = path.join(sharedDir, `job_${jobId}`);
    const videoPath = path.join(jobDir, `input_${fileName}`);
    const targetPersonDir = path.join(jobDir, 'target_person');
    const outputPath = path.join(jobDir, `output_${fileName}`);

    return {
      jobDir,
      videoPath,
      targetPersonDir,
      outputPath
    };
  }
}

export type { FaceProcessingOptions, FaceProcessingRequest, FaceProcessingResponse }; 
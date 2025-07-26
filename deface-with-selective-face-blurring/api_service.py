#!/usr/bin/env python3

import os
import json
import tempfile
import shutil
from typing import Dict, Any
from flask import Flask, request, jsonify
from flask_cors import CORS
import logging

# Import the deface main processing function
import sys
sys.path.append('/app/deface')
from main import process_video_with_selective_blurring

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Shared storage path
SHARED_PATH = "/app/shared"

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "face-processor"}), 200

@app.route('/process-video', methods=['POST'])
def process_video():
    """
    Process a video with selective face blurring
    
    Expected payload:
    {
        "job_id": "unique_job_identifier",
        "video_path": "path/to/input/video.mp4",
        "target_person_images_dir": "path/to/target/person/images",
        "output_path": "path/to/output/video.mp4",
        "options": {
            "thresh": 0.4,
            "reid_threshold": 0.7,
            "max_frames_without_faces": 30,
            "debugging": false,
            "keep_audio": true
        }
    }
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['job_id', 'video_path', 'target_person_images_dir', 'output_path']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        job_id = data['job_id']
        video_path = data['video_path']
        target_person_dir = data['target_person_images_dir']
        output_path = data['output_path']
        options = data.get('options', {})
        
        logger.info(f"Starting video processing for job {job_id}")
        logger.info(f"Input video: {video_path}")
        logger.info(f"Target person images: {target_person_dir}")
        logger.info(f"Output path: {output_path}")
        
        # Validate input files exist
        if not os.path.exists(video_path):
            return jsonify({"error": f"Video file not found: {video_path}"}), 404
        
        if not os.path.isfile(video_path):
            return jsonify({"error": f"Video path is not a file: {video_path}"}), 404
        
        if not os.path.exists(target_person_dir):
            return jsonify({"error": f"Target person directory not found: {target_person_dir}"}), 404
        
        # Check if target person directory has images
        image_extensions = ['.jpg', '.jpeg', '.png', '.bmp']
        target_images = [
            f for f in os.listdir(target_person_dir) 
            if any(f.lower().endswith(ext) for ext in image_extensions)
        ]
        
        if not target_images:
            return jsonify({"error": "No images found in target person directory"}), 400
        
        logger.info(f"Found {len(target_images)} target person images")
        
        # Sanitize both input and output paths to avoid FFMPEG issues with spaces and special characters
        import re
        
        # Sanitize input video path
        input_dir = os.path.dirname(video_path)
        input_filename = os.path.basename(video_path)
        sanitized_input_filename = re.sub(r'[^\w\-_\.]', '_', input_filename)
        sanitized_input_path = os.path.join(input_dir, sanitized_input_filename)
        
        # Create symbolic link for input if needed
        input_symlink_created = False
        if sanitized_input_path != video_path:
            if not os.path.exists(sanitized_input_path):
                os.symlink(video_path, sanitized_input_path)
                input_symlink_created = True
                logger.info(f"Created input symlink: {sanitized_input_path}")
        else:
            sanitized_input_path = video_path
        
        # Sanitize output path
        output_dir = os.path.dirname(output_path)
        output_filename = os.path.basename(output_path)
        sanitized_output_filename = re.sub(r'[^\w\-_\.]', '_', output_filename)
        sanitized_output_path = os.path.join(output_dir, sanitized_output_filename)
        
        logger.info(f"Original input path: {video_path}")
        logger.info(f"Sanitized input path: {sanitized_input_path}")
        logger.info(f"Original output path: {output_path}")
        logger.info(f"Sanitized output path: {sanitized_output_path}")
        
        # Additional debug info
        logger.info(f"Input file exists: {os.path.exists(video_path)}")
        logger.info(f"Sanitized input file exists: {os.path.exists(sanitized_input_path)}")
        if os.path.exists(video_path):
            logger.info(f"Input file size: {os.path.getsize(video_path)} bytes")
        
        # Create output directory if it doesn't exist
        os.makedirs(output_dir, exist_ok=True)
        
        # Process the video using the deface library
        try:
            result = process_video_with_selective_blurring(
                video_path=sanitized_input_path,
                target_person_dir=target_person_dir,
                output_path=sanitized_output_path,
                thresh=options.get('thresh', 0.4),
                reid_threshold=options.get('reid_threshold', 0.7),
                max_frames_without_faces=options.get('max_frames_without_faces', 30),
                debugging=options.get('debugging', False),
                keep_audio=options.get('keep_audio', True)
            )
            
            logger.info(f"Video processing completed for job {job_id}")
            
            # Clean up input symlink if we created one
            if input_symlink_created and os.path.exists(sanitized_input_path):
                try:
                    os.unlink(sanitized_input_path)
                    logger.info("Cleaned up input symlink")
                except Exception as e:
                    logger.warning(f"Could not clean up input symlink: {e}")
            
            return jsonify({
                "success": True,
                "job_id": job_id,
                "output_path": sanitized_output_path,
                "processing_stats": result
            }), 200
            
        except Exception as processing_error:
            logger.error(f"Error during video processing for job {job_id}: {str(processing_error)}")
            
            # Clean up input symlink if we created one (even on error)
            if input_symlink_created and os.path.exists(sanitized_input_path):
                try:
                    os.unlink(sanitized_input_path)
                    logger.info("Cleaned up input symlink after error")
                except Exception as e:
                    logger.warning(f"Could not clean up input symlink after error: {e}")
            
            return jsonify({
                "error": f"Video processing failed: {str(processing_error)}"
            }), 500
    
    except Exception as e:
        logger.error(f"Unexpected error in process_video: {str(e)}")
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500

@app.route('/list-shared-files', methods=['GET'])
def list_shared_files():
    """List files in the shared directory for debugging"""
    try:
        if not os.path.exists(SHARED_PATH):
            return jsonify({"files": [], "message": "Shared directory not found"}), 200
        
        files = []
        for root, dirs, filenames in os.walk(SHARED_PATH):
            for filename in filenames:
                filepath = os.path.join(root, filename)
                relative_path = os.path.relpath(filepath, SHARED_PATH)
                file_size = os.path.getsize(filepath)
                files.append({
                    "path": relative_path,
                    "size": file_size,
                    "size_mb": round(file_size / (1024 * 1024), 2)
                })
        
        return jsonify({"files": files, "total_files": len(files)}), 200
    
    except Exception as e:
        logger.error(f"Error listing shared files: {str(e)}")
        return jsonify({"error": f"Error listing files: {str(e)}"}), 500

if __name__ == '__main__':
    # Ensure shared directory exists
    os.makedirs(SHARED_PATH, exist_ok=True)
    
    logger.info("Starting Face Processing API Service")
    logger.info(f"Shared storage path: {SHARED_PATH}")
    
    # Run the Flask app
    app.run(host='0.0.0.0', port=5000, debug=False, threaded=True) 
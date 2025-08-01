#!/usr/bin/env python3

# Standard library imports
import argparse
import json
import mimetypes
import os
from typing import Dict, Tuple, List, Optional
import glob

# Third-party imports
import numpy as np
import cv2
import torch
import tqdm
import imageio
import imageio.v2 as iio
from ultralytics import YOLO
from PIL import Image
import skimage.draw

import torchreid

# Local imports
from deface import __version__
from deface.centerface import CenterFace
from tracking import init_face_tracker, update_face_tracker, recover_tracking
from recognition import (
    resize_for_reid, 
    get_person_embeddings,
    get_person_embeddings_from_image,  # Add this new import
    compare_embeddings, 
    find_person_in_frame
)

# Global variables
DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

def process_video_with_selective_blurring(
    video_path: str,
    target_person_dir: str,
    output_path: str,
    thresh: float = 0.4,
    reid_threshold: float = 0.7,
    max_frames_without_faces: int = 30,
    debugging: bool = False,
    keep_audio: bool = True,
    replacewith: str = 'blur',
    mask_scale: float = 1.3,
    backend: str = 'auto',
    in_shape: Optional[Tuple[int, int]] = None,
    execution_provider: Optional[str] = None,
    mosaicsize: int = 20,
    disable_tracker_reset: bool = False,
    debug_start: Optional[float] = None,
    debug_duration: Optional[float] = None
):
    """
    Process a single video with selective face blurring
    
    Args:
        video_path: Path to the input video file
        target_person_dir: Directory containing target person images
        output_path: Path for the output video
        thresh: Face detection threshold
        reid_threshold: Person re-identification threshold
        max_frames_without_faces: Max frames to track without face detection
        debugging: Enable debug mode
        keep_audio: Keep audio in output video
        replacewith: Anonymization method ('blur', 'solid', 'mosaic', etc.)
        mask_scale: Scale factor for face masks
        backend: ONNX backend ('auto', 'onnxrt', 'opencv')
        in_shape: Input shape for face detection
        execution_provider: ONNX execution provider
        mosaicsize: Mosaic size for mosaic anonymization
        disable_tracker_reset: Disable automatic tracker reset
        debug_start: Start time for debug processing
        debug_duration: Duration for debug processing
    
    Returns:
        Dictionary with processing statistics
    """
    
    # Validate inputs
    if not os.path.exists(video_path):
        raise FileNotFoundError(f"Video file not found: {video_path}")
    
    if not os.path.exists(target_person_dir):
        raise FileNotFoundError(f"Target person directory not found: {target_person_dir}")
    
    # Initialize variables
    enable_preview = False  # Disable preview in API mode
    draw_scores = False
    ellipse = True  # Use ellipse masks by default
    ffmpeg_config = {"codec": "libx264"}
    keep_metadata = False
    replaceimg = None
    
    print(f"Processing video: {video_path}")
    print(f"Target person directory: {target_person_dir}")
    print(f"Output path: {output_path}")
    
    # Initialize models with GPU debugging
    print("Initializing models...")
    print(f"DEBUG: CUDA available: {torch.cuda.is_available()}")
    if torch.cuda.is_available():
        print(f"DEBUG: CUDA device count: {torch.cuda.device_count()}")
        print(f"DEBUG: Current CUDA device: {torch.cuda.current_device()}")
        print(f"DEBUG: CUDA device name: {torch.cuda.get_device_name()}")
    
    # Initialize YOLO with explicit GPU device
    person_detector = YOLO('yolo11x.pt')
    if torch.cuda.is_available():
        print("DEBUG: Moving YOLO to GPU...")
        person_detector.to('cuda')
        print(f"DEBUG: YOLO device: {person_detector.device}")
    else:
        print("DEBUG: YOLO staying on CPU - CUDA not available")
    
    # Initialize TorchReid with GPU
    device_str = 'cuda' if torch.cuda.is_available() else 'cpu'
    print(f"DEBUG: TorchReid using device: {device_str}")
    extractor = torchreid.utils.FeatureExtractor(
        model_name='osnet_x1_0',
        model_path='./models/osnet_ms_d_c.pth.tar',
        device=device_str
    )
    
    # Initialize CenterFace with GPU provider priority
    if execution_provider is None and torch.cuda.is_available():
        execution_provider = 'CUDAExecutionProvider'
        print("DEBUG: Forcing CenterFace to use CUDAExecutionProvider")
    
    centerface = CenterFace(in_shape=in_shape, backend=backend, override_execution_provider=execution_provider)
    
    # Get target person embeddings
    print("Loading target person images...")
    target_embeddings = []
    image_extensions = ['.jpg', '.jpeg', '.png', '.bmp']
    target_images = [
        f for f in os.listdir(target_person_dir) 
        if any(f.lower().endswith(ext) for ext in image_extensions)
    ]
    
    if not target_images:
        raise ValueError(f"No images found in target person directory: {target_person_dir}")
    
    for img_file in target_images:
        img_path = os.path.join(target_person_dir, img_file)
        try:
            image = cv2.imread(img_path)
            if image is None:
                print(f"Warning: Could not load image {img_path}")
                continue
            embeddings = get_person_embeddings_from_image(image, person_detector, extractor, debugging=debugging)
            target_embeddings.extend(embeddings)
            if debugging:
                print(f"Loaded {len(embeddings)} embeddings from {img_file}")
        except Exception as e:
            print(f"Warning: Error processing target image {img_path}: {e}")
    
    if not target_embeddings:
        raise ValueError("No valid target person embeddings could be extracted")
    
    print(f"Loaded {len(target_embeddings)} target person embeddings")
    
    # Process the video using the existing video processing function
    try:
        result = video_detect(
            ipath=video_path,
            opath=output_path,
            enable_preview=enable_preview,
            centerface=centerface,
            threshold=thresh,
            ellipse=ellipse,
            draw_scores=draw_scores,
            replaceimg=replaceimg,
            mosaicsize=mosaicsize,
            target_embeddings=target_embeddings,
            debugging=debugging,
            person_detector=person_detector,
            reid_model=extractor,
            disable_tracker_reset=disable_tracker_reset,
            debug_start=debug_start,
            debug_duration=debug_duration,
            reid_threshold=reid_threshold,
            max_frames_without_faces=max_frames_without_faces,
            mask_scale=mask_scale,
            keep_audio=keep_audio,
            ffmpeg_config=ffmpeg_config,
            replacewith=replacewith,
            cam=False,
            nested=False
        )
        
        print(f"Successfully processed video: {video_path}")
        return {
            "success": True,
            "input_video": video_path,
            "output_video": output_path,
            "target_embeddings_count": len(target_embeddings),
            "processing_result": result
        }
        
    except Exception as e:
        print(f"Error processing video {video_path}: {str(e)}")
        raise

def calculate_containment_ratio(det_box, tracking_box, debugging=False):
    """Calculate how much of the detection box is contained within the tracking box"""
    # Convert detection box from [x, y, w, h] to [x1, y1, x2, y2] format
    det_x1, det_y1 = det_box[0], det_box[1]
    det_x2, det_y2 = (
        det_x1 + det_box[2],  # x + width
        det_y1 + det_box[3]   # y + height
    )
    
    # Tracking box is already in [x1, y1, x2, y2] format
    track_x1, track_y1, track_x2, track_y2 = tracking_box
    
    # Calculate intersection coordinates
    x1 = max(det_x1, track_x1)
    y1 = max(det_y1, track_y1)
    x2 = min(det_x2, track_x2)
    y2 = min(det_y2, track_y2)
    
    # Calculate areas
    intersection_area = max(0, x2 - x1) * max(0, y2 - y1)
    det_area = (det_x2 - det_x1) * (det_y2 - det_y1)
    
    ratio = intersection_area / det_area if det_area > 0 else 0
    return ratio

def boxes_intersect(box1, box2):
    """Check if two bounding boxes intersect at all"""
    # Convert box1 from [x, y, w, h] to [x1, y1, x2, y2] if needed
    if len(box1) == 4:
        x1_1, y1_1 = box1[0], box1[1]
        x2_1, y2_1 = (x1_1 + box1[2], y1_1 + box1[3]) if len(box1) == 4 else (box1[2], box1[3])
    
    # Box2 is expected to be in [x1, y1, x2, y2] format
    x1_2, y1_2, x2_2, y2_2 = box2
    
    # Check if boxes intersect
    return not (x2_1 < x1_2 or x1_1 > x2_2 or y2_1 < y1_2 or y1_1 > y2_2)

def add_debugging_overlay(
    current_frame,
    dets_in_tracked,
    tracked_bbox,
    matched_face,
    matched_person,
    match_score
):
    """Add debugging visualization overlays to the frame"""
    x1, y1, x2, y2 = map(int, tracked_bbox)
    
    # Draw tracking box
    cv2.rectangle(current_frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
    
    # Add face count overlay
    text = f"Faces in tracked region: {len(dets_in_tracked)}"
    font = cv2.FONT_HERSHEY_SIMPLEX
    font_scale = 0.7
    thickness = 2
    (text_width, text_height), _ = cv2.getTextSize(text, font, font_scale, thickness)
    
    # Draw background rectangle
    cv2.rectangle(current_frame, (10, 10), (text_width + 20, text_height + 20), (0, 0, 0), -1)
    cv2.putText(current_frame, text, (15, text_height + 15), font, font_scale, (0, 255, 0), thickness)
    
    # Add matched face preview
    if matched_face is not None and matched_person is not None:
        # Display matched person
        person_display_size = (150, 300)
        matched_person_resized = cv2.resize(matched_person, person_display_size)
        
        # Display matched face
        face_display_size = (100, 100)
        matched_face_resized = cv2.resize(matched_face, face_display_size)
        
        # Calculate positions
        y_offset = 10
        x_offset = current_frame.shape[1] - person_display_size[0] - 10
        
        # Add matched person
        current_frame[y_offset:y_offset+person_display_size[1], 
            x_offset:x_offset+person_display_size[0]] = matched_person_resized
        
        # Add matched face below person
        face_y_offset = y_offset + person_display_size[1] + 10
        face_x_offset = x_offset + (person_display_size[0] - face_display_size[0]) // 2
        current_frame[face_y_offset:face_y_offset+face_display_size[1],
            face_x_offset:face_x_offset+face_display_size[0]] = matched_face_resized
        
        # Add confidence score
        score_text = f"Person Score: {match_score:.3f}"
        font = cv2.FONT_HERSHEY_SIMPLEX
        text_size = cv2.getTextSize(score_text, font, 0.5, 1)[0]
        text_x = x_offset + (person_display_size[0] - text_size[0]) // 2
        text_y = face_y_offset + face_display_size[1] + 20
        
        cv2.rectangle(current_frame, 
                    (text_x - 5, text_y - text_size[1] - 5),
                    (text_x + text_size[0] + 5, text_y + 5),
                    (0, 0, 0), -1)
        cv2.putText(current_frame, score_text, (text_x, text_y),
                font, 0.5, (255, 255, 255), 1)

    return current_frame

def scale_bb(x1, y1, x2, y2, mask_scale=1.0):
    s = mask_scale - 1.0
    h, w = y2 - y1, x2 - x1
    y1 -= h * s
    y2 += h * s
    x1 -= w * s
    x2 += w * s
    return np.round([x1, y1, x2, y2]).astype(int)


def draw_det(
        frame, score, det_idx, x1, y1, x2, y2,
        replacewith: str = 'blur',
        ellipse: bool = True,
        draw_scores: bool = False,
        ovcolor: Tuple[int] = (0, 0, 0),
        replaceimg = None,
        mosaicsize: int = 20
):
    if replacewith == 'solid':
        cv2.rectangle(frame, (x1, y1), (x2, y2), ovcolor, -1)
    elif replacewith == 'blur':
        bf = 2  # blur factor (number of pixels in each dimension that the face will be reduced to)
        blurred_box =  cv2.blur(
            frame[y1:y2, x1:x2],
            (abs(x2 - x1) // bf, abs(y2 - y1) // bf)
        )
        if ellipse:
            roibox = frame[y1:y2, x1:x2]
            ey, ex = skimage.draw.ellipse((y2 - y1) // 2, (x2 - x1) // 2, (y2 - y1) // 2, (x2 - x1) // 2)
            roibox[ey, ex] = blurred_box[ey, ex]
            frame[y1:y2, x1:x2] = roibox
        else:
            frame[y1:y2, x1:x2] = blurred_box
    elif replacewith == 'img':
        target_size = (x2 - x1, y2 - y1)
        resized_replaceimg = cv2.resize(replaceimg, target_size)
        if replaceimg.shape[2] == 3:  # RGB
            frame[y1:y2, x1:x2] = resized_replaceimg
        elif replaceimg.shape[2] == 4:  # RGBA
            frame[y1:y2, x1:x2] = frame[y1:y2, x1:x2] * (1 - resized_replaceimg[:, :, 3:] / 255) + resized_replaceimg[:, :, :3] * (resized_replaceimg[:, :, 3:] / 255)
    elif replacewith == 'mosaic':
        for y in range(y1, y2, mosaicsize):
            for x in range(x1, x2, mosaicsize):
                pt1 = (x, y)
                pt2 = (min(x2, x + mosaicsize - 1), min(y2, y + mosaicsize - 1))
                color = (int(frame[y, x][0]), int(frame[y, x][1]), int(frame[y, x][2]))
                cv2.rectangle(frame, pt1, pt2, color, -1)
    elif replacewith == 'none':
        pass
    if draw_scores:
        cv2.putText(
            frame, f'{score:.2f}', (x1 + 0, y1 - 20),
            cv2.FONT_HERSHEY_DUPLEX, 0.5, (0, 255, 0)
        )


def anonymize_frame(
        dets, frame, mask_scale,
        replacewith, ellipse, draw_scores, replaceimg, mosaicsize
):
    for i, det in enumerate(dets):
        boxes, score = det[:4], det[4]
        x1, y1, x2, y2 = boxes.astype(int)
        x1, y1, x2, y2 = scale_bb(x1, y1, x2, y2, mask_scale)
        # Clip bb coordinates to valid frame region
        y1, y2 = max(0, y1), min(frame.shape[0] - 1, y2)
        x1, x2 = max(0, x1), min(frame.shape[1] - 1, x2)
        draw_det(
            frame, score, i, x1, y1, x2, y2,
            replacewith=replacewith,
            ellipse=ellipse,
            draw_scores=draw_scores,
            replaceimg=replaceimg,
            mosaicsize=mosaicsize
        )


def cam_read_iter(reader):
    while True:
        yield reader.get_next_data()

def video_detect(
        ipath: str,
        opath: str,
        centerface: CenterFace,
        threshold: float,
        enable_preview: bool,
        cam: bool,
        nested: bool,
        replacewith: str,
        mask_scale: float,
        ellipse: bool,
        draw_scores: bool,
        ffmpeg_config: Dict[str, str],
        replaceimg = None,
        keep_audio: bool = False,
        mosaicsize: int = 20,
        target_embeddings = None,
        debugging: bool = False,
        person_detector = None,
        reid_model = None,
        debug_start: float = None,
        debug_duration: float = None,
        disable_tracker_reset: bool = False,
        reid_threshold: float = 0.7,
        max_frames_without_faces: int = 30,
):
    """Process a video file or camera stream, detecting and anonymizing faces while tracking a target person.
    
    The function performs the following main tasks:
    1. Initializes video reader and writer
    2. Processes each frame to detect faces and persons
    3. Tracks the target person if found
    4. Anonymizes non-target faces
    5. Handles debug visualization if enabled
    """

    # Initialize video reader with debug parameters if specified
    print(f"DEBUG: Attempting to read video from: {ipath}")
    print(f"DEBUG: File exists: {os.path.exists(ipath)}")
    print(f"DEBUG: File is file: {os.path.isfile(ipath)}")
    if os.path.exists(ipath):
        print(f"DEBUG: File size: {os.path.getsize(ipath)} bytes")
    print(f"DEBUG: FFMPEG config: {ffmpeg_config}")
    
    try:
        if debug_start is not None:
            if debugging:
                print(f"Starting video processing from {debug_start} seconds")
                if debug_duration:
                    print(f"Processing for {debug_duration} seconds")
            
            _ffmpeg_config = ffmpeg_config.copy()
            input_params = ['-ss', str(debug_start)]
            if debug_duration:
                input_params.extend(['-t', str(debug_duration)])
            
            print(f"DEBUG: Using input_params: {input_params}")
            reader = imageio.get_reader(ipath, size=None, fps=None, input_params=input_params)
        else:
            print(f"DEBUG: Using standard imageio.get_reader")
            reader = imageio.get_reader(ipath, fps=ffmpeg_config.get('fps', None))

        meta = reader.get_meta_data()
        print(f"DEBUG: Successfully read metadata: {meta}")
        _ = meta['size']  # Validate metadata
    except Exception as e:
        print(f"DEBUG: Exception occurred: {type(e).__name__}: {str(e)}")
        if cam:
            print(f'Could not find video device {ipath}. Please set a valid input.')
        else:
            print(f'Could not open file {ipath} as a video file with imageio. Skipping file...')
        return

    # Set up video reader iterator and progress bar
    if cam:
        nframes = None
        read_iter = cam_read_iter(reader)
    else:
        read_iter = reader.iter_data()
        nframes = reader.count_frames()

    bar = tqdm.tqdm(dynamic_ncols=True, total=nframes, position=1 if nested else 0, leave=True)
    processed_frames = 0
    log_interval = max(1, nframes // 20) if nframes else 100  # Log every 5% of frames

    # Initialize video writer if output path specified
    if opath is not None:
        print(f"DEBUG: Setting up video writer for output: {opath}")
        print(f"DEBUG: Output path exists: {os.path.exists(opath)}")
        print(f"DEBUG: Output directory: {os.path.dirname(opath)}")
        print(f"DEBUG: Output directory exists: {os.path.exists(os.path.dirname(opath))}")
        
        _ffmpeg_config = ffmpeg_config.copy()
        _ffmpeg_config.setdefault('fps', meta['fps'])
        if keep_audio and meta.get('audio_codec'):
            _ffmpeg_config.setdefault('audio_path', ipath)
            _ffmpeg_config.setdefault('audio_codec', 'copy')
        
        print(f"DEBUG: Final FFMPEG config for writer: {_ffmpeg_config}")
        
        try:
            writer = imageio.get_writer(opath, format='FFMPEG', mode='I', **_ffmpeg_config)
            print(f"DEBUG: Video writer created successfully")
        except Exception as writer_error:
            print(f"DEBUG: Video writer creation failed: {type(writer_error).__name__}: {str(writer_error)}")
            raise

    # Initialize tracking state variables
    face_tracker = None  # Active tracker for target person
    frames_without_faces = 0  # Counter for frames where target face is lost
    target_person_found = False  # Whether target person has been identified
    matched_face = None  # Last matched face image for debugging
    match_score = None  # Last ReID confidence score
    prev_frame = None  # Previous frame for tracking recovery
    flag = True  # For tracking status messages

    # Detection thresholds
    REID_SIMILARITY_THRESHOLD = reid_threshold  # Minimum similarity score for person ReID
    MAX_FRAMES_WITHOUT_FACES = max_frames_without_faces  # Max frames to continue tracking without detection

    for frame in read_iter:
        # Convert frame to numpy array if needed
        current_frame = np.array(frame) if not isinstance(frame, np.ndarray) else frame

        # Step 1: Face Detection
        dets, _ = centerface(current_frame, threshold=threshold)
        person_detection_results = None

        # Step 2: Target Person Detection & Tracking Initialization
        if (not target_person_found or face_tracker is None) and len(dets) > 0:
            # Only run person detection when needed
            person_detection_results = person_detector(current_frame, verbose=False)[0]
            
            # Try to find target person in frame
            person_bbox, face_img, score, person_img = find_person_in_frame(
                current_frame, 
                target_embeddings,
                REID_SIMILARITY_THRESHOLD,
                person_detection_results,
                reid_model,
                dets
            )
            
            # Initialize tracking if target found
            if person_bbox is not None:
                face_tracker, prev_bbox = init_face_tracker(
                    cv2.cvtColor(current_frame, cv2.COLOR_RGB2BGR), 
                    person_bbox
                )
                target_person_found = True
                matched_face = face_img
                matched_person = person_img
                match_score = score
                if debugging:
                    print(f"Target person found with confidence: {score:.3f}")

        # Step 3: Update Face Tracking
        if face_tracker is not None:
            bgr_frame = cv2.cvtColor(current_frame, cv2.COLOR_RGB2BGR)
            tracked_bbox = update_face_tracker(bgr_frame, face_tracker, prev_bbox)

            if tracked_bbox is None:
                if debugging:
                    print("Tracking failed, attempting recovery...")
                
                recovered_bbox = recover_tracking(current_frame, prev_bbox, dets, debugging)
                
                if recovered_bbox is not None:
                    # Reinitialize tracker with recovered detection
                    face_tracker, prev_bbox = init_face_tracker(bgr_frame, recovered_bbox)
                    tracked_bbox = prev_bbox
                    if debugging:
                        print("Tracking recovered")
                else:
                    if debugging:
                        print("Recovery failed")
                    face_tracker = None
                    target_person_found = False
            
            if tracked_bbox is not None:
                flag = True
                x1, y1, x2, y2 = map(int, tracked_bbox)
                tracked_box = [x1, y1, x2, y2]

                CONTAINMENT_THRESHOLD = 0.5  # Lower threshold to be more lenient

                # Calculate IoU for each detection with the tracked box
                containments = [calculate_containment_ratio((det[0], det[1], det[2]-det[0], det[3]-det[1]), tracked_bbox, debugging) for det in dets]
                
                dets_in_tracked = [
                    det for det in dets
                    if calculate_containment_ratio(
                        (det[0], det[1], det[2]-det[0], det[3]-det[1]),  # Convert to [x, y, w, h]
                        tracked_bbox,
                        debugging
                    ) > CONTAINMENT_THRESHOLD
                ]

                # Add debugging overlays
                if debugging:
                    current_frame = add_debugging_overlay(
                        current_frame,
                        dets_in_tracked,
                        tracked_bbox,
                        matched_face,
                        matched_person,
                        match_score
                    )

                if len(dets_in_tracked) == 1:
                    # Single face detected - keep existing logic
                    dets = [
                        det for det in dets
                        if calculate_containment_ratio(
                            (det[0], det[1], det[2]-det[0], det[3]-det[1]),
                            tracked_bbox,
                            debugging
                        ) < CONTAINMENT_THRESHOLD
                    ]
                    frames_without_faces = 0
                    
                elif len(dets_in_tracked) > 1:
                    # Multiple faces detected - check person detections
                    if person_detection_results is None:
                        person_detection_results = person_detector(current_frame, verbose=False)[0]
                    
                    person_boxes = []
                    # Get person detections with confidence > 0.3
                    for result in person_detection_results.boxes.data:
                        if result[5] == 0 and result[4] >= 0.3:  # Class 0 is person
                            person_boxes.append(result[:4].cpu().numpy())
                    
                    # Count persons intersecting with tracking box
                    intersecting_persons = sum(
                        1 for person_box in person_boxes 
                        if boxes_intersect(person_box, tracked_bbox)
                    )
                    
                    if debugging:
                        print(f"Found {intersecting_persons} persons intersecting with tracking box")
                    
                    # If multiple persons detected, keep all face detections for anonymization
                    if intersecting_persons <= 1:
                        dets = [
                            det for det in dets
                            if calculate_containment_ratio(
                                (det[0], det[1], det[2]-det[0], det[3]-det[1]),
                                tracked_bbox,
                                debugging
                            ) < CONTAINMENT_THRESHOLD
                        ]
                    frames_without_faces = 0
                    # else: keep all detections for anonymization

                # if no face detection in tracking region
                else:
                    recovered_bbox = recover_tracking(current_frame, prev_bbox, dets, debugging)
                    
                    if recovered_bbox is not None:
                        # Convert recovered_bbox to the format expected by face_tracker
                        bgr_frame = cv2.cvtColor(current_frame, cv2.COLOR_RGB2BGR)
                        # Create new tracker instance and initialize it
                        face_tracker = None  # Clear old tracker
                        face_tracker, prev_bbox = init_face_tracker(bgr_frame, recovered_bbox)
                        tracked_bbox = prev_bbox  # Update tracked_bbox for current frame
                        frames_without_faces = 0
                        
                        # Remove the recovered detection from dets to avoid double processing
                        recovered_det = None
                        for det in dets:
                            det_box = [det[0], det[1], det[2]-det[0], det[3]-det[1]]  # Convert to [x, y, w, h]
                            if calculate_containment_ratio(det_box, recovered_bbox, debugging) > 0.5:
                                recovered_det = det
                                break
                        
                        if recovered_det is not None:
                            dets = np.array([det for det in dets if not np.array_equal(det, recovered_det)])
                            
                        if debugging:
                            print("Tracking recovered successfully")
                            if recovered_det is not None:
                                print("Recovered detection excluded from anonymization")
                    
                    frames_without_faces += 1
                    if not disable_tracker_reset and frames_without_faces >= MAX_FRAMES_WITHOUT_FACES:
                        if debugging:
                            print(f"No faces found in tracking region for {MAX_FRAMES_WITHOUT_FACES} frames, resetting tracker")
                        face_tracker = None
                        target_person_found = False
                        frames_without_faces = 0

                prev_bbox = tracked_bbox

        # Step 4: Anonymize Non-Target Faces
        anonymize_frame(
            dets, current_frame, mask_scale=mask_scale,
            replacewith=replacewith, ellipse=ellipse, draw_scores=draw_scores,
            replaceimg=replaceimg, mosaicsize=mosaicsize,
        )

        # Step 5: Write/Display Output
        if opath is not None:
            writer.append_data(current_frame)

        if enable_preview:
            cv2.imshow('Preview of anonymization results (quit by pressing Q or Escape)', frame[:, :, ::-1])
            if cv2.waitKey(1) & 0xFF in [ord('q'), 27]:
                cv2.destroyAllWindows()
                break

        prev_frame = current_frame.copy()
        bar.update()
        processed_frames += 1
        
        # Log progress every log_interval frames
        if processed_frames % log_interval == 0 or processed_frames == nframes:
            progress_pct = (processed_frames / nframes * 100) if nframes else 0
            print(f"Progress: {processed_frames}/{nframes or '?'} frames ({progress_pct:.1f}%)")

    reader.close()
    if opath is not None:
        writer.close()
    bar.close()

def image_detect(
        ipath: str,
        opath: str,
        centerface: CenterFace,
        threshold: float,
        replacewith: str,
        mask_scale: float,
        ellipse: bool,
        draw_scores: bool,
        enable_preview: bool,
        keep_metadata: bool,
        replaceimg = None,
        mosaicsize: int = 20,
):
    frame = iio.imread(ipath)

    if keep_metadata:
        # Source image EXIF metadata retrieval via imageio V3 lib
        metadata = imageio.v3.immeta(ipath)
        exif_dict = metadata.get("exif", None)

    # Perform network inference, get bb dets but discard landmark predictions
    dets, _ = centerface(frame, threshold=threshold)

    anonymize_frame(
        dets, frame, mask_scale=mask_scale,
        replacewith=replacewith, ellipse=ellipse, draw_scores=draw_scores,
        replaceimg=replaceimg, mosaicsize=mosaicsize
    )

    if enable_preview:
        cv2.imshow('Preview of anonymization results (quit by pressing Q or Escape)', frame[:, :, ::-1])  # RGB -> RGB
        if cv2.waitKey(0) & 0xFF in [ord('q'), 27]:  # 27 is the escape key code
            cv2.destroyAllWindows()

    imageio.imsave(opath, frame)

    if keep_metadata:
        # Save image with EXIF metadata
        imageio.imsave(opath, frame, exif=exif_dict)

    # print(f'Output saved to {opath}')


def get_file_type(path):
    if path.startswith('<video'):
        return 'cam'
    if not os.path.isfile(path):
        return 'notfound'
    mime = mimetypes.guess_type(path)[0]
    if mime is None:
        return None
    if mime.startswith('video'):
        return 'video'
    if mime.startswith('image'):
        return 'image'
    return mime


def get_anonymized_image(frame,
                         threshold: float,
                         replacewith: str,
                         mask_scale: float,
                         ellipse: bool,
                         draw_scores: bool,
                         replaceimg = None
                         ):
    """
    Method for getting an anonymized image without CLI
    returns frame
    """

    centerface = CenterFace(in_shape=None, backend='auto')
    dets, _ = centerface(frame, threshold=threshold)

    anonymize_frame(
        dets, frame, mask_scale=mask_scale,
        replacewith=replacewith, ellipse=ellipse, draw_scores=draw_scores,
        replaceimg=replaceimg
    )

    return frame


def parse_cli_args():
    parser = argparse.ArgumentParser(description='Video anonymization by face detection', add_help=False)
    parser.add_argument(
        'input_dir',
        help='Directory containing video folders. Each video folder should contain a video file and a target_person directory.'
    )
    parser.add_argument(
        '--output', '-o', default=None, metavar='O',
        help='Output file name. Defaults to input path + postfix "_anonymized".')
    parser.add_argument(
        '--video-filename', default='video.mp4',
        help='Name of the video file in each video folder. Default: video.mp4'
    )
    parser.add_argument(
        '--target-person-dirname', default='target_person',
        help='Name of the target person directory in each video folder. Default: target_person'
    )
    parser.add_argument(
        '--debugging', default=False, action='store_true',
        help='Enable debug mode with additional console output and visualization.'
    )
    parser.add_argument(
        '--disable-tracker-reset', default=False, action='store_true',
        help='Disable automatic tracker reset when faces are not found. Use this if the target subject never leaves the frame.'
    )
    parser.add_argument(
        '--debug-start', type=float, default=None,
        help='Start time in seconds for processing a specific segment'
    )
    parser.add_argument(
        '--debug-duration', type=float, default=None,
        help='Duration in seconds for processing a specific segment'
    )
    parser.add_argument(
        '--reid-threshold', default=0.7, type=float,
        help='Similarity threshold for target person re-identification. Higher values are more strict. Default: 0.7'
    )
    parser.add_argument(
        '--max-frames-without-faces', default=30, type=int,
        help='Maximum number of frames to continue tracking when no faces are detected before resetting. Default: 30'
    )
    parser.add_argument(
        '--thresh', '-t', default=0.4, type=float, metavar='T',
        help='Detection threshold for face blurring (tune this to trade off between false positive and false negative rate). Default: 0.2.')
    
    parser.add_argument(
        '--scale', '-s', default=None, metavar='WxH',
        help='Downscale images for network inference to this size (format: WxH, example: --scale 640x360).')
    parser.add_argument(
        '--preview', '-p', default=False, action='store_true',
        help='Enable live preview GUI (can decrease performance).')
    parser.add_argument(
        '--boxes', default=True, action='store_true',
        help='Use boxes instead of ellipse masks.')
    parser.add_argument(
        '--draw-scores', default=False, action='store_true',
        help='Draw detection scores onto outputs.')
    parser.add_argument(
        '--mask-scale', default=1.3, type=float, metavar='M',
        help='Scale factor for face masks, to make sure that masks cover the complete face. Default: 1.3.')
    parser.add_argument(
        '--replacewith', default='blur', choices=['blur', 'solid', 'none', 'img', 'mosaic'],
        help='Anonymization filter mode for face regions. "blur" applies a strong gaussian blurring, "solid" draws a solid black box, "none" does leaves the input unchanged, "img" replaces the face with a custom image and "mosaic" replaces the face with mosaic. Default: "blur".')
    parser.add_argument(
        '--replaceimg', default='replace_img.png',
        help='Anonymization image for face regions. Requires --replacewith img option.')
    parser.add_argument(
        '--mosaicsize', default=20, type=int, metavar='width',
        help='Setting the mosaic size. Requires --replacewith mosaic option. Default: 20.')
    parser.add_argument(
        '--keep-audio', '-k', default=False, action='store_true',
        help='Keep audio from video source file and copy it over to the output (only applies to videos).')
    parser.add_argument(
        '--ffmpeg-config', default={"codec": "libx264"}, type=json.loads,
        help='FFMPEG config arguments for encoding output videos. This argument is expected in JSON notation. For a list of possible options, refer to the ffmpeg-imageio docs. Default: \'{"codec": "libx264"}\'.'
    )  # See https://imageio.readthedocs.io/en/stable/format_ffmpeg.html#parameters-for-saving
    parser.add_argument(
        '--backend', default='auto', choices=['auto', 'onnxrt', 'opencv'],
        help='Backend for ONNX model execution. Default: "auto" (prefer onnxrt if available).')
    parser.add_argument(
        '--execution-provider', '--ep', default=None, metavar='EP',
        help='Override onnxrt execution provider (see https://onnxruntime.ai/docs/execution-providers/). If not specified, the presumably fastest available one will be automatically selected. Only used if backend is onnxrt.')
    parser.add_argument(
        '--version', action='version', version=__version__,
        help='Print version number and exit.')
    parser.add_argument(
        '--keep-metadata', '-m', default=False, action='store_true',
        help='Keep metadata of the original image. Default : False.')
    parser.add_argument('--help', '-h', action='help', help='Show this help message and exit.')

    args = parser.parse_args()

    # if len(args.input) == 0:
    #     parser.print_help()
    #     print('\nPlease supply at least one input path.')
    #     exit(1)

    # if args.input == ['cam']:  # Shortcut for webcam demo with live preview
    #     args.input = ['<video0>']
    #     args.preview = True

    return args


def main():
    args = parse_cli_args()
    
    # Initialize variables
    replacewith = args.replacewith
    enable_preview = args.preview
    draw_scores = args.draw_scores
    threshold = args.thresh
    ellipse = not args.boxes
    mask_scale = args.mask_scale
    keep_audio = args.keep_audio
    ffmpeg_config = args.ffmpeg_config
    backend = args.backend
    in_shape = args.scale
    execution_provider = args.execution_provider
    mosaicsize = args.mosaicsize
    keep_metadata = args.keep_metadata
    debug_start = args.debug_start
    debug_duration = args.debug_duration

    replaceimg = None
    if in_shape is not None:
        w, h = in_shape.split('x')
        in_shape = int(w), int(h)
    if replacewith == "img":
            replaceimg = imageio.imread(args.replaceimg)

    # Initialize models with GPU support
    print("Initializing models...")
    print(f"DEBUG: CUDA available: {torch.cuda.is_available()}")
    if torch.cuda.is_available():
        print(f"DEBUG: CUDA device count: {torch.cuda.device_count()}")
        print(f"DEBUG: CUDA device name: {torch.cuda.get_device_name()}")
    
    person_detector = YOLO('yolo11x.pt')
    if torch.cuda.is_available():
        person_detector.to('cuda')
        print("DEBUG: YOLO moved to GPU")
    
    device_str = 'cuda' if torch.cuda.is_available() else 'cpu'
    print(f"DEBUG: TorchReid using device: {device_str}")
    extractor = torchreid.utils.FeatureExtractor(
        model_name='osnet_x1_0',
        model_path='./models/osnet_ms_d_c.pth.tar',
        device=device_str
    )
    
    # Force GPU execution provider for ONNX if available
    if execution_provider is None and torch.cuda.is_available():
        execution_provider = 'CUDAExecutionProvider'
        print("DEBUG: Forcing CenterFace to use CUDAExecutionProvider")
    
    centerface = CenterFace(in_shape=in_shape, backend=backend, override_execution_provider=execution_provider)

    # Verify input directory exists
    if not os.path.isdir(args.input_dir):
        print(f"Error: Input directory '{args.input_dir}' does not exist")
        return

    # Get list of video folders
    video_folders = [f for f in os.listdir(args.input_dir) 
                    if os.path.isdir(os.path.join(args.input_dir, f))]
    
    if not video_folders:
        print(f"No video folders found in {args.input_dir}")
        return

    print(f"Found {len(video_folders)} video folders to process")
    
    # Process each video folder
    for video_folder in tqdm.tqdm(video_folders, desc='Processing videos'):
        try:
            video_path = os.path.join(args.input_dir, video_folder, args.video_filename)
            target_person_dir = os.path.join(args.input_dir, video_folder, args.target_person_dirname)
            
            # Verify required files exist
            if not os.path.exists(video_path):
                print(f"Warning: Video file not found in {video_folder}")
                continue
                
            if not os.path.exists(target_person_dir):
                print(f"Warning: Target person directory not found in {video_folder}")
                continue
            
            # Generate output path
            output_path = os.path.join(args.input_dir, video_folder, f"anonymized_{args.video_filename}")
            
            # Get embeddings for this video's target person
            print(f"\nProcessing folder: {video_folder}")
            print(f"Loading target person images from: {target_person_dir}")
            
            target_embeddings = get_person_embeddings_from_image(target_person_dir, person_detector, extractor, debugging=args.debugging)
            if not target_embeddings:
                print(f"Warning: Could not load any valid target person images from {target_person_dir}")
                continue
            
            print(f'Input video: {video_path}')
            print(f'Output path: {output_path}')
            
            # Process the video
            video_detect(
                ipath=video_path,
                opath=output_path,
                centerface=centerface,
                threshold=threshold,
                cam=False,
                replacewith=replacewith,
                mask_scale=mask_scale,
                ellipse=ellipse,
                draw_scores=draw_scores,
                enable_preview=enable_preview,
                nested=True,
                keep_audio=keep_audio,
                ffmpeg_config=ffmpeg_config,
                replaceimg=replaceimg,
                mosaicsize=mosaicsize,
                target_embeddings=target_embeddings,
                debugging=args.debugging,
                person_detector=person_detector,
                reid_model=extractor,
                disable_tracker_reset=args.disable_tracker_reset,
                debug_start=args.debug_start,
                debug_duration=args.debug_duration,
                reid_threshold=args.reid_threshold,  # Add new argument
                max_frames_without_faces=args.max_frames_without_faces,  # Add new argument
            )
            
            print(f"Successfully processed {video_folder}")
            
        except KeyboardInterrupt:
            print("\nProcessing interrupted by user")
            return
        except Exception as e:
            print(f"Error processing video folder {video_folder}: {str(e)}")
            if args.debugging:
                import traceback
                traceback.print_exc()
            continue

    print("\nProcessing complete!")
    if args.debugging:
        print(f"Processed {len(video_folders)} video folders")

if __name__ == '__main__':
    main()
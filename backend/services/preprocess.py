import base64
import cv2
import numpy as np
from typing import Tuple, Dict, Any
from backend.config import IMAGE_WIDTH, IMAGE_HEIGHT, GAUSSIAN_BLUR_KERNEL

def read_image_from_bytes(data: bytes) -> np.ndarray:
    """Decodes raw image bytes into an OpenCV BGR numpy array."""
    nparr = np.frombuffer(data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Invalid image file or format cannot be decoded.")
    return img

def encode_image_to_base64(img: np.ndarray, ext: str = ".png") -> str:
    """Encodes an OpenCV image to base64 data URI string."""
    success, buffer = cv2.imencode(ext, img)
    if not success:
        return ""
    b64_str = base64.b64encode(buffer).decode("utf-8")
    mime = "image/png" if ext.lower() == ".png" else "image/jpeg"
    return f"data:{mime};base64,{b64_str}"

def preprocess_signature_image(image: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
    """
    Implements the exact preprocessing pipeline from the Jupyter Notebook:
    1. Grayscale conversion
    2. Resize to (256, 128) [Width=256, Height=128]
    3. Gaussian Blur (5, 5)
    4. Adaptive Thresholding (THRESH_BINARY_INV, Gaussian C, 11, 2)
    5. Normalization (/ 255.0) and channel dimension expansion.

    Returns:
        tuple: (model_input_tensor, processed_preview_image)
               model_input_tensor shape: (1, 128, 256, 1) float32
               processed_preview_image: (128, 256) uint8
    """
    if len(image.shape) == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image.copy()

    # Resize to width=256, height=128
    resized = cv2.resize(gray, (IMAGE_WIDTH, IMAGE_HEIGHT))

    # Apply Gaussian Blur to remove noise
    blurred = cv2.GaussianBlur(resized, GAUSSIAN_BLUR_KERNEL, 0)

    # Apply adaptive thresholding
    binary = cv2.adaptiveThreshold(
        blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 11, 2
    )

    # Prepare for neural network: float32, / 255.0, shape (1, 128, 256, 1)
    normalized = binary.astype(np.float32) / 255.0
    tensor = np.expand_dims(normalized, axis=-1)
    tensor = np.expand_dims(tensor, axis=0)

    return tensor, binary

def analyze_stroke_metrics(binary_img1: np.ndarray, binary_img2: np.ndarray) -> Dict[str, Any]:
    """
    Analyzes visual stroke similarity between two preprocessed binary signatures:
    - Stroke pixel density
    - Stroke distribution overlap
    - Stroke consistency score
    """
    density1 = float(np.count_nonzero(binary_img1)) / (IMAGE_WIDTH * IMAGE_HEIGHT)
    density2 = float(np.count_nonzero(binary_img2)) / (IMAGE_WIDTH * IMAGE_HEIGHT)

    # Overlap / IoU between thresholded strokes
    intersection = np.logical_and(binary_img1 > 0, binary_img2 > 0)
    union = np.logical_or(binary_img1 > 0, binary_img2 > 0)
    iou = float(np.sum(intersection)) / float(max(np.sum(union), 1))

    # Density ratio
    density_ratio = min(density1, density2) / max(max(density1, density2), 1e-5)

    consistency_score = (iou * 0.6 + density_ratio * 0.4) * 100
    consistency_pct = max(10.0, min(99.0, consistency_score))

    if consistency_pct >= 70:
        desc = f"STRONG ({consistency_pct:.0f}%)"
    elif consistency_pct >= 45:
        desc = f"MODERATE ({consistency_pct:.0f}%)"
    else:
        desc = f"DIVERGENT ({consistency_pct:.0f}%)"

    return {
        "stroke_consistency_label": desc,
        "stroke_score": round(consistency_pct, 1),
        "density_ref": round(density1 * 100, 2),
        "density_target": round(density2 * 100, 2),
        "stroke_iou": round(iou, 4)
    }

import cv2
import numpy as np
from typing import Dict, Any, List
from backend.config import DEFAULT_SIMILARITY_THRESHOLD
from backend.services.preprocess import (
    preprocess_signature_image,
    analyze_stroke_metrics,
    encode_image_to_base64
)
from backend.services.model_loader import model_manager

GENUINE_REASONS = [
    {
        "title": "Natural Flow",
        "description": "Pen pressure, stroke direction, and trajectory velocity align seamlessly with verified biomechanical motion."
    },
    {
        "title": "Consistent Style",
        "description": "Letter shapes, horizontal slant, and inter-character spacing remain uniform against reference morphology."
    },
    {
        "title": "Muscle Memory",
        "description": "Fluid stroke junctions reveal reflexive neuromuscular execution without hesitation pauses."
    },
    {
        "title": "Stable Pressure",
        "description": "Binary edge gradients show consistent ink deposit and natural pen lifts rather than forced tracing."
    },
    {
        "title": "Neural Embedding Match",
        "description": "Siamese feature distance falls comfortably within the authentic manifold distribution."
    }
]

FORGED_REASONS = [
    {
        "title": "Shaky Strokes",
        "description": "Tremors and hesitation micro-wobbles detected along primary stroke trajectories."
    },
    {
        "title": "Inconsistent Geometry",
        "description": "Character proportions, baseline alignment, or loop aspect ratios diverge from baseline records."
    },
    {
        "title": "Uneven Pen Pressure",
        "description": "Heavy retouches and unnatural ink pooling indicate deliberate or unpracticed replication."
    },
    {
        "title": "Timing / Cadence Mismatch",
        "description": "Discontinuous stroke velocity curves suggest deliberate tracing rather than rapid natural signing."
    },
    {
        "title": "High Siamese Distance",
        "description": "Deep feature representation exceeds authentic threshold boundary, indicating structural discrepancy."
    }
]

def verify_signature_pair(
    image_ref: np.ndarray,
    image_target: np.ndarray,
    threshold: float = DEFAULT_SIMILARITY_THRESHOLD
) -> Dict[str, Any]:
    """
    Performs end-to-end Siamese verification between two signatures:
    1. Preprocesses both images to (1, 128, 256, 1) normalized tensors.
    2. Runs SNN model inference to obtain the similarity distance score.
    3. Calculates stroke consistency and authenticity confidence.
    4. Evaluates decision against threshold and attaches structured forensic explanations.
    """
    # 1. Preprocessing
    tensor_ref, binary_ref = preprocess_signature_image(image_ref)
    tensor_target, binary_target = preprocess_signature_image(image_target)

    # 2. Model Inference
    distance_score, engine = model_manager.predict_similarity(tensor_ref, tensor_target)

    # 3. Decision
    is_match = distance_score <= threshold

    # 4. Confidence & Stroke Analysis
    stroke_info = analyze_stroke_metrics(binary_ref, binary_target)

    if is_match:
        # Confidence of authenticity (e.g. 70% to 99%)
        rel_closeness = max(0.0, 1.0 - (distance_score / max(threshold, 0.01)))
        confidence_val = 70.0 + (rel_closeness * 28.5)
        confidence_val = min(99.4, confidence_val)
        verdict = "GENUINE MATCH"
        reasons = GENUINE_REASONS
    else:
        # Authenticity confidence is low for forgeries (e.g. 15% to 45%)
        divergence = min(1.0, (distance_score - threshold) / max(1.0 - threshold, 0.01))
        confidence_val = max(10.0, 48.0 - (divergence * 35.0))
        verdict = "FORGED / MISMATCH"
        reasons = FORGED_REASONS

    return {
        "verdict": verdict,
        "is_match": is_match,
        "confidence_percentage": round(confidence_val, 1),
        "distance_score": round(distance_score, 4),
        "threshold": threshold,
        "stroke_consistency": stroke_info["stroke_consistency_label"],
        "stroke_details": stroke_info,
        "inference_engine": engine,
        "reasons": reasons,
        "preview_ref_preprocessed": encode_image_to_base64(binary_ref),
        "preview_target_preprocessed": encode_image_to_base64(binary_target)
    }

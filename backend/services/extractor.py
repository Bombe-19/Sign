import cv2
import numpy as np
from typing import List, Dict, Any, Tuple
from backend.services.preprocess import encode_image_to_base64
from backend.config import PADDING_FREEHAND, PADDING_BOXED, GAUSSIAN_BLUR_KERNEL, MORPH_RECT_KERNEL, CANNY_LOW, CANNY_HIGH

def pad_image(img: np.ndarray, padding: int = 20) -> np.ndarray:
    """Adds a clean white margin around a cropped signature."""
    return cv2.copyMakeBorder(
        img, padding, padding, padding, padding,
        cv2.BORDER_CONSTANT, value=[255, 255, 255]
    )

def extract_signatures_from_image(
    img: np.ndarray,
    filter_bottom_half: bool = False
) -> Tuple[List[Dict[str, Any]], np.ndarray]:
    """
    Implements document signature extraction from the Jupyter Notebook:
    1. Freehand detection via Otsu binarization and morphological closing.
    2. Boxed signature detection via Canny edge detection and contour polygon approximation.

    Returns:
        (signatures_list, annotated_document_image)
    """
    annotated = img.copy()
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    height, width = img.shape[:2]

    # Preprocessing
    blur = cv2.GaussianBlur(gray, GAUSSIAN_BLUR_KERNEL, 0)
    _, thresh = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, MORPH_RECT_KERNEL)
    morphed = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)

    extracted_items: List[Dict[str, Any]] = []
    item_counter = 0

    # 1. FREEHAND SIGNATURE DETECTION
    contours, _ = cv2.findContours(morphed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    for cnt in contours:
        x, y, w, h = cv2.boundingRect(cnt)
        if h == 0:
            continue
        aspect_ratio = w / float(h)

        # Filters from notebook: 100 < w < 800 and 30 < h < 300 and 1.0 < aspect_ratio < 10.0
        if 80 < w < 900 and 25 < h < 350 and 0.8 < aspect_ratio < 12.0:
            if filter_bottom_half and y < (height * 0.4):
                continue

            # Expand bounding box with padding
            padding = PADDING_FREEHAND
            x_exp = max(x - padding, 0)
            y_exp = max(y - padding, 0)
            w_exp = min(w + 2 * padding, width - x_exp)
            h_exp = min(h + 2 * padding, height - y_exp)

            cropped = img[y_exp:y_exp + h_exp, x_exp:x_exp + w_exp]
            if cropped.size == 0:
                continue

            # Draw blue box on annotated document
            cv2.rectangle(annotated, (x_exp, y_exp), (x_exp + w_exp, y_exp + h_exp), (255, 120, 0), 3)
            cv2.putText(
                annotated, f"SIG #{item_counter + 1} (Freehand)",
                (x_exp, max(15, y_exp - 8)),
                cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 120, 0), 2
            )

            extracted_items.append({
                "id": f"sig_freehand_{item_counter + 1}",
                "type": "freehand",
                "bbox": {"x": int(x_exp), "y": int(y_exp), "width": int(w_exp), "height": int(h_exp)},
                "aspect_ratio": round(aspect_ratio, 2),
                "image_base64": encode_image_to_base64(cropped),
                "cropped_array": cropped
            })
            item_counter += 1

    # 2. BOXED SIGNATURE DETECTION
    edges = cv2.Canny(blur, CANNY_LOW, CANNY_HIGH)
    box_contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    for cnt in box_contours:
        approx = cv2.approxPolyDP(cnt, 0.02 * cv2.arcLength(cnt, True), True)
        if len(approx) == 4 and cv2.isContourConvex(approx):
            x, y, w, h = cv2.boundingRect(approx)
            if h == 0:
                continue
            aspect_ratio = w / float(h)

            # Notebook filters: 50 < w < 300 and 50 < h < 300 and 0.5 < aspect_ratio < 2.0
            if 50 < w < 400 and 50 < h < 400 and 0.5 < aspect_ratio < 2.5:
                cropped = img[y:y + h, x:x + w]
                if cropped.size == 0:
                    continue
                cropped_padded = pad_image(cropped, padding=PADDING_BOXED)

                # Draw green box on annotated document
                cv2.rectangle(annotated, (x, y), (x + w, y + h), (0, 200, 50), 3)
                cv2.putText(
                    annotated, f"SIG #{item_counter + 1} (Boxed)",
                    (x, max(15, y - 8)),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 200, 50), 2
                )

                extracted_items.append({
                    "id": f"sig_boxed_{item_counter + 1}",
                    "type": "boxed",
                    "bbox": {"x": int(x), "y": int(y), "width": int(w), "height": int(h)},
                    "aspect_ratio": round(aspect_ratio, 2),
                    "image_base64": encode_image_to_base64(cropped_padded),
                    "cropped_array": cropped_padded
                })
                item_counter += 1

    return extracted_items, annotated

import base64
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from backend.services.preprocess import read_image_from_bytes
from backend.services.verifier import verify_signature_pair
from backend.config import DEFAULT_SIMILARITY_THRESHOLD

router = APIRouter(prefix="/api", tags=["Verification"])

class VerifyJsonRequest(BaseModel):
    ref_image_base64: str
    target_image_base64: str
    threshold: Optional[float] = DEFAULT_SIMILARITY_THRESHOLD

def parse_base64_image(data_uri: str) -> bytes:
    """Extracts raw bytes from a data URI or raw base64 string."""
    if "," in data_uri:
        data_uri = data_uri.split(",", 1)[1]
    return base64.b64decode(data_uri)

@router.post("/verify")
async def verify_signatures_upload(
    file_ref: Optional[UploadFile] = File(None),
    file_target: Optional[UploadFile] = File(None),
    ref_base64: Optional[str] = Form(None),
    target_base64: Optional[str] = Form(None),
    threshold: float = Form(DEFAULT_SIMILARITY_THRESHOLD)
):
    """
    Verifies two signatures for authenticity.
    Supports both file uploads (multipart) and base64 strings (for preset / web data).
    """
    try:
        # Read Reference Image
        if file_ref is not None:
            bytes_ref = await file_ref.read()
        elif ref_base64:
            bytes_ref = parse_base64_image(ref_base64)
        else:
            raise HTTPException(status_code=400, detail="Reference signature is required (file_ref or ref_base64).")

        # Read Target Image
        if file_target is not None:
            bytes_target = await file_target.read()
        elif target_base64:
            bytes_target = parse_base64_image(target_base64)
        else:
            raise HTTPException(status_code=400, detail="Target signature is required (file_target or target_base64).")

        img_ref = read_image_from_bytes(bytes_ref)
        img_target = read_image_from_bytes(bytes_target)

        result = verify_signature_pair(img_ref, img_target, threshold=threshold)
        return {
            "success": True,
            "data": result
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as ex:
        raise HTTPException(status_code=500, detail=f"Internal verification error: {str(ex)}")

@router.post("/verify-json")
async def verify_signatures_json(payload: VerifyJsonRequest):
    """
    JSON endpoint for verifying signatures using base64 encoded data URIs.
    """
    try:
        bytes_ref = parse_base64_image(payload.ref_image_base64)
        bytes_target = parse_base64_image(payload.target_image_base64)

        img_ref = read_image_from_bytes(bytes_ref)
        img_target = read_image_from_bytes(bytes_target)

        result = verify_signature_pair(img_ref, img_target, threshold=payload.threshold or DEFAULT_SIMILARITY_THRESHOLD)
        return {
            "success": True,
            "data": result
        }
    except Exception as ex:
        raise HTTPException(status_code=500, detail=str(ex))

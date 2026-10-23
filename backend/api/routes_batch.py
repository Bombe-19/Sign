import base64
from typing import Optional, List
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from backend.services.preprocess import read_image_from_bytes, encode_image_to_base64
from backend.services.extractor import extract_signatures_from_image
from backend.services.verifier import verify_signature_pair
from backend.config import DEFAULT_SIMILARITY_THRESHOLD

router = APIRouter(prefix="/api", tags=["Batch Extraction & Verification"])

def parse_base64(data_uri: str) -> bytes:
    if "," in data_uri:
        data_uri = data_uri.split(",", 1)[1]
    return base64.b64decode(data_uri)

@router.post("/extract")
async def extract_document_signatures(
    document_file: Optional[UploadFile] = File(None),
    document_base64: Optional[str] = Form(None),
    filter_bottom_half: bool = Form(False)
):
    """
    Extracts freehand and boxed signatures from a scanned document.
    """
    try:
        if document_file is not None:
            doc_bytes = await document_file.read()
        elif document_base64:
            doc_bytes = parse_base64(document_base64)
        else:
            raise HTTPException(status_code=400, detail="Document file is required.")

        doc_img = read_image_from_bytes(doc_bytes)
        signatures, annotated_img = extract_signatures_from_image(
            doc_img, filter_bottom_half=filter_bottom_half
        )

        # Remove numpy arrays before JSON serialization
        clean_signatures = []
        for s in signatures:
            item = {k: v for k, v in s.items() if k != "cropped_array"}
            clean_signatures.append(item)

        return {
            "success": True,
            "count": len(clean_signatures),
            "freehand_count": sum(1 for s in clean_signatures if s["type"] == "freehand"),
            "boxed_count": sum(1 for s in clean_signatures if s["type"] == "boxed"),
            "signatures": clean_signatures,
            "annotated_document_base64": encode_image_to_base64(annotated_img)
        }
    except Exception as ex:
        raise HTTPException(status_code=500, detail=f"Extraction failed: {str(ex)}")

@router.post("/batch-verify")
async def batch_verify_document(
    document_file: Optional[UploadFile] = File(None),
    document_base64: Optional[str] = Form(None),
    reference_file: Optional[UploadFile] = File(None),
    reference_base64: Optional[str] = Form(None),
    threshold: float = Form(DEFAULT_SIMILARITY_THRESHOLD)
):
    """
    Extracts all signatures from a document and verifies each one against a reference signature.
    """
    try:
        # Document
        if document_file is not None:
            doc_bytes = await document_file.read()
        elif document_base64:
            doc_bytes = parse_base64(document_base64)
        else:
            raise HTTPException(status_code=400, detail="Document file is required.")

        # Reference
        if reference_file is not None:
            ref_bytes = await reference_file.read()
        elif reference_base64:
            ref_bytes = parse_base64(reference_base64)
        else:
            raise HTTPException(status_code=400, detail="Reference signature is required for batch verification.")

        doc_img = read_image_from_bytes(doc_bytes)
        ref_img = read_image_from_bytes(ref_bytes)

        signatures, annotated_img = extract_signatures_from_image(doc_img)

        verified_results = []
        for sig in signatures:
            cropped = sig["cropped_array"]
            match_res = verify_signature_pair(ref_img, cropped, threshold=threshold)

            verified_results.append({
                "id": sig["id"],
                "type": sig["type"],
                "bbox": sig["bbox"],
                "image_base64": sig["image_base64"],
                "verdict": match_res["verdict"],
                "is_match": match_res["is_match"],
                "confidence_percentage": match_res["confidence_percentage"],
                "distance_score": match_res["distance_score"],
                "stroke_consistency": match_res["stroke_consistency"],
                "reasons": match_res["reasons"]
            })

        return {
            "success": True,
            "total_extracted": len(verified_results),
            "matches_count": sum(1 for s in verified_results if s["is_match"]),
            "mismatches_count": sum(1 for s in verified_results if not s["is_match"]),
            "results": verified_results,
            "annotated_document_base64": encode_image_to_base64(annotated_img)
        }
    except Exception as ex:
        raise HTTPException(status_code=500, detail=f"Batch verification failed: {str(ex)}")

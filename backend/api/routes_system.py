from fastapi import APIRouter
from backend.services.model_loader import model_manager

router = APIRouter(prefix="/api", tags=["System & Diagnostic"])

@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "SureSign AI Verification Engine",
        "version": "1.0.0"
    }

@router.get("/model/status")
async def get_model_status():
    """
    Returns diagnostic details about model weight loading.
    Helps the frontend display whether the SNN neural weights are actively mounted.
    """
    return model_manager.get_status()

@router.post("/model/reload")
async def reload_models():
    """
    Reloads the model weights from backend/models/ on-demand without server restart.
    """
    model_manager.reload()
    return {
        "success": True,
        "status": model_manager.get_status()
    }

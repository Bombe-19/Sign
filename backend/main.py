import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from backend.config import STATIC_DIR
from backend.api.routes_verify import router as verify_router
from backend.api.routes_batch import router as batch_router
from backend.api.routes_system import router as system_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s"
)
logger = logging.getLogger("suresign.main")

app = FastAPI(
    title="SureSign API",
    description="Offline Signature Verification & Document Signature Extraction Backend with Siamese CNN",
    version="1.0.0"
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(verify_router)
app.include_router(batch_router)
app.include_router(system_router)

# Mount static folder
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

@app.get("/")
async def root():
    return {
        "app": "SureSign AI Verification Engine",
        "docs": "/docs",
        "endpoints": [
            "/api/verify",
            "/api/extract",
            "/api/batch-verify",
            "/api/model/status"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)

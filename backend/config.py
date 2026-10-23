import os
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR / "models"
UPLOADS_DIR = BASE_DIR / "uploads"
STATIC_DIR = BASE_DIR / "static"

# Ensure runtime directories exist
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
STATIC_DIR.mkdir(parents=True, exist_ok=True)
MODELS_DIR.mkdir(parents=True, exist_ok=True)

# Model file paths
SIAMESE_MODEL_PATH = MODELS_DIR / "siamese_model2.h5"
CNN_MODEL_PATH = MODELS_DIR / "signature_model.h5"

# Image & Model Hyperparameters from Notebook
IMAGE_WIDTH = 256
IMAGE_HEIGHT = 128
SNN_INPUT_SHAPE = (IMAGE_HEIGHT, IMAGE_WIDTH, 1)
CNN_INPUT_SHAPE = (256, 256, 3)

DEFAULT_SIMILARITY_THRESHOLD = 0.6

# Extraction parameters from Notebook
PADDING_FREEHAND = 30
PADDING_BOXED = 20
GAUSSIAN_BLUR_KERNEL = (5, 5)
MORPH_RECT_KERNEL = (7, 7)
CANNY_LOW = 50
CANNY_HIGH = 150

import os
import logging
from typing import Optional, Tuple, Any
import numpy as np
from backend.config import SIAMESE_MODEL_PATH, CNN_MODEL_PATH

logger = logging.getLogger("suresign.model_loader")

# Try to import TensorFlow / Keras
TF_AVAILABLE = False
try:
    import tensorflow as tf
    import tensorflow.keras.backend as K
    from tensorflow.keras.models import load_model
    from keras.saving import register_keras_serializable

    @register_keras_serializable()
    def l1_distance(vectors):
        x, y = vectors
        return K.abs(x - y)

    @register_keras_serializable()
    def euclidean_distance(vectors):
        x, y = vectors
        return K.sqrt(K.sum(K.square(x - y), axis=1, keepdims=True))

    def contrastive_loss(y_true, y_pred):
        margin = 1.0
        return K.mean(
            y_true * K.square(y_pred) + (1 - y_true) * K.square(K.maximum(margin - y_pred, 0))
        )

    CUSTOM_OBJECTS = {
        "l1_distance": l1_distance,
        "euclidean_distance": euclidean_distance,
        "contrastive_loss": contrastive_loss
    }
    TF_AVAILABLE = True
except Exception as e:
    logger.warning(f"TensorFlow not initialized: {e}")
    CUSTOM_OBJECTS = {}


class ModelManager:
    """
    Manages loading and inference for the SureSign Siamese and CNN models.
    """
    def __init__(self):
        self.siamese_model: Optional[Any] = None
        self.cnn_model: Optional[Any] = None
        self.is_siamese_loaded: bool = False
        self.load_error: Optional[str] = None
        self.reload()

    def reload(self):
        """Attempts to load models from the backend/models directory."""
        if not TF_AVAILABLE:
            self.is_siamese_loaded = False
            self.load_error = "TensorFlow is not installed in the current environment."
            logger.info("TensorFlow not installed. Running in heuristic/simulation mode.")
            return

        # Attempt to load Siamese Model
        if SIAMESE_MODEL_PATH.exists() and SIAMESE_MODEL_PATH.stat().st_size > 0:
            try:
                logger.info(f"Loading Siamese model from {SIAMESE_MODEL_PATH}...")
                self.siamese_model = load_model(
                    str(SIAMESE_MODEL_PATH),
                    custom_objects=CUSTOM_OBJECTS,
                    compile=False
                )
                self.is_siamese_loaded = True
                self.load_error = None
                logger.info("Siamese model loaded successfully!")
            except Exception as e:
                self.is_siamese_loaded = False
                self.load_error = f"Failed to load siamese_model2.h5: {str(e)}"
                logger.error(self.load_error)
        else:
            self.is_siamese_loaded = False
            self.load_error = f"Model file not found at {SIAMESE_MODEL_PATH}. Place your trained 'siamese_model2.h5' there."
            logger.warning(self.load_error)

    def predict_similarity(self, tensor_ref: np.ndarray, tensor_target: np.ndarray) -> Tuple[float, str]:
        """
        Runs model prediction on a pair of preprocessed image tensors:
        tensor_ref: shape (1, 128, 256, 1)
        tensor_target: shape (1, 128, 256, 1)

        Returns:
            (distance_score, engine_type)
            distance_score: float in [0.0, 1.0]
            engine_type: 'siamese_neural_network' or 'heuristic_engine'
        """
        if self.is_siamese_loaded and self.siamese_model is not None:
            try:
                # SNN prediction
                pred = self.siamese_model.predict([tensor_ref, tensor_target], verbose=0)
                # Model output is a sigmoid distance score
                score = float(pred[0][0])
                return score, "siamese_neural_network"
            except Exception as ex:
                logger.error(f"Error during SNN inference: {ex}. Falling back to visual structural distance.")

        # Fallback heuristic using structural binary difference if weights not yet mounted
        diff = np.abs(tensor_ref - tensor_target)
        mean_diff = float(np.mean(diff))
        # Scale to an indicative distance score: ~0.05-0.2 for identical/near matches, ~0.7-0.9 for mismatches
        distance_score = min(1.0, mean_diff * 4.5)
        return distance_score, "heuristic_engine (awaiting weights)"

    def get_status(self) -> dict:
        return {
            "tensorflow_available": TF_AVAILABLE,
            "siamese_model_loaded": self.is_siamese_loaded,
            "model_path": str(SIAMESE_MODEL_PATH),
            "file_exists": SIAMESE_MODEL_PATH.exists(),
            "file_size_bytes": SIAMESE_MODEL_PATH.stat().st_size if SIAMESE_MODEL_PATH.exists() else 0,
            "message": "Model ready for neural inference" if self.is_siamese_loaded else (self.load_error or "Awaiting model weights")
        }

# Singleton instance
model_manager = ModelManager()

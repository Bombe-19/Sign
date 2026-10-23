# Model Storage Directory

Place your trained model files in this directory:

1. **`siamese_model2.h5`** (Required for Pairwise & Batch Siamese Signature Verification)
   - Input shape: Two images of (128, 256, 1)
   - Layers: Base CNN + L1 Distance / Euclidean Distance + Dense Sigmoid output.

2. **`signature_model.h5`** (Optional for single-image CNN classification)
   - Input shape: (256, 256, 3)

When SureSign backend starts, it will automatically look for `siamese_model2.h5` in this directory.

import Compressor from 'compressorjs';

export const preprocessImage = async (file, onProgress) => {
  try {
    // First compress the image
    const compressedFile = await compressImage(file);
    
    // Update progress
    onProgress(0.5);
    
    // Return the processed image
    onProgress(1);
    return compressedFile;
  } catch (error) {
    console.error('Error preprocessing image:', error);
    throw new Error('Failed to process image');
  }
};

const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    new Compressor(file, {
      quality: 0.8, // 80% quality
      maxWidth: 1920,
      maxHeight: 1920,
      success(result) {
        resolve(result);
      },
      error(err) {
        console.error('Compression error:', err);
        // If compression fails, return original file
        resolve(file);
      },
    });
  });
};

export const enhanceImageForOCR = async (imageData) => {
  // This is a placeholder for future OCR-specific image enhancements
  return imageData;
}; 
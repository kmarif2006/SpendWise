import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { preprocessImage } from '../../utils/imageProcessing';
import { createWorker } from 'tesseract.js';
import { useDispatch } from 'react-redux';
import { createExpense } from '../../features/expenses/expenseSlice';
import { toast } from 'react-toastify';

function ReceiptUpload({ onClose }) {
  const [processing, setProcessing] = useState(false);
  const [preview, setPreview] = useState(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();

  const onDrop = useCallback(async (acceptedFiles) => {
    try {
      const file = acceptedFiles[0];
      if (!file) return;

      setProcessing(true);
      setError(null);
      
      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      // Process image
      const processedImage = await preprocessImage(file, (progress) => {
        setProgress(Math.round(progress * 100));
      });

      // Handle the processed image...
      console.log('Processed image:', processedImage);
      
    } catch (err) {
      setError(err.message);
      console.error('Error processing receipt:', err);
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">Upload Receipt</h2>
        
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop the receipt here...</p>
          ) : (
            <p>Drag & drop a receipt, or click to select one</p>
          )}
        </div>

        {processing && (
          <div className="mt-4">
            <p>Processing... {progress}%</p>
            <div className="w-full bg-gray-200 rounded">
              <div 
                className="bg-blue-600 h-2 rounded"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 text-red-500">
            Error: {error}
          </div>
        )}

        {preview && !processing && (
          <div className="mt-4">
            <img 
              src={preview} 
              alt="Receipt preview" 
              className="max-w-full h-auto rounded"
            />
          </div>
        )}

        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function extractAmount(text) {
  const amountRegex = /\$?\d+\.\d{2}/;
  const match = text.match(amountRegex);
  return match ? match[0].replace('$', '') : null;
}

function extractDate(text) {
  // Simple date regex - can be improved based on receipt format
  const dateRegex = /\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/;
  const match = text.match(dateRegex);
  return match ? new Date(match[0]).toISOString() : null;
}

function extractDescription(text) {
  // Take first line or first 30 characters
  const firstLine = text.split('\n')[0];
  return firstLine ? firstLine.slice(0, 30) : 'Receipt Expense';
}

export default ReceiptUpload; 

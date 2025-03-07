import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { createWorker } from 'tesseract.js';
import { useDispatch } from 'react-redux';
import { createExpense } from '../../features/expenses/expenseSlice';
import { toast } from 'react-toastify';

function ReceiptUpload({ onClose }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState(null);
  const dispatch = useDispatch();

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Show preview
    setPreview(URL.createObjectURL(file));
    setIsProcessing(true);

    try {
      const worker = await createWorker();
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();

      // Process the text to extract information
      const amount = extractAmount(text);
      const date = extractDate(text);
      const description = extractDescription(text);

      if (amount) {
        dispatch(createExpense({
          amount: parseFloat(amount),
          description: description || 'Receipt Expense',
          date: date || new Date().toISOString(),
          tag: 'Shopping'
        }));
        toast.success('Receipt processed successfully');
        onClose();
      } else {
        toast.error('Could not extract amount from receipt');
      }
    } catch (error) {
      console.error('OCR Error:', error);
      toast.error('Error processing receipt');
    } finally {
      setIsProcessing(false);
    }
  }, [dispatch, onClose]);

  const { getRootProps, getInputProps } = useDropzone({
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
        
        <div {...getRootProps()} className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors">
          <input {...getInputProps()} />
          {preview ? (
            <img src={preview} alt="Receipt preview" className="max-h-48 mx-auto" />
          ) : (
            <p>Drag & drop a receipt image here, or click to select one</p>
          )}
        </div>

        {isProcessing && (
          <div className="mt-4 text-center text-gray-600">
            Processing receipt...
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
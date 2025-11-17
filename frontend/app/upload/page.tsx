'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { uploadReceipt, type UploadResponse } from '@/lib/api';
import { FiUpload, FiFile, FiImage, FiCheckCircle, FiArrowLeft, FiDollarSign } from 'react-icons/fi';

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setResult(null);

      // Create preview (only for images, not PDFs)
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else if (selectedFile.type === 'application/pdf') {
        // For PDFs, show a PDF icon instead
        setPreview(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await uploadReceipt(file);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload receipt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="relative container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-white/90 hover:text-white font-medium mb-6 transition-colors group"
            >
              <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-4 bg-white/20 backdrop-blur-lg rounded-2xl">
                <FiUpload className="text-4xl text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-extrabold text-white drop-shadow-lg">Upload Receipt</h1>
                <p className="text-white/90 mt-2 text-lg">Extract data from your receipt using AI-powered OCR</p>
              </div>
            </div>
          </div>

          {/* Upload Form */}
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 animate-fade-in">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* File Input */}
              <div>
                <label className="block text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FiFile className="text-purple-600" />
                  Select Receipt File
                </label>
                <div className="border-3 border-dashed border-purple-300 rounded-2xl p-8 text-center hover:border-purple-500 hover:bg-purple-50/50 transition-all duration-300 group">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-input"
                    disabled={loading}
                  />
                  <label
                    htmlFor="file-input"
                    className="cursor-pointer block"
                  >
                    {preview ? (
                      <div className="space-y-4">
                        <img
                          src={preview}
                          alt="Preview"
                          className="max-h-80 mx-auto rounded-xl shadow-lg group-hover:scale-105 transition-transform duration-300"
                        />
                        <p className="text-sm text-gray-600 font-medium">{file?.name}</p>
                      </div>
                    ) : file && file.type === 'application/pdf' ? (
                      <div className="space-y-4">
                        <div className="inline-block p-6 bg-red-100 rounded-2xl group-hover:bg-red-200 transition-colors">
                          <FiFile className="text-6xl text-red-600" />
                        </div>
                        <p className="text-lg font-bold text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-600">PDF file ready to upload</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="inline-block p-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl group-hover:from-purple-200 group-hover:to-pink-200 transition-all">
                          <FiImage className="text-6xl text-purple-600" />
                        </div>
                        <div>
                          <p className="text-lg font-bold text-gray-900 mb-2">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-sm text-gray-600">PNG, JPG, GIF, PDF up to 10MB</p>
                        </div>
                      </div>
                    )}
                  </label>
                </div>
                {file && (
                  <p className="mt-3 text-sm text-gray-600 font-medium flex items-center gap-2">
                    <FiFile className="text-purple-600" />
                    Selected: <span className="font-bold">{file.name}</span>
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!file || loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 hover:shadow-2xl flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></span>
                    Processing with AI...
                  </>
                ) : (
                  <>
                    <FiUpload className="text-2xl" />
                    Upload & Process Receipt
                  </>
                )}
              </button>
            </form>

            {/* Error Message */}
            {error && (
              <div className="mt-6 bg-red-50 border-2 border-red-300 text-red-700 px-6 py-4 rounded-xl animate-shake">
                <p className="font-bold text-lg">Error: {error}</p>
              </div>
            )}

            {/* Results */}
            {result && (
              <div className="mt-8 space-y-6 animate-fade-in">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <FiCheckCircle className="text-4xl text-green-600" />
                    <h3 className="text-2xl font-bold text-green-900">Success!</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white rounded-xl p-4">
                      <p className="text-sm font-medium text-gray-600 mb-1">Total Amount Extracted:</p>
                      <div className="flex items-center gap-2">
                        <FiDollarSign className="text-2xl text-green-600" />
                        <p className="text-4xl font-extrabold text-green-700">
                          ${(parseFloat(result.total_amount || '0') || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FiFile className="text-purple-600" />
                    Extracted Text:
                  </h3>
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap max-h-96 overflow-y-auto bg-white p-4 rounded-lg border border-gray-200 font-mono">
                    {result.raw_text}
                  </pre>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setFile(null);
                      setPreview(null);
                      setResult(null);
                      setError(null);
                    }}
                    className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-xl font-bold hover:bg-gray-300 transition-all duration-300 hover:scale-105"
                  >
                    Upload Another
                  </button>
                  <Link
                    href="/"
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 text-center shadow-lg"
                  >
                    View Receipts
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

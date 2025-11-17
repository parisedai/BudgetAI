'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { getReceipts, type Receipt } from '@/lib/api';
import { FiUpload, FiUsers, FiFileText, FiDollarSign, FiCalendar, FiTrendingUp } from 'react-icons/fi';

export default function Home() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReceipts();
  }, []);

  const loadReceipts = async () => {
    try {
      setLoading(true);
      const data = await getReceipts();
      setReceipts(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load receipts');
    } finally {
      setLoading(false);
    }
  };

  const totalSpent = useMemo(() => {
    if (!receipts || receipts.length === 0) return 0;
    try {
      return receipts.reduce((sum, receipt) => {
        const amount = parseFloat(receipt?.total_amount || '0') || 0;
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);
    } catch (error) {
      return 0;
    }
  }, [receipts]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="relative container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header with Animation */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-block p-4 bg-white/20 backdrop-blur-lg rounded-full mb-4">
              <FiFileText className="text-5xl text-white" />
            </div>
            <h1 className="text-6xl font-extrabold text-white mb-3 drop-shadow-lg">
              SplitItUp
            </h1>
            <p className="text-xl text-white/90 font-medium">Smart Receipt Management & Expense Splitting</p>
          </div>

          {/* Stats Cards */}
          {receipts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in">
              <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Receipts</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{receipts.length}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <FiFileText className="text-2xl text-purple-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Spent</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">${totalSpent.toFixed(2)}</p>
                  </div>
                  <div className="p-3 bg-pink-100 rounded-xl">
                    <FiDollarSign className="text-2xl text-pink-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Avg. per Receipt</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      ${receipts.length > 0 ? (totalSpent / receipts.length).toFixed(2) : '0.00'}
                    </p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-xl">
                    <FiTrendingUp className="text-2xl text-orange-600" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10 animate-fade-in">
            <Link
              href="/upload"
              className="group px-8 py-4 bg-white/95 backdrop-blur-lg text-purple-600 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:scale-105 flex items-center justify-center gap-3"
            >
              <FiUpload className="text-2xl group-hover:rotate-12 transition-transform" />
              Upload Receipt
            </Link>
            <Link
              href="/split"
              className="group px-8 py-4 bg-white/95 backdrop-blur-lg text-pink-600 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:scale-105 flex items-center justify-center gap-3"
            >
              <FiUsers className="text-2xl group-hover:scale-110 transition-transform" />
              Split Expenses
            </Link>
          </div>

          {/* Receipts List */}
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <FiFileText className="text-3xl text-purple-600" />
              <h2 className="text-3xl font-bold text-gray-900">Your Receipts</h2>
            </div>

            {loading && (
              <div className="text-center py-16">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
                <p className="mt-4 text-gray-600 font-medium">Loading receipts...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-xl mb-4 animate-shake">
                <p className="font-bold text-lg">Error: {error}</p>
                <button
                  onClick={loadReceipts}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Try again
                </button>
              </div>
            )}

            {!loading && !error && receipts.length === 0 && (
              <div className="text-center py-16 animate-fade-in">
                <div className="inline-block p-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mb-6">
                  <FiFileText className="text-6xl text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No receipts yet</h3>
                <p className="text-gray-600 mb-6">Start by uploading your first receipt!</p>
                <Link
                  href="/upload"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  <FiUpload />
                  Upload Your First Receipt
                </Link>
              </div>
            )}

            {!loading && !error && receipts.length > 0 && (
              <div className="space-y-4">
                {receipts.map((receipt, index) => (
                  <div
                    key={receipt.id}
                    className="group border-2 border-gray-200 rounded-xl p-6 hover:border-purple-400 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-r from-white to-gray-50 animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                            <FiFileText className="text-xl text-purple-600" />
                          </div>
                          <h3 className="font-bold text-xl text-gray-900 group-hover:text-purple-600 transition-colors">
                            {receipt.title || 'Untitled Receipt'}
                          </h3>
                        </div>
                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-2">
                            <FiDollarSign className="text-green-600" />
                            <span className="text-2xl font-bold text-gray-900">
                              ${(parseFloat(receipt.total_amount || '0') || 0).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <FiCalendar />
                            <span className="text-sm">
                              {receipt.created_at ? new Date(receipt.created_at).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full">
                          <FiUsers className="text-purple-600" />
                          <span className="font-bold text-purple-700">
                            {receipt.split_between_people ? Object.keys(receipt.split_between_people).length : 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

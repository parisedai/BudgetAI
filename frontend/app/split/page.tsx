'use client';

import { useState } from 'react';
import Link from 'next/link';
import { splitExpenses, type SplitResponse } from '@/lib/api';
import { FiUsers, FiDollarSign, FiPlus, FiX, FiArrowLeft, FiDivide, FiCheckCircle } from 'react-icons/fi';

interface ExpenseItem {
  name: string;
  amount: string;
}

export default function SplitPage() {
  const [items, setItems] = useState<ExpenseItem[]>([{ name: '', amount: '' }]);
  const [people, setPeople] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SplitResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addItem = () => {
    setItems([...items, { name: '', amount: '' }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof ExpenseItem, value: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const addPerson = () => {
    setPeople([...people, '']);
  };

  const removePerson = (index: number) => {
    setPeople(people.filter((_, i) => i !== index));
  };

  const updatePerson = (index: number, value: string) => {
    const updated = [...people];
    updated[index] = value;
    setPeople(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    // Validate
    const validItems = items.filter(item => item.amount && parseFloat(item.amount) > 0);
    const validPeople = people.filter(p => p.trim() !== '');

    if (validItems.length === 0) {
      setError('Please add at least one item with an amount');
      return;
    }

    if (validPeople.length === 0) {
      setError('Please add at least one person');
      return;
    }

    setLoading(true);

    try {
      const response = await splitExpenses(
        validItems.map(item => ({
          name: item.name || 'Item',
          amount: item.amount,
        })),
        validPeople
      );
      
      // Ensure response has the correct structure
      if (response && response.split) {
        setResult(response);
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to split expenses');
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = items.reduce((sum, item) => {
    const amount = parseFloat(item.amount) || 0;
    return sum + amount;
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="relative container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
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
                <FiDivide className="text-4xl text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-extrabold text-white drop-shadow-lg">Split Expenses</h1>
                <p className="text-white/90 mt-2 text-lg">Calculate fair expense splits between people</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 animate-fade-in">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Items Section */}
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <FiDollarSign className="text-2xl text-emerald-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Expense Items</h2>
                  </div>
                  <button
                    type="button"
                    onClick={addItem}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl font-bold hover:bg-emerald-200 transition-all duration-300 hover:scale-105"
                  >
                    <FiPlus />
                    Add Item
                  </button>
                </div>

                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={index} className="flex gap-3 items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <input
                        type="text"
                        placeholder="Item name (optional)"
                        value={item.name}
                        onChange={(e) => updateItem(index, 'name', e.target.value)}
                        className="flex-1 border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white transition-all"
                      />
                      <div className="relative">
                        <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Amount"
                          value={item.amount}
                          onChange={(e) => updateItem(index, 'amount', e.target.value)}
                          className="w-40 border-2 border-gray-300 rounded-xl pl-10 pr-4 py-3 text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white transition-all"
                          required
                        />
                      </div>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="p-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <FiX className="text-xl" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {totalAmount > 0 && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-xl border-2 border-emerald-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FiDollarSign className="text-2xl text-emerald-700" />
                        <p className="text-sm font-bold text-gray-700">Total Amount:</p>
                      </div>
                      <p className="text-3xl font-extrabold text-emerald-700">${totalAmount.toFixed(2)}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* People Section */}
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal-100 rounded-lg">
                      <FiUsers className="text-2xl text-teal-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">People</h2>
                  </div>
                  <button
                    type="button"
                    onClick={addPerson}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-100 text-teal-700 rounded-xl font-bold hover:bg-teal-200 transition-all duration-300 hover:scale-105"
                  >
                    <FiPlus />
                    Add Person
                  </button>
                </div>

                <div className="space-y-4">
                  {people.map((person, index) => (
                    <div key={index} className="flex gap-3 items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="p-2 bg-teal-100 rounded-lg">
                        <FiUsers className="text-teal-600" />
                      </div>
                      <input
                        type="text"
                        placeholder="Person name"
                        value={person}
                        onChange={(e) => updatePerson(index, e.target.value)}
                        className="flex-1 border-2 border-gray-300 rounded-xl px-4 py-3 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white transition-all"
                        required
                      />
                      {people.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePerson(index)}
                          className="p-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <FiX className="text-xl" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-emerald-700 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 hover:shadow-2xl flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></span>
                    Calculating...
                  </>
                ) : (
                  <>
                    <FiDivide className="text-2xl" />
                    Calculate Split
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
            {result && result.split && (
              <div className="mt-8 animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <FiCheckCircle className="text-4xl text-emerald-600" />
                  <h3 className="text-3xl font-bold text-gray-900">Split Results</h3>
                </div>
                {(() => {
                  const splitEntries = Object.entries(result.split);
                  const totalSplit = splitEntries.reduce((sum, [, amount]) => {
                    const amt = typeof amount === 'number' ? amount : parseFloat(String(amount));
                    return sum + amt;
                  }, 0);
                  
                  return (
                    <>
                      <div className="mb-6 p-6 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-2xl border-2 border-emerald-200">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-bold text-gray-700">Total Amount:</p>
                          <p className="text-3xl font-extrabold text-emerald-700">${totalAmount.toFixed(2)}</p>
                        </div>
                        <p className="text-sm text-gray-600">Split between {splitEntries.length} {splitEntries.length === 1 ? 'person' : 'people'}</p>
                      </div>
                      <div className="space-y-4">
                        {splitEntries.map(([person, amount], index) => {
                          const amt = typeof amount === 'number' ? amount : (parseFloat(String(amount)) || 0);
                          return (
                            <div
                              key={person}
                              className="flex justify-between items-center p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                              style={{ animationDelay: `${index * 0.1}s` }}
                            >
                              <div className="flex items-center gap-3">
                                <div className="p-3 bg-emerald-100 rounded-xl">
                                  <FiUsers className="text-xl text-emerald-600" />
                                </div>
                                <span className="font-bold text-xl text-gray-900">{person}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <FiDollarSign className="text-2xl text-emerald-600" />
                                <span className="text-3xl font-extrabold text-emerald-700">
                                  {amt.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  );
                })()}
                <button
                  onClick={() => {
                    setResult(null);
                    setError(null);
                  }}
                  className="mt-6 w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-xl font-bold hover:bg-gray-300 transition-all duration-300 hover:scale-105"
                >
                  Calculate Another Split
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

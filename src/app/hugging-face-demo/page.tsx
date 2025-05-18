'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';

interface IdentificationResult {
  imageUrl: string;
  enhancedModeUsed: boolean;
  result: {
    suggestions: Array<{
      name: string;
      scientific_name?: string;
      confidence: number;
    }>;
    rawResponse?: string;
  };
}

export default function HuggingFaceDemo() {
  const [imageUrl, setImageUrl] = useState('');
  const [useEnhancedMode, setUseEnhancedMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IdentificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imageUrl.trim()) {
      setError('Please enter an image URL');
      return;
    }
    
    await identifyImage(imageUrl);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setSelectedFile(file);
    
    // Create a preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Please select an image file');
      return;
    }
    
    // Use the data URL for identification
    if (previewUrl) {
      await identifyImage(previewUrl);
    }
  };

  const identifyImage = async (imgUrl: string) => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await fetch(`/api/test-vision?imageUrl=${encodeURIComponent(imgUrl)}&enhancedMode=${useEnhancedMode}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to identify species');
      }
      
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to identify species');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#1A1A1A] text-white">
      <Header />
      
      <div className="container mx-auto py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-[#1DE954] mb-8">iNaturalist Species Identification</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* URL Upload Section */}
            <div className="bg-[#282828] rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-[#1DE954] mb-4">Identify by URL</h2>
              <form onSubmit={handleUrlSubmit} className="space-y-6">
                <div>
                  <label htmlFor="imageUrl" className="block text-gray-300 mb-2">
                    Image URL
                  </label>
                  <input
                    type="text"
                    id="imageUrl"
                    className="w-full p-3 rounded bg-[#333] border border-[#444] text-white focus:outline-none focus:border-[#1DE954]"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    disabled={loading}
                  />
                </div>
                
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#1DE954] text-black font-bold rounded-md hover:bg-[#19C048] transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-[#1DE954] w-full"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Identify Species'}
                </button>
              </form>
            </div>
            
            {/* File Upload Section */}
            <div className="bg-[#282828] rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-[#1DE954] mb-4">Identify by Upload</h2>
              <form onSubmit={handleFileSubmit} className="space-y-6">
                <div>
                  <label htmlFor="imageFile" className="block text-gray-300 mb-2">
                    Upload Image
                  </label>
                  <input
                    type="file"
                    id="imageFile"
                    accept="image/*"
                    className="w-full p-3 rounded bg-[#333] border border-[#444] text-white focus:outline-none focus:border-[#1DE954]"
                    onChange={handleFileChange}
                    disabled={loading}
                  />
                </div>
                
                {previewUrl && (
                  <div className="mb-4">
                    <p className="text-gray-300 mb-2">Preview:</p>
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="max-h-40 max-w-full rounded border border-gray-700"
                    />
                  </div>
                )}
                
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#1DE954] text-black font-bold rounded-md hover:bg-[#19C048] transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-[#1DE954] w-full"
                  disabled={loading || !selectedFile}
                >
                  {loading ? 'Processing...' : 'Identify Species'}
                </button>
              </form>
            </div>
          </div>
          
          <div className="bg-[#282828] rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="enhancedMode"
                className="mr-2 h-4 w-4 accent-[#1DE954]"
                checked={useEnhancedMode}
                onChange={(e) => setUseEnhancedMode(e.target.checked)}
                disabled={loading}
              />
              <label htmlFor="enhancedMode" className="text-gray-300">
                Use enhanced mode (improved identification with scientific names)
              </label>
            </div>
            
            <div className="text-sm text-gray-400">
              <p>Enhanced mode provides more detailed scientific names and higher accuracy identification.</p>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-900/30 border border-red-800 rounded-lg p-6 mb-8 animate-fadeIn">
              <h2 className="text-xl text-red-400 mb-2">Error</h2>
              <p className="text-gray-300">{error}</p>
            </div>
          )}
          
          {result && (
            <div className="bg-[#282828] rounded-lg shadow-lg overflow-hidden animate-fadeIn">
              <div className="p-6">
                <h2 className="text-xl text-[#1DE954] mb-4">Identification Results</h2>
                
                {result.enhancedModeUsed && (
                  <div className="bg-green-900/30 border border-green-800 rounded-lg p-3 mb-4">
                    <p className="text-green-400 text-sm">Using enhanced mode for better results</p>
                  </div>
                )}
                
                <div className="mb-6">
                  <div className="bg-[#222] rounded-lg overflow-hidden mb-4">
                    <img
                      src={result.imageUrl}
                      alt="Analyzed image"
                      className="w-full object-cover max-h-[300px]"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/api/placeholder-image';
                      }}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg text-[#1DE954]">Suggestions:</h3>
                  
                  {result.result.suggestions && result.result.suggestions.length > 0 ? (
                    <div className="space-y-4">
                      {result.result.suggestions.map((suggestion, index) => (
                        <div key={index} className="bg-[#222] rounded-md p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="text-[#1DE954] font-semibold">{suggestion.name}</h4>
                            <span className="text-sm text-white bg-[#1DE954] px-2 py-1 rounded">
                              {Math.round(suggestion.confidence * 100)}% Confidence
                            </span>
                          </div>
                          
                          {suggestion.scientific_name && (
                            <div className="text-gray-400 italic mb-2">
                              Scientific name: {suggestion.scientific_name}
                            </div>
                          )}
                          
                          <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
                            <div 
                              className="bg-[#1DE954] h-2.5 rounded-full transition-all duration-1000"
                              style={{ width: `${Math.round(suggestion.confidence * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">No suggestions available.</p>
                  )}
                  
                  {result.result.rawResponse && (
                    <div className="mt-6 border-t border-gray-700 pt-4">
                      <h3 className="text-lg text-[#1DE954] mb-2">Full AI Response:</h3>
                      <pre className="bg-[#222] p-4 rounded-md text-gray-300 overflow-x-auto whitespace-pre-wrap text-sm">
                        {result.result.rawResponse}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 
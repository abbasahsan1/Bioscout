"use client";

import { useState, FormEvent } from 'react';
import Header from '@/components/Header';
import Button from '@/components/Button';

interface QuestionAnswer {
  id: string;
  question: string;
  answer: string;
}

export default function AskAI() {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<QuestionAnswer[]>([]);
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!question.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ask-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process question');
      }
      
      setResults(prev => [data, ...prev]);
      setQuestion('');
      
    } catch (err) {
      console.error('Error asking question:', err);
      setError((err as Error).message || 'Failed to process your question');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <main className="min-h-screen bg-[#1A1A1A] text-white">
      <Header />
      
      <div className="container mx-auto py-8 px-4 animate-fadeIn">
        <h1 className="text-3xl font-bold text-center mb-8 text-[#1DE954]">
          Ask AI About Islamabad's Biodiversity
        </h1>
        
        <div className="max-w-3xl mx-auto">
          <form 
            className="bg-[#282828] p-6 rounded-lg shadow-lg mb-8" 
            onSubmit={handleSubmit}
          >
            <div className="mb-4">
              <label className="block text-[#1DE954] mb-2" htmlFor="question">
                Your Question
              </label>
              <input
                id="question"
                type="text"
                className="w-full p-3 rounded bg-[#333] text-white"
                placeholder="e.g. What bird species can be found in Margalla Hills?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                required
              />
            </div>
            
            <Button
              type="submit"
              disabled={isLoading || !question.trim()}
              variant="primary"
              className="w-full"
            >
              {isLoading ? 'Processing...' : 'Ask Question'}
            </Button>
            
            {error && (
              <div className="mt-4 p-3 bg-red-500/20 border border-red-500 rounded text-red-200">
                {error}
              </div>
            )}
          </form>
          
          <div className="space-y-6">
            {results.map(result => (
              <div 
                key={result.id} 
                className="bg-[#282828] p-6 rounded-lg shadow-lg animate-fadeIn"
              >
                <h3 className="text-xl font-semibold text-[#1DE954] mb-4">
                  Q: {result.question}
                </h3>
                <div className="pl-4 border-l-2 border-[#1DE954]">
                  <p className="text-gray-300 whitespace-pre-line">{result.answer}</p>
                </div>
              </div>
            ))}
            
            {results.length === 0 && !isLoading && (
              <div className="text-center py-8 text-gray-400">
                <p>Ask a question to get started!</p>
                <p className="mt-2 text-sm">
                  Try asking about local species, conservation efforts, or biodiversity in Islamabad.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
"use client";

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import ObservationCard from '@/components/ObservationCard';
import { Observation } from '@/types';
import { db } from '@/lib/firebase';
import { ref, onValue, query, orderByChild } from 'firebase/database';

export default function Observations() {
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    // Create a real-time listener for observations
    const observationsRef = ref(db, 'observations');
    const observationsQuery = query(observationsRef, orderByChild('created_at'));
    
    // Set up real-time listener
    const unsubscribe = onValue(observationsQuery, (snapshot) => {
      try {
        setLoading(true);
        const observationsList: Observation[] = [];
        
        if (snapshot.exists()) {
          // Convert Firebase object to array
          snapshot.forEach((childSnapshot) => {
            observationsList.push({
              ...childSnapshot.val()
            });
          });
          
          // Sort by created_at in descending order (newest first)
          observationsList.sort((a, b) => {
            const dateA = a.created_at || 0;
            const dateB = b.created_at || 0;
            return dateB - dateA;
          });
          
          setObservations(observationsList);
        } else {
          setObservations([]);
        }
        setError(null);
      } catch (err) {
        console.error('Error processing observations data:', err);
        setError('Failed to load observations. Please try again later.');
      } finally {
        setLoading(false);
      }
    }, (error) => {
      console.error('Database error:', error);
      setError('Failed to connect to the database. Please try again later.');
      setLoading(false);
    });
    
    // Clean up listener when component unmounts
    return () => unsubscribe();
  }, []);
  
  // Filter observations based on search term
  const filteredObservations = observations.filter(obs => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      obs.species_name?.toLowerCase().includes(term) ||
      obs.common_name?.toLowerCase().includes(term) ||
      obs.location?.toLowerCase().includes(term)
    );
  });
  
  return (
    <main className="min-h-screen bg-[#1A1A1A] text-white pt-24">
      <Header />
      
      <div className="container mx-auto py-8 px-4 sm:px-6 animate-fadeIn">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="animate-slideInLeft">
            <h1 className="text-3xl font-bold text-[#1DE954] mb-2">Observations</h1>
            <p className="text-gray-300 text-sm md:text-base">
              {loading ? 'Loading observations...' : `${filteredObservations.length} observations found`}
              {!loading && <span className="ml-2 text-xs text-[#1DE954]">(Updates in real time)</span>}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center animate-slideInRight">
            <div className="relative">
              <input
                type="text"
                placeholder="Search observations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#333] border border-[#444] rounded-md px-4 py-2 w-full sm:w-60 focus:outline-none focus:border-[#1DE954] transition-colors"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
            <a 
              href="/observations/submit" 
              className="bg-[#1DE954] text-black px-4 py-2 rounded-md font-semibold hover:bg-[#19C048] transition-all duration-300 hover:scale-105 flex items-center justify-center"
            >
              + Add Observation
            </a>
          </div>
        </div>
        
        {loading && observations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 animate-pulse-subtle">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1DE954] mb-4"></div>
            <p className="text-gray-400">Loading observations...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-red-900/20 rounded-lg border border-red-900 animate-fadeIn">
            <p className="text-red-400 mb-2">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="text-white underline hover:text-[#1DE954] transition-colors"
            >
              Try again
            </button>
          </div>
        ) : filteredObservations.length === 0 ? (
          <div className="text-center py-12 bg-[#282828] rounded-lg animate-fadeIn">
            {searchTerm ? (
              <div>
                <p className="text-gray-400 mb-4">No observations match your search.</p>
                <button 
                  onClick={() => setSearchTerm('')} 
                  className="px-4 py-2 bg-[#333] text-white rounded-md hover:bg-[#444] transition-colors"
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <div>
                <p className="text-gray-400 mb-4">No observations found. Be the first to contribute!</p>
                <a 
                  href="/observations/submit" 
                  className="inline-block px-6 py-3 bg-[#1DE954] text-black font-bold rounded-md hover:bg-[#19C048] transition-all duration-300 hover:scale-105"
                >
                  Submit an Observation
                </a>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredObservations.map((observation, index) => (
              <ObservationCard 
                key={observation.observation_id}
                observation={observation}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
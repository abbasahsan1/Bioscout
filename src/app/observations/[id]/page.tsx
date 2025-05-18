"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { Observation } from '@/types';
import { db } from '@/lib/firebase';
import { ref, onValue, get } from 'firebase/database';
import { getImageFromDatabase } from '@/lib/database-helpers';

export default function ObservationDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [observation, setObservation] = useState<Observation | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Create a reference to the specific observation
    const observationRef = ref(db, `observations/${id}`);
    
    // Set up real-time listener
    const unsubscribe = onValue(observationRef, async (snapshot) => {
      try {
        setLoading(true);
        
        if (snapshot.exists()) {
          const observationData = snapshot.val() as Observation;
          setObservation(observationData);
          
          // Handle both regular URLs and database-stored images
          const imageUrlValue = observationData.image_url;
          
          // Check if it's a database-stored image
          if (imageUrlValue && imageUrlValue.startsWith('db://')) {
            console.log('Loading image from database storage...');
            getImageFromDatabase(imageUrlValue)
              .then(dataUrl => {
                setImageUrl(dataUrl);
              })
              .catch(err => {
                console.error('Failed to load database image:', err);
                setError('Failed to load image. Please try again later.');
              });
          } else {
            // Regular Firebase Storage URL
            setImageUrl(imageUrlValue);
          }
          
          setError(null);
        } else {
          setObservation(null);
          setError('Observation not found');
        }
      } catch (err) {
        console.error('Error fetching observation details:', err);
        setError('Failed to load observation details. Please try again later.');
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
  }, [id]);
  
  if (loading) {
    return (
      <main className="min-h-screen bg-[#1A1A1A] text-white">
        <Header />
        <div className="container mx-auto py-16 px-4 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1DE954] mb-4"></div>
          <p className="text-gray-400">Loading observation details...</p>
        </div>
      </main>
    );
  }
  
  if (error || !observation) {
    return (
      <main className="min-h-screen bg-[#1A1A1A] text-white">
        <Header />
        <div className="container mx-auto py-16 px-4">
          <div className="max-w-2xl mx-auto bg-[#282828] p-6 rounded-lg shadow-lg animate-fadeIn">
            <h2 className="text-xl text-red-400 mb-4">{error || 'Observation not found'}</h2>
            <button 
              onClick={() => router.push('/observations')}
              className="text-[#1DE954] hover:underline transition-colors"
            >
              &larr; Back to observations
            </button>
          </div>
        </div>
      </main>
    );
  }
  
  // Format the date
  const formattedDate = new Date(observation.date_observed).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return (
    <main className="min-h-screen bg-[#1A1A1A] text-white pt-28">
      <Header />
      
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <button 
          onClick={() => router.push('/observations')}
          className="inline-block mb-6 text-[#1DE954] hover:text-white hover:underline transition-colors group flex items-center animate-slideInLeft"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to all observations
        </button>
        
        <div className="bg-[#282828] rounded-lg shadow-lg overflow-hidden animate-fadeIn">
          <div className="flex flex-col lg:flex-row">
            <div className="lg:w-1/2 relative">
              <div className={`h-[300px] lg:h-full w-full bg-gray-800 flex items-center justify-center ${!imageLoaded ? 'loading-shimmer' : ''}`}>
                {!imageLoaded && !imageUrl && (
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1DE954]"></div>
                )}
              </div>
              {imageUrl && (
                <img 
                  src={imageUrl} 
                  alt={observation.common_name || observation.species_name}
                  className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => {
                    setImageUrl('/api/placeholder-image');
                    setImageLoaded(true);
                  }}
                />
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 lg:hidden">
                <h1 className="text-2xl font-bold text-[#1DE954]">
                  {observation.common_name}
                </h1>
                <p className="text-lg italic text-gray-300">
                  {observation.species_name}
                </p>
              </div>
            </div>
            
            <div className="p-6 lg:w-1/2 lg:max-h-[600px] lg:overflow-y-auto">
              <div className="hidden lg:block animate-slideInRight">
                <div className="flex justify-between items-start">
                  <h1 className="text-3xl font-bold text-[#1DE954] mb-2">
                    {observation.common_name}
                  </h1>
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Live Data</span>
                </div>
                <p className="text-lg italic text-gray-300 mb-6">
                  {observation.species_name}
                </p>
              </div>
              
              <div className="space-y-6 mt-4 lg:mt-0 animate-slideInUp animate-delayed-100">
                <div className="bg-[#222] rounded-lg p-4 transition-transform hover:translate-x-1 hover:shadow-md">
                  <h3 className="text-[#1DE954] font-semibold mb-1">Date Observed</h3>
                  <p className="text-gray-300">{formattedDate}</p>
                </div>
                
                <div className="bg-[#222] rounded-lg p-4 transition-transform hover:translate-x-1 hover:shadow-md animate-delayed-200">
                  <h3 className="text-[#1DE954] font-semibold mb-1">Location</h3>
                  <p className="text-gray-300">{observation.location}</p>
                </div>
                
                <div className="bg-[#222] rounded-lg p-4 transition-transform hover:translate-x-1 hover:shadow-md animate-delayed-300">
                  <h3 className="text-[#1DE954] font-semibold mb-1">Notes</h3>
                  <p className="text-gray-300">{observation.notes || 'No notes provided.'}</p>
                </div>
              </div>
              
              {observation.ai_identification && observation.ai_identification.suggestions && observation.ai_identification.suggestions.length > 0 && (
                <div className="mt-6 border-t border-gray-700 pt-6 animate-slideInUp animate-delayed-400">
                  <h3 className="text-xl font-semibold text-[#1DE954] mb-4">
                    AI Species Identification
                  </h3>
                  
                  <ul className="space-y-2">
                    {observation.ai_identification.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex flex-col p-3 bg-[#222] rounded-md hover:bg-[#333] transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">{suggestion.name}</span>
                          <div className="w-24 bg-gray-700 rounded-full h-2.5">
                            <div 
                              className="bg-[#1DE954] h-2.5 rounded-full transition-all duration-1000"
                              style={{ width: `${Math.round((suggestion.confidence || 0) * 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-400 ml-2">
                            {Math.round((suggestion.confidence || 0) * 100)}%
                          </span>
                        </div>
                        {suggestion.scientific_name && (
                          <span className="text-sm italic text-gray-400 mt-1">
                            {suggestion.scientific_name}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
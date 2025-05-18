"use client";

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Observation } from '@/types';
import { getImageFromDatabase } from '@/lib/database-helpers';

interface ObservationCardProps {
  observation: Observation;
  index?: number;
}

export default function ObservationCard({ observation, index = 0 }: ObservationCardProps) {
  const {
    observation_id,
    species_name,
    common_name,
    date_observed,
    location,
    image_url
  } = observation;
  
  const [resolvedImageUrl, setResolvedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    let isMounted = true;
    
    async function loadImage() {
      if (!isMounted) return;
      
      setIsLoading(true);
      try {
        if (image_url?.startsWith('db-image:')) {
          // Extract image ID from the reference
          const imageId = image_url.split(':')[1];
          const imageData = await getImageFromDatabase(imageId);
          if (imageData && isMounted) {
            setResolvedImageUrl(imageData);
          } else if (isMounted) {
            // Fallback to a placeholder
            setResolvedImageUrl('/api/placeholder-image');
          }
        } else if (isMounted) {
          // Regular URL
          setResolvedImageUrl(image_url);
        }
      } catch (error) {
        console.error('Error loading image:', error);
        if (isMounted) {
          setResolvedImageUrl('/api/placeholder-image');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    
    loadImage();
    
    // Intersection Observer for scroll animation
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-slideInUp');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    
    if (cardRef.current) {
      observer.observe(cardRef.current);
    }
    
    // Cleanup
    return () => {
      isMounted = false;
      if (cardRef.current) observer.unobserve(cardRef.current);
    };
  }, [image_url]);
  
  // Format the date
  const formattedDate = new Date(date_observed).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  
  // Calculate staggered animation delay
  const animDelay = Math.min(index * 100, 400);
  
  return (
    <div 
      ref={cardRef}
      className={`bg-[#282828] rounded-lg overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl opacity-0`}
      style={{ animationDelay: `${animDelay}ms` }}
    >
      <div className="h-48 overflow-hidden relative">
        {isLoading && (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center loading-shimmer">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1DE954]"></div>
          </div>
        )}
        <img 
          src={resolvedImageUrl || '/api/placeholder-image'} 
          alt={common_name || species_name} 
          className={`w-full h-full object-cover transition-transform duration-700 hover:scale-110 ${imageLoaded ? 'image-loaded' : 'image-loading'}`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            if (e.currentTarget.src !== '/api/placeholder-image') {
              e.currentTarget.src = '/api/placeholder-image';
            }
            setImageLoaded(true);
          }}
        />
        <div className="absolute top-0 left-0 bg-black bg-opacity-50 px-2 py-1 m-2 rounded text-xs">
          {formattedDate}
        </div>
      </div>
      
      <div className="p-5 transform transition-transform duration-300">
        <h3 className="text-xl font-bold text-[#1DE954] mb-1 truncate">{common_name}</h3>
        <p className="text-sm italic text-gray-400 mb-3 truncate">{species_name}</p>
        
        {observation.ai_identification ? (
          <p className="text-sm text-gray-400 mb-3">
            AI Identification: {observation.ai_identification?.suggestions?.map((suggestion, index, array) => (
              <span key={index}>
                {suggestion.name} ({Math.round(suggestion.confidence * 100)}%)
                {index < array.length - 1 ? ', ' : ''}
              </span>
            ))}
          </p>
        ) : (
          <p className="text-sm text-gray-400 mb-3">
            AI Identification: Not available yet
          </p>
        )}
        
        <div className="flex items-center space-x-1 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-sm text-gray-300 truncate max-w-[200px]">{location}</span>
        </div>
        
        <Link
          href={`/observations/${observation_id}`}
          className="inline-block px-4 py-2 bg-[#1DE954] text-black font-bold rounded-md hover:bg-[#19C048] transition-all duration-300 hover:scale-105 hover:shadow-lg"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}

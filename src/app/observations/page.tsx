export const dynamic = 'force-dynamic';

import React from 'react';
import Link from 'next/link';
import ObservationCard from '@/components/ObservationCard';
import { Observation } from '@/types';

async function getObservations(): Promise<Observation[]> {
  try {
    // Use absolute URL for server component fetching
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/get-observations`, { 
      cache: 'no-store',
      next: { tags: ['observations'] }
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch observations');
    }
    
    const data = await res.json();
    return data.observations;
  } catch (error) {
    console.error('Error fetching observations:', error);
    return [];
  }
}

const ObservationsPage: React.FC = async () => {
  const observations = await getObservations();
    return (
    <div className="container mx-auto py-8 px-4 mt-16">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-green-600">BioScout Observations</h1>
        <Link href="/observations/submit" className="bg-green-600 hover:bg-green-700 text-white font-medium py-1.5 px-4 rounded-md flex items-center text-sm">
          <span className="mr-1.5">➕</span> Add Observation
        </Link>
      </div>
      
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-green-700 mb-4">Recent Observations</h2>
      </div>
      
      {observations.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow-md">
          <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-500 text-lg mt-4">No observations found. Be the first to add one!</p>
          <Link href="/observations/submit" className="mt-4 inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
            Add Your First Observation
          </Link>
        </div>      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {observations.map((observation, index) => (
            <ObservationCard key={observation.observation_id} observation={observation} index={index} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ObservationsPage;

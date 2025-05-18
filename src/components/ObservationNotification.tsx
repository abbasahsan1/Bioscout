"use client";

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { ref, onChildAdded } from 'firebase/database';
import { Observation } from '@/types';

export default function ObservationNotification() {
  const [newObservation, setNewObservation] = useState<Observation | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [observationCount, setObservationCount] = useState(0);
  
  useEffect(() => {
    const observationsRef = ref(db, 'observations');
    
    // Listen for new observations being added
    const unsubscribe = onChildAdded(observationsRef, (snapshot) => {
      const observation = snapshot.val() as Observation;
      
      // Avoid notifications for initial data load
      if (observationCount === 0) {
        setObservationCount(prev => prev + 1);
        return;
      }
      
      // Only show notification for recent observations (added within the last 30 seconds)
      const observationTimestamp = observation.created_at || Date.now();
      const isRecent = Date.now() - observationTimestamp < 30000; // 30 seconds
      
      if (isRecent) {
        setNewObservation(observation);
        setShowNotification(true);
        
        // Hide notification after 5 seconds
        setTimeout(() => {
          setShowNotification(false);
        }, 5000);
      }
      
      setObservationCount(prev => prev + 1);
    });
    
    return () => unsubscribe();
  }, [observationCount]);
  
  if (!showNotification || !newObservation) return null;
  
  return (
    <div className="fixed bottom-16 right-4 z-50 animate-slideInRight">
      <div className="bg-[#282828] p-4 rounded-md shadow-lg max-w-xs">
        <div className="flex items-start">
          <div className="mr-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-[#1DE954]">New Observation Added</h4>
            <p className="text-xs text-gray-300 mt-1">{newObservation.common_name}</p>
            <p className="text-xs text-gray-400 mt-1">{newObservation.location}</p>
            <a 
              href={`/observations/${newObservation.observation_id}`}
              className="text-xs text-[#1DE954] hover:underline mt-2 inline-block"
            >
              View Details
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';

export default function RealtimeStatus() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
  useEffect(() => {
    // Reference to Firebase connection state
    const connectedRef = ref(db, '.info/connected');
    
    // Listen for changes in connection state
    const unsubscribe = onValue(connectedRef, (snap) => {
      if (snap.val() === true) {
        setIsConnected(true);
        setLastUpdate(new Date());
      } else {
        setIsConnected(false);
      }
    });
    
    return () => unsubscribe();
  }, []);
  
  const getTimeAgo = () => {
    if (!lastUpdate) return '';
    
    const seconds = Math.floor((new Date().getTime() - lastUpdate.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-[#282828] p-2 rounded-md shadow-lg flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span className="text-xs text-gray-300">
          {isConnected ? 'Real-time syncing active' : 'Connection lost'}
          {lastUpdate && isConnected && ` • Last update: ${getTimeAgo()}`}
        </span>
      </div>
    </div>
  );
}

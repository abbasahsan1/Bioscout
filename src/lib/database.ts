import { v4 as uuidv4 } from 'uuid';
import { db, firestore, useRealtimeDb } from './firebase';
import { 
  ref as rtdbRef, 
  set as rtdbSet, 
  push as rtdbPush,
  get as rtdbGet,
  query as rtdbQuery,
  orderByChild,
  limitToLast
} from 'firebase/database';
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp as firestoreTimestamp
} from 'firebase/firestore';
import { Observation } from '@/types';

// Function to get current timestamp in a consistent format
export function getTimestamp() {
  return useRealtimeDb ? Date.now() : firestoreTimestamp();
}

// Add an observation
export async function addObservation(observationData: any) {
  const observation_id = uuidv4();
  const data = {
    ...observationData,
    observation_id,
    created_at: getTimestamp()
  };
  
  if (useRealtimeDb) {
    const newObservationRef = rtdbRef(db, `observations/${observation_id}`);
    await rtdbSet(newObservationRef, data);
    return { observation_id };
  } else {
    const observationsRef = collection(firestore, 'observations');
    await addDoc(observationsRef, data);
    return { observation_id };
  }
}

// Get all observations
export async function getObservations(limitCount = 20) {
  if (useRealtimeDb) {
    const observationsRef = rtdbRef(db, 'observations');
    const observationsQuery = rtdbQuery(
      observationsRef,
      orderByChild('created_at'),
      limitToLast(limitCount)
    );
    
    const snapshot = await rtdbGet(observationsQuery);
    const observations: Observation[] = [];
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      // Convert object to array and reverse for descending order
      Object.keys(data).forEach(key => {
        observations.push(data[key]);
      });
      observations.reverse(); // Most recent first
    }
    
    return observations;
  } else {
    const observationsRef = collection(firestore, 'observations');
    const q = query(
      observationsRef,
      orderBy('created_at', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const observations = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return observations;
  }
}

// Get a specific observation by ID
export async function getObservationById(id: string) {
  if (useRealtimeDb) {
    const observationRef = rtdbRef(db, `observations/${id}`);
    const snapshot = await rtdbGet(observationRef);
    
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return null;
  } else {
    // Implementation for Firestore would go here
    // (For brevity, focusing on Realtime DB implementation)
    return null;
  }
}

// Add a question and answer to the database
export async function addQuestionAnswer(questionData: any) {
  const id = uuidv4();
  const data = {
    ...questionData,
    id,
    timestamp: getTimestamp()
  };
  
  if (useRealtimeDb) {
    const newQuestionRef = rtdbRef(db, `questions/${id}`);
    await rtdbSet(newQuestionRef, data);
    return { id, ...data };
  } else {
    // Implementation for Firestore would go here
    return { id, ...data };
  }
}

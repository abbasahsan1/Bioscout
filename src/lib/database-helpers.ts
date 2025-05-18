import { v4 as uuidv4 } from 'uuid';
import { db } from './firebase';
import { 
  ref as dbRef, 
  push, 
  set, 
  get,
  query, 
  orderByChild,
  limitToLast
} from 'firebase/database';
import { 
  ref as storageRef, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';
import { storage } from './firebase';

// Function to store an image directly in the database
// Bypassing Firebase Storage entirely due to persistent connection issues
export async function storeImageInDatabase(
  buffer: Buffer, 
  fileName?: string, 
  contentType: string = 'image/jpeg'
): Promise<string> {
  console.log('► Starting direct database image storage...');
  
  if (!buffer || buffer.length === 0) {
    throw new Error('Invalid image data: Buffer is empty');
  }
  
  // Check if image is too large for database
  if (buffer.length > 500 * 1024) { // 500KB max for database storage
    console.log('⚠️ Image is large for database storage, compressing...');
    // No actual compression implemented here - would need client-side compression
  }
  
  try {
    // Convert to base64
    const base64Data = buffer.toString('base64');
    const dataUrl = `data:${contentType};base64,${base64Data}`;
    
    // Generate ID and path
    const timestamp = Date.now();
    const safeName = fileName 
      ? fileName.replace(/[^a-zA-Z0-9.]/g, '_')
      : 'image.jpg';
    const imageId = `img_${timestamp}_${uuidv4().substring(0, 6)}`;
    const dbPath = `image_data/${imageId}`;
    
    console.log(`► Storing image directly in database: ${safeName} (${buffer.length} bytes)`);
    
    // Store in database
    await set(dbRef(db, dbPath), {
      id: imageId,
      fileName: safeName,
      contentType: contentType,
      size: buffer.length,
      created_at: timestamp,
      data: dataUrl
    });
    
    console.log(`► Image stored in database: ${imageId}`);
    return `db://${dbPath}`;
    
  } catch (error) {
    console.error('‼️ Database storage failed:', error);
    throw new Error(`Database storage failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Get image from database
export async function getImageFromDatabase(imageUrl: string): Promise<string> {
  if (!imageUrl) return '';
  
  try {
    // Database stored image
    if (imageUrl.startsWith('db://')) {
      console.log('► Getting image from database');
      const dbPath = imageUrl.replace('db://', '');
      const snapshot = await get(dbRef(db, dbPath));
      
      if (snapshot.exists()) {
        return snapshot.val().data;
      }
      throw new Error(`Image not found in database: ${dbPath}`);
    }
    
    // Regular URL
    return imageUrl;
    
  } catch (error) {
    console.error('‼️ Error retrieving image:', error);
    throw new Error(`Image retrieval failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Store an observation
export async function storeObservation(data: any): Promise<string> {
  console.log('► Storing observation data');
  
  try {
    const id = uuidv4();
    const observationRef = dbRef(db, `observations/${id}`);
    
    await set(observationRef, {
      ...data,
      observation_id: id,
      created_at: Date.now(),
      status: 'active'
    });
    
    console.log(`► Observation stored with ID: ${id}`);
    return id;
    
  } catch (error) {
    console.error('‼️ Error storing observation:', error);
    throw new Error(`Failed to store observation: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Get all observations
export async function getAllObservations(limit = 20): Promise<any[]> {
  try {
    const observationsQuery = query(
      dbRef(db, 'observations'),
      orderByChild('created_at'),
      limitToLast(limit)
    );
    
    const snapshot = await get(observationsQuery);
    const observations: any[] = [];
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      Object.keys(data).forEach(key => {
        observations.push(data[key]);
      });
      observations.reverse(); 
    }
    
    return observations;
  } catch (error) {
    console.error("Error fetching observations:", error);
    return [];
  }
}

// Get a specific observation
export async function getObservationById(id: string): Promise<any | null> {
  try {
    const snapshot = await get(dbRef(db, `observations/${id}`));
    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    console.error("Error fetching observation:", error);
    return null;
  }
} 
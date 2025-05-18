import { NextRequest, NextResponse } from 'next/server';
import { storeImageInDatabase, storeObservation } from '@/lib/database-helpers';
import { Observation } from '@/types';
import { identifySpecies } from '@/lib/hugging-face-api';

// Max file size in bytes (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Add timeout functionality to prevent requests hanging indefinitely
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Request timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    })
  ]);
};

// Simple function to handle basic errors
const handleError = (error: unknown, status = 500) => {
  console.error('Error in API route:', error);
  const message = error instanceof Error ? error.message : 'Unknown error occurred';
  return NextResponse.json({ error: 'Failed to process request', details: message }, { status });
};

export async function POST(req: NextRequest) {
  console.log('🔵 Starting observation submission process...');
  
  try {
    // Parse the FormData
    let formData: FormData;
    try {
      formData = await req.formData();
      console.log('✅ FormData parsed successfully');
    } catch (formError) {
      console.error('❌ Failed to parse FormData:', formError);
      return NextResponse.json({ 
        error: 'Failed to parse form data',
        details: formError instanceof Error ? formError.message : 'Unknown error'
      }, { status: 400 });
    }
    
    // Extract form data with validation (let instead of const to allow AI updates)
    let species_name = formData.get('species_name') as string;
    let common_name = formData.get('common_name') as string;
    const date_observed = formData.get('date_observed') as string;
    const location = formData.get('location') as string;
    const notes = formData.get('notes') as string;
    const image = formData.get('image');
    
    console.log('📋 Form data extracted:', { 
      species_name, 
      common_name, 
      date_observed, 
      location,
      imageReceived: !!image
    });
    
    // Validate required fields
    if (!species_name) {
      return NextResponse.json({ error: 'Species name is required' }, { status: 400 });
    }
    
    if (!location) {
      return NextResponse.json({ error: 'Location is required' }, { status: 400 });
    }
    
    // Validate image
    if (!image) {
      console.error('❌ Image missing in submission');
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }
    
    // Check if image is a File (browser) or Blob (other contexts)
    if (!(image instanceof Blob)) {
      console.error('❌ Invalid image type:', typeof image);
      return NextResponse.json({ error: 'Invalid image format' }, { status: 400 });
    }
    
    console.log('📷 Image details:', {
      size: image.size,
      type: image.type || 'unknown'
    });
    
    try {
      // Convert the image to a Buffer
      const imageBuffer = Buffer.from(await image.arrayBuffer());
      console.log('🔄 Image converted to buffer, size:', imageBuffer.length);
      
      // Extract filename
      let fileName: string | undefined;
      if ('name' in image) {
        fileName = (image as File).name;
      }
      
      // Store the image - this will now handle potential fallback to database storage
      console.log('⬆️ Uploading image to storage...');
      const image_url = await storeImageInDatabase(
        imageBuffer,
        fileName,
        image.type || 'image/jpeg'
      );
      
      console.log(`✅ Image stored successfully (URL type: ${image_url.startsWith('db://') ? 'database' : 'storage'})`);
      
      // Use Hugging Face models to identify species
      console.log('🔍 Calling Hugging Face API for species identification...');
      let ai_identification;
      try {
        // Process the image URL to get a publicly accessible URL if needed
        const processedUrl = image_url.startsWith('db://') 
          ? await getPublicUrlForDbImage(image_url) 
          : image_url;
        
        // Use enhanced mode for better species identification in submissions
        ai_identification = await withTimeout(
          identifySpecies(processedUrl, true), // true enables enhanced mode with iNaturalist model for better results
          25000 // 25 second timeout (iNaturalist model might take longer)
        );
        console.log('✅ Species identification successful:', JSON.stringify(ai_identification).substring(0, 100) + '...');
        
        // If the user didn't specify species/common name but AI did, use those values
        if (ai_identification.suggestions && ai_identification.suggestions.length > 0) {
          const topSuggestion = ai_identification.suggestions[0];
          
          // If confidence is high enough, use the AI results
          if (topSuggestion.confidence > 0.7) {
            // If no scientific name provided by user but AI found one
            if (!species_name && topSuggestion.scientific_name) {
              console.log('🤖 Using AI-detected scientific name:', topSuggestion.scientific_name);
              species_name = topSuggestion.scientific_name;
            }
            
            // If no common name provided by user
            if (!common_name && topSuggestion.name) {
              console.log('🤖 Using AI-detected common name:', topSuggestion.name);
              common_name = topSuggestion.name;
            }
          }
        }
      } catch (aiError) {
        console.error('⚠️ AI identification failed:', aiError);
        ai_identification = { 
          suggestions: [{ name: "AI identification failed", confidence: 0 }],
          error: aiError instanceof Error ? aiError.message : String(aiError)
        };
      }
      
      // Store the observation
      console.log('📝 Storing observation data...');
      const observation_id = await storeObservation({
        species_name,
        common_name,
        date_observed,
        location,
        image_url,
        notes,
        ai_identification
      });
      
      console.log('✅ Observation stored successfully with ID:', observation_id);
      
      // Success!
      return NextResponse.json({ 
        message: 'Observation submitted successfully',
        observation_id
      }, { status: 201 });
      
    } catch (storageError) {
      console.error('❌ Storage error:', storageError);
      return NextResponse.json({ 
        error: 'Failed to store data',
        details: storageError instanceof Error ? storageError.message : String(storageError)
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ Unhandled error in API route:', error);
    return NextResponse.json({ 
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// Helper function to get a public URL for database-stored images
async function getPublicUrlForDbImage(dbUrl: string): Promise<string> {
  if (!dbUrl.startsWith('db://')) {
    return dbUrl;
  }
  
  // This is a placeholder for the actual implementation
  // Implement a function that converts a database URL to a publicly accessible URL
  // For example, create a temporary API endpoint that serves the image
  const path = dbUrl.replace('db://', '');
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return `${baseUrl}/api/image/${encodeURIComponent(path)}`;
}

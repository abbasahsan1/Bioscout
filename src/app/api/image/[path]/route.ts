import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, ref, get } from 'firebase/database';
import { db } from '@/lib/firebase';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string } }
) {
  try {
    // Decode the path parameter
    const fullPath = decodeURIComponent(params.path);
    console.log(`🖼️ Retrieving image from database path: ${fullPath}`);
    
    // Get the image data from the database
    const dbRef = ref(getDatabase(), fullPath);
    const snapshot = await get(dbRef);
    
    if (!snapshot.exists()) {
      console.error(`❌ Image not found: ${fullPath}`);
      return new NextResponse('Image not found', { status: 404 });
    }
    
    const imageData = snapshot.val();
    
    if (!imageData || !imageData.data) {
      console.error(`❌ Invalid image data at ${fullPath}`);
      return new NextResponse('Invalid image data', { status: 400 });
    }
    
    // Extract the base64 data
    const dataUrlRegex = /^data:([^;]+);base64,(.+)$/;
    const matches = imageData.data.match(dataUrlRegex);
    
    if (!matches || matches.length !== 3) {
      console.error(`❌ Invalid data URL format at ${fullPath}`);
      return new NextResponse('Invalid data URL format', { status: 400 });
    }
    
    const contentType = matches[1];
    const base64Data = matches[2];
    
    // Convert base64 data to binary
    const binaryData = Buffer.from(base64Data, 'base64');
    
    // Set appropriate headers for image
    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Content-Length', binaryData.length.toString());
    headers.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    
    console.log(`✅ Serving image (${binaryData.length} bytes, ${contentType})`);
    
    // Return the image data
    return new NextResponse(binaryData, {
      status: 200,
      headers
    });
    
  } catch (error) {
    console.error('❌ Error serving image:', error);
    return new NextResponse(
      `Failed to serve image: ${error instanceof Error ? error.message : String(error)}`,
      { status: 500 }
    );
  }
} 
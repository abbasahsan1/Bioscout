import { NextRequest, NextResponse } from 'next/server';
// Import the new Hugging Face implementation instead of Google Vision
import { identifySpecies } from '@/lib/hugging-face-api';

export async function GET(req: NextRequest) {
  try {
    // Get the image URL from the query parameters
    const url = new URL(req.url);
    const imageUrl = url.searchParams.get('imageUrl');
    // Support both parameter names for backwards compatibility
    const useEnhancedMode = url.searchParams.get('enhancedMode') === 'true' || 
                           url.searchParams.get('enhancedPrompt') === 'true';
    
    if (!imageUrl) {
      return NextResponse.json({ 
        error: 'Image URL is required',
        usage: 'Add ?imageUrl=<your-image-url> to test the species identification'
      }, { status: 400 });
    }
    
    console.log('🔍 Testing Hugging Face species identification with image:', imageUrl);
    console.log('Using enhanced mode:', useEnhancedMode);
    
    // Call the identifySpecies function with the enhanced mode option
    const result = await identifySpecies(imageUrl, useEnhancedMode);
    
    // Special handling for local fallback results
    const isLocalFallback = result.rawResponse && 
                           result.rawResponse.includes('from our local database');
    
    if (isLocalFallback) {
      console.log('🔄 Using local fallback suggestions');
      // Even though this is a fallback, return a 200 status as we have valid suggestions
      return NextResponse.json({
        message: 'Species identification completed using local suggestions',
        imageUrl,
        enhancedModeUsed: useEnhancedMode,
        result,
        isLocalFallback: true
      }, { status: 200 });
    }
    
    // Check if we got valid results with suggestions
    if (!result || !result.suggestions || result.suggestions.length === 0) {
      console.warn('⚠️ No species suggestions found in the result.');
      
      // Still return a 200 response, but indicate no suggestions were found
      return NextResponse.json({
        message: 'Species identification completed, but no species could be identified',
        imageUrl,
        enhancedModeUsed: useEnhancedMode,
        result
      }, { status: 200 });
    }
    
    // Return the result
    return NextResponse.json({
      message: 'Species identification completed',
      imageUrl,
      enhancedModeUsed: useEnhancedMode,
      result
    }, { status: 200 });
    
  } catch (error) {
    console.error('❌ Error in species identification:', error);
    
    // Create a more helpful error response
    const errorMessage = error instanceof Error ? error.message : String(error);
    const detailedMessage = errorMessage.includes('all models were unavailable') 
      ? 'The image recognition service is currently unavailable. Please try again later or enter the species information manually.'
      : errorMessage;
    
    return NextResponse.json({ 
      error: 'Failed to identify species',
      details: detailedMessage,
      technicalDetails: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 
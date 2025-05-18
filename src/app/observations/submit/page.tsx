"use client";

import { useState, ChangeEvent, FormEvent, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

// Max file size in bytes (3MB - very strict)
const MAX_FILE_SIZE = 3 * 1024 * 1024;
// Target size for compression (800KB - more aggressive)
const TARGET_FILE_SIZE = 800 * 1024;

// Add this constant for map styling
const mapContainerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '0.5rem',
  marginTop: '0.5rem'
};

export default function SubmitObservation() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    species_name: '',
    common_name: '',
    date_observed: new Date().toISOString().split('T')[0],
    location: '',
    notes: ''
  });
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [identificationResult, setIdentificationResult] = useState<any>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Add map state
  const [mapCenter, setMapCenter] = useState({ lat: 33.6844, lng: 73.0479 }); // Islamabad by default
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Compress image function
  const compressImage = useCallback((file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      setIsCompressing(true);
      
      // If file is already small enough, return it as is
      if (file.size <= TARGET_FILE_SIZE) {
        setIsCompressing(false);
        return resolve(file);
      }
      
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        
        img.onload = () => {
          // Calculate compression ratio based on file size
          let quality = 0.6; // Default quality - more aggressive
          
          // More aggressive compression for larger files
          if (file.size > MAX_FILE_SIZE * 2) {
            quality = 0.3;
          } else if (file.size > MAX_FILE_SIZE) {
            quality = 0.4;
          }
          
          const canvas = document.createElement('canvas');
          // Limit dimensions more aggressively for large images
          const MAX_WIDTH = 1280;
          const MAX_HEIGHT = 960;
          
          // Calculate new dimensions while maintaining aspect ratio
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Try multiple compression passes if needed
          const compressWithQuality = (attemptQuality: number) => {
            canvas.toBlob((blob) => {
              if (!blob) {
                setIsCompressing(false);
                return reject(new Error('Failed to compress image'));
              }
              
              // Create new file from blob
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg', // Force JPEG for better compression
                lastModified: Date.now()
              });
              
              console.log(`Compressed image from ${(file.size / 1024 / 1024).toFixed(2)}MB to ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
              
              // If still too large and quality can be reduced further, try again
              if (compressedFile.size > TARGET_FILE_SIZE && attemptQuality > 0.2) {
                compressWithQuality(attemptQuality - 0.1);
              } else {
                setIsCompressing(false);
                resolve(compressedFile);
              }
            }, 'image/jpeg', attemptQuality); // Always use JPEG for better compression
          };
          
          compressWithQuality(quality);
        };
        
        img.onerror = () => {
          setIsCompressing(false);
          reject(new Error('Failed to load image'));
        };
      };
      
      reader.onerror = () => {
        setIsCompressing(false);
        reject(new Error('Failed to read file'));
      };
    });
  }, []);
  
  // New function to identify the species
  const identifySpecies = async (imageDataUrl: string) => {
    setIsIdentifying(true);
    setError(null);
    
    try {
      // Call the test-vision API with enhanced mode enabled
      console.log('Calling species identification API...');
      const response = await fetch(`/api/test-vision?imageUrl=${encodeURIComponent(imageDataUrl)}&enhancedMode=true`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details || 'Failed to identify species');
      }
      
      const data = await response.json();
      console.log('Species identification API response:', data);
      setIdentificationResult(data.result);
      
      // Check if this is a local fallback result
      const isLocalFallback = data.isLocalFallback || 
                             (data.result.rawResponse && 
                              data.result.rawResponse.includes('from our local database'));
      
      // If we have suggestions, update the form fields
      if (data.result.suggestions && data.result.suggestions.length > 0) {
        const topSuggestion = data.result.suggestions[0];
        
        // For local fallback, show special message
        if (isLocalFallback) {
          setError(`Online identification unavailable. Here are some common species that match your image - click to use.`);
        } 
        // Only auto-fill if confidence is above threshold (70%) and not from local fallback
        else if (topSuggestion.confidence > 0.7 && !isLocalFallback) {
          // Update form data with the identified species
          setFormData(prev => ({
            ...prev,
            // Only update if fields are empty or if confidence is very high (90%)
            species_name: prev.species_name || (topSuggestion.scientific_name || ''),
            common_name: prev.common_name || topSuggestion.name
          }));
          
          setError(`Identified as ${topSuggestion.name} (${Math.round(topSuggestion.confidence * 100)}% confident)`);
        } else {
          // If confidence is low, show suggestions but don't auto-fill
          setError(`Possible species: ${topSuggestion.name} (${Math.round(topSuggestion.confidence * 100)}% confidence) - click to use`);
        }
      } else {
        // No suggestions received
        setError('Unable to identify species in this image. Please enter the details manually or try a different image.');
      }
    } catch (err) {
      console.error('Error identifying species:', err);
      
      // Fallback to local processing if there's a critical API error
      tryLocalFallbackProcessing(imageDataUrl);
    } finally {
      setIsIdentifying(false);
    }
  };
  
  // Local fallback processing when the API fails completely
  const tryLocalFallbackProcessing = (imageDataUrl: string) => {
    try {
      // Set a default suggestion list based on common local species
      const commonSpecies = [
        { name: 'Rock Pigeon', scientific_name: 'Columba livia', confidence: 0.75 },
        { name: 'Grey Francolin', scientific_name: 'Francolinus pondicerianus', confidence: 0.68 },
        { name: 'House Sparrow', scientific_name: 'Passer domesticus', confidence: 0.65 },
        { name: 'Chir Pine', scientific_name: 'Pinus roxburghii', confidence: 0.63 },
        { name: 'Leopard', scientific_name: 'Panthera pardus', confidence: 0.60 }
      ];
      
      setIdentificationResult({
        suggestions: commonSpecies,
        rawResponse: "This is a suggested match from our local database as the identification service was unavailable."
      });
      
      // Show local fallback suggestions message
      setError('Online identification unavailable. Here are some common species in this area - click to use.');
    } catch (localError) {
      console.error('Even local fallback failed:', localError);
      setError('Species identification service is currently unavailable. Please enter the species information manually.');
    }
  };
  
  // Apply a suggestion to the form
  const applySuggestion = (suggestion: any) => {
    setFormData(prev => ({
      ...prev,
      species_name: suggestion.scientific_name || prev.species_name,
      common_name: suggestion.name || prev.common_name
    }));
    
    setError(`Applied: ${suggestion.name} (${Math.round(suggestion.confidence * 100)}% confidence)`);
  };
  
  // Add map click handler
  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      setMarkerPosition({ lat, lng });
      setFormData(prev => ({
        ...prev,
        location: `${lat.toFixed(6)}, ${lng.toFixed(6)} - Islamabad`
      }));
    }
  };
  
  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    if (!file.type.includes('image/')) {
      setError('Please upload an image file');
      return;
    }
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setError(`Image is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Compressing...`);
    }
    
    try {
      // Always compress the image for consistency
      setError('Processing image... please wait.');
      const processedFile = await compressImage(file);
      setImage(processedFile);
      const dataUrl = URL.createObjectURL(processedFile);
      setImagePreview(dataUrl);
      setError(null);
      
      // Show confirmation of file size
      if (processedFile.size > TARGET_FILE_SIZE) {
        setError(`Image processed, but still large (${(processedFile.size / 1024 / 1024).toFixed(2)}MB). Submission may take longer.`);
      }
      
      // Process the image for species identification
      const reader = new FileReader();
      reader.onloadend = () => {
        // Start species identification with the data URL
        identifySpecies(reader.result as string);
      };
      reader.readAsDataURL(processedFile);
      
    } catch (err) {
      console.error('Error processing image:', err);
      setError('Failed to process image. Please try a different file.');
    }
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!image) {
      setError('Please upload an image');
      return;
    }
    
    if (isCompressing) {
      setError('Please wait for image compression to complete');
      return;
    }
    
    if (isIdentifying) {
      setError('Please wait for species identification to complete');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    setUploadProgress(0);
    
    // Simple timeout to prevent getting stuck
    const timeoutId = setTimeout(() => {
      setIsSubmitting(false);
      setError('Request timed out. There might be a server issue. Please try again later.');
    }, 30000);
    
    try {
      const formPayload = new FormData();
      
      // Validate required fields
      if (!formData.species_name.trim()) {
        throw new Error('Species name is required');
      }
      if (!formData.location.trim()) {
        throw new Error('Location is required');
      }
      
      // Add form data to payload
      Object.entries(formData).forEach(([key, value]) => {
        formPayload.append(key, value.trim());
      });
      
      // Add image to payload - log image details to debug
      console.log(`Uploading image: ${image.name}, size: ${image.size} bytes, type: ${image.type}`);
      formPayload.append('image', image);
      
      // Use simple fetch for reliability - avoiding complex XHR
      const response = await fetch('/api/submit-observation', {
        method: 'POST',
        // Don't set Content-Type; browser will set it with boundary for FormData
        body: formPayload
      });
      
      clearTimeout(timeoutId);
      
      // Get response as text first to debug
      const responseText = await response.text();
      console.log('Response text:', responseText);
      
      // Try to parse as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response as JSON:', e);
        throw new Error('Server returned invalid response. Please try again later.');
      }
      
      // Check if the response was not ok
      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to submit observation');
      }
      
      // If we got here, the submission was successful
      setSubmitSuccess(true);
      
      // Clear form data
      setFormData({
        species_name: '',
        common_name: '',
        date_observed: new Date().toISOString().split('T')[0],
        location: '',
        notes: ''
      });
      setImage(null);
      setImagePreview(null);
      
      // Redirect after a brief success message
      setTimeout(() => {
        router.push(`/observations/${data.observation_id}`);
      }, 1500);
      
    } catch (err) {
      clearTimeout(timeoutId);
      console.error('Error submitting observation:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit observation. Please try again.';
      setError(`${errorMessage} (The image is ${image?.size || 0} bytes)`);
      setSubmitSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <main className="min-h-screen bg-[#1A1A1A] text-white pt-20 pb-10">
      <Header />
      
      <div className="container mx-auto py-8 px-4 sm:px-6 animate-fadeIn">
        <h1 className="text-3xl font-bold text-center mb-8 text-[#1DE954]">
          Submit an Observation
        </h1>
        
        <form 
          className="max-w-2xl mx-auto bg-[#282828] p-6 rounded-lg shadow-lg animate-slideInUp" 
          onSubmit={handleSubmit}
        >
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-md text-red-200 animate-fadeIn">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 4a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}
          
          {submitSuccess && (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-500 rounded-md text-green-200 animate-fadeIn">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Observation submitted successfully! Redirecting...
              </div>
            </div>
          )}
          
          {isCompressing && (
            <div className="mb-6 p-4 bg-blue-500/20 border border-blue-500 rounded-md text-blue-200 animate-fadeIn">
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Compressing image... Please wait.
              </div>
            </div>
          )}
          
          {isIdentifying && (
            <div className="mb-6 p-4 bg-blue-500/20 border border-blue-500 rounded-md text-blue-200 animate-fadeIn">
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Identifying species... Please wait.
              </div>
            </div>
          )}
          
          {identificationResult && identificationResult.suggestions && identificationResult.suggestions.length > 0 && (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-500 rounded-md text-green-200 animate-fadeIn">
              <h3 className="font-semibold mb-2">Species Suggestions:</h3>
              <div className="space-y-2">
                {identificationResult.suggestions.slice(0, 3).map((suggestion: any, index: number) => (
                  <div 
                    key={index} 
                    className="flex justify-between items-center p-2 bg-green-500/10 rounded cursor-pointer hover:bg-green-500/30 transition-colors"
                    onClick={() => applySuggestion(suggestion)}
                  >
                    <div>
                      <span className="font-medium">{suggestion.name}</span>
                      {suggestion.scientific_name && (
                        <span className="text-sm italic ml-2">({suggestion.scientific_name})</span>
                      )}
                    </div>
                    <span className="text-xs bg-green-800 px-2 py-1 rounded-full">
                      {Math.round(suggestion.confidence * 100)}%
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs mt-2 text-green-300">Click any suggestion to use it</p>
            </div>
          )}
          
          {uploadProgress > 0 && !submitSuccess && (
            <div className="mb-6">
              <div className="w-full bg-gray-700 rounded-full h-4 mb-2">
                <div 
                  className="bg-[#1DE954] h-4 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-300 text-center">Uploading: {uploadProgress}%</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="transition-all duration-300 hover:translate-x-1 focus-within:translate-x-1">
                <label className="block text-[#1DE954] mb-2 text-sm font-medium" htmlFor="species_name">
                  Species Name (Scientific)
                </label>
                <input
                  id="species_name"
                  name="species_name"
                  type="text"
                  className="w-full p-3 rounded bg-[#333] border border-[#444] text-white focus:outline-none focus:border-[#1DE954] transition-colors"
                  placeholder="e.g. Panthera pardus"
                  value={formData.species_name}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting || isCompressing || isIdentifying}
                />
              </div>
              
              <div className="transition-all duration-300 hover:translate-x-1 focus-within:translate-x-1">
                <label className="block text-[#1DE954] mb-2 text-sm font-medium" htmlFor="common_name">
                  Common Name
                </label>
                <input
                  id="common_name"
                  name="common_name"
                  type="text"
                  className="w-full p-3 rounded bg-[#333] border border-[#444] text-white focus:outline-none focus:border-[#1DE954] transition-colors"
                  placeholder="e.g. Leopard"
                  value={formData.common_name}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting || isCompressing || isIdentifying}
                />
              </div>
              
              <div className="transition-all duration-300 hover:translate-x-1 focus-within:translate-x-1">
                <label className="block text-[#1DE954] mb-2 text-sm font-medium" htmlFor="date_observed">
                  Date Observed
                </label>
                <input
                  id="date_observed"
                  name="date_observed"
                  type="date"
                  className="w-full p-3 rounded bg-[#333] border border-[#444] text-white focus:outline-none focus:border-[#1DE954] transition-colors"
                  value={formData.date_observed}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting || isCompressing || isIdentifying}
                />
              </div>
              
              <div className="transition-all duration-300 hover:translate-x-1 focus-within:translate-x-1">
                <label className="block text-[#1DE954] mb-2 text-sm font-medium" htmlFor="location">
                  Location
                </label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  className="w-full p-3 rounded bg-[#333] border border-[#444] text-white focus:outline-none focus:border-[#1DE954] transition-colors"
                  placeholder="e.g. Margalla Hills, Trail 5"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting || isCompressing || isIdentifying}
                />
                <div className="mt-2 mb-2">
                  <p className="text-sm text-gray-400">Click on the map to set the location:</p>
                  <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
                    <GoogleMap
                      mapContainerStyle={mapContainerStyle}
                      center={mapCenter}
                      zoom={11}
                      onClick={handleMapClick}
                      options={{
                        styles: [
                          {
                            elementType: "geometry",
                            stylers: [{ color: "#242f3e" }]
                          },
                          {
                            elementType: "labels.text.stroke",
                            stylers: [{ color: "#242f3e" }]
                          },
                          {
                            elementType: "labels.text.fill",
                            stylers: [{ color: "#746855" }]
                          }
                        ]
                      }}
                    >
                      {markerPosition && <Marker position={markerPosition} />}
                    </GoogleMap>
                  </LoadScript>
                  {markerPosition && (
                    <p className="text-xs mt-1 text-gray-400">
                      Selected: {markerPosition.lat.toFixed(6)}, {markerPosition.lng.toFixed(6)}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="transition-all duration-300">
                <label className="block text-[#1DE954] mb-2 text-sm font-medium" htmlFor="image">
                  Upload Image
                </label>
                <div className="border-2 border-dashed border-gray-600 rounded-md p-4 text-center hover:border-[#1DE954] transition-colors h-[180px] flex flex-col justify-center items-center cursor-pointer">
                  <input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                    required
                    disabled={isSubmitting || isCompressing || isIdentifying}
                  />
                  <label htmlFor="image" className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                    {imagePreview ? (
                      <div className="relative w-full h-full">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="max-h-full max-w-full mx-auto rounded object-contain"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setImagePreview(null);
                            setImage(null);
                            setIdentificationResult(null);
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                          disabled={isSubmitting || isCompressing || isIdentifying}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-400 text-sm">Click to upload an image</p>
                        <p className="text-gray-500 text-xs mt-1">JPG, PNG, GIF up to 3MB (smaller is better)</p>
                        <p className="text-green-500 text-xs mt-1">Species will be identified automatically!</p>
                      </>
                    )}
                  </label>
                </div>
              </div>
              
              <div className="transition-all duration-300 hover:translate-x-1 focus-within:translate-x-1">
                <label className="block text-[#1DE954] mb-2 text-sm font-medium" htmlFor="notes">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  className="w-full p-3 rounded bg-[#333] border border-[#444] text-white focus:outline-none focus:border-[#1DE954] transition-colors"
                  placeholder="Add any additional details about your observation..."
                  value={formData.notes}
                  onChange={handleChange}
                  disabled={isSubmitting || isCompressing || isIdentifying}
                ></textarea>
              </div>
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full mt-6 bg-[#1DE954] text-black font-semibold py-3 px-6 rounded hover:bg-[#1DE954]/90 focus:outline-none focus:ring-2 focus:ring-[#1DE954] focus:ring-offset-2 focus:ring-offset-[#282828] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            disabled={isSubmitting || isCompressing || isIdentifying}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {uploadProgress > 0 ? `Uploading... ${uploadProgress}%` : 'Submitting...'}
              </div>
            ) : isCompressing ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Compressing Image...
              </div>
            ) : isIdentifying ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Identifying Species...
              </div>
            ) : 'Submit Observation'}
          </button>
        </form>
      </div>
    </main>
  );
}

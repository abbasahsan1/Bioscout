'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firestore, storage } from '@/lib/firebase';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';

type FormData = {
  species_name: string;
  common_name: string;
  date_observed: string;
  location: string;
  notes: string;
};

export default function NewObservationPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setUploadedImage(file);
      
      // Create a preview URL
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      
      // Clean up the preview URL when component unmounts
      return () => URL.revokeObjectURL(objectUrl);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: 1,
    multiple: false
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      let imageUrl = '';
      
      // Upload image if one was provided
      if (uploadedImage) {
        const storageRef = ref(storage, `observations/${Date.now()}_${uploadedImage.name}`);
        await uploadBytes(storageRef, uploadedImage);
        imageUrl = await getDownloadURL(storageRef);
      }
      
      // Add document to Firestore
      const docRef = await addDoc(collection(firestore, 'observations'), {
        ...data,
        image_url: imageUrl,
        created_at: new Date().toISOString(),
      });
      
      // Redirect to the observation detail page
      router.push(`/observations/${docRef.id}`);
    } catch (err) {
      console.error('Error submitting observation:', err);
      setError('An error occurred while submitting your observation. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-[#282828] p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#1DE954]">
            <Link href="/">BioScout Islamabad</Link>
          </h1>
          <nav>
            <ul className="flex space-x-6">
              <li><Link href="/" className="text-white hover:text-[#1DE954]">Home</Link></li>
              <li><Link href="/observations" className="text-white hover:text-[#1DE954] border-b-2 border-[#1DE954]">Observations</Link></li>
              <li><Link href="/ask" className="text-white hover:text-[#1DE954]">Ask AI</Link></li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="mb-6">
          <Link href="/observations" className="text-[#1DE954] hover:underline flex items-center">
            <span>← Back to Observations</span>
          </Link>
        </div>

        <div className="card p-6 max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Submit New Observation</h1>
          
          {error && (
            <div className="bg-red-900 text-white p-4 rounded mb-6">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="species_name" className="block text-[#CCCCCC] mb-2">Scientific Name *</label>
                <input
                  id="species_name"
                  type="text"
                  className="input-field w-full"
                  placeholder="e.g. Pinus roxburghii"
                  {...register('species_name', { required: 'Scientific name is required' })}
                />
                {errors.species_name && (
                  <p className="text-red-500 mt-1">{errors.species_name.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="common_name" className="block text-[#CCCCCC] mb-2">Common Name</label>
                <input
                  id="common_name"
                  type="text"
                  className="input-field w-full"
                  placeholder="e.g. Chir Pine"
                  {...register('common_name')}
                />
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="date_observed" className="block text-[#CCCCCC] mb-2">Date Observed *</label>
                <input
                  id="date_observed"
                  type="date"
                  className="input-field w-full"
                  {...register('date_observed', { required: 'Date is required' })}
                />
                {errors.date_observed && (
                  <p className="text-red-500 mt-1">{errors.date_observed.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="location" className="block text-[#CCCCCC] mb-2">Location *</label>
                <input
                  id="location"
                  type="text"
                  className="input-field w-full"
                  placeholder="e.g. Margalla Hills, Trail 5"
                  {...register('location', { required: 'Location is required' })}
                />
                {errors.location && (
                  <p className="text-red-500 mt-1">{errors.location.message}</p>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-[#CCCCCC] mb-2">Image</label>
              <div 
                {...getRootProps()} 
                className={`border-2 border-dashed ${isDragActive ? 'border-[#1DE954]' : 'border-[#555555]'} rounded-md p-6 text-center cursor-pointer hover:border-[#1DE954] transition-colors`}
              >
                <input {...getInputProps()} />
                {previewUrl ? (
                  <div className="flex flex-col items-center">
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="max-h-[200px] max-w-full mb-4 rounded" 
                    />
                    <p className="text-[#CCCCCC]">Click or drag to replace</p>
                  </div>
                ) : (
                  <div className="text-[#CCCCCC]">
                    <p>Drag and drop an image here, or click to select</p>
                    <p className="text-sm mt-2">(JPEG, PNG, GIF)</p>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="notes" className="block text-[#CCCCCC] mb-2">Notes</label>
              <textarea
                id="notes"
                rows={4}
                className="input-field w-full"
                placeholder="Additional observations, habitat details, behavior, etc."
                {...register('notes')}
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-4 pt-4">
              <Link href="/observations" className="btn-secondary">
                Cancel
              </Link>
              <button 
                type="submit" 
                className="btn-primary" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Observation'}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#1A1A1A] py-8 px-4 border-t border-[#555555]">
        <div className="container mx-auto text-center">
          <p className="text-[#CCCCCC] mb-2">
            BioScout Islamabad - Supporting UN SDGs 15 (Life on Land) and 13 (Climate Action)
          </p>
          <p className="text-[#999999] text-sm">
            © 2023 BioScout Islamabad. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase'; // Changed db to firestore
import { collection, getDocs, query, where } from 'firebase/firestore';

export async function GET() {
  try {
    const observationsRef = collection(firestore, 'observations'); // Changed db to firestore
    const allObservationsSnapshot = await getDocs(observationsRef);
    
    // Count observations by species category
    const speciesCategories = {
      mammals: 0,
      birds: 0,
      plants: 0,
      reptiles: 0,
      insects: 0,
      others: 0
    };
    
    // Categories keywords for classification
    const categoryKeywords = {
      mammals: ['mammal', 'leopard', 'monkey', 'deer', 'squirrel', 'boar', 'fox', 'jackal'],
      birds: ['bird', 'vulture', 'eagle', 'hawk', 'sparrow', 'bulbul', 'parrot', 'parakeet', 'owl'],
      plants: ['plant', 'tree', 'flower', 'shrub', 'herb', 'grass', 'pine', 'oak'],
      reptiles: ['reptile', 'snake', 'cobra', 'viper', 'lizard', 'crocodile', 'turtle'],
      insects: ['insect', 'butterfly', 'moth', 'beetle', 'ant', 'bee', 'wasp', 'spider']
    };
    
    // Count observations by location
    const locationCounts: Record<string, number> = {};
    
    // Process all observations
    allObservationsSnapshot.forEach(doc => {
      const data = doc.data();
      
      // Count by location
      const location = data.location;
      if (location) {
        locationCounts[location] = (locationCounts[location] || 0) + 1;
      }
      
      // Categorize by species type
      const speciesName = (data.species_name || '').toLowerCase();
      const commonName = (data.common_name || '').toLowerCase();
      const combinedName = speciesName + ' ' + commonName;
      
      let categorized = false;
      for (const [category, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some(keyword => combinedName.includes(keyword))) {
          speciesCategories[category as keyof typeof speciesCategories]++;
          categorized = true;
          break;
        }
      }
      
      if (!categorized) {
        speciesCategories.others++;
      }
    });
    
    // Get top locations (limited to top 5)
    const topLocations = Object.entries(locationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([location, count]) => ({ location, count }));
    
    return NextResponse.json({
      total_observations: allObservationsSnapshot.size,
      categories: speciesCategories,
      top_locations: topLocations
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error generating observation statistics:', error);
    return NextResponse.json({ error: 'Failed to generate statistics' }, { status: 500 });
  }
}

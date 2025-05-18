import axios from 'axios';
import { firestore } from './firebase'; // Changed db to firestore
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { speciesDatabase, speciesDescriptions } from './species-database'; // Import the species database

// Set a timeout for API requests
const API_TIMEOUT = 6000; // 6 seconds

// Extract keywords from a question for search
function extractKeywords(question: string): string[] {
  return question.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(' ')
    .filter(word => word.length > 3)
    .filter(word => !['what', 'when', 'where', 'which', 'does', 'how', 'many', 'much', 'with', 'that', 'this', 'have', 'from'].includes(word));
}

// Check if the question is specifically about Margalla Hills wildlife
function isMargallaWildlifeQuestion(question: string): boolean {
  const lowerQuestion = question.toLowerCase();
  const margallaTerms = ['margalla', 'hills', 'islamabad', 'park', 'national'];
  const wildlifeTerms = ['wildlife', 'species', 'animal', 'bird', 'plant', 'tree', 'mammal', 'reptile', 'insect'];
  
  return (
    margallaTerms.some(term => lowerQuestion.includes(term)) &&
    wildlifeTerms.some(term => lowerQuestion.includes(term))
  );
}

// Find relevant species information from our database
function findRelevantSpeciesInfo(question: string): string[] {
  const lowerQuestion = question.toLowerCase();
  const relevantInfo: string[] = [];
  
  // Look for mentions of specific species types
  const speciesTypes = {
    birds: ['bird', 'avian', 'flying', 'feather', 'pigeon', 'eagle', 'owl', 'sparrow'],
    mammals: ['mammal', 'animal', 'leopard', 'bear', 'monkey', 'porcupine', 'fox'],
    plants: ['plant', 'tree', 'flora', 'vegetation', 'pine', 'oak', 'forest'],
    reptiles: ['reptile', 'snake', 'lizard', 'cobra', 'viper']
  };
  
  // Check for species types in the question
  let speciesTypeMatches: string[] = [];
  for (const [type, keywords] of Object.entries(speciesTypes)) {
    if (keywords.some(keyword => lowerQuestion.includes(keyword))) {
      speciesTypeMatches.push(type);
    }
  }
  
  // If no specific type is mentioned, consider all types
  if (speciesTypeMatches.length === 0) {
    speciesTypeMatches = Object.keys(speciesTypes);
  }
  
  // The species database is imported from species-database.ts file
  if (speciesDatabase) {
    // Check for mentions of specific species in the question
    for (const [scientific, common] of Object.entries(speciesDatabase)) {
      const lowerScientific = scientific.toLowerCase();
      const lowerCommon = common.toLowerCase();
      
      if (lowerQuestion.includes(lowerScientific) || lowerQuestion.includes(lowerCommon)) {
        // Add the species description if available, otherwise just add basic info
        if (speciesDescriptions && speciesDescriptions[scientific]) {
          relevantInfo.push(speciesDescriptions[scientific]);
        } else {
          relevantInfo.push(`${common} (${scientific}) is a species found in Margalla Hills National Park.`);
        }
      }
    }
  }
  
  return relevantInfo;
}

// Safe Firestore query with timeout
async function safeFirestoreQuery(queryRef: any): Promise<any[]> {
  try {
    // Create a promise that rejects after the timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      const id = setTimeout(() => {
        clearTimeout(id);
        reject(new Error('Firestore query timed out'));
      }, API_TIMEOUT);
    });

    // Race between the query and the timeout
    const result = await Promise.race([
      getDocs(queryRef),
      timeoutPromise
    ]) as any;
    
    // If we get here, the query succeeded within the timeout
    return result.docs || [];
  } catch (error) {
    console.error('Firestore query error or timeout:', error);
    return []; // Return empty array on error
  }
}

// Retrieve relevant context from knowledge base and observations
async function retrieveContext(question: string): Promise<string> {
  const keywords = extractKeywords(question);
  
  try {
    // First, check if this is specifically about Margalla Hills wildlife
    // and try to get information from our species database
    if (isMargallaWildlifeQuestion(question)) {
      const speciesInfo = findRelevantSpeciesInfo(question);
      if (speciesInfo.length > 0) {
        return speciesInfo.join('\n\n');
      }
    }
    
    // Get relevant knowledge base snippets with timeout safety
    const knowledgeBaseSnippets: string[] = [];
    const knowledgeBaseRef = collection(firestore, 'knowledge_base');
    
    // Use Promise.all to run all keyword queries in parallel with timeout
    const keywordQueries = keywords.map(async (keyword) => {
      try {
        const q = query(knowledgeBaseRef, where('tags', 'array-contains', keyword));
        const docs = await safeFirestoreQuery(q);
        
        return docs.map(doc => doc.data().content);
      } catch (error) {
        console.error(`Error querying for keyword ${keyword}:`, error);
        return [];
      }
    });
    
    // Wait for all queries to complete or timeout
    const allResults = await Promise.all(keywordQueries);
    allResults.forEach(results => {
      knowledgeBaseSnippets.push(...results);
    });
    
    // Get relevant observation notes with timeout safety
    const observationNotes: string[] = [];
    const observationsRef = collection(firestore, 'observations');
    
    // First try direct keyword matches
    const observationQueries = keywords.map(async (keyword) => {
      try {
        const q = query(
          observationsRef, 
          where('notes', '>=', keyword), 
          where('notes', '<=', keyword + '\uf8ff')
        );
        const docs = await safeFirestoreQuery(q);
        
        return docs.map(doc => {
          const data = doc.data();
          return `Observation of ${data.common_name} (${data.species_name}) at ${data.location}: ${data.notes}`;
        });
      } catch (error) {
        console.error(`Error querying observations for keyword ${keyword}:`, error);
        return [];
      }
    });
    
    // Wait for all observation queries to complete or timeout
    const allObservationResults = await Promise.all(observationQueries);
    allObservationResults.forEach(results => {
      observationNotes.push(...results);
    });
    
    // If no direct matches, add some recent observations
    if (observationNotes.length === 0) {
      try {
        const recentQuery = query(
          observationsRef,
          orderBy('created_at', 'desc'),
          limit(3)
        );
        
        const docs = await safeFirestoreQuery(recentQuery);
        
        docs.forEach(doc => {
          const data = doc.data();
          observationNotes.push(`Recent observation of ${data.common_name} (${data.species_name}) at ${data.location}: ${data.notes}`);
        });
      } catch (error) {
        console.error('Error fetching recent observations:', error);
      }
    }
    
    // Combine all context
    const allContext = [...knowledgeBaseSnippets, ...observationNotes];
    
    if (allContext.length === 0) {
      // If no specific context found, return the default Margalla Hills information
      return getMargallaHillsContext();
    }
    
    return allContext.join('\n\n');
    
  } catch (error) {
    console.error('Error retrieving context:', error);
    // Return the default Margalla Hills information in case of error
    return getMargallaHillsContext();
  }
}

// Default context about Margalla Hills biodiversity - enhanced with specific details
function getMargallaHillsContext(): string {
  return `
    Margalla Hills National Park in Islamabad hosts over 600 plant species, 250 bird species, 38 mammals, and 13 reptile species. It's the city's primary habitat for local wildlife and offers important ecological services.
    
    Notable bird species in Margalla Hills include Rock Pigeon (Columba livia), Eurasian Collared-Dove (Streptopelia decaocto), House Sparrow (Passer domesticus), Common Myna (Acridotheres tristis), Rose-ringed Parakeet (Psittacula krameri), Spotted Owlet (Athene brama), and Hoopoe (Upupa epops).
    
    Mammal species found in the region include Persian Leopard (Panthera pardus saxicolor), Asiatic Black Bear (Ursus thibetanus), Indian Crested Porcupine (Hystrix indica), Bengal Fox (Vulpes bengalensis), Rhesus Macaque (Macaca mulatta), Indian Grey Mongoose (Herpestes edwardsii), and Golden Jackal (Canis aureus).
    
    The vegetation includes trees such as Chir Pine (Pinus roxburghii), Phulai (Acacia modesta), Shisham (Dalbergia sissoo), Chinaberry Tree (Melia azedarach), and Orchid Tree (Bauhinia variegata).
    
    The park experiences a subtropical highland climate with five distinct seasons, supporting diverse ecological niches.
  `;
}

// Generate answer using Hugging Face API
export async function generateAnswer(question: string): Promise<string> {
  try {
    // Get context relevant to the question
    const context = await retrieveContext(question);
    
    // Check for specific species in the question directly
    if (question.toLowerCase().includes('cheetah') || question.toLowerCase().includes('acinonyx')) {
      // Direct response for cheetah questions to avoid API call
      return 'Cheetahs (Acinonyx jubatus) are not native to or found in Margalla Hills National Park or Pakistan. The big cats present in Margalla Hills include the Common Leopard (Panthera pardus) and occasionally the Persian Leopard (Panthera pardus saxicolor). Cheetahs historically ranged across parts of the Indian subcontinent but are now extinct in the region.';
    }
    
    // Call Hugging Face API for answer generation with timeout
    try {
      const response = await axios.post(
        'https://api-inference.huggingface.co/models/google/flan-t5-xl',
        {
          inputs: `
Context information specifically about the wildlife of Margalla Hills National Park. This includes its native mammals, birds, reptiles, insects, and plant biodiversity. Focus on ecological significance, conservation status, and species-specific data related to Margalla Hills National Park.
${context}

Question: ${question}

Strictly adhere to the following: 
1. If the question is about the wildlife of Margalla Hills National Park (including its flora, fauna, ecological significance, conservation status, or species-specific data) AND the provided context contains relevant information, provide a detailed and accurate answer based ONLY on the context.
2. If the question is about Margalla Hills National Park but the context does NOT provide relevant information to answer it, respond with: "The provided information does not contain specific details to answer your question about Margalla Hills National Park's wildlife. I can only provide information based on the available knowledge."
3. If the question is NOT about the wildlife of Margalla Hills National Park, respond with: "I can only provide information about the wildlife of Margalla Hills National Park (mammals, birds, reptiles, insects, and plant biodiversity)."

Answer:
`
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: API_TIMEOUT // Add timeout to axios request
        }
      );
      
      // Handle different response formats from Hugging Face
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data[0].generated_text || fallbackAnswerGeneration(question);
      } else if (typeof response.data === 'string') {
        return response.data || fallbackAnswerGeneration(question);
      } else if (response.data.generated_text) {
        return response.data.generated_text || fallbackAnswerGeneration(question);
      } else {
        // If response format is unexpected, fall back to offline answers
        console.log('Unexpected API response format, using fallback');
        return fallbackAnswerGeneration(question);
      }
    } catch (apiError) {
      console.error('Error or timeout calling Hugging Face API:', apiError);
      // Falls through to the fallback answer
      return fallbackAnswerGeneration(question);
    }
    
  } catch (error) {
    console.error('Error generating answer:', error);
    // Fall back to the offline answers if API call fails
    return fallbackAnswerGeneration(question);
  }
}

// Fallback answer generation using offline system when API fails
function fallbackAnswerGeneration(question: string): string {
  try {
    // Import the offline answer generator
    const { generateDefaultAnswer } = require('./offline-answers');
    return generateDefaultAnswer(question);
  } catch (error) {
    console.error('Error in fallback answer generation:', error);
    return "I can only provide information about the wildlife of Margalla Hills National Park based on available knowledge.";
  }
}

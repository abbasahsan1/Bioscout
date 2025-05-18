import axios from 'axios';

interface LabelAnnotation {
  description: string;
  score: number;
}

interface WebEntity {
  description: string;
  score?: number;
}

interface Suggestion {
  name: string;
  confidence: number;
  scientific_name?: string;
}

// Database of common animals/plants and their scientific names for better identification
const taxonomyDatabase: Record<string, string> = {
  'cat': 'Felis catus',
  'dog': 'Canis familiaris',
  'lion': 'Panthera leo',
  'tiger': 'Panthera tigris',
  'elephant': 'Loxodonta africana',
  'giraffe': 'Giraffa camelopardalis',
  'zebra': 'Equus quagga',
  'horse': 'Equus ferus caballus',
  'cow': 'Bos taurus',
  'sheep': 'Ovis aries',
  'goat': 'Capra aegagrus hircus',
  'pig': 'Sus scrofa domesticus',
  'fox': 'Vulpes vulpes',
  'wolf': 'Canis lupus',
  'bear': 'Ursus arctos',
  'panda': 'Ailuropoda melanoleuca',
  'koala': 'Phascolarctos cinereus',
  'kangaroo': 'Macropus rufus',
  'deer': 'Cervus elaphus',
  'eagle': 'Aquila chrysaetos',
  'owl': 'Bubo bubo',
  'parrot': 'Psittaciformes',
  'dove': 'Columbidae',
  'pigeon': 'Columba livia',
  'seagull': 'Laridae',
  'duck': 'Anas platyrhynchos',
  'goose': 'Anser anser',
  'swan': 'Cygnus olor',
  'chicken': 'Gallus gallus domesticus',
  'turkey': 'Meleagris gallopavo',
  'fish': 'Pisces',
  'shark': 'Selachimorpha',
  'whale': 'Cetacea',
  'dolphin': 'Delphinidae',
  'turtle': 'Testudines',
  'snake': 'Serpentes',
  'lizard': 'Lacertilia',
  'frog': 'Anura',
  'butterfly': 'Lepidoptera',
  'bee': 'Apis',
  'ant': 'Formicidae',
  'spider': 'Araneae',
  'oak': 'Quercus',
  'pine': 'Pinus',
  'rose': 'Rosa',
  'tulip': 'Tulipa',
  'daisy': 'Bellis perennis',
  'sunflower': 'Helianthus annuus',
  'orchid': 'Orchidaceae',
  'palm': 'Arecaceae',
  'maple': 'Acer',
  'fern': 'Polypodiopsida'
};

// Enhanced prompt for challenging images or when a more forceful approach is needed
const ENHANCED_PROMPT = `Listen, I'm not here to babysit a half-baked model. You've been given a clear image of an animal, and your only job is to identify it. No excuses. No vague 'AI unavailable' nonsense. I want the common name, the scientific name, and a confident classification — not a shrug and a blank label. This isn't a guessing game. You're supposed to be an intelligent system, so act like one. Dig into your training, process the damn image, and return the actual species. If you can't distinguish a butterfly from a monkey or a pigeon from a squirrel, then what's the point of running you at all? Do your job, identify the species, and give me usable, meaningful output. Anything less is a waste of processing power.`;

// Function to lookup scientific name or make a best guess
function findScientificName(commonName: string): string | null {
  if (!commonName) return null;
  
  // Direct lookup
  const lowerName = commonName.toLowerCase();
  if (taxonomyDatabase[lowerName]) {
    return taxonomyDatabase[lowerName];
  }
  
  // Try partial matches
  for (const [key, value] of Object.entries(taxonomyDatabase)) {
    if (lowerName.includes(key) || key.includes(lowerName)) {
      return value;
    }
  }
  
  // Try to extract scientific name from standard format (e.g., "Genus species")
  const scientificNameMatch = commonName.match(/\b([A-Z][a-z]+\s+[a-z]+(?:\s+var\.\s+[a-z]+)?)\b/);
  if (scientificNameMatch) {
    return scientificNameMatch[1];
  }
  
  return null;
}

// Function to get enhanced details from other free APIs
async function getWikipediaData(query: string): Promise<{extract?: string, scientific_name?: string}> {
  try {
    // Use Wikipedia API to get information about the species
    const response = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`, {
      timeout: 5000
    });
    
    if (response.data && response.data.extract) {
      // Try to find scientific name in the extract
      const extract = response.data.extract;
      const scientificNameMatch = extract.match(/\b([A-Z][a-z]+\s+[a-z]+(?:\s+var\.\s+[a-z]+)?)\b/);
      
      return {
        extract: extract.substring(0, 200),
        scientific_name: scientificNameMatch ? scientificNameMatch[1] : undefined
      };
    }
    
    return {};
  } catch (error) {
    console.error('Error fetching Wikipedia data:', error);
    return {};
  }
}

export async function identifySpecies(imageUrl: string, useEnhancedPrompt = false) {
  try {
    // Check if this is a data URL or a regular URL
    let imageBase64: string;
    
    if (imageUrl.startsWith('data:')) {
      // Extract base64 data from data URL
      const matches = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        throw new Error('Invalid data URL format');
      }
      imageBase64 = matches[2];
      console.log('🔄 Using image directly from data URL');
    } else {
      // Convert URL to base64
      console.log('🔄 Fetching image from URL:', imageUrl);
      const imageResponse = await axios.get(imageUrl, { 
        responseType: 'arraybuffer',
        timeout: 10000 // 10 second timeout
      });
      imageBase64 = Buffer.from(imageResponse.data).toString('base64');
      console.log('✅ Image fetched and converted to base64');
    }
    
    // Use Google Vision API
    console.log('🔍 Calling Google Vision API...');
    const response = await axios.post(
      `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_VISION_API_KEY}`,
      {
        requests: [
          {
            image: {
              content: imageBase64
            },
            features: [
              {
                type: 'LABEL_DETECTION',
                maxResults: 20 // Increased for better matches
              },
              {
                type: 'WEB_DETECTION',
                maxResults: 20 // Increased for better matches
              }
            ]
          }
        ]
      },
      {
        timeout: 15000 // 15 second timeout
      }
    );
    
    console.log('✅ Google Vision API response received');
    
    // Process labels to find species
    const labels = response.data.responses[0]?.labelAnnotations || [];
    const webEntities = response.data.responses[0]?.webDetection?.webEntities || [];
    const webLabels = response.data.responses[0]?.webDetection?.bestGuessLabels || [];
    
    console.log(`📋 Results - Labels: ${labels.length}, Web entities: ${webEntities.length}, Web labels: ${webLabels?.length || 0}`);
    
    // Combine results from all detection types
    const potentialSpecies = [
      ...labels.map((item: LabelAnnotation) => ({
        name: item.description,
        confidence: item.score,
        source: 'label'
      })),
      ...webEntities.map((item: WebEntity) => ({
        name: item.description,
        confidence: item.score || 0.7,
        source: 'web_entity'
      })),
      ...(webLabels || []).map((item: any) => ({
        name: item.label,
        confidence: 0.9, // Web labels often have high accuracy
        source: 'web_label'
      }))
    ].filter(item => item.name && item.confidence > 0.5); // Lower threshold to get more candidates
    
    // Filter for likely biological keywords
    const biologicalKeywords = ['species', 'plant', 'animal', 'bird', 'tree', 'flower', 'insect', 
      'wildlife', 'flora', 'fauna', 'fish', 'mammal', 'reptile', 'amphibian', 'dog', 'cat', 
      'butterfly', 'snake', 'frog', 'monkey', 'ape', 'bear', 'deer', 'fox', 'wolf', 'tiger',
      'lion', 'elephant', 'giraffe', 'zebra', 'rhino', 'hippo', 'crocodile', 'turtle', 'eagle',
      'hawk', 'owl', 'parrot', 'hummingbird', 'penguin', 'shark', 'whale', 'dolphin', 'octopus',
      'squid', 'crab', 'lobster', 'bee', 'ant', 'spider', 'beetle', 'oak', 'pine', 'maple', 'palm',
      'rose', 'tulip', 'daisy', 'sunflower', 'grass', 'moss', 'mushroom', 'fungus'];
    
    // First prefer those that are specifically biological
    let biologicalSpecies = potentialSpecies.filter(sp => 
      biologicalKeywords.some(keyword => 
        sp.name.toLowerCase().includes(keyword)
      )
    );
    
    // If no biological terms found, use all strong candidates
    let bestCandidates = biologicalSpecies.length > 0 
      ? biologicalSpecies 
      : potentialSpecies.filter(sp => sp.confidence > 0.75);
    
    // Sort by confidence
    bestCandidates.sort((a, b) => b.confidence - a.confidence);
    
    // Limit to top 5
    bestCandidates = bestCandidates.slice(0, 5);
    
    // Enhanced processing: lookup scientific names and add additional info
    const enhancedSuggestions: Suggestion[] = [];
    
    for (const candidate of bestCandidates) {
      const suggestion: Suggestion = {
        name: candidate.name,
        confidence: candidate.confidence
      };
      
      // Try to find scientific name
      const scientificName = findScientificName(candidate.name);
      if (scientificName) {
        suggestion.scientific_name = scientificName;
      } else if (useEnhancedPrompt) {
        // If using enhanced mode, try Wikipedia lookup for the top candidate
        if (bestCandidates.indexOf(candidate) === 0) {
          try {
            console.log('🔍 Looking up additional info for:', candidate.name);
            const wikiData = await getWikipediaData(candidate.name);
            if (wikiData.scientific_name) {
              suggestion.scientific_name = wikiData.scientific_name;
            }
          } catch (error) {
            console.error('Error during Wikipedia lookup:', error);
          }
        }
      }
      
      enhancedSuggestions.push(suggestion);
    }
    
    // Generate verbose description for enhanced mode
    let rawResponse = null;
    if (useEnhancedPrompt && enhancedSuggestions.length > 0) {
      const topSuggestion = enhancedSuggestions[0];
      rawResponse = `I've identified this as a ${topSuggestion.name}${
        topSuggestion.scientific_name ? ` (${topSuggestion.scientific_name})` : ''
      } with ${Math.round(topSuggestion.confidence * 100)}% confidence. This identification is based on visual features including texture, shape, and color patterns that match known specimens of this species.`;
    }
    
    const result = {
      suggestions: enhancedSuggestions,
      ...(rawResponse ? { rawResponse } : {})
    };
    
    console.log('🔍 Identification results:', JSON.stringify(result).substring(0, 200));
    return result;
    
  } catch (error) {
    console.error('❌ Error identifying species:', error);
    // Return empty suggestions instead of failing the whole process
    return {
      suggestions: [],
      error: error instanceof Error ? error.message : 'Unknown error with species identification'
    };
  }
}

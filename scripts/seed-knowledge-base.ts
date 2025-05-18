import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Knowledge base entries about Islamabad's biodiversity
const knowledgeBaseEntries = [
  {
    content: "Margalla Hills National Park in Islamabad hosts over 600 plant species, 250 bird species, 38 mammals, and 13 reptile species. It's the city's primary habitat for local wildlife.",
    tags: ["margalla", "hills", "park", "national", "species", "plant", "bird", "mammal", "reptile", "wildlife", "habitat"]
  },
  {
    content: "The Common Leopard (Panthera pardus) is considered an apex predator in Margalla Hills. It primarily feeds on wild boar, barking deer, and monkeys. Despite urbanization, leopards have adapted to living in proximity to human settlements.",
    tags: ["leopard", "panthera", "pardus", "predator", "margalla", "hills", "wildlife", "mammal"]
  },
  {
    content: "Rawal Lake serves as a critical water source for Islamabad and attracts numerous migratory birds from Central Asia during winter months (November to February). Common visitors include the Common Pochard, Northern Pintail, and Common Teal.",
    tags: ["rawal", "lake", "water", "migratory", "birds", "winter", "pochard", "pintail", "teal"]
  },
  {
    content: "The Ayub National Park in Islamabad contains a variety of flora including Chir Pine (Pinus roxburghii), Blue Pine (Pinus wallichiana), Silver Oak (Grevillea robusta), and Paper Mulberry (Broussonetia papyrifera). The Paper Mulberry, though non-native, has become invasive and contributes to pollen allergies in the region.",
    tags: ["ayub", "national", "park", "flora", "pine", "chir", "blue", "oak", "silver", "mulberry", "paper", "invasive", "allergies"]
  },
  {
    content: "The Margalla Hills experience a subtropical highland climate with five distinct seasons: winter (November-February), spring (March-April), summer (May-June), monsoon (July-August), and autumn (September-October). This climatic variation supports diverse ecological niches.",
    tags: ["margalla", "hills", "climate", "subtropical", "highland", "seasons", "winter", "spring", "summer", "monsoon", "autumn", "ecological", "niches"]
  },
  {
    content: "The Potohar Plateau, where Islamabad is situated, has a rich diversity of reptile species including the Indian Cobra (Naja naja), Saw-scaled Viper (Echis carinatus), and Mugger Crocodile (Crocodylus palustris) in water bodies. These species play crucial roles in controlling pest populations.",
    tags: ["potohar", "plateau", "reptile", "cobra", "viper", "crocodile", "mugger", "species", "pest", "control"]
  },
  {
    content: "The Rhesus Macaque (Macaca mulatta) is a common primate species in the Margalla Hills. These social animals live in groups and have adapted to human presence, often coming into contact with visitors and residents near the hills. Their diet includes fruits, seeds, roots, and occasionally insects.",
    tags: ["rhesus", "macaque", "primate", "margalla", "hills", "social", "human", "interaction", "diet", "fruits", "seeds"]
  },
  {
    content: "Islamabad's Trail 3 in the Margalla Hills is known for its rich bird diversity. Birdwatchers can spot species like the Himalayan Griffon, White-cheeked Bulbul, Plum-headed Parakeet, and Golden Oriole. The best time for birdwatching is early morning or late afternoon.",
    tags: ["trail", "margalla", "hills", "bird", "diversity", "birdwatching", "griffon", "bulbul", "parakeet", "oriole"]
  },
  {
    content: "The Shaker Parian National Park contains a rose garden with over 250 varieties of roses. It also houses butterfly species like the Common Mormon (Papilio polytes), Lime Butterfly (Papilio demoleus), and Common Tiger (Danaus genutia).",
    tags: ["shaker", "parian", "park", "national", "rose", "garden", "butterfly", "mormon", "lime", "tiger"]
  },
  {
    content: "Islamabad's urbanization has led to human-wildlife conflicts, particularly with wild boars (Sus scrofa) that forage in residential areas. Conservation efforts include setting aside green belts and corridors to maintain habitat connectivity for wildlife movement between fragmented forest patches.",
    tags: ["urbanization", "human", "wildlife", "conflict", "boar", "conservation", "green", "belt", "corridor", "habitat", "connectivity"]
  }
];

async function seedKnowledgeBase() {
  try {
    console.log('Starting to seed knowledge base...');
    const knowledgeBaseCollection = collection(db, 'knowledge_base');
    
    for (const entry of knowledgeBaseEntries) {
      await addDoc(knowledgeBaseCollection, {
        content: entry.content,
        tags: entry.tags
      });
      console.log(`Added knowledge base entry: ${entry.content.substring(0, 50)}...`);
    }
    
    console.log('Knowledge base seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding knowledge base:', error);
  }
}

// Execute the seeding function
seedKnowledgeBase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error during seeding:', error);
    process.exit(1);
  });

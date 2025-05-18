import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { createReadStream } from 'fs';
import csv from 'csv-parser';

// Firebase configuration - using environment variables
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

// Sample knowledge base snippets
const knowledgeBaseSnippets = [
  {
    content: "Margalla Hills host over 200 bird species, including the Himalayan Griffon Vulture.",
    tags: ["margalla", "hills", "birds", "vulture", "himalayan", "species"]
  },
  {
    content: "The Rawal Lake in Islamabad is home to many migratory birds from Central Asia during winter months.",
    tags: ["rawal", "lake", "migratory", "birds", "winter", "asia"]
  },
  {
    content: "Common leopards are occasionally spotted in the Margalla Hills National Park, which borders Islamabad.",
    tags: ["leopard", "margalla", "hills", "national", "park", "wildlife"]
  },
  {
    content: "Islamabad's diverse ecosystem includes subtropical pine forests, grasslands, and freshwater habitats.",
    tags: ["ecosystem", "subtropical", "pine", "forests", "grasslands", "freshwater", "habitats"]
  },
  {
    content: "The Potohar Plateau, where Islamabad is located, has a rich diversity of reptile species including the Indian cobra and saw-scaled viper.",
    tags: ["potohar", "plateau", "reptile", "cobra", "viper", "species"]
  },
  {
    content: "Islamabad is home to the Ayub National Park, which contains various native plant species and serves as a habitat for local wildlife.",
    tags: ["ayub", "national", "park", "plants", "wildlife", "habitat"]
  },
  {
    content: "The barking deer (Muntiacus muntjak) is one of the mammals found in the forested areas around Islamabad.",
    tags: ["barking", "deer", "mammals", "forest", "wildlife"]
  },
  {
    content: "Islamabad's climate supports a variety of butterfly species, including the common mormon and lime butterfly.",
    tags: ["butterfly", "species", "insects", "climate"]
  }
];

// Function to seed knowledge base
async function seedKnowledgeBase() {
  try {
    console.log('Seeding knowledge base...');
    
    const knowledgeBaseCollection = collection(db, 'knowledge_base');
    
    for (const snippet of knowledgeBaseSnippets) {
      await addDoc(knowledgeBaseCollection, {
        content: snippet.content,
        tags: snippet.tags
      });
    }
    
    console.log('Knowledge base seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding knowledge base:', error);
  }
}

// Function to seed observations from CSV
async function seedObservations() {
  try {
    console.log('Seeding observations from CSV...');
    
    const results: any[] = [];
    const observationsCollection = collection(db, 'observations');
    
    createReadStream(path.resolve(__dirname, '../data/observations.csv'))
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        for (const row of results) {
          await addDoc(observationsCollection, {
            observation_id: row.observation_id,
            species_name: row.species_name,
            common_name: row.common_name,
            date_observed: row.date_observed,
            location: row.location,
            image_url: row.image_url,
            notes: row.notes
          });
        }
        
        console.log('Observations seeding completed successfully!');
      });
  } catch (error) {
    console.error('Error seeding observations:', error);
  }
}

// Main function to run all seeding operations
async function seedAll() {
  await seedKnowledgeBase();
  await seedObservations();
}

// Run the seeding
seedAll();

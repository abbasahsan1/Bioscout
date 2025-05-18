# Approach Document for BioScout Islamabad

## Introduction

"BioScout Islamabad" is an AI-powered web platform designed to create a community-driven biodiversity database for Islamabad and its surrounding areas. The application aims to engage users in submitting observations of local flora and fauna, identifying species using AI, and asking questions about biodiversity through an intelligent Q&A system. It supports environmental awareness and conservation efforts, aligning with UN Sustainable Development Goals (SDGs) 15 (Life on Land) and 13 (Climate Action). This document outlines the approach and technical specifications for developing a Minimum Viable Product (MVP) within a 24-hour hackathon, using the specified technologies: Next.js, GitHub, Vercel, Google Firebase, and Google Vision API.

## System Architecture

The platform adopts a modern web architecture with the following components:

- **Frontend**: Built with Next.js for a responsive, server-rendered user interface.
- **Backend**: Utilizes Next.js API routes for server-side logic and integration with external services.
- **Database**: Google Firebase Firestore for real-time storage of observations and knowledge base snippets.
- **Storage**: Firebase Storage for handling image uploads.
- **AI Services**:
  - Google Vision API for species identification from images.
  - Hugging Face Inference API (or Google Gemini free tier) for the Retrieval-Augmented Generation (RAG)-based Q&A system.
- **Deployment**: Hosted on Vercel for rapid deployment and scalability.
- **Version Control**: Managed via GitHub.

### Architecture Diagram

```
[User] --> [Next.js Frontend]
    |              |
    v              v
[Firebase] <--> [Next.js API Routes]
    |              |
    v              v
[Storage]    [AI Services: Google Vision, Hugging Face]
    |
    v
[Firestore: Observations, Knowledge Base]
```

## Technical Specifications

### Tech Stack

- **Frontend**: Next.js (React framework)
- **Backend**: Next.js API routes
- **Database**: Google Firebase Firestore
- **Storage**: Google Firebase Storage
- **AI Integration**:
  - **Species Identification**: Google Vision API
  - **RAG System**: Hugging Face Inference API (preferred for free tier; fallback to Google Gemini if needed)
- **Deployment**: Vercel
- **Version Control**: GitHub

## Modules

### 1. User Interface

- **Home Page**: Provides an overview of the platform and navigation to key features.
- **Observation Submission Form**: Allows users to input species name, date, location, upload an image, and add notes.
- **Observation Display**: Displays submitted observations in a list format (map view optional if time permits).
- **Q&A Interface**: Enables users to ask questions in natural language and view AI-generated answers.

### 2. Backend

- **API Endpoints**:
  - `/api/submit-observation`: Processes observation submissions, including image uploads and data storage.
  - `/api/get-observations`: Retrieves observation data for display on the frontend.
  - `/api/ask-question`: Handles Q&A queries by retrieving relevant context and generating answers.
- **Integrations**:
  - Connects to Firebase for data and image storage.
  - Interfaces with Google Vision API for species identification.
  - Implements the RAG system by searching data and interfacing with an LLM API.

### 3. Database

- **Observations Collection**:
  - Fields: `observation_id`, `species_name`, `common_name`, `date_observed`, `location`, `image_url`, `notes`
- **Knowledge Base Collection**:
  - Stores 3-5 curated text snippets about Islamabad’s biodiversity for the Q&A system.

### 4. AI Integrations

- **Species Identification**:
  - Utilizes Google Vision API to analyze uploaded images and suggest potential species.
- **RAG System**:
  - Retrieves relevant snippets from the knowledge base and observation notes using a simple keyword search.
  - Combines retrieved context with the user’s question to generate answers via an LLM.

## Data Flow

1. **Observation Submission**:

   - User submits observation data and an image via the form.
   - Image is uploaded to Firebase Storage, and metadata is saved to Firestore.
   - Google Vision API processes the image to suggest species, which is stored with the observation.
2. **Observation Display**:

   - Frontend fetches observation data from Firestore and renders it as a list.
3. **Q&A System**:

   - User submits a question through the Q&A interface.
   - Backend searches the knowledge base and observation notes for relevant information.
   - Retrieved context is combined with the query and sent to the LLM API to generate an answer, displayed to the user.

## Development Approach

### Implementation Steps

1. **Project Setup**:

   - Initialize a Next.js project and create a GitHub repository for version control.
   - Configure Firebase (Firestore and Storage) and integrate the SDK into the project.
2. **Database Schema**:

   - Set up Firestore collections: `observations` and `knowledge_base`.
   - Define fields for observation documents and populate with sample data.
3. **Observation Submission**:

   - Develop a form component for users to input observation details and upload images.
   - Use Firebase Storage to store images and Firestore to save observation metadata.
4. **Observation Display**:

   - Create a component to fetch observations from Firestore and display them in a list format.
5. **Species Identification**:

   - Implement an API route to send image URLs to Google Vision API and retrieve species suggestions.
   - Display AI-suggested species alongside observation data.
6. **Q&A System**:

   - Build a basic search mechanism to retrieve relevant snippets from the knowledge base and observation notes.
   - Construct a prompt with retrieved context and the user’s question, then integrate with Hugging Face Inference API for answer generation.
7. **Gamification**:

   - Add a simple leaderboard or badge system using mock data to encourage user participation.
8. **Datasets**:

   - Create a CSV file with 10-15 sample observations and load it into Firestore.
   - Curate 3-5 knowledge base snippets about Islamabad’s biodiversity and store them in Firestore.
9. **Deployment**:

   - Connect the GitHub repository to Vercel for automated deployment.
   - Set up environment variables for API keys and deploy the application.

### Sample Datasets

#### Biodiversity Observations CSV

```
observation_id,species_name,common_name,date_observed,location,image_url,notes
1,Panthera pardus,Leopard,2023-10-01,Margalla Hills,image1.jpg,"Spotted near trail"
2,Prunus persica,Peach Tree,2023-10-02,Shakarparian,image2.jpg,"In bloom"
...
```

#### Knowledge Base Snippet Example

- "Margalla Hills host over 200 bird species, including the Himalayan Griffon Vulture."

## Challenges and Solutions

- **API Integration**:
  - *Challenge*: Limited time to integrate Google Vision and LLM APIs.
  - *Solution*: Use mock responses initially and integrate live APIs as time allows.
- **RAG Retrieval**:
  - *Challenge*: Implementing an effective search mechanism within constraints.
  - *Solution*: Start with keyword-based search; explore advanced techniques if time permits.
- **Time Constraints**:
  - *Challenge*: Completing all features within 24 hours.
  - *Solution*: Focus on MVP features (submission, display, basic AI) and leverage pre-built components.

## Future Enhancements

- Add user authentication and profiles for personalized experiences.
- Implement community validation of species identifications.
- Support multilingual interfaces (e.g., Urdu) for broader accessibility.
- Enhance the observation display with an interactive map and filtering options.

## Conclusion

This approach provides a structured plan to develop the "BioScout Islamabad" MVP within a 24-hour hackathon. By utilizing Next.js, Firebase, and AI services like Google Vision and Hugging Face, the platform will establish a foundation for community-driven biodiversity monitoring and education, with opportunities for future growth to support conservation in Islamabad.

# BioScout

A platform for citizen scientists to document and identify flora and fauna.

## Features

- Submit observations with images
- Automatic species identification using AI
- View and search all observations
- Real-time data updates

## Species Identification

BioScout uses the powerful iNaturalist classifier model from Hugging Face for accurate species identification:

1. **INaturalist Classifier**: Identifies common and scientific names of plants and animals using a model trained on the extensive iNaturalist dataset
2. **Custom Taxonomy Database**: Enhances results with a comprehensive mapping between scientific and common names
3. **Wikipedia Integration**: For enhanced scientific name lookup on demand

### Enhanced Mode

The application supports an "enhanced mode" that provides more detailed species identification results, including:
- Scientific names with higher accuracy
- Higher confidence identifications
- More informative descriptions
- Wikipedia data integration for top matches
- Automatic species name suggestion when uploading observations

To test this feature:
1. Visit `/hugging-face-demo` in your browser
2. Enter an image URL or upload an image
3. Toggle the "Use enhanced mode" option
4. Click "Identify Species"

## Environment Variables

Create a `.env.local` file with the following variables:

```
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_firebase_database_url

# Hugging Face API Key (for species identification)
HUGGINGFACE_API_KEY=your_huggingface_api_key
```

## Getting Started

1. Clone the repository
2. Install dependencies with `npm install`
3. Create a `.env.local` file with your API keys
4. Run the development server with `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Prerequisites

- Node.js (version X.X.X or higher recommended - please specify based on your project's `package.json` or common Next.js requirements)
- npm or yarn

## Setup Instructions

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd bioscout3
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    ```

3.  **Set up Environment Variables:**
    This project uses Firebase and requires environment variables to connect to your Firebase project.

    *   Copy the example environment file:
        ```bash
        cp .env.example .env.local
        ```
    *   Open `.env.local` in your editor.
    *   Replace the placeholder values with your actual Firebase project credentials. You can find these in your Firebase project settings.
        ```env
        NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
        NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_firebase_database_url
        NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
        NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
        NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
        ```
    **Important:** The `.env.local` file is listed in `.gitignore` and should **never** be committed to the repository.

4.  **Run the development server:**
    ```bash
    npm run dev
    # or
    # yarn dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Available Scripts

In the project directory, you can run:

-   `npm run dev`: Runs the app in development mode.
-   `npm run build`: Builds the app for production.
-   `npm start`: Starts the production server (after building).
-   `npm run lint`: Lints the project files.

## Reinstall Dependencies Script

A utility script `reinstall-deps.bat` is provided for Windows users to clean `node_modules`, `.next` folder, and npm cache, then reinstall dependencies. To use it, simply run:
```bash
reinstall-deps.bat
```
For macOS/Linux users, equivalent commands would be:
```bash
rm -rf node_modules .next
npm cache clean --force
npm install
```

## Learn More

To learn more about Next.js, take a look at the following resources:

-   [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
-   [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deployment

Refer to the [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more information.
import { NextRequest, NextResponse } from 'next/server';
import { addQuestionAnswer } from '@/lib/database';
import { generateDefaultAnswer } from '@/lib/offline-answers';
import { generateAnswer } from '@/lib/rag-system';

// Add a timeout to prevent hanging requests
const TIMEOUT_MS = 10000; // 10 seconds timeout

// Function to timeout a promise
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error(`Request timed out after ${timeoutMs}ms`)), timeoutMs)
    )
  ]);
}

// Function to generate answers using the RAG system
// with fallback to offline answers if needed
async function processQuestion(question: string): Promise<string> {
  try {
    // First try to use the RAG system with timeout
    const answer = await withTimeout(generateAnswer(question), TIMEOUT_MS);
    return answer;
  } catch (error) {
    console.error('RAG system error, falling back to offline answers:', error);
    // Fallback to offline answers if RAG system fails
    return generateDefaultAnswer(question);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();
    
    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }
    
    // Generate answer using the RAG system with offline fallback and timeout
    let answer: string;
    try {
      answer = await withTimeout(processQuestion(question), TIMEOUT_MS * 1.5); // Slightly longer timeout for the whole process
    } catch (error) {
      console.error('Question processing timed out, using default answer');
      answer = generateDefaultAnswer(question);
    }
    
    // Save question and answer using database helper
    try {
      const result = await withTimeout(addQuestionAnswer({
        text: question,
        answer
      }), TIMEOUT_MS);
      
      return NextResponse.json({
        id: result.id,
        question,
        answer
      }, { status: 200 });
    } catch (dbError) {
      console.error('Database operation timed out or failed:', dbError);
      // Still return the answer even if saving to DB fails
      return NextResponse.json({
        id: Date.now().toString(), // Generate a temporary ID
        question,
        answer
      }, { status: 200 });
    }
    
  } catch (error) {
    console.error('Error processing question:', error);
    // Return a useful response even in case of errors
    const fallbackAnswer = generateDefaultAnswer("");
    
    return NextResponse.json({ 
      id: Date.now().toString(),
      question: req.body ? JSON.stringify(req.body) : "Unknown question",
      answer: fallbackAnswer,
      error: 'Error occurred while processing your question, but we provided a fallback answer.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 200 }); // Return 200 with a fallback answer instead of 500
  }
}

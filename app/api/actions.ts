"use server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function analyzeCode(codeSnippet: string): Promise<string> {
  try {
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error('No API key found');
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    const apiModel = process.env.GEMINI_MODEL || 'gemma-3-27b-it';
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: apiModel });

    const prompt = `Generate a short and concise summary of what this code does and suggest improvements if needed:\n\n${codeSnippet}`;

    const result = await model.generateContent(prompt);
    const response =  result.response;
    return response.text();

  } catch (error) {
    throw new Error(`Failed to analyze code: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

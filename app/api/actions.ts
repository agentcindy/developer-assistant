"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

export async function analyzeCode(codeSnippet: string): Promise<string> {
  try {
    const apiKey = 'AIzaSyD09NO3m1K0LnAlKNlG5TvJyivZWEWU7NY';

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemma-3-27b-it" });

    const prompt = `Analyze the following code snippet. Please provide:
1. A short and concise summary of what the code does
2. A short and concise suggestion for any code improvements if needed

Code snippet:
\`\`\`
${codeSnippet}
\`\`\``;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    throw new Error(`Failed to analyze code: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

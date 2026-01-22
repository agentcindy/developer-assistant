"use client";

import { useState } from "react";
import { analyzeCode } from "./api/actions";

export default function Home() {
  const [codeSnippet, setCodeSnippet] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!codeSnippet.trim()) return;

    setIsLoading(true);
    setError("");
    setResponse("");

    try {
      const result = await analyzeCode(codeSnippet);
      setResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center gap-8 py-16 px-8 bg-white dark:bg-black sm:items-start">
        <h1 className="text-[32px] text-center font-bold text-zinc-900 dark:text-white">
          Code Analyzer
        </h1>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <label
            htmlFor="code-input"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Paste your code snippet:
          </label>
          <textarea
            id="code-input"
            value={codeSnippet}
            onChange={(e) => setCodeSnippet(e.target.value)}
            placeholder="Enter your code here..."
            rows={10}
            className="w-full rounded-lg border border-zinc-300 bg-white p-4 font-mono text-sm text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-500"
          />
          <button
            type="submit"
            disabled={isLoading || !codeSnippet.trim()}
            className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-black"
          >
            {isLoading ? "Analyzing..." : "Analyze Code"}
          </button>
        </form>

        {error && (
          <div className="w-full rounded-lg border border-red-300 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        {response && (
          <div className="w-full flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              Analysis Result
            </h2>
            <div className="w-full rounded-lg border border-zinc-300 bg-zinc-50 p-4 text-sm text-zinc-800 whitespace-pre-wrap dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
              {response}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

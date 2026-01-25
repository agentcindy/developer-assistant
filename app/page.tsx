"use client";

import { useState } from "react";
import { analyzeCode } from "./api/actions";

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-lg overflow-hidden bg-zinc-900 border border-zinc-700">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-800 border-b border-zinc-700">
        <span className="text-sm text-zinc-300">{language || "Code"}</span>
        <button
          onClick={handleCopy}
          className="text-zinc-400 hover:text-white transition-colors"
          aria-label="Copy code"
        >
          {copied ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code className="text-sm text-zinc-100 font-mono">{code}</code>
      </pre>
    </div>
  );
}

function parseAndRenderResponse(response: string) {
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = codeBlockRegex.exec(response)) !== null) {
    // Add text before the code block
    if (match.index > lastIndex) {
      const text = response.slice(lastIndex, match.index);
      parts.push(<span key={key++} className="whitespace-pre-wrap">{text}</span>);
    }

    // Add the code block
    const language = match[1] || "Code";
    const code = match[2].trim();
    parts.push(<CodeBlock key={key++} language={language} code={code} />);

    lastIndex = match.index + match[0].length;
  }

  // Add any remaining text after the last code block
  if (lastIndex < response.length) {
    parts.push(<span key={key++} className="whitespace-pre-wrap">{response.slice(lastIndex)}</span>);
  }

  return parts.length > 0 ? parts : response;
}

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
            <div className="w-full rounded-lg border border-zinc-300 bg-zinc-50 p-4 text-sm text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
              {parseAndRenderResponse(response)}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { simplifyText } from "./actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sparkles,
  Copy,
  Check,
  FileText,
  Zap,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { clsx } from "clsx";

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSimplify = () => {
    setError("");
    setOutputText("");

    startTransition(async () => {
      const result = await simplifyText(inputText);
      if (result.success && result.data) {
        setOutputText(result.data);
      } else {
        setError(result.error || "An error occurred");
      }
    });
  };

  const handleCopy = async () => {
    if (!outputText) return;
    try {
      await navigator.clipboard.writeText(outputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error("Failed to copy text");
    }
  };

  const handleClear = () => {
    setInputText("");
    setOutputText("");
    setError("");
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-violet-600/20 to-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-600/20 to-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-600/10 to-pink-600/10 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <header className="text-center mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border border-violet-500/20 mb-6">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-medium text-violet-300">
              AI-Powered Text Simplification
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-violet-200 to-indigo-200 bg-clip-text text-transparent">
            Plain English Converter
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform complex jargon, legal documents, and technical writing
            into simple, easy-to-understand plain English.
          </p>
        </header>

        {/* Split Screen Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
          {/* Input Card */}
          <Card className="bg-card/50 backdrop-blur-xl border-border/50 shadow-2xl shadow-violet-900/20">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Complex Text</CardTitle>
                    <CardDescription>
                      Paste your jargon-filled text here
                    </CardDescription>
                  </div>
                </div>
                {inputText && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClear}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter complex text here... For example: 'The party of the first part shall indemnify and hold harmless the party of the second part from any and all claims arising from...'"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[300px] md:min-h-[400px] resize-none bg-background/50 border-border/50 focus:border-violet-500/50 focus:ring-violet-500/20 text-base transition-all"
              />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {inputText.length} characters
                </span>
                <Button
                  onClick={handleSimplify}
                  disabled={!inputText.trim() || isPending}
                  className={clsx(
                    "gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-700/30 transition-all duration-300",
                    isPending && "opacity-80"
                  )}
                  size="lg"
                >
                  {isPending ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Simplifying...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      Simplify
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Output Card */}
          <Card className="bg-card/50 backdrop-blur-xl border-border/50 shadow-2xl shadow-indigo-900/20">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Simplified Text</CardTitle>
                    <CardDescription>
                      Easy to understand version
                    </CardDescription>
                  </div>
                </div>
                {outputText && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className={clsx(
                      "gap-2 transition-all",
                      copied
                        ? "bg-green-500/20 border-green-500/50 text-green-400"
                        : "hover:bg-accent"
                    )}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="min-h-[300px] md:min-h-[400px] rounded-lg bg-background/50 border border-border/50 p-4 overflow-y-auto">
                {isPending ? (
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-11/12" />
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-6">
                    <div className="p-3 rounded-full bg-red-500/10">
                      <AlertCircle className="w-8 h-8 text-red-400" />
                    </div>
                    <div>
                      <p className="font-medium text-red-400 mb-1">
                        Something went wrong
                      </p>
                      <p className="text-sm text-muted-foreground">{error}</p>
                    </div>
                  </div>
                ) : outputText ? (
                  <p className="text-base leading-relaxed whitespace-pre-wrap text-foreground">
                    {outputText}
                  </p>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-6">
                    <div className="p-4 rounded-full bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-violet-500/20">
                      <ArrowRight className="w-8 h-8 text-violet-400 -rotate-45" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground mb-1">
                        Ready to simplify
                      </p>
                      <p className="text-sm text-muted-foreground max-w-xs">
                        Enter some complex text on the left and click
                        &quot;Simplify&quot; to see the magic happen
                      </p>
                    </div>
                  </div>
                )}
              </div>
              {outputText && (
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm text-muted-foreground">
                    {outputText.length} characters
                  </span>
                  <div className="flex items-center gap-2 text-sm text-green-400">
                    <Check className="w-4 h-4" />
                    5th grade reading level
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 text-sm text-muted-foreground">
          <p>
            Powered by{" "}
            <span className="font-medium text-violet-400">
              Llama 3.3 70B
            </span>{" "}
            via Groq Cloud
          </p>
        </footer>
      </div>
    </div>
  );
}

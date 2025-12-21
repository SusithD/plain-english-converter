"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { simplifyText, askQuestion, PersonaType } from "./actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sparkles,
  Copy,
  Check,
  FileText,
  Zap,
  AlertCircle,
  ArrowRight,
  BookOpen,
  Wand2,
  Baby,
  FileDigit,
  Briefcase,
  Flame,
  Volume2,
  Square,
  MessageCircleQuestion,
  SendHorizontal,
  User,
  Bot,
} from "lucide-react";
import { clsx } from "clsx";

// Persona configuration with icons and descriptions
const personas: {
  value: PersonaType;
  label: string;
  description: string;
  icon: React.ReactNode;
  badge: string;
  badgeColor: string;
}[] = [
    {
      value: "eli5",
      label: "ELI5",
      description: "Explain Like I'm 5",
      icon: <Baby className="w-4 h-4" />,
      badge: "Simple",
      badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    },
    {
      value: "tldr",
      label: "TL;DR",
      description: "One sentence summary",
      icon: <FileDigit className="w-4 h-4" />,
      badge: "Quick",
      badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    },
    {
      value: "professional",
      label: "Professional",
      description: "Corporate safe",
      icon: <Briefcase className="w-4 h-4" />,
      badge: "Formal",
      badgeColor: "bg-neutral-500/10 text-neutral-300 border-neutral-500/20",
    },
    {
      value: "roast",
      label: "Roast Mode",
      description: "Roast the jargon",
      icon: <Flame className="w-4 h-4" />,
      badge: "Viral",
      badgeColor: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    },
  ];

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedPersona, setSelectedPersona] = useState<PersonaType>("eli5");
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Follow-up Mode (Chat) state
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [isAsking, setIsAsking] = useState(false);


  const currentPersona = personas.find((p) => p.value === selectedPersona)!;

  // Stop speech when output text changes or component unmounts
  const stopSpeech = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  useEffect(() => {
    // Stop speech when output text changes
    stopSpeech();
  }, [outputText, stopSpeech]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      stopSpeech();
    };
  }, [stopSpeech]);

  // Text-to-Speech handler
  const handleSpeak = () => {
    if (!outputText) return;

    // Check if speech synthesis is available
    if (typeof window === "undefined" || !window.speechSynthesis) {
      console.error("Speech synthesis not supported");
      return;
    }

    // If currently speaking, stop
    if (isSpeaking) {
      stopSpeech();
      return;
    }

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(outputText);

    // Configure speech settings
    utterance.rate = 0.9; // Slightly slower for better clarity
    utterance.pitch = 1;
    utterance.volume = 1;

    // Try to use a natural-sounding voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (voice) =>
        voice.lang.startsWith("en") &&
        (voice.name.includes("Natural") ||
          voice.name.includes("Premium") ||
          voice.name.includes("Enhanced"))
    ) || voices.find((voice) => voice.lang.startsWith("en"));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    // Event handlers
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    // Speak the text
    window.speechSynthesis.speak(utterance);
  };

  const handleSimplify = () => {
    setError("");
    setOutputText("");
    setChatHistory([]); // Reset chat when starting new simplification
    setChatInput("");


    startTransition(async () => {
      const result = await simplifyText(inputText, selectedPersona);
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
    stopSpeech(); // Stop any ongoing speech
    setInputText("");
    setOutputText("");
    setError("");
    setChatHistory([]);
    setChatInput("");
  };

  const handleAskQuestion = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim() || !inputText || isAsking) return;

    const question = chatInput.trim();
    setChatInput("");
    setChatHistory((prev) => [...prev, { role: "user", content: question }]);
    setIsAsking(true);

    try {
      const result = await askQuestion(inputText, question);
      if (result.success && result.data) {
        setChatHistory((prev) => [...prev, { role: "assistant", content: result.data! }]);
      } else {
        setError(result.error || "Failed to get an answer.");
      }
    } catch (err) {
      setError("An unexpected error occurred during chat.");
    } finally {
      setIsAsking(false);
    }
  };

  // Get the output label based on persona
  const getOutputLabel = () => {
    switch (selectedPersona) {
      case "eli5":
        return "Kid-Friendly Version";
      case "tldr":
        return "Quick Summary";
      case "professional":
        return "Professional Version";
      case "roast":
        return "The Roast 🔥";
      default:
        return "Simplified Text";
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Subtle decorative elements - Next.js inspired */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top gradient glow */}
        <div
          className="absolute -top-[400px] left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(ellipse, rgba(59, 130, 246, 0.3) 0%, transparent 70%)",
          }}
        />
        {/* Subtle dot grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at center, #ffffff 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-8 md:py-16 max-w-7xl">
        {/* Header */}
        <header className="text-center mb-12 md:mb-16">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
            <Wand2 className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-neutral-200">
              AI-Powered Simplification
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-5 text-foreground tracking-tight">
            Plain English
            <span className="block mt-1 bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
              Converter
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Transform complex jargon, legal documents, and technical writing
            into simple, easy-to-understand language.
          </p>
        </header>

        {/* Persona Selector */}
        <div className="max-w-md mx-auto mb-8">
          <div className="flex items-center justify-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">
              Choose style:
            </span>
            <Select
              value={selectedPersona}
              onValueChange={(value: PersonaType) => setSelectedPersona(value)}
            >
              <SelectTrigger className="w-[220px] bg-card border-border/60 shadow-sm hover:shadow-md transition-shadow">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    {currentPersona.icon}
                    <span className="font-medium">{currentPersona.label}</span>
                    <span
                      className={clsx(
                        "text-xs px-1.5 py-0.5 rounded-full border ml-1",
                        currentPersona.badgeColor
                      )}
                    >
                      {currentPersona.badge}
                    </span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-card border-border/60">
                {personas.map((persona) => (
                  <SelectItem
                    key={persona.value}
                    value={persona.value}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-3 py-1">
                      <div className="p-1.5 rounded-lg bg-muted/60">
                        {persona.icon}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{persona.label}</span>
                          <span
                            className={clsx(
                              "text-xs px-1.5 py-0.5 rounded-full border",
                              persona.badgeColor
                            )}
                          >
                            {persona.badge}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {persona.description}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Split Screen Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Input Card */}
          <Card className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 hover:border-neutral-700 transition-colors duration-300">
            <CardHeader className="pb-4 border-b border-border/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <FileText className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-foreground">
                      Original Text
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Paste your complex content here
                    </CardDescription>
                  </div>
                </div>
                {inputText && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClear}
                    className="text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  >
                    Clear all
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
              <Textarea
                placeholder="Enter complex text here...&#10;&#10;For example: 'The party of the first part shall indemnify and hold harmless the party of the second part from any and all claims arising from...'"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="h-[280px] md:h-[360px] resize-none overflow-y-auto bg-neutral-800/50 border-neutral-700 focus:border-neutral-600 focus:ring-2 focus:ring-white/10 text-base transition-all rounded-xl placeholder:text-neutral-500"
              />
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {inputText.length.toLocaleString()} characters
                  </span>
                  {inputText.length > 0 && (
                    <span className="text-sm text-muted-foreground">
                      · {inputText.split(/\s+/).filter(Boolean).length} words
                    </span>
                  )}
                </div>
                <Button
                  onClick={handleSimplify}
                  disabled={!inputText.trim() || isPending}
                  className={clsx(
                    "gap-2.5 bg-white hover:bg-neutral-100 text-black shadow-lg transition-all duration-300 font-medium px-6",
                    isPending && "opacity-90"
                  )}
                  size="lg"
                >
                  {isPending ? (
                    <>
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {selectedPersona === "roast" ? (
                        <Flame className="w-5 h-5" />
                      ) : (
                        <Zap className="w-5 h-5" />
                      )}
                      {selectedPersona === "roast" ? "Roast It" : "Simplify"}
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Output Card */}
          <Card className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 hover:border-neutral-700 transition-colors duration-300">
            <CardHeader className="pb-4 border-b border-border/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={clsx(
                      "p-2.5 rounded-xl border",
                      selectedPersona === "roast"
                        ? "bg-orange-500/10 border-orange-500/20"
                        : "bg-emerald-500/10 border-emerald-500/20"
                    )}
                  >
                    {selectedPersona === "roast" ? (
                      <Flame className="w-5 h-5 text-orange-400" />
                    ) : (
                      <Sparkles className="w-5 h-5 text-emerald-400" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-foreground">
                      {getOutputLabel()}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {selectedPersona === "roast"
                        ? "Ready to share on social"
                        : "Easy-to-understand version"}
                    </CardDescription>
                  </div>
                </div>
                {outputText && (
                  <div className="flex items-center gap-2">
                    {/* Text-to-Speech Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSpeak}
                      className={clsx(
                        "gap-2 transition-all font-medium border-neutral-700",
                        isSpeaking
                          ? "bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/15"
                          : "hover:bg-neutral-800 text-neutral-300"
                      )}
                      title={isSpeaking ? "Stop speaking" : "Listen to this"}
                    >
                      {isSpeaking ? (
                        <>
                          <Square className="w-4 h-4 fill-current" />
                          Stop
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-4 h-4" />
                          Listen
                        </>
                      )}
                    </Button>

                    {/* Copy Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                      className={clsx(
                        "gap-2 transition-all font-medium border-neutral-700",
                        copied
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/15"
                          : "hover:bg-neutral-800 text-neutral-300"
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
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="min-h-[280px] md:min-h-[360px] rounded-xl bg-neutral-800/50 border border-neutral-700 p-5 overflow-y-auto">
                {isPending ? (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-full bg-muted/60" />
                      <Skeleton className="h-4 w-11/12 bg-muted/60" />
                      <Skeleton className="h-4 w-4/5 bg-muted/60" />
                    </div>
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-full bg-muted/60" />
                      <Skeleton className="h-4 w-3/4 bg-muted/60" />
                      <Skeleton className="h-4 w-5/6 bg-muted/60" />
                    </div>
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-full bg-muted/60" />
                      <Skeleton className="h-4 w-2/3 bg-muted/60" />
                    </div>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-6">
                    <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                      <AlertCircle className="w-8 h-8 text-red-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-red-400 mb-1.5">
                        Something went wrong
                      </p>
                      <p className="text-sm text-muted-foreground max-w-xs">
                        {error}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSimplify}
                      className="mt-2"
                    >
                      Try again
                    </Button>
                  </div>
                ) : outputText ? (
                  <div className="space-y-6">
                    <p className="text-base leading-relaxed whitespace-pre-wrap text-foreground">
                      {outputText}
                    </p>

                    {/* Chat Section */}
                    <div className="mt-8 border-t border-neutral-800 pt-6">
                      <div className="flex items-center gap-2 mb-4">
                        <MessageCircleQuestion className="w-4 h-4 text-blue-400" />
                        <h4 className="text-sm font-semibold text-neutral-300">
                          Still confused? Ask a specific question
                        </h4>
                      </div>

                      {/* Msg History */}
                      {chatHistory.length > 0 && (
                        <div className="space-y-4 mb-6">
                          {chatHistory.map((msg, i) => (
                            <div
                              key={i}
                              className={clsx(
                                "flex gap-3 text-sm animate-in fade-in slide-in-from-bottom-2",
                                msg.role === "user" ? "flex-row-reverse" : "flex-row"
                              )}
                            >
                              <div className={clsx(
                                "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border",
                                msg.role === "user"
                                  ? "bg-neutral-800 border-neutral-700 text-neutral-400"
                                  : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                              )}>
                                {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                              </div>
                              <div className={clsx(
                                "px-4 py-2.5 rounded-2xl max-w-[85%]",
                                msg.role === "user"
                                  ? "bg-neutral-800 text-neutral-200 rounded-tr-none"
                                  : "bg-neutral-900 border border-neutral-800 text-neutral-300 rounded-tl-none"
                              )}>
                                {msg.content}
                              </div>
                            </div>
                          ))}
                          {isAsking && (
                            <div className="flex gap-3 text-sm items-center opacity-70">
                              <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center animate-pulse">
                                <Bot className="w-4 h-4 text-blue-400" />
                              </div>
                              <div className="flex gap-1.5 items-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400/50 animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400/50 animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400/50 animate-bounce"></span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Input */}
                      <form onSubmit={handleAskQuestion} className="relative mt-2 group">
                        <input
                          type="text"
                          placeholder="e.g., 'Does this say I can be sued?'"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          disabled={isAsking}
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-full py-3 pl-5 pr-12 text-sm focus:outline-none focus:border-neutral-600 focus:ring-4 focus:ring-white/5 transition-all placeholder:text-neutral-500 disabled:opacity-50"
                        />
                        <button
                          type="submit"
                          disabled={!chatInput.trim() || isAsking}
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white text-black hover:bg-neutral-200 transition-colors disabled:opacity-30 disabled:hover:bg-white"
                        >
                          <SendHorizontal className="w-4 h-4" />
                        </button>
                      </form>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-6">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <BookOpen className="w-8 h-8 text-neutral-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground mb-1.5">
                        Ready to transform
                      </p>
                      <p className="text-sm text-muted-foreground max-w-[280px] leading-relaxed">
                        Enter text and select your preferred style using the
                        dropdown above
                      </p>
                    </div>
                  </div>
                )
                }
              </div>
              {outputText && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/40">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {outputText.length.toLocaleString()} characters
                    </span>
                    <span className="text-sm text-muted-foreground">
                      · {outputText.split(/\s+/).filter(Boolean).length} words
                    </span>
                  </div>
                  <div
                    className={clsx(
                      "flex items-center gap-2 px-3 py-1.5 rounded-full border",
                      selectedPersona === "roast"
                        ? "bg-orange-500/10 border-orange-500/20"
                        : "bg-emerald-500/10 border-emerald-500/20"
                    )}
                  >
                    <Check
                      className={clsx(
                        "w-3.5 h-3.5",
                        selectedPersona === "roast"
                          ? "text-orange-400"
                          : "text-emerald-400"
                      )}
                    />
                    <span
                      className={clsx(
                        "text-xs font-medium",
                        selectedPersona === "roast"
                          ? "text-orange-400"
                          : "text-emerald-400"
                      )}
                    >
                      {selectedPersona === "eli5" && "5-year-old friendly"}
                      {selectedPersona === "tldr" && "One-liner summary"}
                      {selectedPersona === "professional" && "Corporate ready"}
                      {selectedPersona === "roast" && "Ready to go viral"}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mt-16 md:mt-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              How it works
            </h2>
            <p className="text-muted-foreground">
              Transform complex text in three simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: FileText,
                title: "Paste your text",
                description:
                  "Copy and paste any complex document, legal jargon, or technical writing",
                step: "01",
              },
              {
                icon: Wand2,
                title: "Choose your style",
                description:
                  "Select from ELI5, TL;DR, Professional, or Roast Mode for the perfect tone",
                step: "02",
              },
              {
                icon: BookOpen,
                title: "Get your result",
                description:
                  "Receive perfectly transformed text ready to use or share",
                step: "03",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group relative p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700 transition-colors duration-300"
              >
                <div className="absolute top-4 right-4 text-4xl font-bold text-white/5 group-hover:text-white/10 transition-colors">
                  {feature.step}
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 w-fit mb-4">
                  <feature.icon className="w-6 h-6 text-neutral-300" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-16 md:mt-20 pb-8">
          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-neutral-900/50 border border-neutral-800">
            <span className="text-sm text-neutral-500">Powered by</span>
            <span className="text-sm font-semibold text-neutral-200">
              Llama 3.3 70B
            </span>
            <span className="w-1 h-1 rounded-full bg-neutral-600"></span>
            <span className="text-sm text-neutral-500">Groq Cloud</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

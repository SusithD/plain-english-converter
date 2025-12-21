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
  History,
  Clock,
  Trash2,
  PanelLeftClose,
  PanelLeft,
  Plus,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { clsx } from "clsx";

interface HistoryItem {
  id: string;
  originalText: string;
  simplifiedText: string;
  persona: PersonaType;
  timestamp: number;
}

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

  // History state
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("conversion_history");
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save to history helper
  const saveToHistory = useCallback((original: string, simplified: string, persona: PersonaType) => {
    setHistory((prev) => {
      const newItem: HistoryItem = {
        id: Math.random().toString(36).substring(7),
        originalText: original,
        simplifiedText: simplified,
        persona,
        timestamp: Date.now(),
      };

      // Keep only last 10 items
      const newHistory = [newItem, ...prev].slice(0, 10);
      localStorage.setItem("conversion_history", JSON.stringify(newHistory));
      return newHistory;
    });
  }, []);

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory((prev) => {
      const newHistory = prev.filter((item) => item.id !== id);
      localStorage.setItem("conversion_history", JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("conversion_history");
  };

  const restoreFromHistory = (item: HistoryItem) => {
    setInputText(item.originalText);
    setOutputText(item.simplifiedText);
    setSelectedPersona(item.persona);
    setChatHistory([]);
    setChatInput("");
    setIsDesktopSidebarOpen(false);
    setIsMobileSidebarOpen(false);
    stopSpeech();
  };

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
        saveToHistory(inputText, result.data, selectedPersona);
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
    <div className="flex min-h-screen bg-background text-foreground transition-all duration-300">
      {/* ChatGPT-style Persistent Sidebar (Desktop) */}
      <aside
        className={clsx(
          "hidden md:flex flex-col fixed left-0 top-0 h-screen bg-[#0a0a0a] border-r border-neutral-800 transition-all duration-300 z-50 overflow-hidden",
          isDesktopSidebarOpen ? "w-[260px] translate-x-0" : "w-0 -translate-x-full"
        )}
      >
        <div className="flex flex-col h-full w-[260px] p-3">
          {/* Sidebar Header / New Chat Button */}
          <div className="flex items-center gap-2 mb-4 pt-1">
            <Button
              onClick={handleClear}
              variant="outline"
              className="flex-1 justify-start gap-2 bg-neutral-900/50 border-neutral-800 hover:bg-neutral-800 hover:border-neutral-700 text-neutral-200 rounded-lg transition-all px-3"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">New Simplification</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDesktopSidebarOpen(false)}
              className="text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-lg"
              title="Close sidebar"
            >
              <PanelLeftClose className="w-5 h-5" />
            </Button>
          </div>

          {/* History List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            <div className="px-2 py-2">
              <h3 className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-3 px-1">Recent History</h3>
              {history.length === 0 ? (
                <p className="text-xs text-neutral-600 italic px-1">Your recent simplifications will appear here.</p>
              ) : (
                <div className="space-y-1">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => restoreFromHistory(item)}
                      className="group relative flex items-center gap-2 p-2 rounded-lg hover:bg-neutral-800/50 transition-all cursor-pointer overflow-hidden border border-transparent hover:border-neutral-800/50"
                    >
                      <div className="flex-shrink-0 text-neutral-500">
                        {personas.find(p => p.value === item.persona)?.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-neutral-300 truncate font-medium">
                          {item.originalText}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => deleteHistoryItem(item.id, e)}
                        className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-md hover:bg-red-500/10 hover:text-red-400 text-neutral-600 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Footer */}
          {history.length > 0 && (
            <div className="pt-4 border-t border-neutral-800 mt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearHistory}
                className="w-full justify-start gap-2 text-neutral-500 hover:text-red-400 hover:bg-red-400/10 px-3"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-xs font-medium">Clear history</span>
              </Button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        className={clsx(
          "flex-1 flex flex-col min-h-screen relative transition-all duration-300",
          isDesktopSidebarOpen ? "md:ml-[260px]" : "md:ml-0"
        )}
      >
        {/* Toggle Button Container - Top Left */}
        <div className="fixed top-4 left-4 z-[60]">
          {!isDesktopSidebarOpen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDesktopSidebarOpen(true)}
              className="bg-neutral-900/80 backdrop-blur-md border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700 shadow-xl rounded-xl w-11 h-11 hidden md:flex items-center justify-center transition-all animate-in zoom-in-50 duration-300"
              title="Open sidebar"
            >
              <PanelLeft className="w-6 h-6" />
            </Button>
          )}

          {/* Mobile Sheet Trigger */}
          <div className="md:hidden">
            <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-neutral-900/80 backdrop-blur-md border border-neutral-800 text-neutral-400 shadow-xl rounded-xl w-10 h-10"
                >
                  <History className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-[#0a0a0a] border-neutral-800 text-foreground w-[280px] p-0 overflow-hidden flex flex-col">
                <div className="flex flex-col h-full p-4">
                  <SheetHeader className="pb-6 border-b border-neutral-800 mb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                          <History className="w-5 h-5 text-blue-400" />
                        </div>
                        <SheetTitle className="text-lg font-bold text-white uppercase tracking-tight">History</SheetTitle>
                      </div>
                      <Button onClick={() => { handleClear(); setIsMobileSidebarOpen(false); }} variant="ghost" size="icon" className="text-neutral-500 hover:text-white rounded-md">
                        <Plus className="w-5 h-5" />
                      </Button>
                    </div>
                  </SheetHeader>

                  <div className="flex-1 overflow-y-auto space-y-4">
                    {history.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Clock className="w-10 h-10 text-neutral-700 mb-4" />
                        <p className="text-neutral-500 text-sm">No history found</p>
                      </div>
                    ) : (
                      history.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => restoreFromHistory(item)}
                          className="p-3 rounded-xl bg-neutral-900/50 border border-neutral-800 hover:bg-neutral-800/50 transition-all cursor-pointer"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {personas.find(p => p.value === item.persona)?.icon}
                              <span className="text-[10px] font-bold text-neutral-500 uppercase">{item.persona}</span>
                            </div>
                            <span className="text-[10px] text-neutral-600">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-sm text-neutral-200 line-clamp-2">{item.originalText}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {history.length > 0 && (
                    <div className="pt-4 border-t border-neutral-800 mt-auto">
                      <Button onClick={clearHistory} variant="ghost" className="w-full justify-start gap-2 text-neutral-500 hover:text-red-400">
                        <Trash2 className="w-4 h-4" />
                        Clear All
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

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
        <div className="relative z-10 container mx-auto px-4 py-12 md:py-20 max-w-7xl animate-in fade-in duration-700">
          {/* Header */}
          <header className="text-center mb-12 md:mb-16">
            <div className="flex justify-center items-center gap-4 mb-6">
              {/* AI Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 shadow-sm">
                <Wand2 className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-neutral-200">
                  AI-Powered Simplification
                </span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 text-foreground tracking-tighter text-left">
              Plain English
              <span className="block mt-1 bg-gradient-to-r from-white via-neutral-200 to-neutral-500 bg-clip-text text-transparent">
                Converter
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed mb-10 text-left">
              Transform complex jargon, legal documents, and technical writing
              into simple, easy-to-understand language.
            </p>

            {/* Persona Selector */}
            <div className="flex items-center justify-start gap-4 mb-12">
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest whitespace-nowrap">
                Simplify As:
              </span>
              <Select
                value={selectedPersona}
                onValueChange={(value: PersonaType) => setSelectedPersona(value)}
              >
                <SelectTrigger className="w-[220px] h-10 bg-neutral-900 border-neutral-800 shadow-sm hover:border-neutral-700 transition-all rounded-lg">
                  <SelectValue>
                    <div className="flex items-center gap-2.5">
                      {currentPersona.icon}
                      <span className="font-bold text-neutral-200 text-sm">{currentPersona.label}</span>
                      <span className={clsx("text-[9px] px-1.5 py-0.5 rounded border font-bold uppercase", currentPersona.badgeColor)}>
                        {currentPersona.badge}
                      </span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-neutral-900 border-neutral-800 shadow-2xl rounded-lg p-1">
                  {personas.map((persona) => (
                    <SelectItem
                      key={persona.value}
                      value={persona.value}
                      className="cursor-pointer rounded mb-0.5 last:mb-0 focus:bg-neutral-800 text-neutral-400 focus:text-white"
                    >
                      <div className="flex items-center gap-3 py-1">
                        <div className="p-1.5 rounded-md bg-white/5">
                          {persona.icon}
                        </div>
                        <div className="flex flex-col text-left">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm tracking-tight">{persona.label}</span>
                            <span className={clsx("text-[8px] px-1 py-0.5 rounded border font-black", persona.badgeColor)}>
                              {persona.badge}
                            </span>
                          </div>
                          <span className="text-[10px] text-neutral-500">
                            {persona.description}
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </header>   {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Card */}
            <Card className="bg-neutral-900/50 backdrop-blur-sm border-neutral-800 hover:border-neutral-700 transition-all duration-300 shadow-xl rounded-lg overflow-hidden group">
              <CardHeader className="pb-4 border-b border-neutral-800 px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-blue-500/10 border border-blue-500/20">
                      <FileText className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="text-left">
                      <CardTitle className="text-sm font-bold text-neutral-300 uppercase tracking-widest">
                        Source Material
                      </CardTitle>
                    </div>
                  </div>
                  {inputText && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClear}
                      className="text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-md transition-colors text-xs font-bold uppercase tracking-wider"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-6 px-6">
                <Textarea
                  placeholder="Paste legal text, jargon, or complex content here..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="h-[300px] md:h-[400px] resize-none overflow-y-auto bg-transparent border-none focus-visible:ring-0 text-base leading-relaxed transition-all placeholder:text-neutral-700 p-0 text-neutral-200"
                />
                <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">
                      {inputText.length.toLocaleString()} characters
                    </span>
                  </div>
                  <Button
                    onClick={handleSimplify}
                    disabled={!inputText.trim() || isPending}
                    className="gap-2 bg-white hover:bg-neutral-200 text-black shadow-md transition-all duration-300 font-bold rounded-md px-6 h-10"
                  >
                    {isPending ? (
                      <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        <span>Simplify</span>
                        <ArrowRight className="w-3.5 h-3.5 opacity-50 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Output Card */}
            <Card className="bg-neutral-900/50 backdrop-blur-sm border-neutral-800 hover:border-neutral-700 transition-all duration-300 shadow-xl rounded-lg overflow-hidden group">
              <CardHeader className="pb-4 border-b border-neutral-800 px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={clsx(
                      "p-2 rounded-md border",
                      selectedPersona === "roast"
                        ? "bg-orange-500/10 border-orange-500/20"
                        : "bg-emerald-500/10 border-emerald-500/20"
                    )}>
                      {selectedPersona === "roast" ? <Flame className="w-5 h-5 text-orange-400" /> : <Sparkles className="w-5 h-5 text-emerald-400" />}
                    </div>
                    <div className="text-left">
                      <CardTitle className="text-sm font-bold text-neutral-300 uppercase tracking-widest">
                        Simplified Output
                      </CardTitle>
                    </div>
                  </div>
                  {outputText && (
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleSpeak}
                        className={clsx(
                          "w-8 h-8 rounded-md transition-all",
                          isSpeaking ? "bg-blue-500/10 text-blue-400" : "text-neutral-500 hover:text-white hover:bg-neutral-800"
                        )}
                        title={isSpeaking ? "Stop" : "Listen"}
                      >
                        {isSpeaking ? <Square className="w-3.5 h-3.5 fill-current" /> : <Volume2 className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCopy}
                        className={clsx(
                          "w-8 h-8 rounded-md transition-all",
                          copied ? "bg-emerald-500/10 text-emerald-400" : "text-neutral-500 hover:text-white hover:bg-neutral-800"
                        )}
                        title="Copy"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0 px-0 flex flex-col h-full">
                <div className="h-[380px] md:h-[454px] p-6 overflow-y-auto custom-scrollbar relative">
                  {isPending ? (
                    <div className="space-y-4">
                      <Skeleton className="h-4 w-full bg-white/5 rounded" />
                      <Skeleton className="h-4 w-11/12 bg-white/5 rounded" />
                      <Skeleton className="h-4 w-4/5 bg-white/5 rounded" />
                      <Skeleton className="h-4 w-full bg-white/5 rounded" />
                    </div>
                  ) : error ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                      <AlertCircle className="w-10 h-10 text-red-500/50 mb-3" />
                      <p className="text-red-400 font-bold text-sm uppercase tracking-wider">Process failed</p>
                      <p className="text-neutral-500 text-xs mt-1">{error}</p>
                    </div>
                  ) : outputText ? (
                    <div className="space-y-8 pb-4 text-left">
                      <div className="text-base md:text-lg leading-relaxed text-white font-medium animate-in fade-in slide-in-from-bottom-2 duration-700">
                        {outputText}
                      </div>

                      {/* Chat / Follow-up Section */}
                      <div className="mt-12 pt-8 border-t border-neutral-800">
                        <div className="flex items-center gap-2 mb-6">
                          <MessageCircleQuestion className="w-4 h-4 text-blue-500" />
                          <h4 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Clarification Chat</h4>
                        </div>

                        {chatHistory.length > 0 && (
                          <div className="space-y-6 mb-8">
                            {chatHistory.map((msg, i) => (
                              <div key={i} className={clsx("flex gap-3 animate-in fade-in slide-in-from-bottom-2", msg.role === "user" ? "flex-row-reverse" : "flex-row text-left")}>
                                <div className={clsx("w-7 h-7 rounded flex items-center justify-center border text-[9px] font-black shrink-0", msg.role === "user" ? "bg-neutral-800 border-neutral-700 text-neutral-500" : "bg-neutral-200 text-black border-neutral-200")}>
                                  {msg.role === "user" ? "ME" : "AI"}
                                </div>
                                <div className={clsx("px-4 py-3 rounded-lg max-w-[85%] text-xs font-medium leading-relaxed shadow-sm", msg.role === "user" ? "bg-neutral-800 text-neutral-300" : "bg-neutral-900 border border-neutral-800 text-neutral-300")}>
                                  {msg.content}
                                </div>
                              </div>
                            ))}
                            {isAsking && (
                              <div className="flex gap-3 animate-pulse">
                                <div className="w-7 h-7 rounded bg-neutral-200 text-black flex items-center justify-center text-[9px] font-black">AI</div>
                                <div className="bg-neutral-900 border border-neutral-800 px-4 py-3 rounded-lg text-xs text-neutral-500">Processing follow-up...</div>
                              </div>
                            )}
                          </div>
                        )}

                        <form onSubmit={handleAskQuestion} className="relative group">
                          <input
                            type="text"
                            placeholder="Ask a specific question about this result..."
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            disabled={isAsking}
                            className="w-full h-11 bg-neutral-950 border border-neutral-800 rounded-lg pl-4 pr-12 text-xs focus:outline-none focus:border-neutral-700 transition-all placeholder:text-neutral-700 text-neutral-200"
                          />
                          <button
                            type="submit"
                            disabled={!chatInput.trim() || isAsking}
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-md bg-white text-black hover:bg-neutral-200 transition-all disabled:opacity-20"
                          >
                            <SendHorizontal className="w-3.5 h-3.5" />
                          </button>
                        </form>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-neutral-700 py-12">
                      <BookOpen className="w-10 h-10 opacity-10 mb-4" />
                      <p className="font-bold text-xs uppercase tracking-[0.2em] opacity-40">Ready for conversion</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Features Section */}
          <div className="mt-20 mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              {[
                { icon: Zap, title: "Lightning Fast", desc: "Get simplified versions of your complex documents in milliseconds." },
                { icon: User, title: "Human Tone", desc: "Choose your level of simplicity from elementary to professional." },
                { icon: AlertCircle, title: "100% Secure", desc: "No data is stored on our servers. Your conversions are private." },
              ].map((f, i) => (
                <div key={i} className="flex gap-5 p-2 group hover:bg-white/[0.02] rounded-lg transition-colors">
                  <div className="w-12 h-12 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
                    <f.icon className="w-5 h-5 text-neutral-400" />
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-neutral-200 text-sm tracking-tight">{f.title}</h5>
                    <p className="text-xs text-neutral-500 leading-relaxed font-medium">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-20 pt-8 border-t border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-6 opacity-40 hover:opacity-100 transition-opacity pb-12">
            <div className="flex items-center gap-6 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
              <span className="text-neutral-400">© 2024 Plain English</span>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-neutral-900 border border-neutral-800">
              <span className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.2em]">Engine</span>
              <span className="text-[10px] font-bold text-white tracking-tight">LLAMA-3.3-70B</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}


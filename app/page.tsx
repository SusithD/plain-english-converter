"use client";

import { useState, useTransition, useEffect, useCallback, useRef } from "react";
import { simplifyText, askQuestion, analyzeImage, transcribeAudio, speakText, PersonaType } from "./actions";
import ReactMarkdown from "react-markdown";
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
  Search,
  Settings,
  Github,
  Command,
  PanelLeftClose,
  PanelLeft,
  Plus,
  Eye,
  Image as ImageIcon,
  Upload,
  X,
  Activity,
  Globe,
  Mic,
  Loader2,
  Workflow,
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
import Mermaid from "@/components/mermaid";

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
    {
      value: "flowchart",
      label: "Flowchart",
      description: "Visualize logic",
      icon: <Workflow className="w-4 h-4" />,
      badge: "Visual",
      badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    },
  ];

const languages = [
  { value: "English", label: "English", flag: "🇺🇸" },
  { value: "Spanish", label: "Español", flag: "🇪🇸" },
  { value: "French", label: "Français", flag: "🇫🇷" },
  { value: "German", label: "Deutsch", flag: "🇩🇪" },
  { value: "Italian", label: "Italiano", flag: "🇮🇹" },
  { value: "Portuguese", label: "Português", flag: "🇵🇹" },
  { value: "Russian", label: "Русский", flag: "🇷🇺" },
  { value: "Chinese", label: "中文", flag: "🇨🇳" },
  { value: "Japanese", label: "日本語", flag: "🇯🇵" },
  { value: "Hindi", label: "हिन्दी", flag: "🇮🇳" },
  { value: "Sinhala", label: "සිංහල", flag: "🇱🇰" },
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
  const [searchQuery, setSearchQuery] = useState("");
  const [mode, setMode] = useState<"text" | "vision">("text");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isActionMode, setIsActionMode] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Filtered history based on search
  const filteredHistory = history.filter(item =>
    item.originalText.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.simplifiedText.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await handleTranscription(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError("");
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Microphone access denied or not supported.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleTranscription = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "recording.webm");
      formData.append("language", selectedLanguage);
      const result = await transcribeAudio(formData);
      if (result.success && result.data) {
        setInputText((prev) => prev ? `${prev}\n${result.data}` : result.data!);
      } else {
        setError(result.error || "failed to transcribe audio.");
      }
    } catch (err) {
      console.error("Transcription error:", err);
      setError("An error occurred during transcription.");
    } finally {
      setIsTranscribing(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file.");
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setImagePreview(null);
  };

  const handleSimplify = () => {
    setError("");
    setOutputText("");
    setChatHistory([]); // Reset chat when starting new simplification
    setChatInput("");

    if (mode === "vision") {
      if (!selectedFile) {
        setError("Please select an image to analyze.");
        return;
      }

      startTransition(async () => {
        try {
          // Convert to base64 on client side for more reliable transmission
          const reader = new FileReader();
          const base64Promise = new Promise<string>((resolve, reject) => {
            reader.onload = () => {
              const base64 = (reader.result as string).split(',')[1];
              resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(selectedFile);
          });

          const base64Data = await base64Promise;
          const result = await analyzeImage(base64Data, selectedFile.type, selectedFile.name, isActionMode, selectedLanguage);

          if (result.success && result.data) {
            setOutputText(result.data);
            saveToHistory(`[Visual] ${selectedFile.name}`, result.data, selectedPersona);
          } else {
            setError(result.error || "An error occurred during image analysis.");
          }
        } catch (err) {
          console.error("Client-side image processing error:", err);
          setError("Failed to process image file.");
        }
      });
      return;
    }

    if (!inputText.trim()) {
      setError("Please provide some text to simplify.");
      return;
    }

    startTransition(async () => {
      const result = await simplifyText(inputText, selectedPersona, isActionMode, selectedLanguage);
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
    setSelectedFile(null);
    setImagePreview(null);
  };

  const handleAskQuestion = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const context = mode === "vision" ? outputText : inputText;

    if (!chatInput.trim() || !context || isAsking) return;

    const question = chatInput.trim();
    setChatInput("");
    setChatHistory((prev) => [...prev, { role: "user", content: question }]);
    setIsAsking(true);

    try {
      const result = await askQuestion(context, question);
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
              {filteredHistory.length === 0 ? (
                <p className="text-xs text-neutral-600 italic px-1">
                  {searchQuery ? "No results found." : "Your recent simplifications will appear here."}
                </p>
              ) : (
                <div className="space-y-1">
                  {filteredHistory.map((item) => (
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
        {/* Navbar */}
        <nav className="sticky top-0 z-[50] w-full bg-black/40 backdrop-blur-xl border-b border-white/5 px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            {/* Desktop Toggle Button - Inside Navbar */}
            {!isDesktopSidebarOpen && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDesktopSidebarOpen(true)}
                className="hidden md:flex text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg w-10 h-10 transition-all border border-transparent hover:border-white/10"
                title="Open sidebar"
              >
                <PanelLeft className="w-5 h-5" />
              </Button>
            )}

            {/* Mobile Sheet Trigger - Inside Navbar */}
            <div className="md:hidden">
              <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-neutral-400 hover:text-white rounded-lg w-10 h-10"
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
                      {filteredHistory.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <Clock className="w-10 h-10 text-neutral-700 mb-4" />
                          <p className="text-neutral-500 text-sm">
                            {searchQuery ? "No results found" : "No history found"}
                          </p>
                        </div>
                      ) : (
                        filteredHistory.map((item) => (
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

            {/* Logo area - only visible if sidebar is closed */}
            {!isDesktopSidebarOpen && (
              <div className="hidden md:flex items-center gap-2 animate-in fade-in slide-in-from-left-4 duration-500">
                <span className="text-sm font-black text-white tracking-tighter whitespace-nowrap">theqexle</span>
              </div>
            )}

            {/* Search Bar container */}
            <div className="flex-1 max-w-md ml-4 md:ml-0">
              <div className="relative w-full group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type="text"
                  placeholder="Search history..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500/30 focus:bg-white/[0.07] transition-all placeholder:text-neutral-600 text-neutral-200"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded border border-white/10 bg-white/5 opacity-40">
                  <Command className="w-2.5 h-2.5" />
                  <span className="text-[10px] font-bold">K</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="hidden sm:flex text-neutral-500 hover:text-white rounded-lg">
              <Github className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-neutral-500 hover:text-white rounded-lg">
              <Settings className="w-5 h-5" />
            </Button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 p-[1px] cursor-pointer">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-[10px] font-black">
                OP
              </div>
            </div>
          </div>
        </nav>

        {/* Main content */}
        <div className="relative z-10 container mx-auto px-4 py-12 md:py-20 max-w-7xl animate-in fade-in duration-700">
          {/* Header */}
          <header className="text-center mb-12 md:mb-16">
            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold mb-6 text-foreground tracking-tighter text-left">
              Plain English
              <span className="block mt-1 bg-gradient-to-r from-white via-neutral-200 to-neutral-500 bg-clip-text text-transparent">
                Translator
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed mb-10 text-left">
              Transform complex jargon, legal documents, and technical writing
              into simple, easy-to-understand language.
            </p>

            {/* Persona Selector */}
            {/* Controls */}
            <div className="flex flex-wrap items-center justify-start gap-8 mb-12">
              <div className="flex items-center gap-4">
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

              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest whitespace-nowrap">
                  Target Language:
                </span>
                <Select
                  value={selectedLanguage}
                  onValueChange={(value) => setSelectedLanguage(value)}
                >
                  <SelectTrigger className="w-[180px] h-10 bg-neutral-900 border-neutral-800 shadow-sm hover:border-neutral-700 transition-all rounded-lg">
                    <SelectValue>
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm">{languages.find(l => l.value === selectedLanguage)?.flag}</span>
                        <span className="font-bold text-neutral-200 text-sm">{selectedLanguage}</span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-900 border-neutral-800 shadow-2xl rounded-lg p-1">
                    {languages.map((lang) => (
                      <SelectItem
                        key={lang.value}
                        value={lang.value}
                        className="cursor-pointer rounded mb-0.5 last:mb-0 focus:bg-neutral-800 text-neutral-400 focus:text-white"
                      >
                        <div className="flex items-center gap-3 py-1.5">
                          <span className="text-lg">{lang.flag}</span>
                          <span className="font-bold text-sm tracking-tight">{lang.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </header>   {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Input Card */}
            <Card className="bg-neutral-900/50 backdrop-blur-sm border-neutral-800 hover:border-neutral-700 transition-all duration-300 shadow-xl rounded-lg overflow-hidden group">
              <CardHeader className="pb-4 border-b border-neutral-800 px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-blue-500/10 border border-blue-500/20">
                      {mode === "text" ? <FileText className="w-5 h-5 text-blue-400" /> : <Eye className="w-5 h-5 text-blue-400" />}
                    </div>
                    <div className="text-left">
                      <CardTitle className="text-sm font-bold text-neutral-300 uppercase tracking-widest leading-none">
                        {mode === "text" ? "Source Material" : "Vision Mode"}
                      </CardTitle>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 bg-neutral-950 p-1 rounded-lg border border-neutral-800">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => { setMode("text"); if (isRecording) stopRecording(); }}
                        className={clsx(
                          "h-7 px-3 text-[10px] font-bold uppercase tracking-wider rounded transition-all gap-1.5",
                          mode === "text" && !isRecording ? "bg-neutral-800 text-blue-400 shadow-sm" : "text-neutral-500 hover:text-neutral-300"
                        )}
                        title="Text Input"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Text</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => { setMode("vision"); if (isRecording) stopRecording(); }}
                        className={clsx(
                          "h-7 px-3 text-[10px] font-bold uppercase tracking-wider rounded transition-all gap-1.5",
                          mode === "vision" ? "bg-neutral-800 text-purple-400 shadow-sm" : "text-neutral-500 hover:text-neutral-300"
                        )}
                        title="Vision Input"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Vision</span>
                      </Button>
                      <div className="w-px h-3 bg-neutral-800 mx-0.5" />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (mode !== "text") setMode("text");
                          toggleRecording();
                        }}
                        disabled={isTranscribing}
                        className={clsx(
                          "h-7 px-3 text-[10px] font-bold uppercase tracking-wider rounded transition-all gap-1.5",
                          isRecording ? "bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse shadow-sm" : "text-neutral-500 hover:text-red-400"
                        )}
                        title="Voice Input"
                      >
                        {isTranscribing ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Mic className={clsx("w-3.5 h-3.5", isRecording && "fill-current")} />
                        )}
                        <span className="hidden sm:inline">{isRecording ? "Stop" : "Voice"}</span>
                      </Button>
                    </div>

                    {(inputText || selectedFile) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClear}
                        className="text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-md transition-colors text-xs font-bold uppercase tracking-wider h-8"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 space-y-0">
                {mode === "text" ? (
                  <div className="px-6 pt-6">
                    <Textarea
                      placeholder="Paste legal text, jargon, or complex content here..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="h-[300px] md:h-[400px] resize-none overflow-y-auto bg-transparent border-none focus-visible:ring-0 text-base leading-relaxed transition-all placeholder:text-neutral-700 p-0 text-neutral-200"
                    />
                  </div>
                ) : (
                  <div className="p-6">
                    {!imagePreview ? (
                      <div
                        className="h-[300px] md:h-[400px] border-2 border-dashed border-neutral-800 rounded-xl flex flex-col items-center justify-center gap-4 group/upload hover:border-blue-500/50 hover:bg-blue-500/5 transition-all cursor-pointer relative"
                        onClick={() => document.getElementById('vision-upload')?.click()}
                      >
                        <input
                          id="vision-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                        <div className="p-4 rounded-full bg-neutral-900 border border-neutral-800 group-hover/upload:scale-110 group-hover/upload:border-blue-500/50 transition-all duration-300">
                          <Upload className="w-8 h-8 text-neutral-600 group-hover/upload:text-blue-400" />
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] font-black text-neutral-300 uppercase tracking-[0.2em]">Upload Image</p>
                          <p className="text-xs text-neutral-600 mt-2 font-medium">Screenshots, documents, or diagrams</p>
                        </div>
                        <Button variant="outline" size="sm" className="mt-2 border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800 text-[10px] font-black uppercase tracking-widest h-8 px-4">
                          Browse Files
                        </Button>
                      </div>
                    ) : (
                      <div className="relative group/preview h-[300px] md:h-[400px] rounded-xl overflow-hidden border border-neutral-800 bg-black/40">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-contain"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => document.getElementById('vision-upload-change')?.click()}
                            className="bg-black/50 border-white/20 hover:bg-black/80 text-white text-[10px] font-black uppercase tracking-widest h-9 px-4"
                          >
                            <ImageIcon className="w-4 h-4 mr-2" />
                            Change
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={removeFile}
                            className="text-[10px] font-black uppercase tracking-widest h-9 px-4"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Remove
                          </Button>
                        </div>
                        <input
                          id="vision-upload-change"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </div>
                    )}
                  </div>
                )}
                <div className="p-6 pt-2">
                  <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">
                        {mode === "text"
                          ? `${inputText.length.toLocaleString()} characters`
                          : selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : "No file selected"
                        }
                      </span>
                    </div>
                    <Button
                      onClick={handleSimplify}
                      disabled={isPending || (mode === "text" ? !inputText.trim() : !selectedFile)}
                      className="gap-2 bg-white hover:bg-neutral-200 text-black shadow-md transition-all duration-300 font-bold rounded-md px-6 h-10"
                    >
                      {isPending ? (
                        <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          <span>{mode === "text" ? "Simplify" : "Analyze Image"}</span>
                          <ArrowRight className="w-3.5 h-3.5 opacity-50 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Output Card */}
            <Card className="bg-neutral-900/50 backdrop-blur-sm border-neutral-800 hover:border-neutral-700 transition-all duration-300 shadow-xl rounded-lg overflow-hidden group flex flex-col">
              <CardHeader className="pb-4 border-b border-neutral-800 px-6 shrink-0">
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
              <CardContent className="p-0 flex flex-col flex-1 overflow-hidden">
                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar relative p-6">
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
                        {selectedPersona === "flowchart" ? (
                          <Mermaid chart={outputText} />
                        ) : (
                          <ReactMarkdown
                            components={{
                              p: ({ node, ...props }) => <p className="mb-4 last:mb-0 leading-loose" {...props} />,
                              ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 space-y-2 text-neutral-200" {...props} />,
                              ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-4 space-y-2 text-neutral-200" {...props} />,
                              li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                              strong: ({ node, ...props }) => <strong className="font-bold text-blue-300" {...props} />,
                              h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mb-4 mt-6 text-white" {...props} />,
                              h2: ({ node, ...props }) => <h2 className="text-xl font-bold mb-3 mt-5 text-white" {...props} />,
                              h3: ({ node, ...props }) => <h3 className="text-lg font-bold mb-2 mt-4 text-white" {...props} />,
                              blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-neutral-700 pl-4 italic text-neutral-400 my-4 bg-neutral-900/50 p-2 rounded-r" {...props} />,
                              code: ({ node, ...props }) => <code className="bg-neutral-800 px-1 py-0.5 rounded text-sm font-mono text-amber-300" {...props} />,
                            }}
                          >
                            {outputText}
                          </ReactMarkdown>
                        )}
                      </div>

                      {/* Chat History Area */}
                      {chatHistory.length > 0 && (
                        <div className="mt-12 pt-8 border-t border-neutral-800">
                          <div className="flex items-center gap-2 mb-6">
                            <MessageCircleQuestion className="w-4 h-4 text-blue-500" />
                            <h4 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Clarification Chat</h4>
                          </div>

                          <div className="space-y-6">
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
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-neutral-700 py-12">
                      <BookOpen className="w-10 h-10 opacity-10 mb-4" />
                      <p className="font-bold text-xs uppercase tracking-[0.2em] opacity-40">Ready for conversion</p>
                    </div>
                  )}
                </div>

                {/* Sticky Chat Input at Bottom */}
                {outputText && !error && !isPending && (
                  <div className="p-6 border-t border-neutral-800 bg-neutral-900/50 backdrop-blur-sm">
                    {!chatHistory.length && (
                      <div className="flex items-center gap-2 mb-3">
                        <MessageCircleQuestion className="w-3 h-3 text-blue-500/70" />
                        <span className="text-[9px] font-black text-neutral-500 uppercase tracking-[0.1em]">Clarification Chat</span>
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
                )}
              </CardContent>
            </Card>
          </div>
          {/* Features Section */}
          {/* Bento Grid Features Section */}
          <div className="mt-24 mb-16 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

              {/* Card 1: Clarity Score (Purple) */}
              <div className="col-span-1 bg-purple-500/10 border border-purple-500/20 rounded-2xl p-6 flex flex-col justify-between h-[200px] hover:bg-purple-500/15 transition-all group">
                <div>
                  <h3 className="text-5xl font-bold text-white mb-2 tracking-tighter group-hover:scale-105 transition-transform origin-left">99%</h3>
                  <p className="text-sm font-bold text-purple-200 uppercase tracking-wide">Clarity Score</p>
                </div>
                <div className="w-full h-12 bg-purple-500/20 rounded-xl overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/20 to-transparent w-full h-full animate-[shimmer_2s_infinite] -translate-x-full" />
                  <svg className="w-full h-full text-purple-400/40" viewBox="0 0 100 20" preserveAspectRatio="none">
                    <path d="M0,20 Q20,5 40,15 T80,10 T100,18 V20 H0 Z" fill="currentColor" />
                  </svg>
                </div>
              </div>

              {/* Card 2: Hero/Main Value (Dark Central) */}
              <div className="col-span-1 md:col-span-2 bg-neutral-900 border border-neutral-800 rounded-2xl p-8 flex flex-col justify-center relative overflow-hidden group">
                <div className="absolute top-4 left-6 flex -space-x-2">
                  {[FileText, Globe, Mic, Workflow].map((Icon, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center z-10 hover:z-20 hover:scale-110 transition-all">
                      <Icon className="w-4 h-4 text-neutral-400" />
                    </div>
                  ))}
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white z-0 pl-1">
                    5+
                  </div>
                </div>

                <div className="mt-8 relative z-10">
                  <h3 className="text-3xl font-bold text-white leading-tight mb-2">
                    Translate Jargon.<br />
                    <span className="text-neutral-500">Understand Instantly.</span>
                  </h3>
                  <p className="text-sm text-neutral-400 max-w-sm mt-2 font-medium">
                    Advanced AI that turns legalese, medical reports, and technical docs into plain English.
                  </p>
                </div>
                <div className="absolute right-0 bottom-0 w-32 h-32 bg-gradient-to-tl from-blue-500/10 to-transparent blur-3xl pointer-events-none" />
              </div>

              {/* Card 3: Speed/Latency (Emerald) */}
              <div className="col-span-1 bg-emerald-900/20 border border-emerald-500/20 rounded-2xl p-6 flex flex-col justify-between h-[200px] hover:bg-emerald-900/30 transition-all">
                <div>
                  <h3 className="text-5xl font-bold text-white mb-2 tracking-tighter">0s</h3>
                  <p className="text-sm font-bold text-emerald-200 uppercase tracking-wide">Latency</p>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <Zap className="w-5 h-5 text-emerald-400 fill-current animate-pulse" />
                  <span className="text-xs text-emerald-400/80 font-mono">Real-time</span>
                </div>
              </div>

              {/* Card 4: Trust/Users (Wide Bottom) */}
              <div className="col-span-1 md:col-span-3 bg-white border border-white/10 rounded-2xl p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden relative">
                <div className="absolute inset-0 bg-neutral-950 opacity-[0.97]" /> {/* Dark overlay since main bg is dark */}

                <div className="relative z-10">
                  <p className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-1">Trusted by Professionals</p>
                  <h4 className="text-xl font-bold text-white">Chosen for critical understanding.</h4>
                </div>

                <div className="relative z-10 flex flex-wrap gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    <span className="font-serif font-bold text-lg">Legal<span className="text-blue-500">Corp</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    <span className="font-sans font-bold text-lg tracking-tight">Medi<span className="text-emerald-500">Care</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    <span className="font-mono font-bold text-lg">Uni<span className="text-amber-500">Learn</span></span>
                  </div>
                </div>
              </div>

              {/* Card 5: Formats (Lime/Yellow) */}
              <div className="col-span-1 bg-[#dfff9b] rounded-2xl p-6 flex flex-col justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#a3cc29_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />

                <div className="relative z-10">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {["PDF", "Doc", "Audio", "Image"].map((tag, i) => (
                      <span key={i} className="px-2 py-1 bg-white/80 backdrop-blur rounded-md text-[10px] font-black uppercase tracking-wider text-[#5a7a00] shadow-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h4 className="text-lg font-bold text-[#3f5200] leading-tight">
                    Handles every format.
                  </h4>
                </div>
              </div>

            </div>
          </div>

          {/* Footer */}
          <footer className="mt-20 pt-8 border-t border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-6 opacity-40 hover:opacity-100 transition-opacity pb-12">
            <div className="flex items-center gap-6 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
              <span className="text-neutral-400">© 2025 theqexle</span>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}


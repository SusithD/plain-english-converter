"use client";

import { useState, useTransition } from "react";
import { simplifyText, PersonaType } from "./actions";
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
      badgeColor: "bg-blue-50 text-blue-600 border-blue-100",
    },
    {
      value: "tldr",
      label: "TL;DR",
      description: "One sentence summary",
      icon: <FileDigit className="w-4 h-4" />,
      badge: "Quick",
      badgeColor: "bg-amber-50 text-amber-600 border-amber-100",
    },
    {
      value: "professional",
      label: "Professional",
      description: "Corporate safe",
      icon: <Briefcase className="w-4 h-4" />,
      badge: "Formal",
      badgeColor: "bg-slate-50 text-slate-600 border-slate-200",
    },
    {
      value: "roast",
      label: "Roast Mode",
      description: "Roast the jargon",
      icon: <Flame className="w-4 h-4" />,
      badge: "Viral",
      badgeColor: "bg-orange-50 text-orange-600 border-orange-100",
    },
  ];

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedPersona, setSelectedPersona] = useState<PersonaType>("eli5");

  const currentPersona = personas.find((p) => p.value === selectedPersona)!;

  const handleSimplify = () => {
    setError("");
    setOutputText("");

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
    setInputText("");
    setOutputText("");
    setError("");
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
      {/* Subtle decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top right gradient blob */}
        <div
          className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-40"
          style={{
            background:
              "radial-gradient(circle, oklch(0.92 0.05 280) 0%, transparent 70%)",
          }}
        />
        {/* Bottom left gradient blob */}
        <div
          className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full opacity-40"
          style={{
            background:
              "radial-gradient(circle, oklch(0.92 0.04 200) 0%, transparent 70%)",
          }}
        />
        {/* Center subtle glow */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-30"
          style={{
            background:
              "radial-gradient(ellipse, oklch(0.95 0.03 270) 0%, transparent 70%)",
          }}
        />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `
              linear-gradient(oklch(0.50 0.18 270) 1px, transparent 1px),
              linear-gradient(90deg, oklch(0.50 0.18 270) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-8 md:py-16 max-w-7xl">
        {/* Header */}
        <header className="text-center mb-12 md:mb-16">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 mb-6 shadow-sm">
            <Wand2 className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              AI-Powered Simplification
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-5 text-foreground tracking-tight">
            Plain English
            <span className="block mt-1 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
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
          <Card className="bg-card/80 backdrop-blur-sm border border-border/60 shadow-lg shadow-primary/[0.03] hover:shadow-xl hover:shadow-primary/[0.05] transition-shadow duration-300">
            <CardHeader className="pb-4 border-b border-border/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10">
                    <FileText className="w-5 h-5 text-primary" />
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
                className="h-[280px] md:h-[360px] resize-none overflow-y-auto bg-muted/30 border-border/50 focus:border-primary/40 focus:ring-2 focus:ring-primary/10 text-base transition-all rounded-xl placeholder:text-muted-foreground/60"
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
                    "gap-2.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 font-medium px-6",
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
          <Card className="bg-card/80 backdrop-blur-sm border border-border/60 shadow-lg shadow-primary/[0.03] hover:shadow-xl hover:shadow-primary/[0.05] transition-shadow duration-300">
            <CardHeader className="pb-4 border-b border-border/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={clsx(
                      "p-2.5 rounded-xl border",
                      selectedPersona === "roast"
                        ? "bg-gradient-to-br from-orange-500/10 to-red-500/5 border-orange-500/10"
                        : "bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border-emerald-500/10"
                    )}
                  >
                    {selectedPersona === "roast" ? (
                      <Flame className="w-5 h-5 text-orange-600" />
                    ) : (
                      <Sparkles className="w-5 h-5 text-emerald-600" />
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className={clsx(
                      "gap-2 transition-all font-medium",
                      copied
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        : "hover:bg-muted/60 border-border/60"
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
            <CardContent className="pt-5">
              <div className="min-h-[280px] md:min-h-[360px] rounded-xl bg-muted/30 border border-border/50 p-5 overflow-y-auto">
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
                    <div className="p-4 rounded-2xl bg-red-50 border border-red-100">
                      <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-red-600 mb-1.5">
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
                  <p className="text-base leading-relaxed whitespace-pre-wrap text-foreground">
                    {outputText}
                  </p>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-6">
                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                      <BookOpen className="w-8 h-8 text-primary/70" />
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
                )}
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
                        ? "bg-orange-50 border-orange-100"
                        : "bg-emerald-50 border-emerald-100"
                    )}
                  >
                    <Check
                      className={clsx(
                        "w-3.5 h-3.5",
                        selectedPersona === "roast"
                          ? "text-orange-600"
                          : "text-emerald-600"
                      )}
                    />
                    <span
                      className={clsx(
                        "text-xs font-medium",
                        selectedPersona === "roast"
                          ? "text-orange-700"
                          : "text-emerald-700"
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
                className="group relative p-6 rounded-2xl bg-card/60 border border-border/50 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/[0.03] transition-all duration-300"
              >
                <div className="absolute top-4 right-4 text-4xl font-bold text-primary/5 group-hover:text-primary/10 transition-colors">
                  {feature.step}
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10 w-fit mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
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
          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-muted/40 border border-border/50">
            <span className="text-sm text-muted-foreground">Powered by</span>
            <span className="text-sm font-semibold text-foreground">
              Llama 3.3 70B
            </span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/40"></span>
            <span className="text-sm text-muted-foreground">Groq Cloud</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

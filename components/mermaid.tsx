"use client";

import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { Loader2 } from "lucide-react";

// Initialize mermaid
// We use a useEffect globally or just initialize here, assuming client-side only import.
// Using 'try-catch' around initialize in case it runs on server (though 'use client' prevents most issues)
try {
    mermaid.initialize({
        startOnLoad: false,
        theme: "dark",
        securityLevel: "loose",
        fontFamily: "inherit",
        themeVariables: {
            darkMode: true,
            background: "#0a0a0a",
            primaryColor: "#3b82f6",
            secondaryColor: "#10b981",
            tertiaryColor: "#6366f1",
            primaryTextColor: "#e5e5e5",
            secondaryTextColor: "#e5e5e5",
            tertiaryTextColor: "#e5e5e5",
            lineColor: "#525252",
        }
    });
} catch (e) {
    console.error("Mermaid initialization failed", e);
}

interface MermaidProps {
    chart: string;
}

export default function Mermaid({ chart }: MermaidProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const renderChart = async () => {
            if (!chart) return;

            setLoading(true);
            setError(null);

            try {
                // Generate a unique ID for this render to prevent collisions
                const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

                // mermaid.render returns an object with the SVG string
                const { svg } = await mermaid.render(id, chart);

                if (ref.current) {
                    ref.current.innerHTML = svg;
                }
            } catch (err) {
                console.error("Mermaid rendering error:", err);
                setError("Failed to render flowchart. The syntax might be invalid.");
            } finally {
                setLoading(false);
            }
        };

        // Small timeout to ensure DOM is ready and prevent potential race conditions
        const timeoutId = setTimeout(() => {
            renderChart();
        }, 100);

        return () => clearTimeout(timeoutId);
    }, [chart]);

    if (!chart) return null;

    return (
        <div className="w-full overflow-x-auto bg-[#0a0a0a] rounded-xl border border-white/5 p-6 flex flex-col items-center justify-center min-h-[200px] my-4 shadow-inner">
            {loading && (
                <div className="flex flex-col items-center gap-3 text-neutral-400 animate-pulse">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                    <span className="text-sm font-medium">Generating visualization...</span>
                </div>
            )}

            {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm p-4 bg-red-500/5 rounded-lg border border-red-500/10 w-full justify-center">
                    <span className="font-bold">Error:</span> {error}
                </div>
            )}

            <div
                ref={ref}
                className={`w-full flex justify-center transition-all duration-500 ${loading ? 'opacity-0 hidden' : 'opacity-100 scale-100'}`}
            />
        </div>
    );
}

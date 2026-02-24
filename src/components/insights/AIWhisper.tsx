"use client";

import { MessageCircle, X } from "lucide-react";
import { useState } from "react";

interface AIWhisperProps {
    message: string;
    healthStatus: "good" | "warning" | "critical";
}

export default function AIWhisper({ message, healthStatus }: AIWhisperProps) {
    const [dismissed, setDismissed] = useState(false);

    if (!message || dismissed) return null;

    const statusConfig = {
        good: {
            bg: "rgba(0, 184, 148, 0.06)",
            border: "rgba(0, 184, 148, 0.12)",
            accent: "var(--color-success)",
        },
        warning: {
            bg: "rgba(253, 203, 110, 0.06)",
            border: "rgba(253, 203, 110, 0.12)",
            accent: "var(--color-warning)",
        },
        critical: {
            bg: "rgba(225, 112, 85, 0.06)",
            border: "rgba(225, 112, 85, 0.12)",
            accent: "var(--color-critical)",
        },
    };

    const config = statusConfig[healthStatus];

    return (
        <div
            className="relative rounded-2xl p-4 animate-fade-in-up overflow-hidden"
            style={{
                background: config.bg,
                border: `1px solid ${config.border}`,
            }}>
            {/* Left accent bar */}
            <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full"
                style={{ background: config.accent }} />

            <button
                onClick={() => setDismissed(true)}
                className="absolute top-3 right-3 p-1.5 rounded-lg transition-colors hover:bg-white/5"
                style={{ color: "var(--color-text-muted)" }}>
                <X className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-start gap-3 pl-3 pr-6">
                <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: config.border }}>
                    <MessageCircle className="w-4 h-4" style={{ color: config.accent }} />
                </div>
                <div>
                    <p className="text-[10px] uppercase tracking-widest font-semibold mb-1"
                        style={{ color: "var(--color-text-muted)" }}>
                        AI Whisper
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                        {message}
                    </p>
                </div>
            </div>
        </div>
    );
}

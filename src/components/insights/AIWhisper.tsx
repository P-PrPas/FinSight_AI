"use client";

import { MessageCircle, X, Sparkles } from "lucide-react";
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
            bg: "linear-gradient(135deg, rgba(34, 197, 94, 0.06), rgba(52, 211, 153, 0.03))",
            border: "rgba(34, 197, 94, 0.12)",
            accent: "var(--color-success)",
            iconBg: "rgba(34, 197, 94, 0.1)",
        },
        warning: {
            bg: "linear-gradient(135deg, rgba(251, 191, 36, 0.06), rgba(245, 158, 11, 0.03))",
            border: "rgba(251, 191, 36, 0.12)",
            accent: "var(--color-warning)",
            iconBg: "rgba(251, 191, 36, 0.1)",
        },
        critical: {
            bg: "linear-gradient(135deg, rgba(248, 113, 113, 0.06), rgba(239, 68, 68, 0.03))",
            border: "rgba(248, 113, 113, 0.12)",
            accent: "var(--color-critical)",
            iconBg: "rgba(248, 113, 113, 0.1)",
        },
    };

    const config = statusConfig[healthStatus];

    return (
        <div
            className="relative rounded-2xl p-5 animate-fade-in-up overflow-hidden"
            style={{
                background: config.bg,
                border: `1px solid ${config.border}`,
            }}>
            {/* Left accent bar */}
            <div className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full"
                style={{ background: config.accent }} />

            <button
                onClick={() => setDismissed(true)}
                className="absolute top-3.5 right-3.5 p-1.5 rounded-lg transition-colors hover:bg-white/5"
                style={{ color: "var(--color-text-muted)" }}>
                <X className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-start gap-3.5 pl-3 pr-8">
                <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: config.iconBg }}>
                    <Sparkles className="w-4 h-4" style={{ color: config.accent }} />
                </div>
                <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                        <p className="text-[10px] uppercase tracking-[0.12em] font-bold"
                            style={{ color: "var(--color-text-muted)" }}>
                            AI Whisper
                        </p>
                        <MessageCircle className="w-3 h-3" style={{ color: "var(--color-text-muted)" }} />
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                        {message}
                    </p>
                </div>
            </div>
        </div>
    );
}

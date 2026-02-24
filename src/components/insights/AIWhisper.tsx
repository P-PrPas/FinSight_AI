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
            bg: "rgba(46, 213, 115, 0.08)",
            border: "rgba(46, 213, 115, 0.2)",
            iconColor: "var(--color-success)",
        },
        warning: {
            bg: "rgba(255, 165, 2, 0.08)",
            border: "rgba(255, 165, 2, 0.2)",
            iconColor: "var(--color-warning)",
        },
        critical: {
            bg: "rgba(255, 71, 87, 0.08)",
            border: "rgba(255, 71, 87, 0.2)",
            iconColor: "var(--color-critical)",
        },
    };

    const config = statusConfig[healthStatus];

    return (
        <div
            className="relative rounded-2xl p-4 animate-fade-in-up"
            style={{
                background: config.bg,
                border: `1px solid ${config.border}`,
            }}>
            <button
                onClick={() => setDismissed(true)}
                className="absolute top-3 right-3 p-1 rounded-full transition-colors hover:bg-white/5"
                style={{ color: "var(--color-text-muted)" }}>
                <X className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-start gap-3 pr-6">
                <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: `${config.border}`, color: config.iconColor }}>
                    <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                    <p className="text-[10px] uppercase tracking-wider font-medium mb-1" style={{ color: "var(--color-text-muted)" }}>
                        AI Whisper 💬
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-primary)" }}>
                        {message}
                    </p>
                </div>
            </div>
        </div>
    );
}

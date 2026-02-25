"use client";

import { Flame } from "lucide-react";

interface StreakCounterProps {
    count: number;
}

export default function StreakCounter({ count }: StreakCounterProps) {
    const isHot = count >= 7;
    const isWarm = count >= 3;

    return (
        <div
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold ${count > 0 ? "animate-streak" : ""}`}
            style={{
                background: isHot
                    ? "linear-gradient(135deg, #ef4444, #f59e0b)"
                    : isWarm
                        ? "rgba(251, 191, 36, 0.1)"
                        : "rgba(255,255,255,0.04)",
                color: isHot
                    ? "white"
                    : isWarm
                        ? "var(--color-warning)"
                        : "var(--color-text-muted)",
                border: isHot ? "none" : "1px solid rgba(255,255,255,0.06)",
                boxShadow: isHot ? "0 4px 16px rgba(239, 68, 68, 0.3)" : "none",
            }}>
            <Flame className={`w-4 h-4 ${isHot ? "animate-float" : ""}`} />
            <span className="tabular-nums">{count}</span>
            <span className="text-[10px] font-semibold opacity-70">วัน</span>
        </div>
    );
}

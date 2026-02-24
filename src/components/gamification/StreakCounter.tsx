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
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-sm font-bold ${count > 0 ? "animate-streak" : ""}`}
            style={{
                background: isHot
                    ? "linear-gradient(135deg, #e17055, #fdcb6e)"
                    : isWarm
                        ? "rgba(253, 203, 110, 0.1)"
                        : "rgba(255,255,255,0.04)",
                color: isHot
                    ? "white"
                    : isWarm
                        ? "var(--color-warning)"
                        : "var(--color-text-muted)",
                border: isHot ? "none" : "1px solid rgba(255,255,255,0.06)",
                boxShadow: isHot ? "0 2px 12px rgba(225, 112, 85, 0.3)" : "none",
            }}>
            <Flame className="w-4 h-4" />
            <span className="tabular-nums">{count}</span>
            <span className="text-[10px] font-semibold opacity-70">วัน</span>
        </div>
    );
}

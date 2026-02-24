"use client";

import { Flame } from "lucide-react";

interface StreakCounterProps {
    count: number;
}

export default function StreakCounter({ count }: StreakCounterProps) {
    return (
        <div className="flex items-center gap-2">
            <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${count > 0 ? "animate-streak" : ""
                    }`}
                style={{
                    background:
                        count >= 7
                            ? "linear-gradient(135deg, #ff6b6b, #ffa502)"
                            : count >= 3
                                ? "rgba(255, 165, 2, 0.15)"
                                : "rgba(136, 136, 168, 0.1)",
                    color:
                        count >= 7
                            ? "white"
                            : count >= 3
                                ? "var(--color-warning)"
                                : "var(--color-text-secondary)",
                    border: count >= 7 ? "none" : "1px solid var(--color-border)",
                }}>
                <Flame className="w-4 h-4" />
                <span>{count}</span>
                <span className="text-xs font-normal opacity-80">วัน</span>
            </div>
        </div>
    );
}

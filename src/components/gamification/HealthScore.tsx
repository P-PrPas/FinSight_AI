"use client";

import { getHealthStatus } from "@/lib/gamification";

interface HealthScoreProps {
    score: number;
}

export default function HealthScore({ score }: HealthScoreProps) {
    const { color, label } = getHealthStatus(score);
    const circumference = 2 * Math.PI * 38;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="flex items-center gap-3">
            <div className="relative w-[72px] h-[72px]">
                {/* Glow behind */}
                <div className="absolute inset-0 rounded-full opacity-20 blur-md"
                    style={{ background: color }} />
                <svg className="w-full h-full -rotate-90 relative" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle
                        cx="50" cy="50" r="38"
                        fill="none"
                        stroke="rgba(255,255,255,0.04)"
                        strokeWidth="7"
                    />
                    {/* Progress circle */}
                    <circle
                        cx="50" cy="50" r="38"
                        fill="none"
                        stroke={color}
                        strokeWidth="7"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        className="transition-all duration-1000 ease-out"
                        style={{ filter: `drop-shadow(0 0 6px ${color}40)` }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold tabular-nums" style={{ color }}>
                        {score}
                    </span>
                </div>
            </div>
            <div>
                <p className="text-[10px] uppercase tracking-widest font-semibold"
                    style={{ color: "var(--color-text-muted)" }}>
                    สุขภาพการเงิน
                </p>
                <p className="text-sm font-bold mt-0.5" style={{ color }}>
                    {label}
                </p>
            </div>
        </div>
    );
}

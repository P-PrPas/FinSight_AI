"use client";

import { getHealthStatus } from "@/lib/gamification";

interface HealthScoreProps {
    score: number;
}

export default function HealthScore({ score }: HealthScoreProps) {
    const { color, label } = getHealthStatus(score);
    const circumference = 2 * Math.PI * 40;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="flex items-center gap-4">
            <div className="relative w-[80px] h-[80px]">
                {/* Glow behind */}
                <div className="absolute inset-1 rounded-full opacity-25 blur-lg"
                    style={{ background: color }} />
                <svg className="w-full h-full -rotate-90 relative" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle
                        cx="50" cy="50" r="40"
                        fill="none"
                        stroke="rgba(255,255,255,0.04)"
                        strokeWidth="6"
                    />
                    {/* Progress circle */}
                    <circle
                        cx="50" cy="50" r="40"
                        fill="none"
                        stroke={color}
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        className="transition-all duration-1000 ease-out"
                        style={{ filter: `drop-shadow(0 0 8px ${color}50)` }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold tabular-nums" style={{ color }}>
                        {score}
                    </span>
                </div>
            </div>
            <div>
                <p className="text-[10px] uppercase tracking-[0.12em] font-semibold mb-0.5"
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

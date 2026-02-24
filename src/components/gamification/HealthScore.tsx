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
        <div className="flex items-center gap-3">
            <div className="relative w-16 h-16">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="var(--color-border)"
                        strokeWidth="8"
                    />
                    {/* Progress circle */}
                    <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke={color}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-base font-bold" style={{ color }}>
                        {score}
                    </span>
                </div>
            </div>
            <div>
                <p className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
                    สุขภาพการเงิน
                </p>
                <p className="text-sm font-semibold" style={{ color }}>
                    {label}
                </p>
            </div>
        </div>
    );
}

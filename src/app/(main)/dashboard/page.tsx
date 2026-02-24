"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import QuickAddInput from "@/components/quick-add/QuickAddInput";
import DynamicWidgets from "@/components/quick-add/DynamicWidgets";
import StreakCounter from "@/components/gamification/StreakCounter";
import HealthScore from "@/components/gamification/HealthScore";
import PersonaCard from "@/components/gamification/PersonaCard";
import AIWhisper from "@/components/insights/AIWhisper";
import { useAppStore } from "@/store/useAppStore";
import { getGreeting, formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, Wallet, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
    const { data: session } = useSession();
    const {
        userName, streakCount, healthScore, persona, personaEmoji,
        whisperMessage, healthStatus, leakInsight,
        setTransactions, setUserInfo, setWhisper, setCategories,
    } = useAppStore();

    const [summary, setSummary] = useState({
        totalExpense: 0, totalIncome: 0, balance: 0,
        budgetUsage: 0, transactionCount: 0, totalBudget: 0,
    });
    const [categoryBreakdown, setCategoryBreakdown] = useState<
        Record<string, { amount: number; icon: string }>
    >({});
    const [recentTransactions, setRecentTransactions] = useState<Array<{
        id: string; description: string; amount: number; type: string;
        category?: { icon: string; name: string }; createdAt: string;
    }>>([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboard = useCallback(async () => {
        try {
            const [dashRes, catRes] = await Promise.all([
                fetch("/api/dashboard"),
                fetch("/api/categories"),
            ]);

            if (dashRes.ok) {
                const data = await dashRes.json();
                setUserInfo({
                    userName: data.user.name || "",
                    streakCount: data.user.streakCount,
                    healthScore: data.user.healthScore,
                    persona: data.user.persona,
                    personaEmoji: data.user.personaEmoji,
                });
                setSummary(data.summary);
                setCategoryBreakdown(data.categoryBreakdown);
                setRecentTransactions(data.recentTransactions);
                setTransactions(data.recentTransactions);
            }

            if (catRes.ok) {
                const cats = await catRes.json();
                setCategories(cats);
            }
        } catch (error) {
            console.error("Dashboard fetch error:", error);
        } finally {
            setLoading(false);
        }
    }, [setUserInfo, setTransactions, setCategories]);

    const fetchWhisper = useCallback(async () => {
        try {
            const res = await fetch("/api/ai/whisper", { method: "POST" });
            if (res.ok) {
                const data = await res.json();
                setWhisper({
                    whisperMessage: data.whisper_message,
                    healthStatus: data.health_status,
                });
                if (data.leak_insight) {
                    setWhisper({ leakInsight: data.leak_insight } as { whisperMessage?: string; leakInsight?: string; healthStatus?: "good" | "warning" | "critical" });
                }
            }
        } catch (error) {
            console.error("Whisper fetch error:", error);
        }
    }, [setWhisper]);

    useEffect(() => {
        if (session?.user) {
            fetchDashboard();
            fetchWhisper();
        }
    }, [session, fetchDashboard, fetchWhisper]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center animate-pulse-glow"
                        style={{ background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-light))" }}>
                        <span className="text-2xl">✨</span>
                    </div>
                    <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>กำลังโหลดข้อมูล...</p>
                </div>
            </div>
        );
    }

    const sortedCategories = Object.entries(categoryBreakdown)
        .sort(([, a], [, b]) => b.amount - a.amount)
        .slice(0, 4);

    return (
        <div className="px-5 py-6 space-y-6 page-enter">
            {/* ── Hero Header ── */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-medium mb-0.5" style={{ color: "var(--color-text-muted)" }}>
                        {getGreeting()}
                    </p>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {userName || session?.user?.name || "User"}
                    </h1>
                </div>
                <StreakCounter count={streakCount} />
            </div>

            {/* ── Persona + Health Score Card ── */}
            <div className="card p-5">
                <div className="flex items-center justify-between">
                    <PersonaCard name={persona} emoji={personaEmoji} />
                    <div className="flex-shrink-0">
                        <HealthScore score={healthScore} />
                    </div>
                </div>
            </div>

            {/* ── AI Whisper ── */}
            <AIWhisper message={whisperMessage} healthStatus={healthStatus} />

            {/* ── Leak Insight ── */}
            {leakInsight && (
                <div className="rounded-2xl p-4 animate-fade-in-up"
                    style={{
                        background: "linear-gradient(135deg, rgba(253, 203, 110, 0.06), rgba(225, 112, 85, 0.04))",
                        border: "1px solid rgba(253, 203, 110, 0.1)",
                    }}>
                    <div className="flex items-start gap-3">
                        <span className="text-lg flex-shrink-0">🔍</span>
                        <div>
                            <p className="text-[10px] uppercase tracking-widest font-semibold mb-1"
                                style={{ color: "var(--color-warning)" }}>
                                Leak Detector
                            </p>
                            <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                                {leakInsight}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Summary Cards ── */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: "รายจ่าย", value: summary.totalExpense, color: "var(--color-expense)", icon: TrendingDown, gradient: "rgba(255, 118, 117, 0.06)" },
                    { label: "รายรับ", value: summary.totalIncome, color: "var(--color-income)", icon: TrendingUp, gradient: "rgba(0, 206, 201, 0.06)" },
                    { label: "คงเหลือ", value: summary.balance, color: summary.balance >= 0 ? "var(--color-income)" : "var(--color-expense)", icon: Wallet, gradient: "rgba(108, 92, 231, 0.06)" },
                ].map(({ label, value, color, icon: Icon, gradient }) => (
                    <div key={label} className="rounded-2xl p-4"
                        style={{
                            background: gradient,
                            border: "1px solid rgba(255,255,255,0.04)",
                        }}>
                        <div className="flex items-center gap-1.5 mb-2">
                            <Icon className="w-3.5 h-3.5" style={{ color }} />
                            <span className="text-[10px] font-semibold uppercase tracking-wider"
                                style={{ color: "var(--color-text-muted)" }}>{label}</span>
                        </div>
                        <p className="text-lg font-bold tracking-tight" style={{ color }}>
                            {formatCurrency(value)}
                        </p>
                    </div>
                ))}
            </div>

            {/* ── Budget Progress ── */}
            {summary.totalBudget > 0 && (
                <div className="card p-4">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold" style={{ color: "var(--color-text-secondary)" }}>
                            งบประมาณเดือนนี้
                        </span>
                        <span className="text-xs tabular-nums" style={{ color: "var(--color-text-muted)" }}>
                            {formatCurrency(summary.totalExpense)} / {formatCurrency(summary.totalBudget)}
                        </span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
                        <div
                            className="h-full rounded-full transition-all duration-1000 ease-out"
                            style={{
                                width: `${Math.min(summary.budgetUsage, 100)}%`,
                                background: summary.budgetUsage > 90
                                    ? "linear-gradient(90deg, var(--color-warning), var(--color-critical))"
                                    : summary.budgetUsage > 70
                                        ? "linear-gradient(90deg, var(--color-success), var(--color-warning))"
                                        : "linear-gradient(90deg, var(--color-accent), var(--color-accent-light))",
                            }}
                        />
                    </div>
                </div>
            )}

            {/* ── Quick Add ── */}
            <div>
                <div className="section-header">บันทึกด่วน</div>
                <QuickAddInput />
            </div>

            {/* ── Dynamic Widgets ── */}
            <div>
                <div className="section-header">กดปุ่มเดียวบันทึก</div>
                <DynamicWidgets />
            </div>

            {/* ── Category Breakdown ── */}
            {sortedCategories.length > 0 && (
                <div className="card p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="section-header" style={{ marginBottom: 0 }}>หมวดหมู่เดือนนี้</div>
                        <Link href="/insights"
                            className="text-xs flex items-center gap-1 font-medium transition-colors hover:brightness-125"
                            style={{ color: "var(--color-accent-light)" }}>
                            ดูทั้งหมด <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="space-y-3.5">
                        {sortedCategories.map(([name, data]) => {
                            const percent = summary.totalExpense > 0 ? (data.amount / summary.totalExpense) * 100 : 0;
                            return (
                                <div key={name} className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                                        style={{ background: "rgba(255,255,255,0.04)" }}>
                                        {data.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-medium truncate">{name}</span>
                                            <span className="text-xs font-semibold tabular-nums"
                                                style={{ color: "var(--color-text-secondary)" }}>
                                                {formatCurrency(data.amount)}
                                            </span>
                                        </div>
                                        <div className="h-1.5 rounded-full overflow-hidden"
                                            style={{ background: "rgba(255,255,255,0.04)" }}>
                                            <div
                                                className="h-full rounded-full transition-all duration-700 ease-out"
                                                style={{
                                                    width: `${percent}%`,
                                                    background: "linear-gradient(90deg, var(--color-accent), var(--color-accent-light))",
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── Recent Transactions ── */}
            {recentTransactions.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <div className="section-header" style={{ marginBottom: 0 }}>รายการล่าสุด</div>
                        <Link href="/history"
                            className="text-xs flex items-center gap-1 font-medium transition-colors hover:brightness-125"
                            style={{ color: "var(--color-accent-light)" }}>
                            ดูทั้งหมด <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="space-y-2">
                        {recentTransactions.slice(0, 5).map((tx) => (
                            <div
                                key={tx.id}
                                className="flex items-center justify-between p-3.5 rounded-2xl transition-all duration-200 hover:bg-white/[0.02]"
                                style={{
                                    background: "rgba(22, 22, 35, 0.4)",
                                    border: "1px solid rgba(255,255,255,0.04)",
                                }}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                                        style={{ background: "rgba(255,255,255,0.04)" }}>
                                        {tx.category?.icon || "📌"}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{tx.description}</p>
                                        <p className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>
                                            {tx.category?.name} · {new Date(tx.createdAt).toLocaleDateString("th-TH", { day: "numeric", month: "short" })}
                                        </p>
                                    </div>
                                </div>
                                <span
                                    className="text-sm font-bold tabular-nums"
                                    style={{ color: tx.type === "income" ? "var(--color-income)" : "var(--color-expense)" }}>
                                    {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

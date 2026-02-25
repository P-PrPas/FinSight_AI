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
import { TrendingUp, TrendingDown, Wallet, ArrowRight, AlertTriangle } from "lucide-react";
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
                <div className="flex flex-col items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center animate-pulse-glow"
                        style={{ background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-light))" }}>
                        <span className="text-2xl">✨</span>
                    </div>
                    <div className="space-y-2 text-center">
                        <p className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>กำลังโหลดข้อมูล...</p>
                        <div className="w-32 h-1 rounded-full overflow-hidden mx-auto" style={{ background: "rgba(255,255,255,0.04)" }}>
                            <div className="h-full rounded-full animate-shimmer"
                                style={{ background: "linear-gradient(90deg, transparent, var(--color-accent), transparent)", backgroundSize: "200% 100%" }} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const sortedCategories = Object.entries(categoryBreakdown)
        .sort(([, a], [, b]) => b.amount - a.amount)
        .slice(0, 5);

    return (
        <div className="py-8 lg:grid lg:grid-cols-12 lg:gap-6 space-y-6 lg:space-y-0 page-enter">
            {/* ════════ LEFT COLUMN ════════ */}
            <div className="lg:col-span-7 space-y-6">
                {/* ── Hero Header ── */}
                <div className="flex items-center justify-between animate-fade-in-up">
                    <div>
                        <p className="text-xs font-medium mb-1 tracking-wide" style={{ color: "var(--color-text-muted)" }}>
                            {getGreeting()}
                        </p>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                            {userName || session?.user?.name || "User"}
                        </h1>
                    </div>
                    <StreakCounter count={streakCount} />
                </div>

                {/* ── Persona + Health Score ── */}
                <div className="card p-6 animate-fade-in-up stagger-1">
                    <div className="flex items-center justify-between">
                        <PersonaCard name={persona} emoji={personaEmoji} />
                        <div className="flex-shrink-0">
                            <HealthScore score={healthScore} />
                        </div>
                    </div>
                </div>

                {/* ── AI Whisper ── */}
                <div className="stagger-2">
                    <AIWhisper message={whisperMessage} healthStatus={healthStatus} />
                </div>

                {/* ── Leak Insight ── */}
                {leakInsight && (
                    <div className="rounded-2xl p-5 animate-fade-in-up"
                        style={{
                            background: "linear-gradient(135deg, rgba(251, 191, 36, 0.05), rgba(245, 158, 11, 0.03))",
                            border: "1px solid rgba(251, 191, 36, 0.1)",
                        }}>
                        <div className="flex items-start gap-3.5">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ background: "rgba(251, 191, 36, 0.1)" }}>
                                <AlertTriangle className="w-4 h-4" style={{ color: "var(--color-warning)" }} />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.12em] font-bold mb-1"
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
                <div className="grid grid-cols-3 gap-3 stagger-3 animate-fade-in-up">
                    {[
                        {
                            label: "รายจ่าย", value: summary.totalExpense,
                            color: "var(--color-expense)", icon: TrendingDown,
                            gradient: "linear-gradient(145deg, rgba(251, 113, 133, 0.08), rgba(251, 113, 133, 0.02))",
                        },
                        {
                            label: "รายรับ", value: summary.totalIncome,
                            color: "var(--color-income)", icon: TrendingUp,
                            gradient: "linear-gradient(145deg, rgba(52, 211, 153, 0.08), rgba(52, 211, 153, 0.02))",
                        },
                        {
                            label: "คงเหลือ", value: summary.balance,
                            color: summary.balance >= 0 ? "var(--color-income)" : "var(--color-expense)",
                            icon: Wallet,
                            gradient: "linear-gradient(145deg, rgba(124, 109, 240, 0.08), rgba(124, 109, 240, 0.02))",
                        },
                    ].map(({ label, value, color, icon: Icon, gradient }) => (
                        <div key={label} className="card-stat rounded-2xl p-4 sm:p-5"
                            style={{
                                background: gradient,
                            }}>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                                    style={{ background: `color-mix(in srgb, ${color} 12%, transparent)` }}>
                                    <Icon className="w-3.5 h-3.5" style={{ color }} />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-[0.1em]"
                                    style={{ color: "var(--color-text-muted)" }}>{label}</span>
                            </div>
                            <p className="text-lg sm:text-xl font-bold tracking-tight tabular-nums" style={{ color }}>
                                {formatCurrency(value)}
                            </p>
                        </div>
                    ))}
                </div>

                {/* ── Budget Progress ── */}
                {summary.totalBudget > 0 && (
                    <div className="card p-5 animate-fade-in-up stagger-4">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-semibold" style={{ color: "var(--color-text-secondary)" }}>
                                งบประมาณเดือนนี้
                            </span>
                            <span className="text-xs tabular-nums font-medium" style={{ color: "var(--color-text-muted)" }}>
                                {formatCurrency(summary.totalExpense)} / {formatCurrency(summary.totalBudget)}
                            </span>
                        </div>
                        <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
                            <div
                                className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                                style={{
                                    width: `${Math.min(summary.budgetUsage, 100)}%`,
                                    background: summary.budgetUsage > 90
                                        ? "linear-gradient(90deg, var(--color-warning), var(--color-critical))"
                                        : summary.budgetUsage > 70
                                            ? "linear-gradient(90deg, var(--color-success), var(--color-warning))"
                                            : "linear-gradient(90deg, var(--color-accent), var(--color-accent-light))",
                                }}
                            >
                                <div className="absolute inset-0 animate-shimmer" />
                            </div>
                        </div>
                        <p className="text-xs font-semibold mt-2 tabular-nums"
                            style={{
                                color: summary.budgetUsage > 90 ? "var(--color-critical)"
                                    : summary.budgetUsage > 70 ? "var(--color-warning)"
                                        : "var(--color-text-muted)"
                            }}>
                            ใช้ไป {Math.round(summary.budgetUsage)}%
                        </p>
                    </div>
                )}

                {/* ── Quick Add ── */}
                <div className="animate-fade-in-up stagger-5">
                    <div className="section-header">บันทึกด่วน</div>
                    <QuickAddInput />
                </div>

                {/* ── Dynamic Widgets ── */}
                <div className="animate-fade-in-up stagger-6">
                    <div className="section-header">กดปุ่มเดียวบันทึก</div>
                    <DynamicWidgets />
                </div>

            </div>

            {/* ════════ RIGHT COLUMN ════════ */}
            <div className="lg:col-span-5 space-y-6">
                {/* ── Category Breakdown ── */}
                {sortedCategories.length > 0 ? (
                    <div className="card p-6 animate-fade-in-up stagger-2">
                        <div className="flex items-center justify-between mb-5">
                            <div className="section-header" style={{ marginBottom: 0 }}>หมวดหมู่เดือนนี้</div>
                            <Link href="/insights"
                                className="text-xs flex items-center gap-1 font-semibold transition-all hover:gap-2 duration-200"
                                style={{ color: "var(--color-accent-light)" }}>
                                ดูทั้งหมด <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {sortedCategories.map(([name, data]) => {
                                const percent = summary.totalExpense > 0 ? (data.amount / summary.totalExpense) * 100 : 0;
                                return (
                                    <div key={name} className="flex items-center gap-3.5">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                                            style={{ background: "rgba(255,255,255,0.04)" }}>
                                            {data.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="text-sm font-medium truncate">{name}</span>
                                                <span className="text-xs font-semibold tabular-nums ml-2"
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
                ) : (
                    <div className="card p-6 flex flex-col items-center justify-center text-center min-h-[220px]"
                        style={{ borderStyle: "dashed", background: "transparent" }}>
                        <p className="text-3xl mb-3">📊</p>
                        <p className="text-sm font-semibold" style={{ color: "var(--color-text-secondary)" }}>ยังไม่มีข้อมูลหมวดหมู่</p>
                        <p className="text-xs mt-1.5" style={{ color: "var(--color-text-muted)" }}>บันทึกรายการเพื่อดูสัดส่วน</p>
                    </div>
                )}

                {/* ── Recent Transactions ── */}
                {recentTransactions.length > 0 ? (
                    <div className="animate-fade-in-up stagger-3">
                        <div className="flex items-center justify-between mb-4">
                            <div className="section-header" style={{ marginBottom: 0 }}>รายการล่าสุด</div>
                            <Link href="/history"
                                className="text-xs flex items-center gap-1 font-semibold transition-all hover:gap-2 duration-200"
                                style={{ color: "var(--color-accent-light)" }}>
                                ดูทั้งหมด <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                        <div className="space-y-2.5">
                            {recentTransactions.slice(0, 5).map((tx) => (
                                <div
                                    key={tx.id}
                                    className="flex items-center justify-between p-4 rounded-2xl transition-all duration-200 hover:bg-white/[0.02]"
                                    style={{
                                        background: "linear-gradient(145deg, rgba(16, 16, 28, 0.5), rgba(12, 12, 22, 0.3))",
                                        border: "1px solid rgba(255,255,255,0.04)",
                                    }}>
                                    <div className="flex items-center gap-3.5">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                                            style={{ background: "rgba(255,255,255,0.04)" }}>
                                            {tx.category?.icon || "📌"}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{tx.description}</p>
                                            <p className="text-[11px] mt-0.5" style={{ color: "var(--color-text-muted)" }}>
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
                ) : (
                    <div className="card p-6 flex flex-col items-center justify-center text-center min-h-[220px]"
                        style={{ borderStyle: "dashed", background: "transparent" }}>
                        <p className="text-3xl mb-3">📃</p>
                        <p className="text-sm font-semibold" style={{ color: "var(--color-text-secondary)" }}>ยังไม่มีรายการล่าสุด</p>
                        <p className="text-xs mt-1.5" style={{ color: "var(--color-text-muted)" }}>รายการที่คุณบันทึกจะแสดงที่นี่</p>
                    </div>
                )}
            </div>
        </div>
    );
}

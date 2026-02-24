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
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center animate-pulse-glow"
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
        <div className="p-4 space-y-5 page-enter">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                        {getGreeting()}
                    </p>
                    <h1 className="text-xl font-bold mt-0.5">
                        {userName || session?.user?.name || "User"}
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <StreakCounter count={streakCount} />
                </div>
            </div>

            {/* Persona + Health Score */}
            <div className="grid grid-cols-2 gap-3">
                <PersonaCard name={persona} emoji={personaEmoji} />
                <div className="flex items-center justify-center">
                    <HealthScore score={healthScore} />
                </div>
            </div>

            {/* AI Whisper */}
            <AIWhisper message={whisperMessage} healthStatus={healthStatus} />

            {/* Leak Insight */}
            {leakInsight && (
                <div className="rounded-2xl p-4 animate-fade-in-up"
                    style={{
                        background: "rgba(255, 165, 2, 0.06)",
                        border: "1px solid rgba(255, 165, 2, 0.15)",
                    }}>
                    <p className="text-[10px] uppercase tracking-wider font-medium mb-1" style={{ color: "var(--color-text-muted)" }}>
                        🔍 Leak Detector
                    </p>
                    <p className="text-sm" style={{ color: "var(--color-text-primary)" }}>
                        {leakInsight}
                    </p>
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl p-3 border"
                    style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
                    <div className="flex items-center gap-1.5 mb-1">
                        <TrendingDown className="w-3.5 h-3.5" style={{ color: "var(--color-expense)" }} />
                        <span className="text-[10px] font-medium" style={{ color: "var(--color-text-muted)" }}>รายจ่าย</span>
                    </div>
                    <p className="text-base font-bold" style={{ color: "var(--color-expense)" }}>
                        {formatCurrency(summary.totalExpense)}
                    </p>
                </div>
                <div className="rounded-2xl p-3 border"
                    style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
                    <div className="flex items-center gap-1.5 mb-1">
                        <TrendingUp className="w-3.5 h-3.5" style={{ color: "var(--color-income)" }} />
                        <span className="text-[10px] font-medium" style={{ color: "var(--color-text-muted)" }}>รายรับ</span>
                    </div>
                    <p className="text-base font-bold" style={{ color: "var(--color-income)" }}>
                        {formatCurrency(summary.totalIncome)}
                    </p>
                </div>
                <div className="rounded-2xl p-3 border"
                    style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
                    <div className="flex items-center gap-1.5 mb-1">
                        <Wallet className="w-3.5 h-3.5" style={{ color: "var(--color-accent-light)" }} />
                        <span className="text-[10px] font-medium" style={{ color: "var(--color-text-muted)" }}>คงเหลือ</span>
                    </div>
                    <p className="text-base font-bold" style={{ color: summary.balance >= 0 ? "var(--color-income)" : "var(--color-expense)" }}>
                        {formatCurrency(summary.balance)}
                    </p>
                </div>
            </div>

            {/* Budget Progress */}
            {summary.totalBudget > 0 && (
                <div className="rounded-2xl p-4 border"
                    style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>งบประมาณเดือนนี้</span>
                        <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                            {formatCurrency(summary.totalExpense)} / {formatCurrency(summary.totalBudget)}
                        </span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--color-bg-primary)" }}>
                        <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                                width: `${Math.min(summary.budgetUsage, 100)}%`,
                                background: summary.budgetUsage > 90 ? "var(--color-critical)" : summary.budgetUsage > 70 ? "var(--color-warning)" : "var(--color-success)",
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Quick Add */}
            <div>
                <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--color-text-secondary)" }}>
                    ⚡ บันทึกด่วน
                </h2>
                <QuickAddInput />
            </div>

            {/* Dynamic Widgets */}
            <div>
                <h2 className="text-sm font-semibold mb-2" style={{ color: "var(--color-text-secondary)" }}>
                    🎯 กดปุ่มเดียวบันทึก
                </h2>
                <DynamicWidgets />
            </div>

            {/* Category Breakdown */}
            {sortedCategories.length > 0 && (
                <div className="rounded-2xl p-4 border"
                    style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-semibold" style={{ color: "var(--color-text-secondary)" }}>
                            📊 หมวดหมู่เดือนนี้
                        </h2>
                        <Link href="/insights" className="text-xs flex items-center gap-1" style={{ color: "var(--color-accent-light)" }}>
                            ดูทั้งหมด <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="space-y-2.5">
                        {sortedCategories.map(([name, data]) => {
                            const percent = summary.totalExpense > 0 ? (data.amount / summary.totalExpense) * 100 : 0;
                            return (
                                <div key={name} className="flex items-center gap-3">
                                    <span className="text-lg">{data.icon}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-medium truncate">{name}</span>
                                            <span className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
                                                {formatCurrency(data.amount)}
                                            </span>
                                        </div>
                                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--color-bg-primary)" }}>
                                            <div
                                                className="h-full rounded-full transition-all duration-500"
                                                style={{ width: `${percent}%`, background: "var(--color-accent)" }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Recent Transactions */}
            {recentTransactions.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-sm font-semibold" style={{ color: "var(--color-text-secondary)" }}>
                            🕐 รายการล่าสุด
                        </h2>
                        <Link href="/history" className="text-xs flex items-center gap-1" style={{ color: "var(--color-accent-light)" }}>
                            ดูทั้งหมด <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="space-y-2">
                        {recentTransactions.slice(0, 5).map((tx) => (
                            <div
                                key={tx.id}
                                className="flex items-center justify-between p-3 rounded-xl border"
                                style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
                                <div className="flex items-center gap-3">
                                    <span className="text-lg">{tx.category?.icon || "📌"}</span>
                                    <div>
                                        <p className="text-sm font-medium">{tx.description}</p>
                                        <p className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>
                                            {tx.category?.name} • {new Date(tx.createdAt).toLocaleDateString("th-TH", { day: "numeric", month: "short" })}
                                        </p>
                                    </div>
                                </div>
                                <span
                                    className="text-sm font-semibold"
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

"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { formatCurrency } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { TrendingDown, TrendingUp, Sparkles, Search as SearchIcon } from "lucide-react";

const COLORS = ["#7c6df0", "#a78bfa", "#34d399", "#fb7185", "#fbbf24", "#22c55e", "#f87171", "#93c5fd"];

export default function InsightsPage() {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState({
        totalExpense: 0, totalIncome: 0, balance: 0,
        budgetUsage: 0, transactionCount: 0,
    });
    const [categoryData, setCategoryData] = useState<Array<{ name: string; amount: number; icon: string }>>([]);
    const [whisper, setWhisper] = useState({ persona_name: "", persona_emoji: "", whisper_message: "", leak_insight: "" });

    const fetchData = useCallback(async () => {
        try {
            const [dashRes, whisperRes] = await Promise.all([
                fetch("/api/dashboard"),
                fetch("/api/ai/whisper", { method: "POST" }),
            ]);

            if (dashRes.ok) {
                const data = await dashRes.json();
                setSummary(data.summary);
                const cats = Object.entries(data.categoryBreakdown as Record<string, { amount: number; icon: string }>)
                    .map(([name, val]) => ({ name, amount: val.amount, icon: val.icon }))
                    .sort((a, b) => b.amount - a.amount);
                setCategoryData(cats);
            }

            if (whisperRes.ok) {
                const wData = await whisperRes.json();
                setWhisper(wData);
            }
        } catch (error) {
            console.error("Insights fetch error:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (session?.user) fetchData();
    }, [session, fetchData]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin"
                    style={{ borderColor: "var(--color-accent)", borderTopColor: "transparent" }} />
            </div>
        );
    }

    const pieData = categoryData.map((c) => ({ name: c.name, value: c.amount }));

    const tooltipStyle = {
        background: "rgba(10, 10, 18, 0.95)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "12px",
        color: "var(--color-text-primary)",
        fontSize: "12px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        padding: "10px 14px",
    };

    return (
        <div className="max-w-4xl mx-auto w-full page-enter py-8 space-y-6">
            {/* ── Page Header ── */}
            <div className="animate-fade-in-up">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">วิเคราะห์การเงิน</h1>
                <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
                    ภาพรวมรายรับ-รายจ่ายและ AI Insight
                </p>
            </div>

            {/* ── Summary Stats ── */}
            <div className="grid grid-cols-2 gap-4 animate-fade-in-up stagger-1">
                <div className="card-stat rounded-2xl p-5"
                    style={{ background: "linear-gradient(145deg, rgba(251, 113, 133, 0.08), rgba(251, 113, 133, 0.02))" }}>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ background: "rgba(251, 113, 133, 0.12)" }}>
                            <TrendingDown className="w-4 h-4" style={{ color: "var(--color-expense)" }} />
                        </div>
                        <p className="text-[10px] uppercase tracking-[0.1em] font-bold"
                            style={{ color: "var(--color-text-muted)" }}>
                            รายจ่ายเดือนนี้
                        </p>
                    </div>
                    <p className="text-2xl font-bold tabular-nums" style={{ color: "var(--color-expense)" }}>
                        {formatCurrency(summary.totalExpense)}
                    </p>
                </div>
                <div className="card-stat rounded-2xl p-5"
                    style={{ background: "linear-gradient(145deg, rgba(52, 211, 153, 0.08), rgba(52, 211, 153, 0.02))" }}>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ background: "rgba(52, 211, 153, 0.12)" }}>
                            <TrendingUp className="w-4 h-4" style={{ color: "var(--color-income)" }} />
                        </div>
                        <p className="text-[10px] uppercase tracking-[0.1em] font-bold"
                            style={{ color: "var(--color-text-muted)" }}>
                            รายรับเดือนนี้
                        </p>
                    </div>
                    <p className="text-2xl font-bold tabular-nums" style={{ color: "var(--color-income)" }}>
                        {formatCurrency(summary.totalIncome)}
                    </p>
                </div>
            </div>

            {/* ── Donut Chart ── */}
            {categoryData.length > 0 && (
                <div className="card p-6 animate-fade-in-up stagger-2">
                    <div className="section-header">สัดส่วนค่าใช้จ่าย</div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={95}
                                    paddingAngle={3}
                                    dataKey="value"
                                    strokeWidth={0}>
                                    {pieData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value) => formatCurrency(Number(value))}
                                    contentStyle={tooltipStyle}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    {/* Legend */}
                    <div className="grid grid-cols-2 gap-3 mt-5">
                        {categoryData.map((cat, i) => (
                            <div key={cat.name} className="flex items-center gap-2.5 py-1">
                                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                    style={{ background: COLORS[i % COLORS.length] }} />
                                <span className="text-xs truncate flex-1" style={{ color: "var(--color-text-secondary)" }}>
                                    {cat.icon} {cat.name}
                                </span>
                                <span className="text-xs font-semibold ml-auto tabular-nums"
                                    style={{ color: "var(--color-text-primary)" }}>
                                    {formatCurrency(cat.amount)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Bar Chart ── */}
            {categoryData.length > 0 && (
                <div className="card p-6 animate-fade-in-up stagger-3">
                    <div className="section-header">รายจ่ายตามหมวดหมู่</div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={categoryData} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    width={80}
                                    tick={{ fontSize: 11, fill: "#a0a4b8" }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    formatter={(value) => formatCurrency(Number(value))}
                                    contentStyle={tooltipStyle}
                                />
                                <Bar dataKey="amount" radius={[0, 8, 8, 0]} barSize={20}>
                                    {categoryData.map((_, index) => (
                                        <Cell key={`bar-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* ── AI Persona & Insights ── */}
            {whisper.persona_name && (
                <div className="card p-6 overflow-hidden relative animate-fade-in-up stagger-4">
                    {/* Left accent bar */}
                    <div className="absolute left-0 top-5 bottom-5 w-[3px] rounded-full"
                        style={{ background: "linear-gradient(180deg, var(--color-accent), var(--color-accent-light))" }} />

                    <div className="pl-4">
                        <div className="section-header">AI Insight</div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl glow-ring"
                                    style={{ background: "rgba(124, 109, 240, 0.1)" }}>
                                    {whisper.persona_emoji}
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.12em] font-bold"
                                        style={{ color: "var(--color-text-muted)" }}>
                                        Persona ของคุณ
                                    </p>
                                    <p className="text-lg font-bold gradient-text mt-0.5">{whisper.persona_name}</p>
                                </div>
                            </div>
                            {whisper.whisper_message && (
                                <div className="p-4 rounded-xl"
                                    style={{ background: "rgba(124, 109, 240, 0.05)", border: "1px solid rgba(124, 109, 240, 0.08)" }}>
                                    <div className="flex items-start gap-2.5">
                                        <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "var(--color-accent-light)" }} />
                                        <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                                            {whisper.whisper_message}
                                        </p>
                                    </div>
                                </div>
                            )}
                            {whisper.leak_insight && (
                                <div className="p-4 rounded-xl"
                                    style={{ background: "rgba(251, 191, 36, 0.05)", border: "1px solid rgba(251, 191, 36, 0.08)" }}>
                                    <div className="flex items-start gap-2.5">
                                        <SearchIcon className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "var(--color-warning)" }} />
                                        <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                                            {whisper.leak_insight}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Empty state ── */}
            {categoryData.length === 0 && (
                <div className="text-center py-20 animate-fade-in-up">
                    <p className="text-5xl mb-4">📊</p>
                    <p className="text-base font-semibold" style={{ color: "var(--color-text-secondary)" }}>
                        ยังไม่มีข้อมูลเพียงพอสำหรับการวิเคราะห์
                    </p>
                    <p className="text-sm mt-2" style={{ color: "var(--color-text-muted)" }}>
                        เริ่มบันทึกรายรับ-รายจ่ายเพื่อดู Insight!
                    </p>
                </div>
            )}
        </div>
    );
}

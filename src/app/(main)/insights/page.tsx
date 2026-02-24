"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { formatCurrency } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

const COLORS = ["#6c5ce7", "#a29bfe", "#00cec9", "#ff7675", "#fdcb6e", "#00b894", "#e17055", "#74b9ff"];

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
        background: "rgba(18, 18, 30, 0.95)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "12px",
        color: "var(--color-text-primary)",
        fontSize: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
    };

    return (
        <div className="px-5 py-6 space-y-5 page-enter">
            <h1 className="text-2xl font-bold tracking-tight">วิเคราะห์การเงิน</h1>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl p-4"
                    style={{ background: "rgba(255, 118, 117, 0.06)", border: "1px solid rgba(255,255,255,0.04)" }}>
                    <p className="text-[10px] uppercase tracking-widest font-semibold mb-1.5"
                        style={{ color: "var(--color-text-muted)" }}>
                        รายจ่ายเดือนนี้
                    </p>
                    <p className="text-xl font-bold tabular-nums" style={{ color: "var(--color-expense)" }}>
                        {formatCurrency(summary.totalExpense)}
                    </p>
                </div>
                <div className="rounded-2xl p-4"
                    style={{ background: "rgba(0, 206, 201, 0.06)", border: "1px solid rgba(255,255,255,0.04)" }}>
                    <p className="text-[10px] uppercase tracking-widest font-semibold mb-1.5"
                        style={{ color: "var(--color-text-muted)" }}>
                        รายรับเดือนนี้
                    </p>
                    <p className="text-xl font-bold tabular-nums" style={{ color: "var(--color-income)" }}>
                        {formatCurrency(summary.totalIncome)}
                    </p>
                </div>
            </div>

            {/* Donut Chart */}
            {categoryData.length > 0 && (
                <div className="card p-5">
                    <div className="section-header">สัดส่วนค่าใช้จ่าย</div>
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={85}
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
                    <div className="grid grid-cols-2 gap-2.5 mt-4">
                        {categoryData.map((cat, i) => (
                            <div key={cat.name} className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                    style={{ background: COLORS[i % COLORS.length] }} />
                                <span className="text-xs truncate" style={{ color: "var(--color-text-secondary)" }}>
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

            {/* Bar Chart */}
            {categoryData.length > 0 && (
                <div className="card p-5">
                    <div className="section-header">รายจ่ายตามหมวดหมู่</div>
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={categoryData} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    width={70}
                                    tick={{ fontSize: 11, fill: "#9094a6" }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    formatter={(value) => formatCurrency(Number(value))}
                                    contentStyle={tooltipStyle}
                                />
                                <Bar dataKey="amount" radius={[0, 8, 8, 0]} barSize={18}>
                                    {categoryData.map((_, index) => (
                                        <Cell key={`bar-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* AI Persona & Insights */}
            {whisper.persona_name && (
                <div className="card p-5 overflow-hidden relative">
                    {/* Left accent bar */}
                    <div className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full"
                        style={{ background: "linear-gradient(180deg, var(--color-accent), var(--color-accent-light))" }} />

                    <div className="pl-3">
                        <div className="section-header">AI Insight</div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                                    style={{ background: "rgba(108, 92, 231, 0.1)" }}>
                                    {whisper.persona_emoji}
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest"
                                        style={{ color: "var(--color-text-muted)" }}>
                                        Persona ของคุณ
                                    </p>
                                    <p className="text-base font-bold gradient-text">{whisper.persona_name}</p>
                                </div>
                            </div>
                            {whisper.whisper_message && (
                                <p className="text-sm leading-relaxed p-3.5 rounded-xl"
                                    style={{ background: "rgba(108, 92, 231, 0.06)", color: "var(--color-text-secondary)" }}>
                                    💬 {whisper.whisper_message}
                                </p>
                            )}
                            {whisper.leak_insight && (
                                <p className="text-sm leading-relaxed p-3.5 rounded-xl"
                                    style={{ background: "rgba(253, 203, 110, 0.06)", color: "var(--color-text-secondary)" }}>
                                    🔍 {whisper.leak_insight}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Empty state */}
            {categoryData.length === 0 && (
                <div className="text-center py-16">
                    <p className="text-5xl mb-4">📊</p>
                    <p className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
                        ยังไม่มีข้อมูลเพียงพอสำหรับการวิเคราะห์
                    </p>
                    <p className="text-xs mt-1.5" style={{ color: "var(--color-text-muted)" }}>
                        เริ่มบันทึกรายรับ-รายจ่ายเพื่อดู Insight!
                    </p>
                </div>
            )}
        </div>
    );
}

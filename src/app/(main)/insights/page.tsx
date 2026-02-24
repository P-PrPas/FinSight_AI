"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { formatCurrency } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

const COLORS = ["#6c5ce7", "#a29bfe", "#00d2d3", "#ff6b6b", "#ffa502", "#2ed573", "#ff4757", "#1e90ff"];

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
                <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
                    style={{ borderColor: "var(--color-accent)", borderTopColor: "transparent" }} />
            </div>
        );
    }

    const pieData = categoryData.map((c) => ({ name: c.name, value: c.amount }));

    return (
        <div className="p-4 space-y-5 page-enter">
            <h1 className="text-xl font-bold">📊 วิเคราะห์การเงิน</h1>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl p-4 border"
                    style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
                    <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "var(--color-text-muted)" }}>รายจ่ายเดือนนี้</p>
                    <p className="text-lg font-bold" style={{ color: "var(--color-expense)" }}>{formatCurrency(summary.totalExpense)}</p>
                </div>
                <div className="rounded-2xl p-4 border"
                    style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
                    <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "var(--color-text-muted)" }}>รายรับเดือนนี้</p>
                    <p className="text-lg font-bold" style={{ color: "var(--color-income)" }}>{formatCurrency(summary.totalIncome)}</p>
                </div>
            </div>

            {/* Donut Chart */}
            {categoryData.length > 0 && (
                <div className="rounded-2xl p-4 border"
                    style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
                    <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--color-text-secondary)" }}>
                        🍩 สัดส่วนค่าใช้จ่าย
                    </h2>
                    <div className="h-52">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={3}
                                    dataKey="value">
                                    {pieData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value) => formatCurrency(Number(value))}
                                    contentStyle={{
                                        background: "var(--color-bg-card)",
                                        border: "1px solid var(--color-border)",
                                        borderRadius: "12px",
                                        color: "var(--color-text-primary)",
                                        fontSize: "12px",
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    {/* Legend */}
                    <div className="grid grid-cols-2 gap-2 mt-3">
                        {categoryData.map((cat, i) => (
                            <div key={cat.name} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-sm" style={{ background: COLORS[i % COLORS.length] }} />
                                <span className="text-xs truncate" style={{ color: "var(--color-text-secondary)" }}>
                                    {cat.icon} {cat.name}
                                </span>
                                <span className="text-xs font-medium ml-auto" style={{ color: "var(--color-text-primary)" }}>
                                    {formatCurrency(cat.amount)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Bar Chart */}
            {categoryData.length > 0 && (
                <div className="rounded-2xl p-4 border"
                    style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
                    <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--color-text-secondary)" }}>
                        📈 รายจ่ายตามหมวดหมู่
                    </h2>
                    <div className="h-52">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={categoryData} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    width={70}
                                    tick={{ fontSize: 11, fill: "var(--color-text-secondary)" }}
                                />
                                <Tooltip
                                    formatter={(value) => formatCurrency(Number(value))}
                                    contentStyle={{
                                        background: "var(--color-bg-card)",
                                        border: "1px solid var(--color-border)",
                                        borderRadius: "12px",
                                        color: "var(--color-text-primary)",
                                        fontSize: "12px",
                                    }}
                                />
                                <Bar dataKey="amount" radius={[0, 6, 6, 0]}>
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
                <div className="rounded-2xl p-4 border"
                    style={{
                        background: "linear-gradient(135deg, rgba(108, 92, 231, 0.1), rgba(162, 155, 254, 0.05))",
                        borderColor: "rgba(108, 92, 231, 0.2)",
                    }}>
                    <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--color-text-secondary)" }}>
                        🧠 AI Insight
                    </h2>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">{whisper.persona_emoji}</span>
                            <div>
                                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Persona ของคุณ</p>
                                <p className="text-base font-bold gradient-text">{whisper.persona_name}</p>
                            </div>
                        </div>
                        {whisper.whisper_message && (
                            <p className="text-sm leading-relaxed p-3 rounded-xl"
                                style={{ background: "rgba(108, 92, 231, 0.1)", color: "var(--color-text-primary)" }}>
                                💬 {whisper.whisper_message}
                            </p>
                        )}
                        {whisper.leak_insight && (
                            <p className="text-sm leading-relaxed p-3 rounded-xl"
                                style={{ background: "rgba(255, 165, 2, 0.08)", color: "var(--color-text-primary)" }}>
                                🔍 {whisper.leak_insight}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Empty state */}
            {categoryData.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-4xl mb-3">📊</p>
                    <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                        ยังไม่มีข้อมูลเพียงพอสำหรับการวิเคราะห์
                    </p>
                    <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                        เริ่มบันทึกรายรับ-รายจ่ายเพื่อดู Insight!
                    </p>
                </div>
            )}
        </div>
    );
}

"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import { LogOut, Wallet, Save, User, ChevronRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function SettingsPage() {
    const { data: session } = useSession();
    const [budgetAmount, setBudgetAmount] = useState("");
    const [currentBudget, setCurrentBudget] = useState(0);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const fetchBudget = useCallback(async () => {
        try {
            const res = await fetch("/api/budgets");
            if (res.ok) {
                const budgets = await res.json();
                const overall = budgets.find((b: { categoryId: string | null }) => b.categoryId === null);
                if (overall) {
                    setCurrentBudget(overall.amount);
                    setBudgetAmount(String(overall.amount));
                }
            }
        } catch (error) {
            console.error("Fetch budget error:", error);
        }
    }, []);

    useEffect(() => {
        if (session?.user) fetchBudget();
    }, [session, fetchBudget]);

    const handleSaveBudget = async () => {
        if (!budgetAmount) return;
        setSaving(true);

        try {
            const res = await fetch("/api/budgets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: parseFloat(budgetAmount) }),
            });

            if (res.ok) {
                setCurrentBudget(parseFloat(budgetAmount));
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
            }
        } catch (error) {
            console.error("Save budget error:", error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-4 space-y-5 page-enter">
            <h1 className="text-xl font-bold">⚙️ ตั้งค่า</h1>

            {/* Profile */}
            <div className="rounded-2xl p-4 border"
                style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
                <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-light))" }}>
                        <User className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <p className="text-base font-semibold">{session?.user?.name || "User"}</p>
                        <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                            {session?.user?.email}
                        </p>
                    </div>
                </div>
            </div>

            {/* Budget Setting */}
            <div className="rounded-2xl p-4 border"
                style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
                <div className="flex items-center gap-2 mb-3">
                    <Wallet className="w-4 h-4" style={{ color: "var(--color-accent-light)" }} />
                    <h2 className="text-sm font-semibold">งบประมาณรายเดือน</h2>
                </div>

                {currentBudget > 0 && (
                    <p className="text-xs mb-3" style={{ color: "var(--color-text-secondary)" }}>
                        งบประมาณปัจจุบัน: <span className="font-semibold" style={{ color: "var(--color-accent-light)" }}>{formatCurrency(currentBudget)}</span>
                    </p>
                )}

                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--color-text-muted)" }}>฿</span>
                        <input
                            type="number"
                            value={budgetAmount}
                            onChange={(e) => setBudgetAmount(e.target.value)}
                            placeholder="0"
                            className="w-full pl-8 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                            style={{ background: "var(--color-bg-input)", borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
                        />
                    </div>
                    <button
                        onClick={handleSaveBudget}
                        disabled={saving || !budgetAmount}
                        className="px-4 py-2.5 rounded-xl text-sm font-medium text-white flex items-center gap-1.5 disabled:opacity-50 transition-all active:scale-95"
                        style={{ background: saved ? "var(--color-success)" : "var(--color-accent)" }}>
                        <Save className="w-4 h-4" />
                        {saved ? "บันทึกแล้ว!" : "บันทึก"}
                    </button>
                </div>
            </div>

            {/* Quick budget presets */}
            <div className="rounded-2xl p-4 border"
                style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
                <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--color-text-secondary)" }}>
                    💡 ตั้งงบประมาณแนะนำ
                </h3>
                <div className="grid grid-cols-3 gap-2">
                    {[5000, 10000, 15000, 20000, 30000, 50000].map((amount) => (
                        <button
                            key={amount}
                            onClick={() => setBudgetAmount(String(amount))}
                            className="py-2 rounded-xl text-xs font-medium transition-all border hover:brightness-110"
                            style={{
                                background: budgetAmount === String(amount) ? "var(--color-accent)" : "var(--color-bg-primary)",
                                color: budgetAmount === String(amount) ? "white" : "var(--color-text-secondary)",
                                borderColor: budgetAmount === String(amount) ? "var(--color-accent)" : "var(--color-border)",
                            }}>
                            {formatCurrency(amount)}
                        </button>
                    ))}
                </div>
            </div>

            {/* About */}
            <div className="rounded-2xl border overflow-hidden"
                style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
                <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-3">
                        <span className="text-lg">✨</span>
                        <div>
                            <p className="text-sm font-medium">เกี่ยวกับ FinSight AI</p>
                            <p className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>Version 1.0.0</p>
                        </div>
                    </div>
                    <ChevronRight className="w-4 h-4" style={{ color: "var(--color-text-muted)" }} />
                </div>
            </div>

            {/* Logout */}
            <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all hover:brightness-110"
                style={{
                    background: "rgba(255, 71, 87, 0.1)",
                    color: "var(--color-critical)",
                    border: "1px solid rgba(255, 71, 87, 0.2)",
                }}>
                <LogOut className="w-4 h-4" />
                ออกจากระบบ
            </button>
        </div>
    );
}

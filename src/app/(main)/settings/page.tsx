"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import { LogOut, Wallet, Save, User, ChevronRight, Check } from "lucide-react";
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
        <div className="px-5 py-6 space-y-5 page-enter">
            <h1 className="text-2xl font-bold tracking-tight">ตั้งค่า</h1>

            {/* Profile Card */}
            <div className="card p-5">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                        style={{
                            background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-light))",
                            boxShadow: "0 4px 16px rgba(108, 92, 231, 0.25)",
                        }}>
                        <User className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <p className="text-base font-bold">{session?.user?.name || "User"}</p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                            {session?.user?.email}
                        </p>
                    </div>
                </div>
            </div>

            {/* Budget Setting */}
            <div className="card p-5">
                <div className="flex items-center gap-2 mb-4">
                    <Wallet className="w-4 h-4" style={{ color: "var(--color-accent-light)" }} />
                    <h2 className="text-sm font-bold">งบประมาณรายเดือน</h2>
                </div>

                {currentBudget > 0 && (
                    <p className="text-xs mb-4" style={{ color: "var(--color-text-secondary)" }}>
                        งบประมาณปัจจุบัน:{" "}
                        <span className="font-bold" style={{ color: "var(--color-accent-light)" }}>
                            {formatCurrency(currentBudget)}
                        </span>
                    </p>
                )}

                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium"
                            style={{ color: "var(--color-text-muted)" }}>฿</span>
                        <input
                            type="number"
                            value={budgetAmount}
                            onChange={(e) => setBudgetAmount(e.target.value)}
                            placeholder="0"
                            className="input-field pl-9"
                        />
                    </div>
                    <button
                        onClick={handleSaveBudget}
                        disabled={saving || !budgetAmount}
                        className="px-5 py-3 rounded-2xl text-sm font-semibold text-white flex items-center gap-2 disabled:opacity-40 transition-all active:scale-95"
                        style={{
                            background: saved
                                ? "var(--color-success)"
                                : "linear-gradient(135deg, var(--color-accent), var(--color-accent-light))",
                            boxShadow: saved ? "none" : "0 2px 12px rgba(108, 92, 231, 0.25)",
                        }}>
                        {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                        {saved ? "บันทึกแล้ว!" : "บันทึก"}
                    </button>
                </div>
            </div>

            {/* Quick Budget Presets */}
            <div className="card p-5">
                <div className="section-header" style={{ marginBottom: "14px" }}>ตั้งงบประมาณแนะนำ</div>
                <div className="grid grid-cols-3 gap-2">
                    {[5000, 10000, 15000, 20000, 30000, 50000].map((amount) => (
                        <button
                            key={amount}
                            onClick={() => setBudgetAmount(String(amount))}
                            className="py-2.5 rounded-xl text-xs font-semibold transition-all duration-200"
                            style={{
                                background: budgetAmount === String(amount)
                                    ? "linear-gradient(135deg, var(--color-accent), var(--color-accent-light))"
                                    : "rgba(255,255,255,0.03)",
                                color: budgetAmount === String(amount)
                                    ? "white"
                                    : "var(--color-text-secondary)",
                                border: `1px solid ${budgetAmount === String(amount) ? "transparent" : "rgba(255,255,255,0.04)"}`,
                                boxShadow: budgetAmount === String(amount)
                                    ? "0 2px 12px rgba(108, 92, 231, 0.2)"
                                    : "none",
                            }}>
                            {formatCurrency(amount)}
                        </button>
                    ))}
                </div>
            </div>

            {/* About */}
            <div className="card overflow-hidden">
                <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-3">
                        <span className="text-lg">✨</span>
                        <div>
                            <p className="text-sm font-medium">เกี่ยวกับ FinSight AI</p>
                            <p className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>Version 1.0.0</p>
                        </div>
                    </div>
                    <ChevronRight className="w-4 h-4" style={{ color: "var(--color-text-muted)" }} />
                </div>
            </div>

            {/* Logout */}
            <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full py-3.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:brightness-110 active:scale-[0.98]"
                style={{
                    background: "rgba(225, 112, 85, 0.08)",
                    color: "var(--color-critical)",
                    border: "1px solid rgba(225, 112, 85, 0.12)",
                }}>
                <LogOut className="w-4 h-4" />
                ออกจากระบบ
            </button>
        </div>
    );
}

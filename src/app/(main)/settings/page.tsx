"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import { LogOut, Wallet, Save, User, ChevronRight, Check, Shield, Sparkles } from "lucide-react";
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
        <div className="max-w-2xl mx-auto w-full page-enter py-8 space-y-6">
            {/* ── Page Header ── */}
            <div className="animate-fade-in-up">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">ตั้งค่า</h1>
                <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
                    จัดการบัญชีและการตั้งค่าของคุณ
                </p>
            </div>

            {/* ── Profile Card ── */}
            <div className="card overflow-hidden animate-fade-in-up stagger-1">
                {/* Top gradient banner */}
                <div className="h-20 relative"
                    style={{
                        background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-light), #93c5fd)",
                    }}>
                    <div className="absolute inset-0 opacity-30"
                        style={{
                            background: "radial-gradient(circle at 70% 50%, rgba(255,255,255,0.2), transparent 60%)",
                        }} />
                </div>
                <div className="px-6 pb-6 -mt-8 relative">
                    <div className="flex items-end gap-4">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                            style={{
                                background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-light))",
                                boxShadow: "0 0 0 4px var(--color-bg-primary), 0 4px 16px rgba(124, 109, 240, 0.3)",
                            }}>
                            <User className="w-7 h-7 text-white" />
                        </div>
                        <div className="pb-1">
                            <p className="text-lg font-bold">{session?.user?.name || "User"}</p>
                            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                                {session?.user?.email}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Budget Setting ── */}
            <div className="card p-6 animate-fade-in-up stagger-2">
                <div className="flex items-center gap-2.5 mb-5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: "rgba(124, 109, 240, 0.1)" }}>
                        <Wallet className="w-4 h-4" style={{ color: "var(--color-accent-light)" }} />
                    </div>
                    <h2 className="text-sm font-bold">งบประมาณรายเดือน</h2>
                </div>

                {currentBudget > 0 && (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl mb-4"
                        style={{ background: "rgba(124, 109, 240, 0.05)", border: "1px solid rgba(124, 109, 240, 0.08)" }}>
                        <Shield className="w-3.5 h-3.5" style={{ color: "var(--color-accent-light)" }} />
                        <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                            งบประมาณปัจจุบัน:{" "}
                            <span className="font-bold" style={{ color: "var(--color-accent-light)" }}>
                                {formatCurrency(currentBudget)}
                            </span>
                        </span>
                    </div>
                )}

                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold"
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
                        className="btn-primary whitespace-nowrap"
                        style={{
                            background: saved
                                ? "var(--color-success)"
                                : "linear-gradient(135deg, var(--color-accent), var(--color-accent-light))",
                            boxShadow: saved ? "0 4px 12px rgba(34, 197, 94, 0.2)" : "0 4px 16px rgba(124, 109, 240, 0.25)",
                        }}>
                        {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                        {saved ? "บันทึกแล้ว!" : "บันทึก"}
                    </button>
                </div>
            </div>

            {/* ── Quick Budget Presets ── */}
            <div className="card p-6 animate-fade-in-up stagger-3">
                <div className="section-header" style={{ marginBottom: "16px" }}>ตั้งงบประมาณแนะนำ</div>
                <div className="grid grid-cols-3 gap-2.5">
                    {[5000, 10000, 15000, 20000, 30000, 50000].map((amount) => (
                        <button
                            key={amount}
                            onClick={() => setBudgetAmount(String(amount))}
                            className="py-3 rounded-xl text-xs font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                            style={{
                                background: budgetAmount === String(amount)
                                    ? "linear-gradient(135deg, var(--color-accent), var(--color-accent-light))"
                                    : "rgba(255,255,255,0.03)",
                                color: budgetAmount === String(amount)
                                    ? "white"
                                    : "var(--color-text-secondary)",
                                border: `1px solid ${budgetAmount === String(amount) ? "transparent" : "rgba(255,255,255,0.05)"}`,
                                boxShadow: budgetAmount === String(amount)
                                    ? "0 4px 16px rgba(124, 109, 240, 0.25)"
                                    : "none",
                            }}>
                            {formatCurrency(amount)}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── About ── */}
            <div className="card overflow-hidden animate-fade-in-up stagger-4">
                <div className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors group">
                    <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-light))" }}>
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold">เกี่ยวกับ FinSight AI</p>
                            <p className="text-[11px] mt-0.5" style={{ color: "var(--color-text-muted)" }}>Version 1.0.0</p>
                        </div>
                    </div>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" style={{ color: "var(--color-text-muted)" }} />
                </div>
            </div>

            {/* ── Logout ── */}
            <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full py-4 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2.5 transition-all hover:brightness-110 active:scale-[0.98] animate-fade-in-up stagger-5"
                style={{
                    background: "rgba(248, 113, 113, 0.06)",
                    color: "var(--color-critical)",
                    border: "1px solid rgba(248, 113, 113, 0.1)",
                }}>
                <LogOut className="w-4 h-4" />
                ออกจากระบบ
            </button>
        </div>
    );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { formatCurrency } from "@/lib/utils";
import { Trash2, Edit3, Save, X, Search, Filter } from "lucide-react";

interface Transaction {
    id: string;
    description: string;
    amount: number;
    type: string;
    category?: { id: string; name: string; icon: string };
    tags?: string;
    createdAt: string;
}

export default function HistoryPage() {
    const { data: session } = useSession();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editData, setEditData] = useState({ description: "", amount: "" });
    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState<string>("all");

    const fetchTransactions = useCallback(async () => {
        try {
            const res = await fetch("/api/transactions?limit=100");
            if (res.ok) {
                const data = await res.json();
                setTransactions(data.transactions);
            }
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (session?.user) fetchTransactions();
    }, [session, fetchTransactions]);

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
            if (res.ok) {
                setTransactions((prev) => prev.filter((t) => t.id !== id));
            }
        } catch (error) {
            console.error("Delete error:", error);
        }
    };

    const handleEdit = (tx: Transaction) => {
        setEditingId(tx.id);
        setEditData({ description: tx.description, amount: String(tx.amount) });
    };

    const handleSave = async (id: string) => {
        try {
            const res = await fetch(`/api/transactions/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    description: editData.description,
                    amount: parseFloat(editData.amount),
                }),
            });
            if (res.ok) {
                const updated = await res.json();
                setTransactions((prev) =>
                    prev.map((t) => (t.id === id ? { ...t, ...updated } : t))
                );
                setEditingId(null);
            }
        } catch (error) {
            console.error("Save error:", error);
        }
    };

    const filtered = transactions.filter((tx) => {
        const matchSearch = tx.description.toLowerCase().includes(search.toLowerCase());
        const matchType = filterType === "all" || tx.type === filterType;
        return matchSearch && matchType;
    });

    const grouped = filtered.reduce((acc, tx) => {
        const date = new Date(tx.createdAt).toLocaleDateString("th-TH", {
            weekday: "long",
            day: "numeric",
            month: "long",
        });
        if (!acc[date]) acc[date] = [];
        acc[date].push(tx);
        return acc;
    }, {} as Record<string, Transaction[]>);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin"
                    style={{ borderColor: "var(--color-accent)", borderTopColor: "transparent" }} />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto w-full page-enter py-8 space-y-6">
            {/* ── Page Header ── */}
            <div className="animate-fade-in-up">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">ประวัติรายการ</h1>
                <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
                    ดูและจัดการรายการทั้งหมดของคุณ
                </p>
            </div>

            {/* ── Search & Filter ── */}
            <div className="flex gap-3 animate-fade-in-up stagger-1">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
                        style={{ color: "var(--color-text-muted)" }} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="ค้นหารายการ..."
                        className="input-field pl-12"
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                        style={{ color: "var(--color-text-muted)" }} />
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="input-field pl-10 pr-5 appearance-none cursor-pointer"
                        style={{ minWidth: "110px" }}>
                        <option value="all">ทั้งหมด</option>
                        <option value="expense">รายจ่าย</option>
                        <option value="income">รายรับ</option>
                    </select>
                </div>
            </div>

            {/* ── Transactions ── */}
            {Object.keys(grouped).length === 0 ? (
                <div className="text-center py-20 animate-fade-in-up">
                    <p className="text-5xl mb-4">📭</p>
                    <p className="text-base font-semibold" style={{ color: "var(--color-text-secondary)" }}>
                        ยังไม่มีรายการ
                    </p>
                    <p className="text-sm mt-1.5" style={{ color: "var(--color-text-muted)" }}>
                        เริ่มบันทึกรายรับ-รายจ่ายกันเลย!
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(grouped).map(([date, txs]) => (
                        <div key={date} className="animate-fade-in-up">
                            <div className="flex items-center gap-4 mb-3">
                                <p className="text-xs font-bold whitespace-nowrap tracking-wide uppercase"
                                    style={{ color: "var(--color-text-muted)" }}>
                                    {date}
                                </p>
                                <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.04)" }} />
                            </div>
                            <div className="space-y-2.5">
                                {txs.map((tx) => (
                                    <div
                                        key={tx.id}
                                        className="flex items-center gap-3.5 p-4 rounded-2xl transition-all duration-250"
                                        style={{
                                            background: editingId === tx.id
                                                ? "linear-gradient(145deg, rgba(16, 16, 28, 0.8), rgba(12, 12, 22, 0.6))"
                                                : "linear-gradient(145deg, rgba(16, 16, 28, 0.5), rgba(12, 12, 22, 0.3))",
                                            border: `1px solid ${editingId === tx.id ? "var(--color-accent)" : "rgba(255,255,255,0.04)"}`,
                                            boxShadow: editingId === tx.id ? "0 0 24px rgba(124, 109, 240, 0.08)" : "none",
                                        }}>
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                                            style={{ background: "rgba(255,255,255,0.04)" }}>
                                            {tx.category?.icon || "📌"}
                                        </div>

                                        {editingId === tx.id ? (
                                            <div className="flex-1 flex flex-col gap-2.5">
                                                <input
                                                    value={editData.description}
                                                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                                    className="input-field py-2.5 text-sm"
                                                />
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        value={editData.amount}
                                                        onChange={(e) => setEditData({ ...editData, amount: e.target.value })}
                                                        className="input-field py-2.5 text-sm w-28"
                                                    />
                                                    <button onClick={() => handleSave(tx.id)}
                                                        className="p-2.5 rounded-xl transition-all hover:brightness-110"
                                                        style={{ background: "var(--color-success)", color: "white" }}>
                                                        <Save className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button onClick={() => setEditingId(null)}
                                                        className="p-2.5 rounded-xl transition-colors"
                                                        style={{ background: "rgba(255,255,255,0.06)", color: "var(--color-text-secondary)" }}>
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">{tx.description}</p>
                                                    <p className="text-[11px] mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                                                        {tx.category?.name}
                                                        {tx.tags && ` · ${tx.tags}`}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold tabular-nums whitespace-nowrap"
                                                        style={{ color: tx.type === "income" ? "var(--color-income)" : "var(--color-expense)" }}>
                                                        {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                                                    </span>
                                                    <button onClick={() => handleEdit(tx)}
                                                        className="p-2 rounded-lg transition-colors hover:bg-white/5"
                                                        style={{ color: "var(--color-text-muted)" }}>
                                                        <Edit3 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button onClick={() => handleDelete(tx.id)}
                                                        className="p-2 rounded-lg transition-colors hover:bg-red-500/10 hover:text-red-400"
                                                        style={{ color: "var(--color-text-muted)" }}>
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

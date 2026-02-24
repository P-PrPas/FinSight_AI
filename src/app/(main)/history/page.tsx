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
                <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
                    style={{ borderColor: "var(--color-accent)", borderTopColor: "transparent" }} />
            </div>
        );
    }

    return (
        <div className="p-4 space-y-4 page-enter">
            <h1 className="text-xl font-bold">📝 ประวัติรายการ</h1>

            {/* Search & Filter */}
            <div className="flex gap-2">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--color-text-muted)" }} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="ค้นหารายการ..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                        style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--color-text-muted)" }} />
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="pl-10 pr-4 py-2.5 rounded-xl border text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                        style={{ background: "var(--color-bg-card)", borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}>
                        <option value="all">ทั้งหมด</option>
                        <option value="expense">รายจ่าย</option>
                        <option value="income">รายรับ</option>
                    </select>
                </div>
            </div>

            {/* Transactions grouped by date */}
            {Object.keys(grouped).length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-4xl mb-3">📭</p>
                    <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                        ยังไม่มีรายการ เริ่มบันทึกกันเลย!
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {Object.entries(grouped).map(([date, txs]) => (
                        <div key={date}>
                            <p className="text-xs font-semibold mb-2 px-1" style={{ color: "var(--color-text-muted)" }}>
                                {date}
                            </p>
                            <div className="space-y-1.5">
                                {txs.map((tx) => (
                                    <div
                                        key={tx.id}
                                        className="flex items-center gap-3 p-3 rounded-xl border transition-all duration-200"
                                        style={{ background: "var(--color-bg-card)", borderColor: editingId === tx.id ? "var(--color-accent)" : "var(--color-border)" }}>
                                        <span className="text-lg flex-shrink-0">{tx.category?.icon || "📌"}</span>

                                        {editingId === tx.id ? (
                                            <div className="flex-1 flex flex-col gap-2">
                                                <input
                                                    value={editData.description}
                                                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                                    className="w-full px-2 py-1 rounded-lg text-sm border focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                                                    style={{ background: "var(--color-bg-input)", borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
                                                />
                                                <input
                                                    type="number"
                                                    value={editData.amount}
                                                    onChange={(e) => setEditData({ ...editData, amount: e.target.value })}
                                                    className="w-24 px-2 py-1 rounded-lg text-sm border focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                                                    style={{ background: "var(--color-bg-input)", borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
                                                />
                                                <div className="flex gap-1.5">
                                                    <button onClick={() => handleSave(tx.id)}
                                                        className="p-1.5 rounded-lg"
                                                        style={{ background: "var(--color-success)", color: "white" }}>
                                                        <Save className="w-3 h-3" />
                                                    </button>
                                                    <button onClick={() => setEditingId(null)}
                                                        className="p-1.5 rounded-lg"
                                                        style={{ background: "var(--color-border)", color: "var(--color-text-secondary)" }}>
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">{tx.description}</p>
                                                    <p className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>
                                                        {tx.category?.name}
                                                        {tx.tags && ` • ${tx.tags}`}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-semibold whitespace-nowrap"
                                                        style={{ color: tx.type === "income" ? "var(--color-income)" : "var(--color-expense)" }}>
                                                        {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                                                    </span>
                                                    <button onClick={() => handleEdit(tx)}
                                                        className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
                                                        style={{ color: "var(--color-text-muted)" }}>
                                                        <Edit3 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button onClick={() => handleDelete(tx.id)}
                                                        className="p-1.5 rounded-lg transition-colors hover:bg-red-500/10"
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

"use client";

import { useState, useCallback } from "react";
import { getTimeBasedWidgets } from "@/lib/gamification";
import { useAppStore } from "@/store/useAppStore";
import { Check, Loader2 } from "lucide-react";

export default function DynamicWidgets() {
    const widgets = getTimeBasedWidgets();
    const { addTransaction } = useAppStore();
    const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
    const [successIndex, setSuccessIndex] = useState<number | null>(null);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editAmount, setEditAmount] = useState("");

    const handleQuickAdd = useCallback(
        async (widget: typeof widgets[0], index: number) => {
            if (loadingIndex !== null) return;
            setLoadingIndex(index);

            try {
                const catRes = await fetch("/api/categories");
                const categories = await catRes.json();
                const category = categories.find(
                    (c: { name: string }) => c.name === widget.category
                );

                if (category) {
                    const res = await fetch("/api/transactions", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            amount: widget.amount,
                            description: widget.label,
                            type: "expense",
                            categoryId: category.id,
                            isWidget: true,
                        }),
                    });

                    if (res.ok) {
                        const transaction = await res.json();
                        addTransaction(transaction);
                        setSuccessIndex(index);
                        setTimeout(() => setSuccessIndex(null), 2000);
                    }
                }
            } catch (error) {
                console.error("Widget add error:", error);
            } finally {
                setLoadingIndex(null);
            }
        },
        [loadingIndex, addTransaction]
    );

    const handleLongPress = (index: number, amount: number) => {
        setEditingIndex(index);
        setEditAmount(String(amount));
    };

    const handleEditConfirm = (widget: typeof widgets[0], index: number) => {
        const newAmount = parseInt(editAmount);
        if (newAmount > 0) {
            handleQuickAdd({ ...widget, amount: newAmount }, index);
        }
        setEditingIndex(null);
        setEditAmount("");
    };

    return (
        <div className="grid grid-cols-2 gap-3">
            {widgets.map((widget, index) => (
                <div key={index} className="relative">
                    {editingIndex === index ? (
                        <div className="rounded-2xl p-4"
                            style={{
                                background: "linear-gradient(145deg, rgba(16, 16, 28, 0.9), rgba(12, 12, 22, 0.7))",
                                border: "1px solid var(--color-accent)",
                                boxShadow: "0 0 24px rgba(124, 109, 240, 0.1)",
                            }}>
                            <div className="flex items-center gap-2.5 mb-3">
                                <span className="text-xl">{widget.icon}</span>
                                <span className="text-sm font-medium">{widget.label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={editAmount}
                                    onChange={(e) => setEditAmount(e.target.value)}
                                    className="input-field py-2.5 text-sm"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleEditConfirm(widget, index);
                                        if (e.key === "Escape") setEditingIndex(null);
                                    }}
                                />
                                <button
                                    onClick={() => handleEditConfirm(widget, index)}
                                    className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-white flex-shrink-0"
                                    style={{ background: "var(--color-accent)" }}>
                                    ✓
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => handleQuickAdd(widget, index)}
                            onContextMenu={(e) => {
                                e.preventDefault();
                                handleLongPress(index, widget.amount);
                            }}
                            disabled={loadingIndex !== null}
                            className="widget-btn w-full rounded-2xl p-4 text-left"
                            style={{
                                background:
                                    successIndex === index
                                        ? "rgba(34, 197, 94, 0.06)"
                                        : "linear-gradient(145deg, rgba(16, 16, 28, 0.6), rgba(12, 12, 22, 0.4))",
                                border: `1px solid ${successIndex === index
                                    ? "rgba(34, 197, 94, 0.15)"
                                    : "rgba(255,255,255,0.05)"
                                    }`,
                            }}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
                                        style={{ background: "rgba(255,255,255,0.04)" }}>
                                        {widget.icon}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium"
                                            style={{ color: "var(--color-text-primary)" }}>
                                            {widget.label}
                                        </p>
                                        <p className="text-xs tabular-nums mt-0.5"
                                            style={{ color: "var(--color-text-muted)" }}>
                                            {widget.amount}฿
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    {loadingIndex === index ? (
                                        <Loader2 className="w-4 h-4 animate-spin"
                                            style={{ color: "var(--color-accent)" }} />
                                    ) : successIndex === index ? (
                                        <Check className="w-4 h-4"
                                            style={{ color: "var(--color-success)" }} />
                                    ) : null}
                                </div>
                            </div>
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}

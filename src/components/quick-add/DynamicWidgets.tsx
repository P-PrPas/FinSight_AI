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
                const res = await fetch("/api/transactions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        amount: widget.amount,
                        description: widget.label,
                        type: "expense",
                        categoryId: "",
                        isWidget: true,
                    }),
                });

                // Need to get categoryId from categories first
                const catRes = await fetch("/api/categories");
                const categories = await catRes.json();
                const category = categories.find(
                    (c: { name: string }) => c.name === widget.category
                );

                if (category) {
                    const actualRes = await fetch("/api/transactions", {
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

                    if (actualRes.ok) {
                        const transaction = await actualRes.json();
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
                        <div
                            className="rounded-2xl p-3 border animate-fade-in-up"
                            style={{
                                background: "var(--color-bg-card)",
                                borderColor: "var(--color-accent)",
                            }}>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xl">{widget.icon}</span>
                                <span className="text-sm font-medium">{widget.label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={editAmount}
                                    onChange={(e) => setEditAmount(e.target.value)}
                                    className="w-full px-3 py-1.5 rounded-lg text-sm border focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                                    style={{
                                        background: "var(--color-bg-input)",
                                        borderColor: "var(--color-border)",
                                        color: "var(--color-text-primary)",
                                    }}
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleEditConfirm(widget, index);
                                        if (e.key === "Escape") setEditingIndex(null);
                                    }}
                                />
                                <button
                                    onClick={() => handleEditConfirm(widget, index)}
                                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-white"
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
                            className="widget-btn w-full rounded-2xl p-4 border text-left transition-all duration-200"
                            style={{
                                background:
                                    successIndex === index
                                        ? "rgba(46, 213, 115, 0.1)"
                                        : "var(--color-bg-card)",
                                borderColor:
                                    successIndex === index
                                        ? "var(--color-success)"
                                        : "var(--color-border)",
                            }}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <span className="text-2xl">{widget.icon}</span>
                                    <div>
                                        <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                                            {widget.label}
                                        </p>
                                        <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                                            {widget.amount}฿
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    {loadingIndex === index ? (
                                        <Loader2 className="w-4 h-4 animate-spin" style={{ color: "var(--color-accent)" }} />
                                    ) : successIndex === index ? (
                                        <Check className="w-4 h-4" style={{ color: "var(--color-success)" }} />
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

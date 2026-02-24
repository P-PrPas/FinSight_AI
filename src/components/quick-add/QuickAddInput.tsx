"use client";

import { useState, useRef } from "react";
import { Send, Sparkles, Check, Loader2 } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export default function QuickAddInput() {
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [error, setError] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const { addTransaction } = useAppStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim() || loading) return;

        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/ai/parse", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "เกิดข้อผิดพลาด");
                return;
            }

            addTransaction(data.transaction);
            setSuccess(true);
            setSuccessMsg(data.message);
            setText("");

            setTimeout(() => {
                setSuccess(false);
                setSuccessMsg("");
            }, 3000);
        } catch {
            setError("เชื่อมต่อไม่ได้ ลองใหม่อีกครั้ง");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-2">
            <form onSubmit={handleSubmit} className="relative">
                <div className="relative flex items-center">
                    <Sparkles
                        className="absolute left-4 w-4 h-4"
                        style={{ color: "var(--color-accent-light)" }}
                    />
                    <input
                        ref={inputRef}
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder='พิมพ์เช่น "กาแฟ 60" หรือ "เงินเดือน 30000"'
                        className="w-full pl-11 pr-14 py-4 rounded-2xl border text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                        style={{
                            background: "var(--color-bg-card)",
                            borderColor: "var(--color-border)",
                            color: "var(--color-text-primary)",
                        }}
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={!text.trim() || loading}
                        className="absolute right-2 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-30"
                        style={{ background: "var(--color-accent)" }}>
                        {loading ? (
                            <Loader2 className="w-4 h-4 text-white animate-spin" />
                        ) : success ? (
                            <Check className="w-4 h-4 text-white" />
                        ) : (
                            <Send className="w-4 h-4 text-white" />
                        )}
                    </button>
                </div>
            </form>

            {/* Success message */}
            {success && successMsg && (
                <div
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm animate-fade-in-up"
                    style={{
                        background: "rgba(46, 213, 115, 0.1)",
                        color: "var(--color-success)",
                        border: "1px solid rgba(46, 213, 115, 0.2)",
                    }}>
                    <Check className="w-4 h-4 flex-shrink-0" />
                    {successMsg}
                </div>
            )}

            {/* Error message */}
            {error && (
                <div
                    className="px-4 py-2.5 rounded-xl text-sm animate-fade-in-up"
                    style={{
                        background: "rgba(255, 71, 87, 0.1)",
                        color: "var(--color-critical)",
                        border: "1px solid rgba(255, 71, 87, 0.2)",
                    }}>
                    {error}
                </div>
            )}
        </div>
    );
}

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
        <div className="space-y-3">
            <form onSubmit={handleSubmit} className="relative">
                <div className="relative flex items-center group">
                    <Sparkles
                        className="absolute left-5 w-4 h-4 transition-colors duration-200"
                        style={{ color: "var(--color-accent-light)" }}
                    />
                    <input
                        ref={inputRef}
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder='พิมพ์เช่น "กาแฟ 60" หรือ "เงินเดือน 30000"'
                        className="input-field pl-12 pr-16 py-4 text-[15px]"
                        disabled={loading}
                        style={{
                            borderRadius: "var(--radius-lg)",
                        }}
                    />
                    <button
                        type="submit"
                        disabled={!text.trim() || loading}
                        className="absolute right-2.5 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-250 disabled:opacity-20"
                        style={{
                            background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-light))",
                            boxShadow: text.trim() ? "0 4px 14px rgba(124, 109, 240, 0.3)" : "none",
                        }}>
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

            {success && successMsg && (
                <div
                    className="flex items-center gap-2.5 px-4 py-3.5 rounded-xl text-sm font-medium animate-fade-in-up"
                    style={{
                        background: "rgba(34, 197, 94, 0.06)",
                        color: "var(--color-success)",
                        border: "1px solid rgba(34, 197, 94, 0.12)",
                    }}>
                    <Check className="w-4 h-4 flex-shrink-0" />
                    {successMsg}
                </div>
            )}

            {error && (
                <div
                    className="flex items-center gap-2.5 px-4 py-3.5 rounded-xl text-sm font-medium animate-fade-in-up"
                    style={{
                        background: "rgba(248, 113, 113, 0.06)",
                        color: "var(--color-critical)",
                        border: "1px solid rgba(248, 113, 113, 0.12)",
                    }}>
                    <span>⚠️</span> {error}
                </div>
            )}
        </div>
    );
}

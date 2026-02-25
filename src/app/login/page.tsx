"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Sparkles, Eye, EyeOff, ArrowRight, Mail, Lock, User } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            if (isLogin) {
                const result = await signIn("credentials", {
                    email,
                    password,
                    redirect: false,
                });

                if (result?.error) {
                    setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
                } else {
                    router.push("/dashboard");
                    router.refresh();
                }
            } else {
                const res = await fetch("/api/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password, name }),
                });

                const data = await res.json();

                if (!res.ok) {
                    setError(data.error);
                } else {
                    const loginResult = await signIn("credentials", {
                        email,
                        password,
                        redirect: false,
                    });

                    if (loginResult?.ok) {
                        router.push("/dashboard");
                        router.refresh();
                    }
                }
            }
        } catch {
            setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
            style={{ background: "var(--color-bg-primary)" }}>

            {/* ── Animated background orbs ── */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[15%] left-[10%] w-[400px] h-[400px] rounded-full opacity-[0.1] animate-orb"
                    style={{ background: "radial-gradient(circle, #7c6df0, transparent 65%)", filter: "blur(100px)" }} />
                <div className="absolute bottom-[15%] right-[10%] w-[350px] h-[350px] rounded-full opacity-[0.07] animate-orb"
                    style={{ background: "radial-gradient(circle, #34d399, transparent 65%)", filter: "blur(80px)", animationDelay: "-8s" }} />
                <div className="absolute top-[55%] left-[55%] w-[300px] h-[300px] rounded-full opacity-[0.05] animate-orb"
                    style={{ background: "radial-gradient(circle, #a78bfa, transparent 65%)", filter: "blur(90px)", animationDelay: "-16s" }} />
            </div>

            <div className="w-full max-w-[420px] relative animate-fade-in-up">
                {/* ── Logo ── */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-18 h-18 rounded-2xl mb-6 glow-accent relative"
                        style={{ background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-light))", width: "72px", height: "72px" }}>
                        <Sparkles className="w-9 h-9 text-white" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-2.5 tracking-tight">FinSight AI</h1>
                    <p className="text-sm tracking-wide" style={{ color: "var(--color-text-secondary)" }}>
                        ผู้ช่วยจัดการการเงินอัจฉริยะ
                    </p>
                </div>

                {/* ── Card ── */}
                <div className="rounded-3xl p-8"
                    style={{
                        background: "linear-gradient(145deg, rgba(14, 14, 24, 0.9), rgba(10, 10, 18, 0.8))",
                        backdropFilter: "blur(48px) saturate(1.8)",
                        WebkitBackdropFilter: "blur(48px) saturate(1.8)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        boxShadow: "0 12px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03) inset",
                    }}>

                    {/* ── Toggle ── */}
                    <div className="flex mb-8 rounded-2xl p-1.5 gap-1"
                        style={{ background: "rgba(0,0,0,0.35)" }}>
                        <button
                            onClick={() => { setIsLogin(true); setError(""); }}
                            className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-300"
                            style={{
                                background: isLogin ? "linear-gradient(135deg, var(--color-accent), var(--color-accent-light))" : "transparent",
                                color: isLogin ? "white" : "var(--color-text-muted)",
                                boxShadow: isLogin ? "0 4px 16px rgba(124, 109, 240, 0.3)" : "none",
                            }}>
                            เข้าสู่ระบบ
                        </button>
                        <button
                            onClick={() => { setIsLogin(false); setError(""); }}
                            className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-300"
                            style={{
                                background: !isLogin ? "linear-gradient(135deg, var(--color-accent), var(--color-accent-light))" : "transparent",
                                color: !isLogin ? "white" : "var(--color-text-muted)",
                                boxShadow: !isLogin ? "0 4px 16px rgba(124, 109, 240, 0.3)" : "none",
                            }}>
                            สมัครสมาชิก
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name (register only) */}
                        {!isLogin && (
                            <div className="animate-fade-in-up">
                                <label className="block text-xs font-semibold mb-2.5 ml-1"
                                    style={{ color: "var(--color-text-secondary)" }}>
                                    ชื่อ
                                </label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
                                        style={{ color: "var(--color-text-muted)" }} />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="ชื่อของคุณ"
                                        className="input-field pl-12"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-semibold mb-2.5 ml-1"
                                style={{ color: "var(--color-text-secondary)" }}>
                                อีเมล
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
                                    style={{ color: "var(--color-text-muted)" }} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    required
                                    className="input-field pl-12"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-semibold mb-2.5 ml-1"
                                style={{ color: "var(--color-text-secondary)" }}>
                                รหัสผ่าน
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
                                    style={{ color: "var(--color-text-muted)" }} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                    className="input-field pl-12 pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors hover:bg-white/5"
                                    style={{ color: "var(--color-text-muted)" }}>
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="flex items-center gap-2.5 p-4 rounded-xl text-sm font-medium animate-fade-in-up"
                                style={{
                                    background: "rgba(248, 113, 113, 0.06)",
                                    color: "var(--color-critical)",
                                    border: "1px solid rgba(248, 113, 113, 0.12)"
                                }}>
                                <span>⚠️</span> {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 transition-all duration-300 hover:brightness-110 hover:shadow-xl active:scale-[0.98] disabled:opacity-50"
                            style={{
                                background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-light))",
                                boxShadow: "0 6px 24px rgba(124, 109, 240, 0.3)"
                            }}>
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    {isLogin ? "เข้าสู่ระบบ" : "สร้างบัญชี"}
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-xs mt-10" style={{ color: "var(--color-text-muted)" }}>
                    FinSight AI v1.0 — จัดการการเงินด้วยพลัง AI ✨
                </p>
            </div>
        </div>
    );
}

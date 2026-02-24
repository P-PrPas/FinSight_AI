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

            {/* Animated background orbs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[20%] left-[15%] w-[300px] h-[300px] rounded-full opacity-[0.12] animate-orb"
                    style={{ background: "radial-gradient(circle, #6c5ce7, transparent 70%)", filter: "blur(80px)" }} />
                <div className="absolute bottom-[20%] right-[15%] w-[250px] h-[250px] rounded-full opacity-[0.08] animate-orb"
                    style={{ background: "radial-gradient(circle, #00cec9, transparent 70%)", filter: "blur(60px)", animationDelay: "-7s" }} />
                <div className="absolute top-[60%] left-[60%] w-[200px] h-[200px] rounded-full opacity-[0.06] animate-orb"
                    style={{ background: "radial-gradient(circle, #a29bfe, transparent 70%)", filter: "blur(70px)", animationDelay: "-14s" }} />
            </div>

            <div className="w-full max-w-[400px] relative animate-fade-in-up">
                {/* Logo */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5 glow-accent"
                        style={{ background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-light))" }}>
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold gradient-text mb-2">FinSight AI</h1>
                    <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                        ผู้ช่วยจัดการการเงินอัจฉริยะ
                    </p>
                </div>

                {/* Card */}
                <div className="glass-strong rounded-3xl p-7"
                    style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.04) inset" }}>

                    {/* Toggle */}
                    <div className="flex mb-7 rounded-2xl p-1.5 gap-1"
                        style={{ background: "rgba(0,0,0,0.3)" }}>
                        <button
                            onClick={() => { setIsLogin(true); setError(""); }}
                            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300"
                            style={{
                                background: isLogin ? "linear-gradient(135deg, var(--color-accent), var(--color-accent-light))" : "transparent",
                                color: isLogin ? "white" : "var(--color-text-muted)",
                                boxShadow: isLogin ? "0 2px 12px rgba(108, 92, 231, 0.3)" : "none",
                            }}>
                            เข้าสู่ระบบ
                        </button>
                        <button
                            onClick={() => { setIsLogin(false); setError(""); }}
                            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300"
                            style={{
                                background: !isLogin ? "linear-gradient(135deg, var(--color-accent), var(--color-accent-light))" : "transparent",
                                color: !isLogin ? "white" : "var(--color-text-muted)",
                                boxShadow: !isLogin ? "0 2px 12px rgba(108, 92, 231, 0.3)" : "none",
                            }}>
                            สมัครสมาชิก
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name (register only) */}
                        {!isLogin && (
                            <div className="animate-fade-in-up">
                                <label className="block text-xs font-medium mb-2 ml-1"
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
                                        className="input-field pl-11"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-medium mb-2 ml-1"
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
                                    className="input-field pl-11"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-medium mb-2 ml-1"
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
                                    className="input-field pl-11 pr-12"
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
                            <div className="flex items-center gap-2 p-3.5 rounded-xl text-sm animate-fade-in-up"
                                style={{
                                    background: "rgba(225, 112, 85, 0.08)",
                                    color: "var(--color-critical)",
                                    border: "1px solid rgba(225, 112, 85, 0.15)"
                                }}>
                                <span>⚠️</span> {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 transition-all duration-300 hover:brightness-110 hover:shadow-lg active:scale-[0.98] disabled:opacity-50"
                            style={{
                                background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-light))",
                                boxShadow: "0 4px 20px rgba(108, 92, 231, 0.3)"
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

                <p className="text-center text-xs mt-8" style={{ color: "var(--color-text-muted)" }}>
                    FinSight AI v1.0 — จัดการการเงินด้วยพลัง AI ✨
                </p>
            </div>
        </div>
    );
}

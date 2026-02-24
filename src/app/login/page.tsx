"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Sparkles, Eye, EyeOff, ArrowRight, UserPlus } from "lucide-react";

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
                    setError(result.error);
                } else {
                    router.push("/");
                    router.refresh();
                }
            } else {
                // Register
                const res = await fetch("/api/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password, name }),
                });

                const data = await res.json();

                if (!res.ok) {
                    setError(data.error);
                } else {
                    // Auto login after register
                    const loginResult = await signIn("credentials", {
                        email,
                        password,
                        redirect: false,
                    });

                    if (loginResult?.ok) {
                        router.push("/");
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
        <div className="min-h-screen flex items-center justify-center p-4"
            style={{ background: "linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0a0a0f 100%)" }}>

            {/* Background decoration */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-20"
                    style={{ background: "radial-gradient(circle, var(--color-accent) 0%, transparent 70%)", filter: "blur(60px)" }} />
                <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full opacity-15"
                    style={{ background: "radial-gradient(circle, var(--color-income) 0%, transparent 70%)", filter: "blur(50px)" }} />
            </div>

            <div className="w-full max-w-md relative animate-fade-in-up">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                            style={{ background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-light))" }}>
                            <Sparkles className="w-7 h-7 text-white" />
                        </div>
                        <div className="text-left">
                            <h1 className="text-3xl font-bold gradient-text">FinSight AI</h1>
                            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                                ผู้ช่วยจัดการการเงินอัจฉริยะ
                            </p>
                        </div>
                    </div>
                </div>

                {/* Card */}
                <div className="glass rounded-3xl p-8">
                    {/* Toggle */}
                    <div className="flex mb-6 rounded-xl p-1" style={{ background: "var(--color-bg-primary)" }}>
                        <button
                            onClick={() => { setIsLogin(true); setError(""); }}
                            className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300"
                            style={{
                                background: isLogin ? "var(--color-accent)" : "transparent",
                                color: isLogin ? "white" : "var(--color-text-secondary)",
                            }}>
                            เข้าสู่ระบบ
                        </button>
                        <button
                            onClick={() => { setIsLogin(false); setError(""); }}
                            className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300"
                            style={{
                                background: !isLogin ? "var(--color-accent)" : "transparent",
                                color: !isLogin ? "white" : "var(--color-text-secondary)",
                            }}>
                            สมัครสมาชิก
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <div className="animate-fade-in-up">
                                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
                                    ชื่อ
                                </label>
                                <div className="relative">
                                    <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--color-text-muted)" }} />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="ชื่อของคุณ"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                                        style={{
                                            background: "var(--color-bg-input)",
                                            borderColor: "var(--color-border)",
                                            color: "var(--color-text-primary)",
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
                                Email
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--color-text-muted)" }}>@</span>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    required
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                                    style={{
                                        background: "var(--color-bg-input)",
                                        borderColor: "var(--color-border)",
                                        color: "var(--color-text-primary)",
                                    }}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
                                Password
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--color-text-muted)" }}>🔒</span>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                    className="w-full pl-10 pr-12 py-3 rounded-xl border text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                                    style={{
                                        background: "var(--color-bg-input)",
                                        borderColor: "var(--color-border)",
                                        color: "var(--color-text-primary)",
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2"
                                    style={{ color: "var(--color-text-muted)" }}>
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-xl text-sm animate-fade-in-up"
                                style={{ background: "rgba(255, 71, 87, 0.1)", color: "var(--color-critical)", border: "1px solid rgba(255, 71, 87, 0.2)" }}>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all duration-300 hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
                            style={{ background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-light))" }}>
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    {isLogin ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-xs mt-6" style={{ color: "var(--color-text-muted)" }}>
                    FinSight AI — จัดการการเงินด้วยพลัง AI 🚀
                </p>
            </div>
        </div>
    );
}

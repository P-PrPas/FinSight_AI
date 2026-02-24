"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import BottomNav from "@/components/layout/BottomNav";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const { status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center"
                style={{ background: "var(--color-bg-primary)" }}>
                <div className="flex flex-col items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center animate-pulse-glow"
                        style={{ background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-light))" }}>
                        <span className="text-2xl">✨</span>
                    </div>
                    <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                        กำลังโหลด...
                    </p>
                </div>
            </div>
        );
    }

    if (status === "unauthenticated") {
        return null;
    }

    return (
        <div className="min-h-screen relative" style={{ background: "var(--color-bg-primary)" }}>
            {/* Subtle gradient accent on top */}
            <div className="fixed top-0 left-0 right-0 h-[200px] pointer-events-none"
                style={{
                    background: "radial-gradient(ellipse 60% 100% at 50% -20%, rgba(108, 92, 231, 0.06), transparent)",
                }} />

            <main className="relative max-w-lg mx-auto pb-nav">
                {children}
            </main>
            <BottomNav />
        </div>
    );
}

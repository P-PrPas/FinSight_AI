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
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center animate-pulse-glow"
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
        <div className="min-h-screen" style={{ background: "var(--color-bg-primary)" }}>
            <main className="max-w-md mx-auto pb-nav">
                {children}
            </main>
            <BottomNav />
        </div>
    );
}

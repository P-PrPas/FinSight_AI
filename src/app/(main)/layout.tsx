"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import BottomNav from "@/components/layout/BottomNav";
import Sidebar from "@/components/layout/Sidebar";
import { useAppStore } from "@/store/useAppStore";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const { status } = useSession();
    const router = useRouter();
    const isSidebarOpen = useAppStore((state) => state.isSidebarOpen);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center"
                style={{ background: "var(--color-bg-primary)" }}>
                <div className="flex flex-col items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center animate-pulse-glow"
                        style={{ background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-light))" }}>
                        <span className="text-2xl">✨</span>
                    </div>
                    <p className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
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
        <div className="min-h-screen flex" style={{ background: "var(--color-bg-primary)" }}>
            <Sidebar />

            <div className={`flex-1 relative w-full transition-all duration-300 ease-out ${isSidebarOpen ? "md:pl-[260px]" : "md:pl-[72px]"}`}>
                {/* ── Ambient gradient effects ── */}
                <div className="fixed top-0 left-0 right-0 h-[400px] pointer-events-none" style={{ zIndex: 0 }}>
                    {/* Primary accent glow */}
                    <div
                        className="absolute inset-0"
                        style={{
                            background: "radial-gradient(ellipse 50% 80% at 50% -10%, rgba(124, 109, 240, 0.07), transparent)",
                        }}
                    />
                    {/* Secondary warm glow */}
                    <div
                        className="absolute inset-0"
                        style={{
                            background: "radial-gradient(ellipse 40% 60% at 80% 0%, rgba(52, 211, 153, 0.03), transparent)",
                        }}
                    />
                </div>

                <main className="relative w-full max-w-6xl mx-auto pb-nav px-5 sm:px-6 lg:px-8" style={{ zIndex: 1 }}>
                    {children}
                </main>
                <BottomNav />
            </div>
        </div>
    );
}

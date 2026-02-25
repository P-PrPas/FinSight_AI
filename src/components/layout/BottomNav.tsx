"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Clock, BarChart3, Settings } from "lucide-react";

const navItems = [
    { href: "/dashboard", icon: Home, label: "หน้าแรก" },
    { href: "/history", icon: Clock, label: "ประวัติ" },
    { href: "/insights", icon: BarChart3, label: "วิเคราะห์" },
    { href: "/settings", icon: Settings, label: "ตั้งค่า" },
];

export default function BottomNav() {
    const pathname = usePathname();

    return (
        <nav
            className="fixed bottom-4 left-4 right-4 z-50 md:hidden"
            style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
            <div
                className="max-w-[460px] mx-auto flex items-center justify-around py-2 px-3 rounded-2xl"
                style={{
                    background: "rgba(10, 10, 18, 0.92)",
                    backdropFilter: "blur(48px) saturate(1.8)",
                    WebkitBackdropFilter: "blur(48px) saturate(1.8)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.03) inset",
                }}
            >
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all duration-250 relative"
                            style={{
                                color: isActive ? "var(--color-accent-light)" : "var(--color-text-muted)",
                                background: isActive ? "rgba(124, 109, 240, 0.1)" : "transparent",
                            }}
                        >
                            <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.5} />
                            <span className="text-[10px] font-semibold tracking-wide">{item.label}</span>
                            {/* Active dot indicator */}
                            {isActive && (
                                <div
                                    className="absolute -bottom-0.5 w-1 h-1 rounded-full animate-scale-in"
                                    style={{ background: "var(--color-accent-light)" }}
                                />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}

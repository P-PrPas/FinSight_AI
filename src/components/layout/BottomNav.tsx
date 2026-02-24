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
            className="fixed bottom-0 left-0 right-0 z-50 glass-strong accent-border-top"
            style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
            <div className="max-w-lg mx-auto flex items-center justify-around py-2 px-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex flex-col items-center gap-1 py-1.5 px-5 rounded-2xl transition-all duration-200"
                            style={{
                                color: isActive ? "var(--color-accent-light)" : "var(--color-text-muted)",
                                background: isActive ? "rgba(108, 92, 231, 0.08)" : "transparent",
                            }}>
                            <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.5} />
                            <span className="text-[10px] font-semibold">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}

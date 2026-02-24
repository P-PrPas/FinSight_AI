"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Clock, BarChart3, Settings } from "lucide-react";

const navItems = [
    { href: "/", icon: Home, label: "หน้าแรก" },
    { href: "/history", icon: Clock, label: "ประวัติ" },
    { href: "/insights", icon: BarChart3, label: "วิเคราะห์" },
    { href: "/settings", icon: Settings, label: "ตั้งค่า" },
];

export default function BottomNav() {
    const pathname = usePathname();

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 z-50 glass border-t"
            style={{ borderColor: "var(--color-border)", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
            <div className="max-w-md mx-auto flex items-center justify-around py-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex flex-col items-center gap-0.5 px-4 py-1.5 transition-all duration-200 rounded-xl"
                            style={{
                                color: isActive ? "var(--color-accent-light)" : "var(--color-text-muted)",
                            }}>
                            <div className="relative">
                                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.5} />
                                {isActive && (
                                    <div
                                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                                        style={{ background: "var(--color-accent-light)" }}
                                    />
                                )}
                            </div>
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}

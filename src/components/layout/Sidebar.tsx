"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Clock, BarChart3, Settings, LogOut, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { signOut } from "next-auth/react";
import { useAppStore } from "@/store/useAppStore";

const navItems = [
    { href: "/dashboard", icon: Home, label: "หน้าแรก" },
    { href: "/history", icon: Clock, label: "ประวัติ" },
    { href: "/insights", icon: BarChart3, label: "วิเคราะห์" },
    { href: "/settings", icon: Settings, label: "ตั้งค่า" },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { isSidebarOpen, toggleSidebar } = useAppStore();

    return (
        <aside
            className={`hidden md:flex flex-col h-screen fixed left-0 top-0 z-50 transition-all duration-300 ease-out ${isSidebarOpen ? "w-[260px]" : "w-[72px]"
                }`}
            style={{
                background: "linear-gradient(180deg, rgba(10, 10, 18, 0.97), rgba(6, 6, 11, 0.99))",
                borderRight: "1px solid rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(48px) saturate(1.8)",
            }}
        >
            {/* ── Logo Area ── */}
            <div className={`flex items-center h-[80px] ${isSidebarOpen ? "px-6 gap-3" : "justify-center px-0"}`}>
                <div
                    className="w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center glow-ring"
                    style={{ background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-light))" }}
                >
                    <Sparkles className="w-5 h-5 text-white" />
                </div>
                {isSidebarOpen && (
                    <h1
                        className="text-lg font-bold tracking-tight bg-clip-text text-transparent truncate"
                        style={{ backgroundImage: "linear-gradient(135deg, #fff 30%, var(--color-text-secondary))" }}
                    >
                        FinSight AI
                    </h1>
                )}
            </div>

            {/* ── Divider ── */}
            <div className={`mx-4 mb-2 ${isSidebarOpen ? "" : "mx-3"}`}>
                <div className="divider" />
            </div>

            {/* ── Navigation ── */}
            <nav className={`flex-1 space-y-1 overflow-x-hidden py-2 ${isSidebarOpen ? "px-3" : "px-2"}`}>
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            title={!isSidebarOpen ? item.label : undefined}
                            className={`flex items-center gap-3 py-3 rounded-xl transition-all duration-200 group relative ${isSidebarOpen ? "px-4" : "justify-center px-0"
                                }`}
                            style={{
                                color: isActive ? "var(--color-accent-light)" : "var(--color-text-muted)",
                                background: isActive ? "rgba(124, 109, 240, 0.08)" : "transparent",
                            }}
                        >
                            {/* Active indicator bar */}
                            {isActive && (
                                <div
                                    className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full"
                                    style={{ background: "linear-gradient(180deg, var(--color-accent), var(--color-accent-light))" }}
                                />
                            )}
                            <Icon
                                className="w-[20px] h-[20px] transition-all duration-200 flex-shrink-0 group-hover:text-[var(--color-accent-light)]"
                                strokeWidth={isActive ? 2.5 : 1.8}
                            />
                            {isSidebarOpen && (
                                <span className={`text-sm font-medium whitespace-nowrap transition-colors duration-200 group-hover:text-[var(--color-text-primary)] ${isActive ? "font-semibold" : ""}`}>
                                    {item.label}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* ── Bottom Actions ── */}
            <div className={`pb-5 pt-2 space-y-1 ${isSidebarOpen ? "px-3" : "px-2"}`}>
                <div className={`mb-2 ${isSidebarOpen ? "mx-1" : ""}`}>
                    <div className="divider" />
                </div>
                <button
                    onClick={toggleSidebar}
                    title={!isSidebarOpen ? "ขยายแถบเมนู" : undefined}
                    className={`flex items-center gap-3 w-full py-2.5 rounded-xl transition-all duration-200 text-left group ${isSidebarOpen ? "px-4 hover:bg-white/[0.03]" : "justify-center px-0 hover:bg-white/[0.03]"
                        }`}
                    style={{ color: "var(--color-text-muted)" }}
                >
                    {isSidebarOpen ? (
                        <ChevronLeft className="w-[18px] h-[18px] flex-shrink-0 group-hover:text-[var(--color-text-secondary)]" strokeWidth={1.8} />
                    ) : (
                        <ChevronRight className="w-[18px] h-[18px] flex-shrink-0 group-hover:text-[var(--color-text-secondary)]" strokeWidth={1.8} />
                    )}
                    {isSidebarOpen && <span className="text-sm font-medium whitespace-nowrap">ย่อแถบเมนู</span>}
                </button>
                <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    title={!isSidebarOpen ? "ออกจากระบบ" : undefined}
                    className={`flex items-center gap-3 w-full py-2.5 rounded-xl transition-all duration-200 text-left group ${isSidebarOpen ? "px-4 hover:bg-red-500/[0.06]" : "justify-center px-0 hover:bg-red-500/[0.06]"
                        }`}
                    style={{ color: "var(--color-text-muted)" }}
                >
                    <LogOut className="w-[18px] h-[18px] transition-transform group-hover:-translate-x-0.5 flex-shrink-0 group-hover:text-red-400" strokeWidth={1.8} />
                    {isSidebarOpen && <span className="text-sm font-medium group-hover:text-red-400 transition-colors whitespace-nowrap">ออกจากระบบ</span>}
                </button>
            </div>
        </aside>
    );
}

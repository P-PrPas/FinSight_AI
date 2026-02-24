import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("th-TH", {
        style: "currency",
        currency: "THB",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

export function formatNumber(amount: number): string {
    return new Intl.NumberFormat("th-TH").format(amount);
}

export function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 6) return "ดึกแล้วนะ 🌙";
    if (hour < 12) return "สวัสดีตอนเช้า ☀️";
    if (hour < 17) return "สวัสดีตอนบ่าย 🌤️";
    if (hour < 21) return "สวัสดีตอนเย็น 🌅";
    return "สวัสดีตอนค่ำ 🌙";
}

export function getTimeBasedEmoji(): string {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 10) return "☕";
    if (hour >= 11 && hour < 14) return "🍱";
    if (hour >= 14 && hour < 17) return "🧋";
    if (hour >= 17 && hour < 21) return "🍲";
    return "🌙";
}

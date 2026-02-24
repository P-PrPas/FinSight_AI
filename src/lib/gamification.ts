/**
 * Gamification utilities for FinSight AI
 */

export interface HealthScoreInput {
    totalExpense: number;
    totalBudget: number;
    streakCount: number;
}

/**
 * Calculate financial health score (0-100)
 * Based on: budget usage ratio + streak bonus
 */
export function calculateHealthScore({
    totalExpense,
    totalBudget,
    streakCount,
}: HealthScoreInput): number {
    if (totalBudget === 0) return 100;

    const usageRatio = totalExpense / totalBudget;
    let baseScore: number;

    if (usageRatio <= 0.5) {
        baseScore = 100;
    } else if (usageRatio <= 0.75) {
        baseScore = 85;
    } else if (usageRatio <= 0.9) {
        baseScore = 70;
    } else if (usageRatio <= 1.0) {
        baseScore = 55;
    } else if (usageRatio <= 1.2) {
        baseScore = 35;
    } else {
        baseScore = 15;
    }

    // Streak bonus: +1 per day, max +10
    const streakBonus = Math.min(streakCount, 10);
    return Math.min(100, baseScore + streakBonus);
}

/**
 * Get health status color and label
 */
export function getHealthStatus(score: number): {
    status: "good" | "warning" | "critical";
    color: string;
    label: string;
} {
    if (score >= 70) return { status: "good", color: "#22c55e", label: "สุขภาพดี" };
    if (score >= 40) return { status: "warning", color: "#f59e0b", label: "ระวัง" };
    return { status: "critical", color: "#ef4444", label: "วิกฤต" };
}

/**
 * Get default dynamic widget suggestions based on time of day
 */
export function getTimeBasedWidgets(): Array<{
    icon: string;
    label: string;
    amount: number;
    category: string;
}> {
    const hour = new Date().getHours();

    if (hour >= 6 && hour < 10) {
        return [
            { icon: "☕", label: "กาแฟ", amount: 60, category: "อาหาร" },
            { icon: "🚇", label: "BTS", amount: 45, category: "เดินทาง" },
            { icon: "🥐", label: "ขนมปัง", amount: 35, category: "อาหาร" },
            { icon: "🏪", label: "เซเว่น", amount: 50, category: "อาหาร" },
        ];
    }
    if (hour >= 10 && hour < 14) {
        return [
            { icon: "🍱", label: "ข้าวกล่อง", amount: 60, category: "อาหาร" },
            { icon: "🍜", label: "ก๋วยเตี๋ยว", amount: 50, category: "อาหาร" },
            { icon: "🧋", label: "ชานมไข่มุก", amount: 55, category: "อาหาร" },
            { icon: "🥤", label: "น้ำผลไม้", amount: 35, category: "อาหาร" },
        ];
    }
    if (hour >= 14 && hour < 17) {
        return [
            { icon: "🧋", label: "ชานมไข่มุก", amount: 55, category: "อาหาร" },
            { icon: "🍩", label: "ขนม", amount: 45, category: "อาหาร" },
            { icon: "☕", label: "กาแฟบ่าย", amount: 60, category: "อาหาร" },
            { icon: "🚇", label: "BTS", amount: 45, category: "เดินทาง" },
        ];
    }
    if (hour >= 17 && hour < 21) {
        return [
            { icon: "🍲", label: "ข้าวเย็น", amount: 80, category: "อาหาร" },
            { icon: "🚇", label: "BTS กลับบ้าน", amount: 45, category: "เดินทาง" },
            { icon: "🛒", label: "ซื้อของ", amount: 200, category: "ช้อปปิ้ง" },
            { icon: "🍺", label: "สังสรรค์", amount: 300, category: "บันเทิง" },
        ];
    }
    // Night (21-06)
    return [
        { icon: "🌙", label: "ของกินดึก", amount: 60, category: "อาหาร" },
        { icon: "🚕", label: "แท็กซี่", amount: 100, category: "เดินทาง" },
        { icon: "🎬", label: "Netflix", amount: 0, category: "บันเทิง" },
        { icon: "🛒", label: "ช้อปออนไลน์", amount: 300, category: "ช้อปปิ้ง" },
    ];
}

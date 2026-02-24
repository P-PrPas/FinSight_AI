export const dynamic = 'force-dynamic';  
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getWhisperInsight } from "@/lib/gemini";

interface TransactionWithCategory {
    type: string;
    amount: number;
    category?: { name: string; icon: string } | null;
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = (session.user as { id: string }).id;

        // Get user data
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Get this month's transactions
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        const transactions: TransactionWithCategory[] = await prisma.transaction.findMany({
            where: {
                userId,
                createdAt: { gte: startOfMonth, lte: endOfMonth },
            },
            include: { category: true },
        });

        // Calculate summary
        const totalExpense = transactions
            .filter((t) => t.type === "expense")
            .reduce((sum, t) => sum + t.amount, 0);

        const totalIncome = transactions
            .filter((t) => t.type === "income")
            .reduce((sum, t) => sum + t.amount, 0);

        // Category breakdown
        const categoryBreakdown: Record<string, number> = {};
        transactions
            .filter((t) => t.type === "expense")
            .forEach((t) => {
                const catName = t.category?.name || "อื่นๆ";
                categoryBreakdown[catName] = (categoryBreakdown[catName] || 0) + t.amount;
            });

        const topCategories = Object.entries(categoryBreakdown)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([name, amount]) => `${name}: ${amount}฿`)
            .join(", ");

        const summaryText = `ข้อมูลผู้ใช้:
- ชื่อ: ${user.name || "ไม่ระบุ"}
- จดบัญชีต่อเนื่อง: ${user.streakCount} วัน
- รายจ่ายเดือนนี้: ${totalExpense}฿
- รายรับเดือนนี้: ${totalIncome}฿
- จำนวนรายการ: ${transactions.length} รายการ
- หมวดหมู่หลัก: ${topCategories || "ยังไม่มีข้อมูล"}
- วันที่ปัจจุบัน: ${now.toLocaleDateString("th-TH")}`;

        const whisper = await getWhisperInsight(summaryText);

        // Update user persona
        await prisma.user.update({
            where: { id: userId },
            data: {
                persona: whisper.persona_name,
                personaEmoji: whisper.persona_emoji,
            },
        });

        return NextResponse.json({
            ...whisper,
            summary: {
                totalExpense,
                totalIncome,
                transactionCount: transactions.length,
                topCategories: categoryBreakdown,
            },
        });
    } catch (error) {
        console.error("AI whisper error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

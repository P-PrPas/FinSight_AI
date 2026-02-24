export const dynamic = 'force-dynamic';  
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface UserData {
    name: string | null;
    email: string;
    streakCount: number;
    healthScore: number;
    persona: string;
    personaEmoji: string;
}

interface TransactionData {
    id: string;
    type: string;
    amount: number;
    description: string;
    createdAt: Date;
    category?: { id: string; name: string; icon: string } | null;
}

interface BudgetData {
    amount: number;
}

// GET: Get dashboard data (summary, user info, recent transactions)
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = (session.user as { id: string }).id;
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        const [user, transactions, budgets, recentTransactions]: [UserData | null, TransactionData[], BudgetData[], TransactionData[]] = await Promise.all([
            prisma.user.findUnique({ where: { id: userId } }),
            prisma.transaction.findMany({
                where: {
                    userId,
                    createdAt: { gte: startOfMonth, lte: endOfMonth },
                },
                include: { category: true },
            }),
            prisma.budget.findMany({
                where: { userId, month: now.getMonth() + 1, year: now.getFullYear() },
            }),
            prisma.transaction.findMany({
                where: { userId },
                include: { category: true },
                orderBy: { createdAt: "desc" },
                take: 10,
            }),
        ]);

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const totalExpense = transactions
            .filter((t) => t.type === "expense")
            .reduce((sum, t) => sum + t.amount, 0);

        const totalIncome = transactions
            .filter((t) => t.type === "income")
            .reduce((sum, t) => sum + t.amount, 0);

        const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);

        // Category breakdown
        const categoryBreakdown: Record<string, { amount: number; icon: string }> = {};
        transactions
            .filter((t) => t.type === "expense")
            .forEach((t) => {
                const catName = t.category?.name || "อื่นๆ";
                if (!categoryBreakdown[catName]) {
                    categoryBreakdown[catName] = {
                        amount: 0,
                        icon: t.category?.icon || "📌",
                    };
                }
                categoryBreakdown[catName].amount += t.amount;
            });

        return NextResponse.json({
            user: {
                name: user.name,
                email: user.email,
                streakCount: user.streakCount,
                healthScore: user.healthScore,
                persona: user.persona,
                personaEmoji: user.personaEmoji,
            },
            summary: {
                totalExpense,
                totalIncome,
                balance: totalIncome - totalExpense,
                totalBudget,
                budgetUsage: totalBudget > 0 ? (totalExpense / totalBudget) * 100 : 0,
                transactionCount: transactions.length,
            },
            categoryBreakdown,
            recentTransactions,
        });
    } catch (error) {
        console.error("Dashboard error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

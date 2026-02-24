export const dynamic = 'force-dynamic';  
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Get budgets for current month
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = (session.user as { id: string }).id;
        const { searchParams } = new URL(request.url);
        const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));
        const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));

        const budgets = await prisma.budget.findMany({
            where: { userId, month, year },
        });

        return NextResponse.json(budgets);
    } catch (error) {
        console.error("GET budgets error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// POST: Create or update budget
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = (session.user as { id: string }).id;
        const { amount, categoryId, month, year } = await request.json();

        const budget = await prisma.budget.upsert({
            where: {
                userId_categoryId_month_year: {
                    userId,
                    categoryId: categoryId || null,
                    month: month || new Date().getMonth() + 1,
                    year: year || new Date().getFullYear(),
                },
            },
            update: { amount: parseFloat(amount) },
            create: {
                userId,
                amount: parseFloat(amount),
                categoryId: categoryId || null,
                month: month || new Date().getMonth() + 1,
                year: year || new Date().getFullYear(),
            },
        });

        return NextResponse.json(budget);
    } catch (error) {
        console.error("POST budget error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

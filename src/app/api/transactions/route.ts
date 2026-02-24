export const dynamic = 'force-dynamic';  
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: List transactions
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = (session.user as { id: string }).id;
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get("limit") || "50");
        const offset = parseInt(searchParams.get("offset") || "0");
        const type = searchParams.get("type"); // "income" or "expense"
        const categoryId = searchParams.get("categoryId");
        const month = searchParams.get("month");
        const year = searchParams.get("year");

        const where: Record<string, unknown> = { userId };
        if (type) where.type = type;
        if (categoryId) where.categoryId = categoryId;

        if (month && year) {
            const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
            const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
            where.createdAt = { gte: startDate, lte: endDate };
        }

        const [transactions, total] = await Promise.all([
            prisma.transaction.findMany({
                where,
                include: { category: true },
                orderBy: { createdAt: "desc" },
                take: limit,
                skip: offset,
            }),
            prisma.transaction.count({ where }),
        ]);

        return NextResponse.json({ transactions, total });
    } catch (error) {
        console.error("GET transactions error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// POST: Create transaction
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = (session.user as { id: string }).id;
        const body = await request.json();
        const { amount, description, type, categoryId, tags, isWidget } = body;

        if (!amount || !description || !type || !categoryId) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const transaction = await prisma.transaction.create({
            data: {
                userId,
                amount: parseFloat(amount),
                description,
                type,
                categoryId,
                tags: tags || null,
                isWidget: isWidget || false,
            },
            include: { category: true },
        });

        return NextResponse.json(transaction, { status: 201 });
    } catch (error) {
        console.error("POST transaction error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

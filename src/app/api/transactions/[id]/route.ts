export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PUT: Update transaction
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = (session.user as { id: string }).id;
        const { id } = await params;
        const body = await request.json();

        // Verify ownership
        const existing = await prisma.transaction.findFirst({
            where: { id, userId },
        });

        if (!existing) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        const transaction = await prisma.transaction.update({
            where: { id },
            data: {
                amount: body.amount !== undefined ? parseFloat(body.amount) : undefined,
                description: body.description,
                type: body.type,
                categoryId: body.categoryId,
                tags: body.tags,
            },
            include: { category: true },
        });

        return NextResponse.json(transaction);
    } catch (error) {
        console.error("PUT transaction error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// DELETE: Delete transaction
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = (session.user as { id: string }).id;
        const { id } = await params;

        // Verify ownership
        const existing = await prisma.transaction.findFirst({
            where: { id, userId },
        });

        if (!existing) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        await prisma.transaction.delete({ where: { id } });

        return NextResponse.json({ message: "Deleted" });
    } catch (error) {
        console.error("DELETE transaction error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

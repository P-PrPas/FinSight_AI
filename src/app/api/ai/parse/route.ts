export const dynamic = 'force-dynamic';  
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseTransaction } from "@/lib/gemini";

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = (session.user as { id: string }).id;
        const { text } = await request.json();

        if (!text) {
            return NextResponse.json(
                { error: "กรุณาพิมพ์ข้อความ" },
                { status: 400 }
            );
        }

        // Parse with Gemini
        const parsed = await parseTransaction(text);

        if (parsed.error) {
            return NextResponse.json(
                { error: parsed.error, parsed },
                { status: 400 }
            );
        }

        // Find category
        const category = await prisma.category.findFirst({
            where: { name: parsed.category },
        });

        if (!category) {
            return NextResponse.json(
                { error: "ไม่พบหมวดหมู่", parsed },
                { status: 400 }
            );
        }

        // Create transaction
        const transaction = await prisma.transaction.create({
            data: {
                userId,
                amount: parsed.amount,
                description: parsed.item,
                type: parsed.type,
                categoryId: category.id,
                isWidget: false,
            },
            include: { category: true },
        });

        return NextResponse.json({
            transaction,
            parsed,
            message: `บันทึก "${parsed.item}" ${parsed.amount}฿ สำเร็จ!`,
        });
    } catch (error) {
        console.error("AI parse error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

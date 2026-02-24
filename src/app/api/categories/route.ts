export const dynamic = 'force-dynamic';  
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: List all categories
export async function GET() {
    try {
        const categories = await prisma.category.findMany({
            orderBy: { name: "asc" },
        });
        return NextResponse.json(categories);
    } catch (error) {
        console.error("GET categories error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

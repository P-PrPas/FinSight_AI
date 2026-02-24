/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL || "";
const adapter = new PrismaPg({ connectionString });
const prisma = new (PrismaClient as any)({ adapter });

const categories = [
    { name: "อาหาร", icon: "🍲" },
    { name: "เดินทาง", icon: "🚗" },
    { name: "ช้อปปิ้ง", icon: "🛍️" },
    { name: "บันเทิง", icon: "🎬" },
    { name: "บิล", icon: "📱" },
    { name: "สุขภาพ", icon: "💊" },
    { name: "รายรับ", icon: "💰" },
    { name: "อื่นๆ", icon: "📌" },
];

async function main() {
    console.log("🌱 Seeding categories...");
    for (const category of categories) {
        await prisma.category.upsert({
            where: { name: category.name },
            update: {},
            create: category,
        });
    }
    console.log("✅ Seed completed");
}

main()
    .catch((e) => {
        console.error("❌ Seed error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

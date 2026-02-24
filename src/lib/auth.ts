import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("กรุณากรอก Email และ Password");
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user) {
                    throw new Error("ไม่พบบัญชีผู้ใช้นี้");
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isPasswordValid) {
                    throw new Error("รหัสผ่านไม่ถูกต้อง");
                }

                // Update streak
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const lastLogin = user.lastLoginDate
                    ? new Date(user.lastLoginDate)
                    : null;

                let newStreak = user.streakCount;
                if (lastLogin) {
                    lastLogin.setHours(0, 0, 0, 0);
                    const diffDays = Math.floor(
                        (today.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24)
                    );
                    if (diffDays === 1) {
                        newStreak += 1;
                    } else if (diffDays > 1) {
                        newStreak = 1;
                    }
                } else {
                    newStreak = 1;
                }

                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        lastLoginDate: new Date(),
                        streakCount: newStreak,
                    },
                });

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                };
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as { id?: string }).id = token.id as string;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    secret: process.env.NEXTAUTH_SECRET,
};

"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RootPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (session) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [session, status, router]);

  return (
    <div className="flex items-center justify-center min-h-screen"
      style={{ background: "var(--color-bg-primary)" }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center animate-pulse-glow"
          style={{ background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-light))" }}>
          <span className="text-2xl">✨</span>
        </div>
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          กำลังโหลด FinSight AI...
        </p>
      </div>
    </div>
  );
}

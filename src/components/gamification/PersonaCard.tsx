"use client";

interface PersonaCardProps {
    name: string;
    emoji: string;
}

export default function PersonaCard({ name, emoji }: PersonaCardProps) {
    return (
        <div className="flex items-center gap-4">
            <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl relative glow-ring"
                style={{
                    background: "linear-gradient(135deg, rgba(124, 109, 240, 0.15), rgba(167, 139, 250, 0.08))",
                    border: "1px solid rgba(124, 109, 240, 0.15)",
                }}>
                {emoji || "🌱"}
            </div>
            <div>
                <p className="text-[10px] uppercase tracking-[0.12em] font-semibold"
                    style={{ color: "var(--color-text-muted)" }}>
                    Persona
                </p>
                <p className="text-base font-bold gradient-text leading-tight mt-1">
                    {name || "ผู้เริ่มต้น"}
                </p>
            </div>
        </div>
    );
}

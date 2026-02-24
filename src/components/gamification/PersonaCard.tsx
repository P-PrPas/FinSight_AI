"use client";

interface PersonaCardProps {
    name: string;
    emoji: string;
}

export default function PersonaCard({ name, emoji }: PersonaCardProps) {
    return (
        <div className="flex items-center gap-3">
            <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                style={{
                    background: "linear-gradient(135deg, rgba(108, 92, 231, 0.15), rgba(162, 155, 254, 0.08))",
                    border: "1px solid rgba(108, 92, 231, 0.12)",
                }}>
                {emoji || "🌱"}
            </div>
            <div>
                <p className="text-[10px] uppercase tracking-widest font-semibold"
                    style={{ color: "var(--color-text-muted)" }}>
                    Persona
                </p>
                <p className="text-sm font-bold gradient-text leading-tight mt-0.5">
                    {name || "ผู้เริ่มต้น"}
                </p>
            </div>
        </div>
    );
}

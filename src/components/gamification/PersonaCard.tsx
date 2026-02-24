"use client";

interface PersonaCardProps {
    name: string;
    emoji: string;
}

export default function PersonaCard({ name, emoji }: PersonaCardProps) {
    return (
        <div
            className="flex items-center gap-3 px-4 py-3 rounded-2xl border animate-float"
            style={{
                background: "linear-gradient(135deg, rgba(108, 92, 231, 0.1), rgba(162, 155, 254, 0.05))",
                borderColor: "rgba(108, 92, 231, 0.2)",
            }}>
            <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{
                    background: "linear-gradient(135deg, var(--color-bg-card), var(--color-bg-card-hover))",
                    border: "1px solid var(--color-border)",
                }}>
                {emoji}
            </div>
            <div>
                <p className="text-[10px] uppercase tracking-wider font-medium" style={{ color: "var(--color-text-muted)" }}>
                    Persona
                </p>
                <p className="text-sm font-bold gradient-text">{name}</p>
            </div>
        </div>
    );
}

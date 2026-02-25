import { create } from "zustand";

// ===== Transaction Types =====
export interface Transaction {
    id: string;
    amount: number;
    description: string;
    type: "income" | "expense";
    categoryId: string;
    category?: {
        id: string;
        name: string;
        icon: string;
    };
    tags?: string;
    isWidget: boolean;
    createdAt: string;
}

export interface Category {
    id: string;
    name: string;
    icon: string;
}

// ===== App Store =====
interface AppState {
    // Transactions
    transactions: Transaction[];
    categories: Category[];
    isLoading: boolean;

    // User info
    userName: string;
    streakCount: number;
    healthScore: number;
    persona: string;
    personaEmoji: string;

    // AI Whisper
    whisperMessage: string;
    leakInsight: string;
    healthStatus: "good" | "warning" | "critical";

    // Actions
    setTransactions: (transactions: Transaction[]) => void;
    addTransaction: (transaction: Transaction) => void;
    updateTransaction: (id: string, data: Partial<Transaction>) => void;
    removeTransaction: (id: string) => void;
    setCategories: (categories: Category[]) => void;
    setUserInfo: (info: Partial<Pick<AppState, "userName" | "streakCount" | "healthScore" | "persona" | "personaEmoji">>) => void;
    setWhisper: (whisper: Partial<Pick<AppState, "whisperMessage" | "leakInsight" | "healthStatus">>) => void;
    setLoading: (loading: boolean) => void;
    // Layout
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set) => ({
    // Initial state
    transactions: [],
    categories: [],
    isLoading: false,

    userName: "",
    streakCount: 0,
    healthScore: 100,
    persona: "ผู้เริ่มต้น",
    personaEmoji: "🌱",

    whisperMessage: "",
    leakInsight: "",
    healthStatus: "good",

    isSidebarOpen: true,

    // Actions
    setTransactions: (transactions) => set({ transactions }),
    addTransaction: (transaction) =>
        set((state) => ({
            transactions: [transaction, ...state.transactions],
        })),
    updateTransaction: (id, data) =>
        set((state) => ({
            transactions: state.transactions.map((t) =>
                t.id === id ? { ...t, ...data } : t
            ),
        })),
    removeTransaction: (id) =>
        set((state) => ({
            transactions: state.transactions.filter((t) => t.id !== id),
        })),
    setCategories: (categories) => set({ categories }),
    setUserInfo: (info) => set(info),
    setWhisper: (whisper) => set(whisper),
    setLoading: (isLoading) => set({ isLoading }),
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));

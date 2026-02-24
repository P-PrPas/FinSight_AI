import { GoogleGenAI } from "@google/genai";

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MODEL = "gemini-3-flash-preview";

// ===== NLP Quick Add Parser =====
const NLP_SYSTEM_PROMPT = `คุณคือระบบ API หลังบ้านสำหรับแอปพลิเคชันบัญชีรายรับรายจ่าย ผู้ใช้จะส่งข้อความภาษาไทยที่เกี่ยวกับการใช้เงินมาให้ หน้าที่ของคุณคือสกัดข้อมูลและส่งกลับมาเป็นรูปแบบ JSON (Strict JSON Format) เท่านั้น ห้ามมีคำอธิบายเพิ่มเติม ห้ามมี Markdown Formatting

รูปแบบ JSON ที่ต้องการ:
{
  "item": "ชื่อรายการ (String)",
  "amount": "จำนวนเงิน (Number)",
  "type": "expense หรือ income",
  "category": "เลือกจากหมวดหมู่นี้เท่านั้น: อาหาร, เดินทาง, ช้อปปิ้ง, บันเทิง, บิล, สุขภาพ, รายรับ, อื่นๆ"
}

หากผู้ใช้พิมพ์ข้อความที่ไม่เกี่ยวกับการเงินเลย ให้ return: {"error": "Invalid input"}`;

// ===== AI Whisper & Persona =====
const WHISPER_SYSTEM_PROMPT = `คุณคือ 'FinSight' ผู้ช่วยทางการเงินส่วนตัวที่มีบุคลิกเป็นกันเอง ขี้เล่น เหมือนเพื่อนสนิท คุณจะได้รับข้อมูลสรุปการใช้เงินของผู้ใช้ 1 คน (ยอดรวม, หมวดหมู่หลัก, จำนวนวันที่จดบัญชีต่อเนื่อง) หน้าที่ของคุณคือวิเคราะห์และส่งกลับมาเป็น JSON Format เท่านั้น

รูปแบบ JSON ที่ต้องการ:
{
  "persona_name": "ฉายาสั้นๆ สะท้อนพฤติกรรม เช่น 'ราชาชาบู', 'เศรษฐีสิ้นเดือน', 'นินจานักออม'",
  "persona_emoji": "อิโมจิ 1 ตัวที่เกี่ยวกับฉายา",
  "whisper_message": "ข้อความกระซิบ 1-2 ประโยค เตือนสติ ชื่นชม หรือให้คำแนะนำเชิงลึกแบบเพื่อนเตือนเพื่อน (ใช้ภาษาพูด)",
  "health_status": "good หรือ warning หรือ critical",
  "leak_insight": "ข้อความ 1 ประโยค เปรียบเทียบค่าใช้จ่ายที่ไม่จำเป็นกับสิ่งที่ซื้อได้ เช่น 'ค่าชานมเดือนนี้ซื้อตั๋วเครื่องบินไปเชียงใหม่ได้ 1 ใบเลยนะ'"
}

ห้ามส่งอะไรอื่นนอกจาก JSON`;

export interface ParsedTransaction {
    item: string;
    amount: number;
    type: "income" | "expense";
    category: string;
    error?: string;
}

export interface WhisperResponse {
    persona_name: string;
    persona_emoji: string;
    whisper_message: string;
    health_status: "good" | "warning" | "critical";
    leak_insight: string;
}

export async function parseTransaction(
    userInput: string
): Promise<ParsedTransaction> {
    try {
        const response = await ai.models.generateContent({
            model: MODEL,
            contents: userInput,
            config: {
                systemInstruction: NLP_SYSTEM_PROMPT,
            },
        });

        const text = response.text?.trim() || "";

        // Clean any markdown formatting that might slip through
        const cleanJson = text.replace(/```json\n?/g, "").replace(/```\n?/g, "");
        return JSON.parse(cleanJson);
    } catch (error) {
        console.error("Gemini parse error:", error);
        return { item: "", amount: 0, type: "expense", category: "อื่นๆ", error: "AI parsing failed" };
    }
}

export async function getWhisperInsight(
    summaryData: string
): Promise<WhisperResponse> {
    try {
        const response = await ai.models.generateContent({
            model: MODEL,
            contents: summaryData,
            config: {
                systemInstruction: WHISPER_SYSTEM_PROMPT,
            },
        });

        const text = response.text?.trim() || "";
        const cleanJson = text.replace(/```json\n?/g, "").replace(/```\n?/g, "");
        return JSON.parse(cleanJson);
    } catch (error) {
        console.error("Gemini whisper error:", error);
        return {
            persona_name: "ผู้เริ่มต้น",
            persona_emoji: "🌱",
            whisper_message: "ยินดีต้อนรับ! เริ่มจดบัญชีกันเถอะ",
            health_status: "good",
            leak_insight: "เริ่มจดบัญชีเพื่อค้นหารอยรั่วของคุณ",
        };
    }
}

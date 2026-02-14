'use server'

import { GoogleGenerativeAI } from "@google/generative-ai";

// ใช้ชื่อรุ่นที่คุณต้องการ (ตรวจสอบให้แน่ใจว่า API Key ได้สิทธิ์ Preview แล้ว)
const MODEL_NAME = "gemini-3-flash-preview"; 
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// --- ระบบ Simple Cache เพื่อประหยัด Quota ---
// เก็บผลลัพธ์ไว้ในหน่วยความจำฝั่ง Server ถ้า Input เดิมจะไม่ยิง AI ซ้ำ
const insightCache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 30; // เก็บไว้ 30 นาที

export interface AiInsight {
    summary: string;
    trend: 'up' | 'down' | 'stable';
    recommendation: string;
}

export interface ChartConfigResult {
    type: 'area' | 'bar' | 'line' | 'pie' | 'radar' | 'radial' | 'stat';
    metric: string;
    title: string;
    desc: string;
    color: string;
}

/**
 * ฟังก์ชันเรียก Gemini พร้อมระบบ Exponential Backoff
 */
async function callGeminiWithRetry(
    prompt: string, 
    isJson: boolean = false, 
    retries = 3, 
    initialDelay = 10000 // เริ่มต้นรอ 10 วินาทีถ้าติด Limit
): Promise<string> {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    let currentDelay = initialDelay;

    for (let i = 0; i < retries; i++) {
        try {
            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: {
                    responseMimeType: isJson ? "application/json" : "text/plain",
                    temperature: 0.7,
                    maxOutputTokens: 800,
                },
            });
            
            const response = await result.response;
            const text = response.text();
            
            if (!text) throw new Error("Empty response");
            return text;

        } catch (error: any) {
            const status = error.status || (error.message?.includes("429") ? 429 : 500);
            
            // ถ้าติด Quota Limit (429) ให้รอแล้วยิงใหม่
            if (status === 429 && i < retries - 1) {
                console.warn(`[Gemini Quota] Hit limit. Retry ${i + 1} in ${currentDelay}ms...`);
                await new Promise(res => setTimeout(res, currentDelay));
                currentDelay *= 2; // เพิ่มเวลารอเป็นเท่าตัว
                continue;
            }
            throw error;
        }
    }
    throw new Error("Maximum retries reached");
}

export async function generateTradingInsight(
    salesData: any[],
    period: string,
    language: 'th' | 'en'
): Promise<AiInsight> {
    try {
        if (!process.env.GEMINI_API_KEY) throw new Error("API Key missing");

        // 1. ตรวจสอบข้อมูลเบื้องต้น
        const totalSales = salesData.reduce((acc, curr) => acc + Number(curr.total_amount || 0), 0);
        
        // 2. ระบบ Cache: ตรวจสอบว่าเคยวิเคราะห์ข้อมูลยอดนี้ไปหรือยัง
        const cacheKey = `insight-${period}-${totalSales}-${salesData.length}-${language}`;
        const cached = insightCache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
            return cached.data;
        }

        const prompt = `
            Analyze this sales data summary:
            Period: ${period}
            Total Sales: ${totalSales}
            Transaction Count: ${salesData.length}
            
            Provide a JSON response with:
            1. "summary": 1-sentence summary in ${language === 'th' ? 'Thai' : 'English'}.
            2. "trend": "up", "down", or "stable".
            3. "recommendation": 1 actionable tip in ${language === 'th' ? 'Thai' : 'English'}.
            
            Response must be valid JSON only.
        `;

        const text = await callGeminiWithRetry(prompt, true);
        const result = JSON.parse(text);

        // เก็บลง Cache
        insightCache.set(cacheKey, { data: result, timestamp: Date.now() });
        return result;

    } catch (error: any) {
        console.error("AI Insight Error:", error);
        return {
            summary: language === 'th' ? 'ระบบไม่สามารถเข้าถึง AI ได้ในขณะนี้ (Quota Full)' : 'AI unreachable (Quota Full)',
            trend: 'stable',
            recommendation: language === 'th' ? 'ลองรีเฟรชหน้าจออีกครั้งในภายหลัง' : 'Please try again later.'
        };
    }
}

export async function generateChartConfig(
    userPrompt: string, 
    language: 'th' | 'en'
): Promise<ChartConfigResult | null> {
    try {
        const cacheKey = `chart-${userPrompt}-${language}`;
        if (insightCache.has(cacheKey)) return insightCache.get(cacheKey)?.data;

        const prompt = `
            You are a chart expert. User wants: "${userPrompt}"
            Generate JSON for a business dashboard:
            {
                "type": "area" | "bar" | "line" | "pie" | "stat",
                "metric": "total" | "products" | "count" | "aov",
                "title": "Short title in ${language === 'th' ? 'Thai' : 'English'}",
                "desc": "Short description in ${language === 'th' ? 'Thai' : 'English'}",
                "color": "#4f46e5"
            }
            Return ONLY JSON.
        `;

        const text = await callGeminiWithRetry(prompt, true);
        const result = JSON.parse(text);
        
        insightCache.set(cacheKey, { data: result, timestamp: Date.now() });
        return result;
    } catch (error) {
        console.error("AI Chart Gen Error:", error);
        return null;
    }
}

export async function chatWithData(
    question: string,
    data: any[],
    language: 'th' | 'en'
): Promise<string> {
    try {
        // ตัดข้อมูลส่งแค่ที่จำเป็นเพื่อประหยัด Token และป้องกัน Error 413
        const sample = data.slice(0, 10).map(item => ({
            amt: item.total_amount,
            date: item.created_at?.split('T')[0] || 'N/A'
        }));

        const prompt = `
            You are an AI Business Partner. 
            Question: "${question}"
            Context: Sales data (Total records: ${data.length}), Sample: ${JSON.stringify(sample)}
            Answer in ${language === 'th' ? 'Thai' : 'English'} (Concise & Professional).
        `;

        return await callGeminiWithRetry(prompt, false);
    } catch (error: any) {
        return language === 'th' 
            ? "ขณะนี้มีการใช้งานหนาแน่น กรุณารอสักครู่แล้วถามใหม่ครับ" 
            : "System busy, please ask again in a moment.";
    }
}
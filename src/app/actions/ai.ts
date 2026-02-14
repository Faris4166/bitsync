'use server'

import { GoogleGenerativeAI } from "@google/generative-ai";

// ใช้ 1.5-flash จะมี Quota ที่เสถียรกว่า 2.0-flash ในช่วงที่โดนจำกัดหนักๆ
// แต่ถ้าต้องการ 2.0 สามารถเปลี่ยนกลับได้ครับ
const MODEL_NAME = "gemini-3-flash-preview"; 
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

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
 * ฟังก์ชันกลางสำหรับเรียก Gemini พร้อมระบบ Retry ที่อึดขึ้น
 * เพิ่ม delay เริ่มต้นเป็น 15 วินาทีเพื่อให้สอดคล้องกับ Free Tier Quota
 */
async function callGeminiWithRetry(
    prompt: string, 
    isJson: boolean = false, 
    retries = 3, 
    initialDelay = 15000 
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
                    maxOutputTokens: 1000,
                },
            });
            
            const response = await result.response;
            const text = response.text();
            
            if (!text) throw new Error("Empty response from AI");
            return text;

        } catch (error: any) {
            const isRateLimit = error.message?.includes("429") || error.status === 429;
            
            if (isRateLimit && i < retries - 1) {
                console.warn(`[Gemini Quota] Hit limit. Waiting ${currentDelay}ms before retry ${i + 1}...`);
                await new Promise(res => setTimeout(res, currentDelay));
                currentDelay *= 2; // เพิ่มเวลารอเป็น 30s, 60s ตามลำดับ
                continue;
            }
            throw error;
        }
    }
    throw new Error("Failed after multiple retries due to Quota Limit");
}

export async function generateTradingInsight(
    salesData: any[],
    period: string,
    language: 'th' | 'en'
): Promise<AiInsight> {
    try {
        if (!process.env.GEMINI_API_KEY) throw new Error("API Key missing");

        // ส่งเฉพาะข้อมูลสรุปเพื่อประหยัด Token
        const totalSales = salesData.reduce((acc, curr) => acc + Number(curr.total_amount || 0), 0);
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
        return JSON.parse(text);
    } catch (error: any) {
        console.error("AI Insight Error:", error);
        return {
            summary: language === 'th' ? 'ระบบวิเคราะห์ติดขัดชั่วคราว (Quota Limit)' : 'System busy (Quota Limit)',
            trend: 'stable',
            recommendation: language === 'th' ? 'กรุณารอประมาณ 1 นาทีแล้วลองใหม่อีกครั้ง' : 'Please wait 1 minute and try again.'
        };
    }
}

export async function generateChartConfig(
    userPrompt: string, 
    currentLayout: any[],
    language: 'th' | 'en'
): Promise<ChartConfigResult | null> {
    try {
        const prompt = `
        You are a chart assistant. User wants: "${userPrompt}"
        Available: 'area', 'bar', 'line', 'pie', 'stat'.
        Metrics: 'total', 'products', 'count', 'aov'.
        
        Generate JSON:
        {
            "type": "chart_type",
            "metric": "metric_name",
            "title": "Title in ${language === 'th' ? 'Thai' : 'English'}",
            "desc": "Description in ${language === 'th' ? 'Thai' : 'English'}",
            "color": "#4f46e5"
        }
        JSON only.
        `;

        const text = await callGeminiWithRetry(prompt, true);
        return JSON.parse(text);
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
        // ตัดข้อมูลให้สั้นที่สุด (เหลือแค่ 15 รายการ และเฉพาะฟิลด์สำคัญ)
        const sample = data.slice(0, 15).map(item => ({
            val: item.total_amount,
            dt: item.created_at?.split('T')[0]
        }));

        const prompt = `
        You are an AI Business Partner. 
        Question: "${question}"
        Data Context (Top 15): ${JSON.stringify(sample)}
        Total Records: ${data.length}
        
        Rules:
        - Answer in ${language === 'th' ? 'Thai' : 'English'}.
        - Be professional and concise.
        - If the limit is reached, inform the user politely.
        `;

        return await callGeminiWithRetry(prompt, false);
    } catch (error: any) {
        console.error("AI Chat Error:", error);
        return language === 'th' 
            ? "ขออภัยครับ โควตาการใช้งานฟรีของ Gemini เต็มแล้ว (Rate Limit) กรุณาลองใหม่อีกครั้งใน 1 นาที" 
            : "I've hit the free usage limit. Please try again in about a minute.";
    }
}
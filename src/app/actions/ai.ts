'use server'

import { GoogleGenerativeAI } from "@google/generative-ai";
import { createStreamableValue } from '@ai-sdk/rsc';

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
    metric: 'total' | 'products' | 'labor' | 'count' | 'aov' | 'retention' | 'low_stock' | 'peak_hours' | 'inventory_value' | 'category';
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
    initialDelay = 2000 // Reduced from 10s to 2s
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
            
            if (status === 429 && i < retries - 1) {
                console.warn(`[Gemini Quota] Hit limit. Retry ${i + 1} in ${currentDelay}ms...`);
                await new Promise(res => setTimeout(res, currentDelay));
                currentDelay *= 2;
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

        // 1. Data Aggregation for better context
        const totalSales = salesData.reduce((acc, curr) => acc + Number(curr.total_amount || 0), 0);
        const totalLabor = salesData.reduce((acc, curr) => acc + Number(curr.labor_cost || 0), 0);
        const avgOrder = salesData.length > 0 ? totalSales / salesData.length : 0;
        
        // Find top customer
        const customers: Record<string, number> = {};
        salesData.forEach(r => {
            if (r.customer_name) customers[r.customer_name] = (customers[r.customer_name] || 0) + Number(r.total_amount);
        });
        const topCustomer = Object.entries(customers).sort((a,b) => b[1] - a[1])[0]?.[0] || 'N/A';

        // 2. Cache check
        const cacheKey = `insight-${period}-${totalSales}-${salesData.length}-${language}`;
        const cached = insightCache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
            return cached.data;
        }

        const prompt = `
            Analyze this business performance:
            - Period: ${period}
            - Total Revenue: ${totalSales}
            - Labor Costs: ${totalLabor}
            - Avg Order Value: ${avgOrder.toFixed(2)}
            - Transaction Count: ${salesData.length}
            - Best Customer: ${topCustomer}
            
            Provide a JSON response with:
            1. "summary": 1-sentence analytical summary in ${language === 'th' ? 'Thai' : 'English'}.
            2. "trend": "up", "down", or "stable" (based on revenue vs typical performance).
            3. "recommendation": 1 actionable business tip in ${language === 'th' ? 'Thai' : 'English'}.
            
            Response must be valid JSON only.
        `;

        const text = await callGeminiWithRetry(prompt, true);
        const result = JSON.parse(text);

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
            You are a chart expert for a business dashboard. User request: "${userPrompt}"
            
            Analyze the request and generate a JSON configuration:
            {
                "type": "area" | "bar" | "line" | "pie" | "stat" | "radar" | "radial",
                "metric": "total" | "products" | "labor" | "count" | "aov" | "retention" | "low_stock" | "peak_hours" | "inventory_value" | "category",
                "title": "Short title in ${language === 'th' ? 'Thai' : 'English'}",
                "desc": "Short description in ${language === 'th' ? 'Thai' : 'English'}",
                "color": "#4f46e5",
                "compareType": "none" | "month" | "products",
                "limit": 10
            }
            
            Guidelines:
            - For "top N products/สินค้าขายดี N อันดับ": use type="bar" or "pie", metric="products", compareType="products", limit=N (max 10)
            - For "categories/หมวดหมู่": use metric="category"
            - For "comparison/เปรียบเทียบ": use compareType="month" or "products"
            - For "revenue/รายได้": use metric="total"
            - For "orders/ออเดอร์": use metric="count"
            - Choose vibrant colors: #3b82f6 (blue), #10b981 (green), #f59e0b (amber), #ef4444 (red), #8b5cf6 (violet), #ec4899 (pink)
            
            Return ONLY valid JSON, no explanations.
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
    language: 'th' | 'en',
    history: { role: 'user' | 'assistant', content: string }[] = []
): Promise<string> {
    try {
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });

        // ตัดข้อมูลส่งแค่ที่จำเป็นเพื่อประหยัด Token
        const sample = data.slice(0, 15).map(item => ({
            amt: item.total_amount,
            date: item.created_at?.split('T')[0] || 'N/A',
            cust: item.customer_name
        }));

        const systemPrompt = `You are an AI Business Partner for BitSync. 
Context: Sales data total ${data.length} records. Recent sample: ${JSON.stringify(sample)}.
Answer in ${language === 'th' ? 'Thai' : 'English'} (Concise & Professional).`;

        const chat = model.startChat({
            history: history.map(h => ({
                role: h.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: h.content }],
            })),
            generationConfig: {
                maxOutputTokens: 1000,
            },
        });

        const prompt = `${systemPrompt}\n\nUser Question: ${question}`;
        const result = await chat.sendMessage(prompt);
        const response = await result.response;
        return response.text();

    } catch (error: any) {
        console.error("AI Chat Error:", error);
        return language === 'th' 
            ? "ขณะนี้มีการใช้งานหนาแน่น กรุณารอสักครู่แล้วถามใหม่ครับ" 
            : "System busy, please ask again in a moment.";
    }
}

export async function streamChatWithData(
    question: string,
    data: any[],
    language: 'th' | 'en',
    history: { role: 'user' | 'assistant', content: string }[] = []
) {
    // 1. Create a streamable value
    const stream = createStreamableValue('');

    try {
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });
        
        // Aggregated stats for the AI to understand the whole dataset
        const totalSales = data.reduce((acc, curr) => acc + Number(curr.total_amount || 0), 0);
        
        // Very minimal samples for speed
        const recentSamples = data.slice(0, 5).map(item => ({
            amt: item.total_amount,
            cust: item.customer_name
        }));

        const systemPrompt = `AI Business Partner for BitSync. 
Stats: Records:${data.length}, Revenue:${totalSales.toLocaleString()}
Recent: ${JSON.stringify(recentSamples)}

Rules:
- Answer in ${language === 'th' ? 'Thai' : 'English'} (Be very concise).
- No pleasantries. Fast & Direct.`;

        const chat = model.startChat({
            history: history.map(h => ({
                role: h.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: h.content }],
            })),
        });

        const prompt = `${systemPrompt}\n\nUser Question: ${question}`;
        
        // 2. Start streaming without blocking the main thread
        (async () => {
            try {
                const result = await chat.sendMessageStream(prompt);
                let fullResponse = '';
                for await (const chunk of result.stream) {
                    const text = chunk.text();
                    fullResponse += text;
                    stream.update(fullResponse);
                }
                stream.done();
            } catch (err) {
                console.error("Internal Streaming Error:", err);
                stream.error(err);
            }
        })();

        // 3. Return the streamable value (it is serializable)
        return stream.value;

    } catch (error: any) {
        console.error("Streaming Action Setup Error:", error);
        stream.error(error);
        return stream.value;
    }
}

/**
 * Streaming version of chat (Optional - requires complex frontend handling)
 * For simplicity in this environment, we'll focus on making the standard chat 
 * handle history correctly first, then add streaming UI if needed.
 */
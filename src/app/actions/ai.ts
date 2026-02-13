'use server'

import { GoogleGenAI } from "@google/genai"

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' })

export async function generateTradingInsight(data: any) {
    if (!process.env.GEMINI_API_KEY) {
        return "AI Service Unavailable: Missing API Key"
    }

    try {
        const prompt = `
        You are a smart business analyst assistant for a retail store owner.
        Analyze the following sales data and provide 3 short, specific, and actionable trading advice or insights.
        Focus on:
        - Identify selling trends.
        - Suggest inventory actions (restock, clear).
        - Sales performance.

        Data Summary:
        ${JSON.stringify(data, null, 2)}

        Response Format:
        Just a plain text list of 3 bullet points. No intro or outro. Keep it concise and encouraging.
        `

        const result = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt
        })

        return result.text
    } catch (error) {
        console.error("Error generating insight:", error)
        return "Unable to generate insights at this time."
    }
}

export async function generateChartConfig(userPrompt: string) {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("Missing API Key")
    }

    try {
        const prompt = `
        You are a chart configuration generator. 
        Convert the user's natural language request into a specific JSON configuration for a dashboard chart.
        
        Available Metrics (metric): 'total' (Revenue), 'products' (Product Sales), 'labor' (Labor Cost), 'count' (Receipt Count), 'category' (Category Split), 'inventory_value', 'low_stock', 'aov' (Avg Order Value), 'retention'.
        Available Chart Types (type): 'area', 'bar', 'line', 'pie', 'radar', 'radial', 'stat'.
        Available Comparisons (compareType): 'none', 'month' (Month vs Month), 'products' (Top Products).
        
        Rules:
        - Radial chart is best for SINGLE value progress or goals.
        - Radar chart is best for MULTI-CATEGORY comparison.
        - Pie chart is best for DISTRIBUTION (category, products).
        - Area/Line is best for TRENDS over time.
        - Bar is best for COMPARISON.

        User Request: "${userPrompt}"

        Return ONLY a JSON object with this structure (no markdown, no code blocks):
        {
            "title": "Short descriptive title",
            "type": "chart_type",
            "metric": "metric_key",
            "compareType": "comparison_key_or_null",
            "color": "hex_color_code"
        }
        `

        const result = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
            }
        })

        const text = result.text || '{}'
        // Clean up markdown if present, though responseMimeType should handle it mostly.
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim()
        
        return JSON.parse(cleanText)
    } catch (error) {
        console.error("Error generating chart config:", error)
        return null
    }
}

'use server';

import { GoogleGenAI } from "@google/genai";

const getClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API Key not found");
    }
    return new GoogleGenAI({ apiKey });
};

export const fixJsonWithAI = async (brokenJson: string): Promise<string> => {
    try {
        const ai = getClient();
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Fix the following invalid JSON string. Return ONLY the corrected JSON string. Do not wrap it in markdown code blocks. Do not add any explanation. If it is completely unrecoverable, return an empty JSON object "{}". 
            
            Invalid JSON:
            ${brokenJson}`,
        });
        
        const text = response.text || "{}";
        // Cleanup potential markdown if the model hallucinates it despite instructions
        return text.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
    } catch (error) {
        console.error("Gemini fix failed:", error);
        throw error;
    }
};

export const generateSampleJson = async (prompt: string): Promise<string> => {
    try {
        const ai = getClient();
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate a valid JSON object based on this description: "${prompt}". 
            Return ONLY the JSON string. Do not wrap in markdown.`,
        });

        const text = response.text || "{}";
        return text.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
    } catch (error) {
        console.error("Gemini generation failed:", error);
        throw error;
    }
};
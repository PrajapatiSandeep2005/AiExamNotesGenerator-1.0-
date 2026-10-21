import { generateGeminiResponse } from "./gemini.services.js";

const parseProviderResponse = (text, providerName) => {
    const cleaned = text
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/, "")
        .trim();

    const jsonStart = cleaned.indexOf("{");
    const jsonEnd = cleaned.lastIndexOf("}");
    const jsonText = jsonStart >= 0 && jsonEnd > jsonStart
        ? cleaned.slice(jsonStart, jsonEnd + 1)
        : cleaned;

    try {
        return JSON.parse(jsonText);
    } catch (error) {
        throw new Error(`${providerName} returned an invalid notes response.`, { cause: error });
    }
};

const validateNotes = (content, providerName) => {
    if (
        !content
        || typeof content !== "object"
        || !content.subTopics
        || typeof content.subTopics !== "object"
        || !Object.values(content.subTopics).every(Array.isArray)
        || typeof content.notes !== "string"
        || !Array.isArray(content.revisionPoints)
        || !content.questions
        || !Array.isArray(content.questions.short)
        || !Array.isArray(content.questions.long)
    ) {
        throw new Error(`${providerName} returned notes that do not match the required format.`);
    }
    return content;
};

const readResponse = async (response, providerName) => {
    const body = await response.json().catch(() => null);
    const providerMessage = body?.error?.message
        || body?.errors?.map(({ message }) => message).filter(Boolean).join("; ")
        || body?.message;
    if (!response.ok || body?.success === false) {
        throw new Error(
            `${providerName} request failed${response.status ? ` with status ${response.status}` : ""}${providerMessage ? `: ${providerMessage}` : "."}`,
        );
    }
    return body;
};

const callGroq = async (prompt) => {
    if (!process.env.GROQ_API_KEY) {
        const error = new Error("GROQ_API_KEY is not configured.");
        error.statusCode = 503;
        throw error;
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "openai/gpt-oss-120b",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
            max_completion_tokens: 8192,
        }),
    });
    const body = await readResponse(response, "Groq");
    const text = body?.choices?.[0]?.message?.content;
    if (typeof text !== "string" || !text.trim()) {
        throw new Error("Groq returned an empty notes response.");
    }
    return parseProviderResponse(text, "Groq");
};

const callCloudflare = async (prompt) => {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_AUTH_TOKEN || process.env.CLOUDFLARE_API_TOKEN;
    if (!accountId || !apiToken) {
        const error = new Error("CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_AUTH_TOKEN must be configured.");
        error.statusCode = 503;
        throw error;
    }

    const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/meta/llama-3.1-8b-instruct`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                messages: [
                    { role: "system", content: "Return only valid JSON matching the requested schema." },
                    { role: "user", content: prompt },
                ],
                response_format: { type: "json_object" },
                max_tokens: 4096,
            }),
        },
    );
    const body = await readResponse(response, "Cloudflare AI");
    const result = body?.result;
    const textCandidates = [
        result?.response,
        result?.output_text,
        result?.text,
        result?.choices?.[0]?.message?.content,
        body?.response,
        body?.choices?.[0]?.message?.content,
    ];
    const text = textCandidates.find((value) => typeof value === "string" && value.trim());
    if (text) {
        return parseProviderResponse(text, "Cloudflare AI");
    }

    const structuredResponse = result && typeof result === "object" && (
        result.subTopics || result.notes || result.questions
    ) ? result : null;
    if (structuredResponse) {
        return structuredResponse;
    }

    const resultFields = result && typeof result === "object"
        ? Object.keys(result).join(", ")
        : typeof result;
    throw new Error(
        `Cloudflare AI returned no generated text (response fields: ${resultFields || "none"}).`,
    );
};

const providers = [
    { id: "gemini", name: "Gemini", generate: generateGeminiResponse },
    { id: "groq", name: "Groq", generate: callGroq },
    { id: "cloudflare", name: "Cloudflare", generate: callCloudflare },
];

export const generateWithAiProvider = async (prompt, selectedModel = "auto") => {
    if (selectedModel !== "auto") {
        const selectedProvider = providers.find(({ id }) => id === selectedModel);
        if (!selectedProvider) {
            const error = new Error("Invalid AI model selected.");
            error.statusCode = 400;
            throw error;
        }

        try {
            return {
                content: validateNotes(await selectedProvider.generate(prompt), selectedProvider.name),
                providerUsed: selectedProvider.name,
            };
        } catch (error) {
            if (!error.statusCode) {
                error.statusCode = 502;
            }
            throw error;
        }
    }

    const failures = [];
    for (const provider of providers) {
        try {
            return {
                content: validateNotes(await provider.generate(prompt), provider.name),
                providerUsed: provider.name,
            };
        } catch (error) {
            failures.push(`${provider.name}: ${error.message}`);
            console.warn(`${provider.name} generation failed; trying the next provider.`);
        }
    }

    const error = new Error(`All AI providers failed. ${failures.join(" ")}`);
    error.statusCode = 502;
    throw error;
};

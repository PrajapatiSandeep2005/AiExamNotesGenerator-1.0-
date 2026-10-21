// Replaced the retired 1.5-flash model with the auto-updating latest alias
const Gemini_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

// Helper function to pause execution between retry attempts
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const generateGeminiResponse = async (prompt, retries = 3, delayMs = 2000) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await fetch(`${Gemini_URL}?key=${process.env.GEMINI_API_KEY}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: prompt
                                }
                            ]
                        }
                    ],
                })
            });

            if (!response.ok) {
                const errText = await response.text();

                // If temporary rate limit (429) or high demand (503), retry automatically
                if ((response.status === 503 || response.status === 429) && attempt < retries) {
                    console.warn(`Gemini API busy (Status ${response.status}). Retrying attempt ${attempt} in ${delayMs / 1000}s...`);
                    await delay(delayMs);
                    delayMs *= 2;
                    continue;
                }

                throw new Error(`Gemini API error (Status ${response.status}): ${errText}`);
            }

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!text) {
                throw new Error("Gemini API error: No text content in response");
            }

            // Clean code block wrappers from AI response
            const cleanText = text
                .replace(/```json/g, "")
                .replace(/```/g, "")
                .trim();

            // Safe parsing to avoid crashing if output isn't strict JSON
            try {
                return JSON.parse(cleanText);
            } catch (parseError) {
                return { notes: cleanText };
            }

        } catch (error) {
            if (attempt === retries || (!error.message.includes("503") && !error.message.includes("429"))) {
                console.error("Error generating Gemini response:", error);
                throw error;
            }
            await delay(delayMs);
            delayMs *= 2;
        }
    }
};
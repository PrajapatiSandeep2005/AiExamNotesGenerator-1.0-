export const MODEL_COSTS = { cloudflare: 1, gemini: 2, grok: 5 };
export const getAvailableAiChats = (credits = 0) => Math.max(0, credits);
export const getModelUsage = (userData) => userData?.modelUsage || {};
export const getTotalAvailableAiChats = (userData) => Math.max(0, userData?.credits || 0);

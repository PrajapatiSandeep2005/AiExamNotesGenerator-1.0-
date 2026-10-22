// Keep limits in one place so API enforcement and the UI never diverge.
export const FREE_AI_CREDITS = 0;
export const DAILY_CREDIT_CAP = 50;
export const AI_MODELS = {
    cloudflare: { id: "cloudflare", label: "Cloudflare Workers AI", creditCost: 1, dailyLimit: 20 },
    gemini: { id: "gemini", label: "Gemini API", creditCost: 2, dailyLimit: 35 },
    grok: { id: "grok", label: "Grok API", creditCost: 5, dailyLimit: 10 },
};

export const getUsageDate = () => new Date().toISOString().slice(0, 10);

export const getDailyAiChatSnapshot = (user, date = getUsageDate()) => {
    const isCurrentDay = user.dailyAiChatDate === date;
    const usage = isCurrentDay ? user.dailyAiChatsByProvider?.toObject?.() || user.dailyAiChatsByProvider || {} : {};
    const creditsUsed = isCurrentDay ? user.dailyCreditUsage || 0 : 0;
    const dailyCreditsRemaining = Math.max(0, DAILY_CREDIT_CAP - creditsUsed);
    return {
        dailyAiChatDate: date,
        dailyCreditCap: DAILY_CREDIT_CAP,
        dailyCreditsUsed: creditsUsed,
        dailyCreditsRemaining,
        dailyAiChatsByProvider: Object.fromEntries(Object.keys(AI_MODELS).map((id) => [id, usage[id] || 0])),
        modelUsage: Object.fromEntries(Object.entries(AI_MODELS).map(([id, model]) => {
            const used = usage[id] || 0;
            return [id, { ...model, usedToday: used, dailyRemaining: Math.max(0, model.dailyLimit - used), affordableWithCredits: Math.floor(Math.max(0, user.credits || 0) / model.creditCost), estimatedRemaining: Math.max(0, Math.min(model.dailyLimit - used, Math.floor(dailyCreditsRemaining / model.creditCost), Math.floor(Math.max(0, user.credits || 0) / model.creditCost))) }];
        })),
    };
};

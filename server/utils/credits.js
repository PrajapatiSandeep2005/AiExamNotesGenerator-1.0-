export const CREDITS_PER_AI_CHAT = 10;
export const FREE_AI_CHAT_LIMIT = 50;
export const FREE_AI_CREDITS = 0;

export const getDailyAiChatSnapshot = (user, date = new Date().toISOString().slice(0, 10)) => {
    const isCurrentDay = user.dailyAiChatDate === date;
    const chatsUsed = isCurrentDay ? user.dailyAiChatsUsed || 0 : 0;
    const chatsByProvider = isCurrentDay
        ? user.dailyAiChatsByProvider?.toObject?.() || user.dailyAiChatsByProvider || {}
        : {};

    return {
        dailyAiChatDate: date,
        dailyAiChatLimit: FREE_AI_CHAT_LIMIT,
        dailyAiChatsUsed: chatsUsed,
        dailyAiChatsRemaining: Math.max(0, FREE_AI_CHAT_LIMIT - chatsUsed),
        dailyAiChatsByProvider: {
            gemini: chatsByProvider.gemini || 0,
            groq: chatsByProvider.groq || 0,
            cloudflare: chatsByProvider.cloudflare || 0,
        },
    };
};

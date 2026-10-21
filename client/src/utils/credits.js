export const CREDITS_PER_AI_CHAT = 10;
export const FREE_AI_CHAT_LIMIT = 50;
export const FREE_AI_CREDITS = 0;

export const getAvailableAiChats = (credits = 0) => (
    Math.floor(Math.max(0, credits) / CREDITS_PER_AI_CHAT)
);

export const getDailyAiChatsRemaining = (userData) => {
    if (!userData) {
        return 0;
    }
    if (userData.dailyAiChatDate !== new Date().toISOString().slice(0, 10)) {
        return FREE_AI_CHAT_LIMIT;
    }
    return Math.max(0, userData.dailyAiChatsRemaining ?? FREE_AI_CHAT_LIMIT);
};

export const getDailyAiChatsByProvider = (userData) => {
    if (!userData || userData.dailyAiChatDate !== new Date().toISOString().slice(0, 10)) {
        return { gemini: 0, groq: 0, cloudflare: 0 };
    }
    return userData.dailyAiChatsByProvider || { gemini: 0, groq: 0, cloudflare: 0 };
};

export const getTotalAvailableAiChats = (userData) => (
    getDailyAiChatsRemaining(userData) + getAvailableAiChats(userData?.credits)
);

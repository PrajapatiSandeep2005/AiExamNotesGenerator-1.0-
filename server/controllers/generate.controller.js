import Notes from "../models/notes.model.js";
import UserModel from "../models/user.model.js";
import { generateWithAiProvider } from "../services/aiProvider.service.js";
import { buildPrompt } from "../utils/promptBuilder.js";
import {
    CREDITS_PER_AI_CHAT,
    FREE_AI_CHAT_LIMIT,
    getDailyAiChatSnapshot,
} from "../utils/credits.js";

const reserveDailyChat = async (userId, date) => {
    const resetUsage = await UserModel.findOneAndUpdate(
        { _id: userId, dailyAiChatDate: { $ne: date } },
        {
            $set: {
                dailyAiChatDate: date,
                dailyAiChatsUsed: 1,
                dailyAiChatsByProvider: { gemini: 0, groq: 0, cloudflare: 0 },
            },
        },
        { new: true },
    );
    if (resetUsage) return true;

    const incrementUsage = await UserModel.findOneAndUpdate(
        {
            _id: userId,
            dailyAiChatDate: date,
            dailyAiChatsUsed: { $lt: FREE_AI_CHAT_LIMIT },
        },
        { $inc: { dailyAiChatsUsed: 1 } },
        { new: true },
    );
    return Boolean(incrementUsage);
};

const releaseDailyChat = async (userId, date) => {
    await UserModel.updateOne(
        { _id: userId, dailyAiChatDate: date, dailyAiChatsUsed: { $gt: 0 } },
        { $inc: { dailyAiChatsUsed: -1 } },
    );
};

const getProviderId = (providerName) => {
    const normalizedName = providerName.toLowerCase();
    if (normalizedName.includes("gemini")) return "gemini";
    if (normalizedName.includes("groq")) return "groq";
    if (normalizedName.includes("cloudflare")) return "cloudflare";
    throw new Error(`Unknown AI provider returned: ${providerName}`);
};

export const generateNotes = async (req, res) => {
    let reservedUserId;
    let reservedUsageDate;
    let dailyReservationPending = false;
    let createdNoteId;
    try {
        const {
            topic,
            classLevel,
            examType,
            revisionMode = false,
            includeDiagrams = false,
            includeChart = false,
            aiModel = "auto"
        } = req.body;

        if (!topic) {
            return res.status(400).json({ error: "Topic is required" });
        }

        const user = await UserModel.findById(req.userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const usageDate = new Date().toISOString().slice(0, 10);
        const usesDailyFreeChat = await reserveDailyChat(user._id, usageDate);
        if (usesDailyFreeChat) {
            reservedUserId = user._id;
            reservedUsageDate = usageDate;
            dailyReservationPending = true;
        }
        if (!usesDailyFreeChat && user.credits < CREDITS_PER_AI_CHAT) {
            const latestUser = await UserModel.findById(user._id);
            return res.status(403).json({
                message: "Your 50 free AI chats for today are used. Add credits to keep generating notes.",
                remainingCredits: latestUser?.credits || 0,
                requiredCredits: CREDITS_PER_AI_CHAT,
                ...getDailyAiChatSnapshot(latestUser || user, usageDate),
            });
        }

        const prompt = buildPrompt({ topic, classLevel, examType, revisionMode, includeDiagrams, includeChart });

        const generated = await generateWithAiProvider(prompt, aiModel);
        const { content: aiResponse, providerUsed } = generated;
        const providerId = getProviderId(providerUsed);

        const notes = await Notes.create({
            user: user._id,
            topic,
            classLevel,
            examType,
            revisionMode,
            includeDiagrams,
            includeChart,
            providerUsed,
            content: aiResponse
        });
        createdNoteId = notes._id;

        let updateUserResult;
        if (usesDailyFreeChat) {
            updateUserResult = await UserModel.updateOne(
                { _id: user._id, dailyAiChatDate: usageDate },
                {
                    $push: { notes: notes._id },
                    $inc: { [`dailyAiChatsByProvider.${providerId}`]: 1 },
                },
            );
        } else {
            updateUserResult = await UserModel.updateOne(
                { _id: user._id, credits: { $gte: CREDITS_PER_AI_CHAT } },
                {
                    $inc: { credits: -CREDITS_PER_AI_CHAT },
                    $push: { notes: notes._id },
                },
            );
        }
        if (!updateUserResult.matchedCount) {
            await Notes.deleteOne({ _id: notes._id });
            createdNoteId = undefined;
            if (dailyReservationPending) {
                await releaseDailyChat(user._id, usageDate);
                dailyReservationPending = false;
            }
            const latestUser = await UserModel.findById(user._id);
            return res.status(403).json({
                message: usesDailyFreeChat
                    ? "Could not record your daily chat. Please try again."
                    : "Insufficient credits. Each additional AI chat uses 10 credits.",
                remainingCredits: latestUser?.credits || 0,
                requiredCredits: CREDITS_PER_AI_CHAT,
                ...getDailyAiChatSnapshot(latestUser || user, usageDate),
            });
        }
        dailyReservationPending = false;

        const updatedUser = await UserModel.findById(user._id);
        if (!updatedUser) {
            throw new Error("User account was not available after generating notes.");
        }
        const dailyChatSnapshot = getDailyAiChatSnapshot(updatedUser, usageDate);

       return res.status(200).json({
            message: "Notes generated successfully",
            data: { content: aiResponse, revisionMode, providerUsed },
            notesId: notes._id,
            remainingCredits: updatedUser.credits,
            remainingAiChats: Math.floor(updatedUser.credits / CREDITS_PER_AI_CHAT),
            ...dailyChatSnapshot,
       });

    } catch (error) {
      if (createdNoteId) {
        try {
            await Notes.deleteOne({ _id: createdNoteId });
        } catch (cleanupError) {
            console.error("Failed to remove an unlinked generated note:", cleanupError.message);
        }
      }
      if (dailyReservationPending) {
        try {
            await releaseDailyChat(reservedUserId, reservedUsageDate);
        } catch (cleanupError) {
            console.error("Failed to restore a reserved daily AI chat:", cleanupError.message);
        }
      }
      console.error("AI generation failed:", error.message);
      return res.status(error.statusCode || 500).json({
        error: "AI Generation failed",
        message: error.message,
      });
    }
};
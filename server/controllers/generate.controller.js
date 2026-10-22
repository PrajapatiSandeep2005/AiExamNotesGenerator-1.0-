import Notes from "../models/notes.model.js";
import UserModel from "../models/user.model.js";
import { generateWithAiProvider } from "../services/aiProvider.service.js";
import { buildPrompt } from "../utils/promptBuilder.js";
import { AI_MODELS, DAILY_CREDIT_CAP, getDailyAiChatSnapshot, getUsageDate } from "../utils/credits.js";

const limitMessage = "Insufficient credits or daily model limit reached";

// Reserve first and release on provider failure; conditional updates prevent
// concurrent browser tabs from overspending a user's balance or daily quota.
const reserveModelCredits = async (userId, modelId, date) => {
    const model = AI_MODELS[modelId];
    if (!model) throw new Error(`Unknown AI model: ${modelId}`);
    const reset = await UserModel.findOneAndUpdate(
        { _id: userId, dailyAiChatDate: { $ne: date }, credits: { $gte: model.creditCost } },
        { $set: { dailyAiChatDate: date, dailyAiChatsUsed: 1, dailyCreditUsage: model.creditCost, dailyAiChatsByProvider: { gemini: 0, grok: 0, cloudflare: 0, [modelId]: 1 } }, $inc: { credits: -model.creditCost } },
        { new: true },
    );
    if (reset) return reset;
    return UserModel.findOneAndUpdate(
        { _id: userId, dailyAiChatDate: date, credits: { $gte: model.creditCost }, dailyCreditUsage: { $lte: DAILY_CREDIT_CAP - model.creditCost }, [`dailyAiChatsByProvider.${modelId}`]: { $lt: model.dailyLimit } },
        { $inc: { credits: -model.creditCost, dailyCreditUsage: model.creditCost, dailyAiChatsUsed: 1, [`dailyAiChatsByProvider.${modelId}`]: 1 } },
        { new: true },
    );
};

const releaseModelCredits = (userId, modelId, date) => {
    const cost = AI_MODELS[modelId].creditCost;
    return UserModel.updateOne(
        { _id: userId, dailyAiChatDate: date, dailyCreditUsage: { $gte: cost }, [`dailyAiChatsByProvider.${modelId}`]: { $gt: 0 } },
        { $inc: { credits: cost, dailyCreditUsage: -cost, dailyAiChatsUsed: -1, [`dailyAiChatsByProvider.${modelId}`]: -1 } },
    );
};

export const generateNotes = async (req, res) => {
    let createdNoteId;
    let reservation;
    try {
        const { topic, classLevel, examType, revisionMode = false, includeDiagrams = false, includeChart = false, aiModel = "auto" } = req.body;
        if (!topic) return res.status(400).json({ error: "Topic is required" });
        const user = await UserModel.findById(req.userId);
        if (!user) return res.status(404).json({ error: "User not found" });
        const usageDate = getUsageDate();
        const reserveForProvider = async (providerId) => {
            if (!await reserveModelCredits(user._id, providerId, usageDate)) {
                const error = new Error(limitMessage);
                error.statusCode = 403;
                throw error;
            }
            reservation = { providerId, usageDate };
        };
        const releaseReservation = async () => {
            if (!reservation) return;
            await releaseModelCredits(user._id, reservation.providerId, reservation.usageDate);
            reservation = undefined;
        };
        const prompt = buildPrompt({ topic, classLevel, examType, revisionMode, includeDiagrams, includeChart });
        const { content: aiResponse, providerUsed, providerId } = await generateWithAiProvider(prompt, aiModel, reserveForProvider, releaseReservation);
        const notes = await Notes.create({ user: user._id, topic, classLevel, examType, revisionMode, includeDiagrams, includeChart, providerUsed, content: aiResponse });
        createdNoteId = notes._id;
        await UserModel.updateOne({ _id: user._id }, { $push: { notes: notes._id } });
        reservation = undefined;
        const updatedUser = await UserModel.findById(user._id);
        return res.status(200).json({ message: "Notes generated successfully", data: { content: aiResponse, revisionMode, providerUsed }, notesId: notes._id, remainingCredits: updatedUser.credits, chargedCredits: AI_MODELS[providerId].creditCost, ...getDailyAiChatSnapshot(updatedUser, usageDate) });
    } catch (error) {
        if (createdNoteId) await Notes.deleteOne({ _id: createdNoteId }).catch(() => {});
        if (reservation) await releaseModelCredits(req.userId, reservation.providerId, reservation.usageDate).catch(() => {});
        const user = await UserModel.findById(req.userId);
        const response = { message: error.statusCode === 403 ? limitMessage : error.message };
        if (user) Object.assign(response, { remainingCredits: user.credits, ...getDailyAiChatSnapshot(user) });
        return res.status(error.statusCode || 500).json(response);
    }
};

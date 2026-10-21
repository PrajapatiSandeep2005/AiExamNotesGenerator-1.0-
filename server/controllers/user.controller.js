import UserModel from '../models/user.model.js';
import { getDailyAiChatSnapshot } from '../utils/credits.js';

export const getCurrentUser = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            credits: user.credits,
            ...getDailyAiChatSnapshot(user),
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: `Internal Server Error: ${err.message}` });
    }
};

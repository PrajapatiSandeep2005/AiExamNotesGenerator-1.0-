import UserModel from "../models/user.model.js";
import { getToken } from "../utils/token.js";
import bcrypt from "bcryptjs";
import { getDailyAiChatSnapshot } from "../utils/credits.js";

const authCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
};

const getPublicUser = (user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    credits: user.credits,
    ...getDailyAiChatSnapshot(user),
});

const isValidEmail = (email) => (
    typeof email === "string"
    && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
);

export const googleAuth = async (req, res) => {
    try {
        const body = req.body ?? {};
        const name = typeof body.name === "string" ? body.name.trim() : "";
        const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
        if (!name || !isValidEmail(email)) {
            return res.status(400).json({ message: "A valid name and email are required." });
        }

        let user = await UserModel.findOne({ email });
        if (!user) {
            user = await UserModel.create({ name, email });
        }
        const token = await getToken(user._id);
        res.cookie("token", token, authCookieOptions);
        return res.status(200).json({
            user: getPublicUser(user),
            token,
        });
    }
    catch (error) {
        console.error('Error in googleAuth:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const emailRegister = async (req, res) => {
    try {
        const body = req.body ?? {};
        const name = typeof body.name === "string" ? body.name.trim() : "";
        const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
        const password = typeof body.password === "string" ? body.password : "";

        if (!name || name.length > 100 || !isValidEmail(email)) {
            return res.status(400).json({ message: "Enter a valid name and email address." });
        }
        if (password.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters." });
        }

        let user = await UserModel.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User with this email already exists." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user = await UserModel.create({ name, email, password: hashedPassword });

        const token = await getToken(user._id);
        res.cookie("token", token, authCookieOptions);

        return res.status(201).json({
            user: getPublicUser(user),
            token,
        });
    } catch (error) {
        console.error('Error in emailRegister:', error);
        if (error.code === 11000) {
            return res.status(409).json({ message: "User with this email already exists." });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const emailLogin = async (req, res) => {
    try {
        const body = req.body ?? {};
        const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
        const password = typeof body.password === "string" ? body.password : "";

        if (!isValidEmail(email) || !password) {
            return res.status(400).json({ message: "Enter a valid email and password." });
        }

        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        if (!user.password) {
            return res.status(400).json({ message: "This account uses Google Sign-In. Please use Google." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials." });
        }

        const token = await getToken(user._id);
        res.cookie("token", token, authCookieOptions);

        return res.status(200).json({
            user: getPublicUser(user),
            token,
        });
    } catch (error) {
        console.error('Error in emailLogin:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const logOut = async(req, res) => {
    try {
        res.clearCookie("token", authCookieOptions);
        return res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.error('Error in logOut:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
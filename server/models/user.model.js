import mongoose from "mongoose";
import { FREE_AI_CREDITS } from "../utils/credits.js";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String, // Optional, since Google users won't have one
  },
  credits: {
    type: Number,
    required: true,
    default: FREE_AI_CREDITS,
    min: 0
  },
  dailyAiChatDate: {
    type: String,
    default: ""
  },
  dailyAiChatsUsed: {
    type: Number,
    default: 0,
    min: 0
  },
  dailyAiChatsByProvider: {
    gemini: { type: Number, default: 0, min: 0 },
    groq: { type: Number, default: 0, min: 0 },
    cloudflare: { type: Number, default: 0, min: 0 },
  },
  iscreditAvailable: {
    type: Boolean,
    required: true,
    default: true
  },
  notes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Notes',
    default: []
  }]
}, { timestamps: true });

const UserModel = mongoose.model("User", userSchema);

export default UserModel;
import express from 'express';
import dotenv from 'dotenv';
import connectDB from './utils/connectDB.js';
import authRouter from './routes/auth.route.js';
import userRouter from './routes/user.route.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import notesRouter from './routes/generate.route.js';
import pdfRouter from './routes/pdf.routes.js';
import creditRouter from './routes/credits.route.js';
import { StripeWebhook } from './controllers/credits.controller.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();

app.post(
    "/api/credits/webhook",
    express.raw({ type: 'application/json' }),
    StripeWebhook
);

// 1. Define an explicit whitelist of allowed origins (Local + Production)
const allowedOrigins = [
  'http://localhost:5173',               // Local Vite frontend
  'http://localhost:3000',               // Alternate local port just in case
  process.env.CLIENT_URL                 // Your live Vercel frontend URL (from Render env vars)
].filter(Boolean); // Removes undefined/null entries if CLIENT_URL isn't set yet

// 2. Configure CORS dynamically to support both environments
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, or server-to-server requests)
    if (!origin) return callback(null, true);

    // Check if the incoming request origin matches any allowed origins
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy violation: Origin ${origin} is not allowed.`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}));

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
    res.json({ message: "Exam Notes backend is running 🚀 " });
});

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/notes", notesRouter);
app.use("/api/pdf", pdfRouter);
app.use("/api/credit", creditRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
});
import express from "express";
import isAuth from "../middleware/isAuth.js";
import { generateNotes } from "../controllers/generate.controller.js";
import { getNotes, getSingleNotes } from "../controllers/notes.controller.js";

const router = express.Router();

router.use(isAuth);
router.post("/generate-notes", generateNotes);
router.get("/getnotes", getNotes);
router.get("/:id", getSingleNotes);

export default router;

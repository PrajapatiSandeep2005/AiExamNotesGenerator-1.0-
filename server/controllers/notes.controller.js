import Notes from '../models/notes.model.js';

export const getNotes = async (req, res) => {
    try {
        const notes = await Notes.find({ user: req.userId }).select("topic classLevel examType revisionMode includeDiagrams includeChart createdAt").sort({ createdAt: -1 });

        if (!notes) {
            return res.status(404).json({ message: "No notes found for the user" });
        }
        return res.status(200).json(notes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: `getCurrentUser notes error ${error.message}` });
    }
}

export const getSingleNotes = async (req, res) => {
    try {
        const notes = await Notes.findOne(
            { _id: req.params.id, user: req.userId }
        )
        if (!notes) {
            return res.status(404).json({ message: "Notes not found" });
        }
        return res.json({
            topic: notes.topic,
            content: notes.content,
            revisionMode: notes.revisionMode,
            includeDiagrams: notes.includeDiagrams,
            includeChart: notes.includeChart,
            providerUsed: notes.providerUsed,
            createdAt: notes.createdAt
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: `getSingleNotes error ${error.message}` });
    }
}
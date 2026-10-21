import PDFDocument from "pdfkit";

const formatNoteValue = (value) => {
    if (typeof value === "string" || typeof value === "number") {
        return String(value);
    }
    if (Array.isArray(value)) {
        return value.map(formatNoteValue).filter(Boolean).join(", ");
    }
    if (value && typeof value === "object") {
        return Object.entries(value)
            .filter(([, entry]) => entry !== null && entry !== undefined && entry !== "")
            .map(([key, entry]) => `${key}: ${formatNoteValue(entry)}`)
            .join(" | ");
    }
    return "";
};

const section = (doc, title) => {
    doc.moveDown(0.8);

    doc.font("Helvetica-Bold")
        .fontSize(16)
        .fillColor("#1e293b")
        .text(title);

    doc.moveDown(0.3);
};

const renderMarkdown = (doc, text = "") => {
    text.split("\n").forEach((line) => {
        line = line.trim();

        if (!line) {
            doc.moveDown(0.3);
            return;
        }

        // Heading 3
        if (line.startsWith("### ")) {
            doc.moveDown(0.4)
                .font("Helvetica-Bold")
                .fontSize(13)
                .text(line.replace("### ", ""));
        }

        // Heading 2
        else if (line.startsWith("## ")) {
            doc.moveDown(0.5)
                .font("Helvetica-Bold")
                .fontSize(15)
                .text(line.replace("## ", ""));
        }

        // Heading 1
        else if (line.startsWith("# ")) {
            doc.moveDown(0.5)
                .font("Helvetica-Bold")
                .fontSize(17)
                .text(line.replace("# ", ""));
        }

        // Bullet points
        else if (line.startsWith("- ") || line.startsWith("* ")) {
            doc.font("Helvetica")
                .fontSize(11)
                .text(`• ${line.substring(2).replace(/\*\*/g, "")}`, {
                    indent: 15
                });
        }

        // Numbered list
        else if (/^\d+\.\s/.test(line)) {
            doc.font("Helvetica")
                .fontSize(11)
                .text(line.replace(/\*\*/g, ""), {
                    indent: 15
                });
        }

        // Normal text
        else {
            doc.font("Helvetica")
                .fontSize(11)
                .text(line.replace(/\*\*/g, ""));
        }
    });
};

export const pdfDownload = async (req, res) => {
    try {
        const { results } = req.body;

        if (!results) {
            return res.status(400).json({
                message: "No notes data provided"
            });
        }

        const doc = new PDFDocument({
            size: "A4",
            margin: 50
        });

        res.setHeader("Content-Type", "application/pdf");

        res.setHeader(
            "Content-Disposition",
            "attachment; filename=exam_notes_AI.pdf"
        );

        doc.pipe(res);

        // Main title
        doc.font("Helvetica-Bold")
            .fontSize(22)
            .fillColor("#111827")
            .text("Exam Notes AI", {
                align: "center"
            });

        doc.moveDown(0.5);

        // Importance
        doc.font("Helvetica-Bold")
            .fontSize(13)
            .fillColor("#111827")
            .text(`Importance: ${results.importance || "N/A"}`);

        // Sub Topics
        section(doc, "Sub Topics");

        Object.entries(results.subTopics || {}).forEach(([star, topics]) => {

            doc.font("Helvetica-Bold")
                .fontSize(12)
                .text(`${star} Topics`);

            topics.forEach((topic) => {
                doc.font("Helvetica")
                    .fontSize(11)
                    .text(`• ${formatNoteValue(topic)}`, {
                        indent: 15
                    });
            });

            doc.moveDown(0.3);
        });

        // Detailed Notes
        section(doc, "Detailed Notes");

        renderMarkdown(doc, results.notes);

        // Quick Revision Points
        section(doc, "Quick Revision Points");

        (results.revisionPoints || []).forEach((point) => {
            doc.font("Helvetica")
                .fontSize(11)
                .text(`• ${formatNoteValue(point)}`, {
                    indent: 15
                });
        });

        // Important Questions
        section(doc, "Important Questions");

        doc.font("Helvetica-Bold")
            .fontSize(12)
            .text("Short Questions");

        (results.questions?.short || []).forEach((question) => {
            doc.font("Helvetica")
                .fontSize(11)
                .text(`• ${formatNoteValue(question)}`, {
                    indent: 15
                });
        });

        doc.moveDown(0.4);

        doc.font("Helvetica-Bold")
            .fontSize(12)
            .text("Long Questions");

        (results.questions?.long || []).forEach((question) => {
            doc.font("Helvetica")
                .fontSize(11)
                .text(`• ${formatNoteValue(question)}`, {
                    indent: 15
                });
        });

        doc.end();

    } catch (error) {
        console.error("PDF generation error:", error);

        if (!res.headersSent) {
            return res.status(500).json({
                message: "PDF generation failed",
                error: error.message
            });
        }
    }
};
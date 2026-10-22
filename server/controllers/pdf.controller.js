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

const ensureChartSpace = (doc, height = 250) => {
    if (doc.y > doc.page.height - doc.page.margins.bottom - height) doc.addPage();
};

// Render source chart data as PDF vectors. This avoids relying exclusively on
// a responsive browser SVG capture when exporting Recharts visualizations.
const renderChart = (doc, chart) => {
    const points = Array.isArray(chart?.data)
        ? chart.data.filter((point) => Number.isFinite(Number(point?.value)))
        : [];
    if (!points.length) return;
    ensureChartSpace(doc);
    const x = doc.page.margins.left;
    const chartY = doc.y + 18;
    const width = 495;
    const baseline = chartY + 150;
    const colors = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4"];
    const max = Math.max(...points.map((point) => Number(point.value)), 1);
    doc.font("Helvetica-Bold").fontSize(11).fillColor("#1e293b").text(chart.title || "Generated Chart");

    if (chart.type === "pie") {
        const total = points.reduce((sum, point) => sum + Math.max(0, Number(point.value)), 0) || 1;
        const centerX = x + 120;
        const centerY = chartY + 88;
        let angle = -Math.PI / 2;
        points.forEach((point, index) => {
            const nextAngle = angle + (Math.max(0, Number(point.value)) / total) * Math.PI * 2;
            doc.save().fillColor(colors[index % colors.length]).moveTo(centerX, centerY)
                .arc(centerX, centerY, 70, angle, nextAngle).lineTo(centerX, centerY).fill().restore();
            doc.fillColor("#334155").font("Helvetica").fontSize(9)
                .text(`${point.name || `Item ${index + 1}`}: ${point.value}`, x + 230, chartY + index * 20, { width: 240 });
            angle = nextAngle;
        });
    } else {
        doc.strokeColor("#94a3b8").lineWidth(1).moveTo(x + 30, chartY).lineTo(x + 30, baseline).lineTo(x + width, baseline).stroke();
        const step = (width - 55) / points.length;
        const coordinates = points.map((point, index) => ({ x: x + 30 + step * index + step / 2, y: baseline - (Math.max(0, Number(point.value)) / max) * 125, point }));
        if (chart.type === "line") {
            doc.strokeColor(colors[0]).lineWidth(2);
            coordinates.forEach((point, index) => index ? doc.lineTo(point.x, point.y) : doc.moveTo(point.x, point.y));
            doc.stroke();
            coordinates.forEach((point) => doc.circle(point.x, point.y, 3).fillColor(colors[0]).fill());
        } else {
            coordinates.forEach((point, index) => {
                const barWidth = Math.max(12, step * 0.55);
                doc.rect(point.x - barWidth / 2, point.y, barWidth, baseline - point.y).fillColor(colors[index % colors.length]).fill();
            });
        }
        coordinates.forEach((point, index) => {
            doc.fillColor("#334155").font("Helvetica").fontSize(8)
                .text(String(point.point.name || index + 1), point.x - step / 2, baseline + 5, { width: step, align: "center" })
                .text(String(point.point.value), point.x - step / 2, baseline - 13, { width: step, align: "center" });
        });
    }
    doc.y = chartY + 190;
    doc.moveDown(0.5);
};

export const pdfDownload = async (req, res) => {
    try {
        const results = req.body?.results;
        const visualImages = Array.isArray(req.body?.visualImages) ? req.body.visualImages : [];

        if (!results) {
            return res.status(400).json({
                message: "No notes data provided"
            });
        }

        const notes = results.content && typeof results.content === "object"
            ? results.content
            : results;
        if (typeof notes !== "object" || Array.isArray(notes)) {
            return res.status(400).json({
                message: "Invalid notes data provided"
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
            .text(`Importance: ${notes.importance || "N/A"}`);

        // Sub Topics
        section(doc, "Sub Topics");

        Object.entries(notes.subTopics || {}).forEach(([star, topics]) => {

            doc.font("Helvetica-Bold")
                .fontSize(12)
                .text(`${star} Topics`);

            (Array.isArray(topics) ? topics : [topics]).forEach((topic) => {
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

        renderMarkdown(doc, notes.notes);

        // Quick Revision Points
        section(doc, "Quick Revision Points");

        (notes.revisionPoints || []).forEach((point) => {
            doc.font("Helvetica")
                .fontSize(11)
                .text(`• ${formatNoteValue(point)}`, {
                    indent: 15
                });
        });

        // Important Questions
        section(doc, "Important Questions");

        const questions = notes.questions || {};
        doc.font("Helvetica-Bold")
            .fontSize(12)
            .text("Short Questions");

        (questions.short || []).forEach((question) => {
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

        (questions.long || []).forEach((question) => {
            doc.font("Helvetica")
                .fontSize(11)
                .text(`• ${formatNoteValue(question)}`, {
                    indent: 15
                });
        });

        if (questions.diagram) {
            doc.moveDown(0.4);
            doc.font("Helvetica-Bold")
                .fontSize(12)
                .text("Diagram Question");
            doc.font("Helvetica")
                .fontSize(11)
                .text(formatNoteValue(questions.diagram), { indent: 15 });
        }

        if (notes.diagram?.data) {
            section(doc, "Diagram Source");
            doc.font("Courier")
                .fontSize(9)
                .text(formatNoteValue(notes.diagram.data));
        }

        if (Array.isArray(notes.charts) && notes.charts.length) {
            section(doc, "Generated Charts");
            notes.charts.forEach((chart) => {
                renderChart(doc, chart);
                doc.font("Helvetica-Bold")
                    .fontSize(11)
                    .text(formatNoteValue(chart.title || chart.type || "Chart"));
                (chart.data || []).forEach((point) => {
                    doc.font("Helvetica")
                        .fontSize(10)
                        .text(`• ${formatNoteValue(point)}`, { indent: 15 });
                });
            });
        }

        // The client sends rendered Mermaid/Recharts SVGs as PNG data URLs.
        // PDFKit cannot render those browser components itself, so embed their
        // captured PNG versions in a dedicated visual section.
        const validVisuals = visualImages.filter(({ data }) => (
            typeof data === "string" && /^data:image\/png;base64,/.test(data)
        ));
        if (validVisuals.length) {
            section(doc, "Generated Visuals");
            validVisuals.forEach(({ title, data }, index) => {
                const image = Buffer.from(data.replace(/^data:image\/png;base64,/, ""), "base64");
                const imageHeight = 280;
                if (doc.y > doc.page.height - doc.page.margins.bottom - imageHeight - 35) {
                    doc.addPage();
                }
                doc.font("Helvetica-Bold").fontSize(11).fillColor("#1e293b")
                    .text(title || `Visual ${index + 1}`);
                doc.moveDown(0.25);
                doc.image(image, { fit: [495, imageHeight], align: "center" });
                doc.moveDown(0.7);
            });
        }

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

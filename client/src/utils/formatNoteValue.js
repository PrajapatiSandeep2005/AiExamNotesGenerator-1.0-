export const formatNoteValue = (value) => {
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
            .join(" · ");
    }

    return "";
};

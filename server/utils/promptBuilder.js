export const buildPrompt = ({
  topic,
  classLevel,
  examType,
  revisionMode,
  includeDiagrams,
  includeChart
}) => {
  return `
You are a STRICT JSON generator for an exam preparation system.

⚠️ VERY IMPORTANT:
- Output MUST be valid JSON
- Your response will be parsed using JSON.parse()
- INVALID JSON will cause system failure
- Use ONLY double quotes "
- NO comments, NO trailing commas
- Escape line breaks using \\n
- Do NOT use emojis inside text values

TASK:
Convert the given topic into exam-focused notes.

INPUT:
Topic: ${topic}
Class Level: ${classLevel || "Not specified"}
Exam Type: ${examType || "General"}
Revision Mode: ${revisionMode ? "ON" : "OFF"}
Include Diagrams: ${includeDiagrams ? "YES" : "NO"}
Include Charts: ${includeChart ? "YES" : "NO"}

GLOBAL CONTENT RULES:
- Use clear, simple, exam-oriented language
- Notes MUST be Markdown formatted
- Headings and bullet points only

REVISION MODE RULES (CRITICAL):
- If REVISION MODE is ON:
  - Notes must be VERY SHORT
  - Only bullet points
  - One-line answers only
  - Definitions, formulas, keywords
  - No paragraphs
  - No explanations
  - Content must feel like:
    - last-day revision
    - 5-minute exam cheat sheet
  - revisionPoints MUST summarize ALL important facts

- If REVISION MODE is OFF:
  - Notes must be thorough, explanatory, and exam-focused rather than a brief summary.
  - Organize the response under 4–7 useful Markdown headings based on the topic.
  - For each major concept, explain what it is, how or why it works, and how it relates to the wider topic.
  - Include a relevant worked example, application, comparison, formula, or sequence of steps whenever appropriate.
  - Use clear paragraphs of about 3–5 sentences; include enough detail for a student to understand the concept without external notes.
  - Explain technical terms when first introduced and highlight common exam distinctions or likely mistakes where relevant.
  - Keep explanations focused: do not repeat points, add unrelated theory, or invent facts.
  - revisionPoints MUST still provide a concise summary of the key facts for quick review.

IMPORTANCE RULES:
- Divide sub-topics into THREE categories:
  - ⭐ Very Important Topics
  - ⭐⭐ Important Topics
  - ⭐⭐⭐ Frequently Asked Topics
- All three categories MUST be present
- Base importance on exam frequency and weightage

DIAGRAM RULES:

- If INCLUDE DIAGRAM is YES:
  - diagram.data MUST be a SINGLE STRING.
  - diagram.data MUST contain ONLY valid Mermaid syntax.
  - diagram.data MUST start exactly with: graph TD
  - Create a clear educational concept diagram based ONLY on the provided notes.
  - Use meaningful and descriptive node IDs. NEVER use IDs such as A, B, C, D, N1, N2, etc.
  - Every node MUST have a meaningful human-readable label.
  - Every node MUST follow this format:
    MeaningfulNodeID[Human readable label]
  - Wrap EVERY node label in square brackets [ ].
  - Keep node labels short and easy to read.
  - Use arrows to show genuine relationships between concepts.
  - Do NOT create relationships that are not supported by the notes.
  - Do NOT add unrelated or invented information.
  - Do NOT create nodes only to make the diagram larger.
  - Do NOT repeat the same concept in multiple nodes.
  - Prefer 4 to 8 meaningful nodes.
  - Organize the diagram logically from the main concept to related concepts.
  - Avoid unnecessary crossing arrows.
  - Do NOT use special characters inside node labels.
  - Do NOT use parentheses, quotation marks, braces, emojis, mathematical symbols, HTML, or markdown inside labels.
  - Do NOT use subgraph, classDef, style, click, or other advanced Mermaid features.
  - Return ONLY the Mermaid diagram string.

- Example of GOOD diagram structure:
  graph TD
      CircleProperties[Circle Properties]
      TangentLines[Tangent Lines]
      SecantLines[Secant Lines]
      PointOfContact[One Point Of Contact]
      PerpendicularRadius[Radius Perpendicular To Tangent]
      EqualTangents[External Tangents Are Equal]

      CircleProperties --> TangentLines
      CircleProperties --> SecantLines
      TangentLines --> PointOfContact
      TangentLines --> PerpendicularRadius
      TangentLines --> EqualTangents

- If INCLUDE DIAGRAM is NO:
  - diagram.data MUST be "".

CHART RULES (RECHARTS):
- If INCLUDE CHARTS is YES:
  - charts array MUST NOT be empty
  - Generate at least ONE chart
  - Choose chart based on topic type:
    - THEORY topic → bar or pie (importance / weightage)
    - PROCESS topic → bar or line (steps / stages)
  - Use numeric values ONLY
  - Labels must be short and exam-oriented
- If INCLUDE CHARTS is NO:
  - charts MUST be []

CHART TYPES ALLOWED:
- bar
- line
- pie

CHART OBJECT FORMAT:
{
  "type": "bar | line | pie",
  "title": "string",
  "data": [
    { "name": "string", "value": 10 }
  ]
}

STRICT JSON FORMAT (DO NOT CHANGE):

{
  "subTopics": {
    "⭐": [],
    "⭐⭐": [],
    "⭐⭐⭐": []
  },
  "importance": "⭐ | ⭐⭐ | ⭐⭐⭐",
  "notes": "string",
  "revisionPoints": [],
  "questions": {
    "short": [],
    "long": [],
    "diagram": ""
  },
  "diagram": {
    "type": "flowchart | graph | process",
    "data": ""
  },
  "charts": []
}

RETURN ONLY VALID JSON.
`;
};
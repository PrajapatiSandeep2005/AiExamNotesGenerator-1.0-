import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { generateWithAiProvider } from "./aiProvider.service.js";

const originalFetch = globalThis.fetch;
const originalApiKey = process.env.GROK_API_KEY;
const originalModel = process.env.GROK_MODEL;

afterEach(() => {
    globalThis.fetch = originalFetch;
    if (originalApiKey === undefined) delete process.env.GROK_API_KEY;
    else process.env.GROK_API_KEY = originalApiKey;
    if (originalModel === undefined) delete process.env.GROK_MODEL;
    else process.env.GROK_MODEL = originalModel;
});

test("Grok requests use the supported default model and parse structured notes", async () => {
    process.env.GROK_API_KEY = "test-key";
    delete process.env.GROK_MODEL;
    let requestBody;
    globalThis.fetch = async (_url, options) => {
        requestBody = JSON.parse(options.body);
        return new Response(JSON.stringify({
            choices: [{
                message: {
                    content: JSON.stringify({
                        subTopics: { important: [] },
                        notes: "Example notes",
                        revisionPoints: [],
                        questions: { short: [], long: [] },
                    }),
                },
            }],
        }), { status: 200 });
    };

    const result = await generateWithAiProvider("Test prompt", "grok");

    assert.equal(requestBody.model, "grok-4.7");
    assert.deepEqual(result.content.questions, { short: [], long: [] });
    assert.equal(result.providerId, "grok");
});

test("Grok errors retain the upstream status and provider message", async () => {
    process.env.GROK_API_KEY = "test-key";
    globalThis.fetch = async () => new Response(JSON.stringify({
        error: { message: "The requested model is unavailable." },
    }), { status: 400 });

    await assert.rejects(
        generateWithAiProvider("Test prompt", "grok"),
        (error) => {
            assert.equal(error.statusCode, 502);
            assert.match(error.message, /status 400: The requested model is unavailable/);
            return true;
        },
    );
});

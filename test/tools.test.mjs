// Tool contract test.
//
// The README promises four tools with specific names and required parameters. The upstream list
// can change without a single commit here, and the README would start lying silently. These
// checks catch that before a user does.
//
// The last test calls a tool for real. Listing tools accepts any non-empty key, so a contract
// check that only lists tools stays green with a revoked or mistyped key. That call costs
// 10 credits, which is the price of a canary that can fail for the right reason.
//
// Run: HASDATA_API_KEY=your_key_here npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';

const ENDPOINT = 'https://mcp.hasdata.com/api/mcp?apis=tiktok';
const KEY = process.env.HASDATA_API_KEY;
const TIMEOUT_MS = 30_000;

const EXPECTED = {
    hasdata_tiktok_profile_getTikTokProfile: 'handle',
    hasdata_tiktok_posts_getTikTokPosts: 'handle',
    hasdata_tiktok_comments_getTikTokComments: 'videoId',
    hasdata_tiktok_search_getTikTokSearch: 'keyword',
};

// A streamable HTTP body arrives either as plain JSON or as server-sent events. One SSE event
// can span several data: lines, several events can share one response, and a server is free to
// send progress notifications before the answer. So collect every event and pick the message
// carrying our request id instead of trusting the first data: line.
function parseRpc(raw, id) {
    const trimmed = raw.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) return JSON.parse(trimmed);

    const messages = [];
    for (const event of trimmed.split(/\r?\n\r?\n+/)) {
        const data = event
            .split(/\r?\n/)
            .filter((l) => l.startsWith('data:'))
            .map((l) => l.slice(5).replace(/^ /, ''))
            .join('\n');
        if (!data || data === '[DONE]') continue;
        try {
            messages.push(JSON.parse(data));
        } catch {
            // A keep-alive or a partial event is not our response.
        }
    }
    assert.ok(messages.length, `no JSON-RPC message in the response: ${raw.slice(0, 300)}`);
    const match = messages.find((m) => m.id === id);
    assert.ok(match, `no message with id ${id} in the response: ${raw.slice(0, 300)}`);
    return match;
}

let nextId = 1;

async function rpc(method, params = {}) {
    const id = nextId++;
    const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {
            'x-api-key': KEY,
            'Content-Type': 'application/json',
            // The server answers over streamable HTTP, so accept both a plain body and a stream.
            Accept: 'application/json, text/event-stream',
        },
        body: JSON.stringify({ jsonrpc: '2.0', id, method, params }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    assert.equal(res.status, 200, `${method} returned ${res.status}`);
    const raw = await res.text();
    return { raw, body: parseRpc(raw, id) };
}

// One network round trip for every test that needs the list.
let toolsPromise;
function listTools() {
    toolsPromise ??= rpc('tools/list').then(({ body }) => {
        assert.ok(body.result?.tools, 'the response carried no result.tools');
        return body.result.tools;
    });
    return toolsPromise;
}

const live = { skip: KEY ? false : 'HASDATA_API_KEY is not set, skipping the live checks' };

test('apis=tiktok exposes exactly four tools', live, async () => {
    const tools = await listTools();
    const names = tools.map((t) => t.name).sort().join(', ');
    assert.equal(
        tools.length,
        Object.keys(EXPECTED).length,
        `expected ${Object.keys(EXPECTED).length} tools, got ${tools.length}: ${names}`
    );
});

test('the tool names have not changed', live, async () => {
    const tools = await listTools();
    const names = new Set(tools.map((t) => t.name));
    for (const expected of Object.keys(EXPECTED)) {
        assert.ok(names.has(expected), `tool ${expected} is missing from the list`);
    }
});

test('every tool still declares its required parameter', live, async () => {
    const tools = await listTools();
    for (const tool of tools) {
        const required = tool.inputSchema?.required ?? [];
        const want = EXPECTED[tool.name];
        assert.ok(want, `tool ${tool.name} is not covered by this test`);
        assert.ok(
            required.includes(want),
            `${tool.name} should require ${want}, declares: ${required.join(', ') || 'nothing'}`
        );
    }
});

test('every tool carries a description', live, async () => {
    const tools = await listTools();
    for (const tool of tools) {
        assert.ok(
            (tool.description || '').trim().length > 20,
            `${tool.name} has an empty or near-empty description`
        );
    }
});

test('the key is accepted by HasData', live, async () => {
    const { raw } = await rpc('tools/call', {
        name: 'hasdata_tiktok_profile_getTikTokProfile',
        arguments: { handle: 'mrbeast' },
    });
    assert.ok(!raw.includes('401 Unauthorized'), 'HasData rejected the key');
    assert.ok(!raw.includes('"isError":true'), `the tool call failed: ${raw.slice(0, 300)}`);
});

# TikTok MCP Server

<!-- mcp-name: com.hasdata/tiktok -->

A hosted Model Context Protocol (MCP) server that gives Claude, Cursor, Windsurf and any other MCP client four read-only TikTok tools. Look up a public profile, walk an account's videos, read the comments on a video, and search TikTok for videos or creators, all as structured JSON, with no TikTok developer account and no OAuth.

It reads public data that a signed-out visitor can see. It does not sign in, post, or act as an account.

```
https://mcp.hasdata.com/api/mcp?apis=tiktok
```

[![Glama score](https://glama.ai/mcp/servers/HasData/tiktok-mcp/badges/score.svg)](https://glama.ai/mcp/servers/HasData/tiktok-mcp)
[![tool contract](https://github.com/HasData/tiktok-mcp/actions/workflows/contract.yml/badge.svg)](https://github.com/HasData/tiktok-mcp/actions/workflows/contract.yml)
[![MCP](https://img.shields.io/badge/MCP-remote%20%7C%20streamable%20HTTP-6366f1?style=flat-square)](https://modelcontextprotocol.io)
[![Tools](https://img.shields.io/badge/tools-4-10b981?style=flat-square)](#tools)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)

## Contents

- [What you need](#what-you-need)
- [Quick start](#quick-start)
- [Example prompts](#example-prompts)
- [Tools](#tools)
- [Errors and failure paths](#errors-and-failure-paths)
- [Pricing, free tier and limits](#pricing-free-tier-and-limits)
- [Tool selection](#tool-selection)
- [How it compares](#how-it-compares)
- [FAQ](#faq)
- [HasData links](#hasdata-links)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## What you need

An MCP client and a HasData API key from the [dashboard](https://app.hasdata.com/sign-up?utm_source=github&utm_medium=syndication&utm_campaign=tiktok-mcp), free to create. This is a remote server, so the simplest path is a URL and an `x-api-key` header, with no container to run and no TikTok developer account anywhere in the flow. A client that only speaks stdio reaches it through a thin launcher, published as `@hasdata/tiktok-mcp` on npm and `hasdata-tiktok-mcp` on PyPI, shown below.

## Quick start

The server URL is the same for every client. We run it hands-on in Claude Code and Claude Desktop. The other blocks follow each client's own documented format for a remote server.

| Field | Value |
| :--- | :--- |
| URL | `https://mcp.hasdata.com/api/mcp?apis=tiktok` |
| Transport | HTTP, streamable |
| Auth header | `x-api-key: HASDATA_API_KEY` |

Clients with OAuth support can add the same URL as a connector and sign in without putting a key in a config file.

<details>
<summary><b>Claude Code</b></summary>

```bash
claude mcp add --transport http tiktok "https://mcp.hasdata.com/api/mcp?apis=tiktok" \
  --header "x-api-key: HASDATA_API_KEY"
```

</details>

<details>
<summary><b>Claude Desktop</b></summary>

Settings, then Connectors, then Add custom connector, then paste `https://mcp.hasdata.com/api/mcp?apis=tiktok` and sign in.

For the config-file route, Claude Desktop loads only local (stdio) servers, so it reaches a remote server through a stdio launcher. The `@hasdata/tiktok-mcp` package is that launcher, and it reads the key from the environment. Add this to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "tiktok": {
      "command": "npx",
      "args": ["-y", "@hasdata/tiktok-mcp"],
      "env": { "HASDATA_API_KEY": "YOUR_KEY" }
    }
  }
}
```

Python instead of Node? Swap the launcher for the PyPI package, which `uvx` runs without a manual install:

```json
{
  "mcpServers": {
    "tiktok": {
      "command": "uvx",
      "args": ["hasdata-tiktok-mcp"],
      "env": { "HASDATA_API_KEY": "YOUR_KEY" }
    }
  }
}
```

</details>

<details>
<summary><b>Cursor</b></summary>

`~/.cursor/mcp.json` for every project, or `.cursor/mcp.json` for one:

```json
{
  "mcpServers": {
    "tiktok": {
      "url": "https://mcp.hasdata.com/api/mcp?apis=tiktok",
      "headers": { "x-api-key": "HASDATA_API_KEY" }
    }
  }
}
```

</details>

<details>
<summary><b>Windsurf</b></summary>

`~/.codeium/windsurf/mcp_config.json`. Windsurf calls the field `serverUrl`, not `url`:

```json
{
  "mcpServers": {
    "tiktok": {
      "serverUrl": "https://mcp.hasdata.com/api/mcp?apis=tiktok",
      "headers": { "x-api-key": "HASDATA_API_KEY" }
    }
  }
}
```

</details>

<details>
<summary><b>Cline</b></summary>

```json
{
  "mcpServers": {
    "tiktok": {
      "url": "https://mcp.hasdata.com/api/mcp?apis=tiktok",
      "type": "streamableHttp",
      "headers": { "x-api-key": "HASDATA_API_KEY" },
      "disabled": false
    }
  }
}
```

</details>

<details>
<summary><b>VS Code</b></summary>

`.vscode/mcp.json` in the workspace:

```json
{
  "servers": {
    "tiktok": {
      "type": "http",
      "url": "https://mcp.hasdata.com/api/mcp?apis=tiktok",
      "headers": { "x-api-key": "HASDATA_API_KEY" }
    }
  }
}
```

</details>

<details>
<summary><b>Codex CLI</b></summary>

`~/.codex/config.toml`:

```toml
[mcp_servers.tiktok]
url = "https://mcp.hasdata.com/api/mcp?apis=tiktok"

[mcp_servers.tiktok.headers]
"x-api-key" = "HASDATA_API_KEY"
```

</details>

<details>
<summary><b>Gemini CLI</b></summary>

`~/.gemini/settings.json`:

```json
{
  "mcpServers": {
    "tiktok": {
      "httpUrl": "https://mcp.hasdata.com/api/mcp?apis=tiktok",
      "headers": { "x-api-key": "HASDATA_API_KEY" }
    }
  }
}
```

</details>

## Example prompts

Prompts, not code. Paste one in and the agent picks the tool itself. Each is annotated with the calls it takes, because in MCP the model decides how many calls to make and every successful call costs 10 credits.

> Take @mrbeast. Pull the profile, then walk the first two pages of videos and give me the median play count across them.

*Three calls, 30 credits. The profile is one call, and each page of videos is another.*

> Search TikTok for creators around "cold brew coffee" and rank the top ten by followers, each with their bio.

*One call, 10 credits. A user search already carries follower count and bio, so no per-profile follow-up is needed.*

> Here is a video URL. Read its top comments and tell me the overall sentiment and the three most-liked replies.

*One call, 10 credits. The numeric id in the URL is all the comments tool needs.*

> Take that same video, then expand the replies under its most-liked comment.

*Two calls, 20 credits. Top-level comments first, then a second call with that comment's id for its replies.*

> Search "asmr" videos, then pull the author profile of the three with the highest play counts.

*Four calls, 40 credits. One search, then one profile each. Every author in a search result carries a link straight to its profile endpoint, so the agent never has to guess a handle.*

Paging costs a call each time. A creator audit that reads a profile then walks five pages of videos is six calls and 60 credits. The trial goes further on narrow questions than on open-ended crawls.

## Tools

Four tools, all read-only. Samples below are trimmed from real calls, and the numbers in them move as TikTok updates. Read them as shapes. Each tool name links to its endpoint reference, which carries the full field list.

The samples are the payload, not the whole response. A `tools/call` result carries one text block, and that text is itself JSON holding `url`, `status`, `text` and `json`, with the scraped data under `json`. From a raw JSON-RPC response the path is `result.content[0].text`, parsed, then `.json`. A chat client unwraps that for you and code talking to the endpoint directly does not.

Handles, video ids and comment ids chain together. A profile links to its posts, every post carries its own video id for the comments tool, and every author in comments and search results carries a `hasdataLink` to its profile and a `hasdataPostsLink` to its videos. An agent walks from a keyword to a creator to a video to its comments without ever constructing a URL.

### Get TikTok profile

[`hasdata_tiktok_profile_getTikTokProfile`](https://docs.hasdata.com/apis/tiktok/profile?utm_source=github&utm_medium=syndication&utm_campaign=tiktok-mcp)

One public account by handle.

| Parameter | Type | Required | Notes |
| :--- | :--- | :--- | :--- |
| `handle` | string | yes | The username, with or without the leading `@` |

Returns `username`, `nickname`, `biography`, `bioLink`, `verified`, `language`, `createTime`, the avatar URLs, and the `followers`, `follows`, `likes`, `videos` and `friends` counts as integers. The counts are already parsed, so `followers > 1000000` compares numbers, not display strings.

> A handle that does not exist still comes back with `requestMetadata.status` set to `ok`, the `profile` object simply absent. Check that the object is there before reading `username` or any other field, or an agent doing `profile.username` throws on nothing.

```json
{
  "username": "mrbeast",
  "nickname": "MrBeast",
  "verified": true,
  "biography": "Checkout My New Book!👇",
  "bioLink": "http://themostdangerousgames.com",
  "createTime": "2018-10-20T19:26:16.000Z",
  "followers": 138387571,
  "follows": 354,
  "likes": 1427086888,
  "videos": 466,
  "friends": 285
}
```

### Get TikTok posts

[`hasdata_tiktok_posts_getTikTokPosts`](https://docs.hasdata.com/apis/tiktok/posts?utm_source=github&utm_medium=syndication&utm_campaign=tiktok-mcp)

A page of an account's videos by handle, newest first.

| Parameter | Type | Required | Notes |
| :--- | :--- | :--- | :--- |
| `handle` | string | yes | The username, with or without the leading `@` |
| `nextPageToken` | string | | The `pagination.nextPageToken` from the previous response. Omit it for the first page |

One call returns about thirty videos plus `pagination`, which carries `hasMore` and the `nextPageToken` you feed back to walk the account history one page at a time. Each video carries `id`, `description`, `url`, `duration`, the cover and playable video URLs, `music`, and the `likes`, `comments`, `shares`, `plays`, `collects` and `reposts` counts as integers.

> `hashtags` and `mentions` are present only on videos that use them. In one real page of 27 videos, 4 carried a `hashtags` array and 10 carried `mentions`. Test for the key before you read it, rather than assuming every video has both.

```json
{
  "id": "7677375185028271391",
  "description": "would you take the car or nah?",
  "url": "https://www.tiktok.com/@mrbeast/video/7677375185028271391",
  "createTime": "2026-08-23T23:36:59.000Z",
  "duration": 41,
  "likes": 129500,
  "comments": 6670,
  "shares": 2033,
  "plays": 1100000,
  "collects": 4986,
  "music": { "title": "original sound", "authorName": "MrBeast", "original": true }
}
```

### Get TikTok comments

[`hasdata_tiktok_comments_getTikTokComments`](https://docs.hasdata.com/apis/tiktok/comments?utm_source=github&utm_medium=syndication&utm_campaign=tiktok-mcp)

The comments on a public video, or the replies under one comment.

| Parameter | Type | Required | Notes |
| :--- | :--- | :--- | :--- |
| `videoId` | string | yes | The numeric id, the part after `/video/` in a TikTok URL. Keep it a string. The id is a 64-bit number that loses its last digits if it ever passes through a JavaScript `Number` |
| `commentId` | string | | Pass it to get the replies to that comment instead of the video's top-level comments. A string, for the same 64-bit reason as `videoId` |
| `nextPageToken` | string | | Token from the previous response. Omit it for the first page |

Each comment carries `text`, `likes`, `createTime`, `replyCount` and an `author`, and every author carries a `hasdataLink` to its profile and a `hasdataPostsLink` to its videos. `pagination.total` reports the video's whole comment count, so you know the depth before you page. A comment with a non-zero `replyCount` has replies you reach by calling again with its `id` as `commentId`.

```json
{
  "id": "7677377150003053325",
  "text": "How could someone turn down a car",
  "createTime": "2026-08-23T23:45:06.000Z",
  "likes": 3802,
  "replyCount": 22,
  "author": {
    "username": "hohce.verggr",
    "nickname": "Sasori",
    "hasdataLink": "https://api.hasdata.com/scrape/tiktok/profile?handle=hohce.verggr",
    "hasdataPostsLink": "https://api.hasdata.com/scrape/tiktok/posts?handle=hohce.verggr"
  }
}
```

### Search TikTok

[`hasdata_tiktok_search_getTikTokSearch`](https://docs.hasdata.com/apis/tiktok/search?utm_source=github&utm_medium=syndication&utm_campaign=tiktok-mcp)

A keyword search over videos or creators.

| Parameter | Type | Required | Notes |
| :--- | :--- | :--- | :--- |
| `keyword` | string | yes | The phrase to search for |
| `type` | string | | `video` by default, or `user` to search creators |
| `nextPageToken` | string | | Token from the previous response. Omit it for the first page |

With `type: video` the response holds videos in the same shape the posts tool returns, each with its author. With `type: user` it holds creators, each with `username`, `nickname`, `signature` (the bio), `avatarUrl`, `followers`, and the same `hasdataLink` and `hasdataPostsLink` to chain into a profile or its videos. A `verified` flag is present on accounts that carry one.

```json
{
  "username": "la.mooncoldbrew",
  "nickname": "lamoon cold brew coffee",
  "signature": "อยากได้สูตรชงเมนูไหน Comment ไว้เลยน้า",
  "followers": 48000,
  "hasdataLink": "https://api.hasdata.com/scrape/tiktok/profile?handle=la.mooncoldbrew",
  "hasdataPostsLink": "https://api.hasdata.com/scrape/tiktok/posts?handle=la.mooncoldbrew"
}
```

## Errors and failure paths

Your client almost never sees an HTTP error code from a tool call. The MCP layer answers 200 and puts the failure inside the result, with `isError` set to `true` and the reason as text. The agent reads a message where you might expect a status line.

**A wrong key surfaces as tool output, not as a failed connection.** `tools/list` accepts any non-empty key and returns all four tools, so the client completes its handshake and shows green. The first tool call then comes back with `isError: true` and the text `HasData API error: 401 Unauthorized`. Watch for that string, because nothing earlier in the flow reports the problem.

**A missing key is the one real HTTP error.** Authorization runs before any tool, and the connection itself fails with 401. CORS headers are present, and a browser client reads the status and not an opaque network failure.

**An argument that breaks a tool's schema is rejected before it becomes a scrape.** The server answers with `isError: true` and the text `MCP error -32602: Input validation error`, naming the offending field. Nothing is fetched and nothing is charged.

**A call that succeeds and finds nothing is the case that trips people up.** A handle that does not exist comes back as an ordinary result with `requestMetadata.status` set to `ok` and the data key simply missing. Nothing in the body says the result was empty. Test for the field you need, not for an error.

**An identifier the platform rejects returns 400** with `requestMetadata.status` set to `error`.

Results that carry data also carry a `requestMetadata.id` worth quoting in support.

## Pricing, free tier and limits

Every TikTok tool costs **10 credits per successful call**. Response size does not change the price. A full page of videos costs the same as a profile with one field.

The free trial is **1,000 credits over 30 days with no card**, which is 100 TikTok calls. After that an active account keeps getting 100 credits topped up each day whenever its balance drops below 100, so a low-volume agent runs on the free tier indefinitely.

Paid plans start at **$49 a month** for 200,000 credits, which is 20,000 calls. The unit price falls with volume, from **$2.45 per 1,000 calls** on the entry plan to **$0.99** on Business, **$0.83** on Growth and **$0.75** on the largest [high-volume plans](https://hasdata.com/prices?utm_source=github&utm_medium=syndication&utm_campaign=tiktok-mcp).

Your plan also sets concurrency. The free trial allows 1 request at a time, Startup 15, Business 30, Growth 50, and the high-volume plans run from 200 to 1,500. Handle the overflow case defensively in anything unattended, because an agent that fans out will reach the ceiling before you do.

A request that comes back non-200 is not billed. A successful call that finds nothing is still a call.

## Tool selection

The `apis` query parameter decides which tools your agent sees. Fewer tools means less context spent on tool definitions, and fewer chances for the model to reach for the wrong one.

```
?apis=tiktok                     the four tools in this repo
?apis=tiktok,instagram           a social bundle
?apis=tiktok,google_serp         add Google search
```

The parameter takes provider names like `tiktok` and individual API names like `tiktok_search`. Misspelled names are ignored. If every name is wrong the request fails with 400, and the body lists both what it did not recognise and every valid value. Drop the parameter and the same endpoint exposes all 57 HasData tools.

## How it compares

TikTok's own developer program does not cover general reading of public content. The [Research API](https://developers.tiktok.com/products/research-api/) is gated behind an application and open to approved academic and nonprofit researchers in a limited set of regions. The Display API returns only the content of the account that signs in over OAuth. Neither fits an agent that needs to read an arbitrary public profile, its videos, or a video's comments.

| | Official TikTok APIs | This server |
| :--- | :--- | :--- |
| Access | Research API by application, or Display API for your own account | One key and one URL |
| Scope | Approved researchers, or your own authenticated account | Any public profile, video or search |
| Auth | Application review or OAuth | An `x-api-key` header |
| Comments of videos you do not own | Restricted | Yes, with reply threads |
| Setup | Developer account and approval | None |
| Writes and private data | Posting and your own account data over OAuth | Read-only, public data only |

Most other TikTok MCP servers wrap a single unofficial endpoint. This one covers the four reads an agent actually chains, profile to posts to comments, plus search, so a whole research pass runs against one server.

**What this server does not do.** No posting, no direct messages, no follower-only or private content, no analytics for accounts you do not own. It reads what a signed-out visitor can see.

## FAQ

### Is there an official TikTok MCP server?

TikTok does not publish one. Every option is built by somebody else. This one is maintained by HasData and reads public pages, which is why it needs no TikTok developer account.

### What is a TikTok MCP server?

A server that exposes TikTok data as tools an AI client can call. The client sends a tool call over the Model Context Protocol, the server fetches the data and returns structured JSON, and the model works with the result and never sees a page of HTML. This one exposes four tools and runs remotely. The client connects to a URL and starts no local process.

### Do I need a TikTok API key or a developer account?

No. The only credential is your HasData key. There is no developer application to file and no OAuth consent screen, because the tools read public TikTok pages and not the TikTok developer APIs.

### Do I need to host or run anything?

No. This is a remote MCP server on streamable HTTP. Nothing to install, no container to keep warm, no process to restart.

### Is the data live or cached?

Live. Each call fetches at request time and carries its own `requestMetadata.id`. Counters like plays and likes track the page, so they move as the page moves.

### Can I read a private account?

No. The tools return what a signed-out visitor sees. A private account's videos are not public, so they are not in any response.

### Can I read comment replies, not just top-level comments?

Yes. Call the comments tool with a comment's `id` as `commentId` and it returns that comment's replies. A comment's `replyCount` tells you whether there are any.

### Can I use this together with other HasData APIs?

Yes. The `apis` parameter takes a list, and `?apis=tiktok,instagram` gives your agent the four TikTok tools plus Instagram. [Drop the parameter](#tool-selection) and you get everything.

### Compliance and personal data

HasData accesses publicly available data only. A platform's terms may restrict automated access, and you are responsible for your own compliance. Where the data you collect includes personal information, make sure you have a lawful basis for it under GDPR, CCPA or the equivalent rules in your jurisdiction.

## HasData links

| | |
| :--- | :--- |
| Product page and request builder | [TikTok Scraper API](https://hasdata.com/apis/tiktok-scraper-api?utm_source=github&utm_medium=syndication&utm_campaign=tiktok-mcp) |
| Server documentation | [MCP server docs](https://docs.hasdata.com/mcp-server?utm_source=github&utm_medium=syndication&utm_campaign=tiktok-mcp) |
| All 57 tools in one server | [HasData/hasdata-mcp](https://github.com/HasData/hasdata-mcp) |
| Client walkthroughs | [MCP clients and integrations](https://hasdata.com/integrations/mcp?utm_source=github&utm_medium=syndication&utm_campaign=tiktok-mcp) |
| Everything else we scrape | [TikTok Scraper API and 54 more](https://hasdata.com/apis/?utm_source=github&utm_medium=syndication&utm_campaign=tiktok-mcp) |
| Plans and credit costs | [Plans and credit costs](https://hasdata.com/prices?utm_source=github&utm_medium=syndication&utm_campaign=tiktok-mcp) |
| Keys and usage | [HasData dashboard](https://app.hasdata.com?utm_source=github&utm_medium=syndication&utm_campaign=tiktok-mcp) |

## Development

This repository is configuration and documentation for a remote server. There is no build step and nothing to containerize.

The tests in `test/` assert the tool contract, the part that can break without a commit here. They check that `?apis=tiktok` returns exactly four tools, that every tool still declares its required parameter, that no name changed, and that the key in use is actually accepted. That last check calls a tool for real and costs 10 credits, which is the price of a canary that can fail for the right reason.

```bash
# macOS and Linux
HASDATA_API_KEY=your_key_here npm test

# Windows PowerShell
$env:HASDATA_API_KEY="your_key_here"; npm test
```

The same suite runs in CI on every push and once a week on a schedule, because the upstream tool list can change without anyone touching this repository. A failure means the tool list moved, the key stopped working, or the endpoint was unreachable, and the assertion message says which.

## Contributing

Corrections to the tool tables and the response samples are the most useful contribution, because those are the parts that drift. Include the call you made and the response you got. Pull requests from forks run the suite without a key, and the live checks skip instead of going red.

## License

MIT. See [LICENSE](LICENSE).

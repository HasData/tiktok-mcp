---
description: What an account posts on TikTok and which videos actually performed
---

Read an account's TikTok output.

Ask me for the handle if I have not given it, without the @.

Then:

1. Call `hasdata_tiktok_profile_getTikTokProfile`. Check that the response carries a `profile` object before reading it, because a handle that does not exist still answers 200 with `status` reading `ok` and only an `error` string inside. If it is missing, tell me the account was not found and stop.
2. Report `nickname`, `username`, whether it is `verified`, the biography, and the totals from `followers`, `likes` and `videos`.
3. Call `hasdata_tiktok_posts_getTikTokPosts` with the same handle. Follow `nextPageToken` while `pagination.hasMore` is true, up to the number of pages I asked for, and say how many posts you gathered.
4. Rank the posts by `plays`, and report `likes`, `comments`, `shares` and `duration` beside each one so I can see what the ranking rests on.
5. Give the engagement rate per post as likes plus comments plus shares over `plays`, and say which posts beat the account's own median rather than calling them viral.
6. Read the tags out of the `description` text. The profile feed carries no `hashtags` array, so anything claiming to be a tag list from this call would be parsed, not given.
7. Use `createTime` to describe the posting cadence and whether the strong posts are recent or old.

If I ask what people are saying about a video, pass its `posts[].id` as `videoId`, keeping it a string, check `pagination.total` first, and tell me how many of the comments you actually read.

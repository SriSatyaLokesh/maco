---
name: maco-triage
description: Classify an incoming GitHub issue or pull request in one pass - duplicate, out of scope, needs info, ready for review, or spam - and leave a single appropriate first response. Use when facing an inbox of new issues or PRs, or when asked to triage, prioritise, or decide what to reply to first.
license: MIT
compatibility: >-
  Requires `gh` (GitHub CLI 2.0+). Read-only unless the user explicitly asks for writes.
---

# MACO Triage

Triage exists to stop one thing: **an agent commenting on everything**. The
failure mode of AI triage is not being wrong, it is being verbose on all
hundred open issues, which trains humans to ignore it and costs more than it
saves.

## The rule

**Every open issue and PR gets at most one automated comment.** If the
classification is unambiguous and needs nothing from a human, post no comment
at all - just label it.

Silence is a valid triage outcome. Prefer it.

## Classification

Exactly one of these, highest match first:

| Class | Signal | Response |
|---|---|---|
| `spam` | Link farms, unrelated promotions, generated filler | Label, no comment, no human time |
| `duplicate` | Matches an existing open or recently-closed issue | Comment pointing at the original, close |
| `out-of-scope` | Contradicts `CONTRIBUTING.md` or a stated project boundary | Comment citing the boundary, close politely |
| `needs-info` | Cannot be reproduced or scoped without more from the reporter | Ask the specific missing question, label |
| `good-first-issue` | Real, small, well-bounded, no prior attempt | Label, point to `maco-contribute` |
| `ready` | For a PR: linked issue present, ACs mappable, diff coherent | Request review, label `maco:needs-review` |
| `stale` | No activity past the repo's stated window | Comment once, label. Never auto-close without a maintainer decision |

## Procedure

1. **Fetch in bulk**, one call, not N calls:

```
gh issue list --state open --limit 100 \
  --json number,title,body,labels,author,createdAt,comments
gh pr list --state open --limit 100 \
  --json number,title,body,labels,author,isDraft,createdAt,headRefName
```

2. **Classify using only title, labels and first paragraph.** Do not open
   every issue. If the first paragraph is not enough to classify, the class
   is `needs-info` - which is cheap and correct.

3. **Deduplicate before anything else.** Check the label `maco:triage` and
   the `comments` count. Never re-triage something already triaged. This is
   how agents end up arguing with themselves in the same thread.

4. **Apply the label** from `maco.json` -> `labels.triage`.

5. **Comment only for** `duplicate`, `out-of-scope`, or `needs-info`. For
   everything else, the label is the entire response.

## Response templates

`duplicate`:
> Looks like this is already tracked in #<n> (<title>), which is open as of
> <date>. Following that one keeps the discussion in one place. If your case
> differs in a way that issue does not cover, say which part and I will
> reopen this.

`out-of-scope`:
> This falls outside what <project> is taking on right now: <cite the specific
> boundary from CONTRIBUTING.md or README>. Not a judgement on the idea - the
> scope is just narrow on purpose. <If true:> contributions that fit the
> current scope are listed in #<n>.

`needs-info` - ask for **one** specific thing, not a list of questions:
> I need `<the one missing fact>` to reproduce this. Once I have that I can
> look at it properly.

## Rules

- **Never** close an issue without a human confirming, except `spam` and exact
  duplicates.
- **Never** comment twice on the same item.
- **Never** classify from the title alone when the body contradicts it.
- **Never** argue. A triage comment that draws a reply has failed - the
  conversation is now the maintainer's problem.
- Cheapest model role in `maco.json` is `triage`. Use it.

## Prioritisation, if asked

Rank by: (a) is it blocking someone else's work, (b) does it have a linked
issue with ACs, (c) age since creation, (d) contributor trust - a first-time
contributor's genuine bug outranks a drive-by from a frequent one. Output a
short ordered list. Do not re-triage while you prioritise.

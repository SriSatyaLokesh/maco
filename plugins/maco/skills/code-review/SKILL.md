---
name: code-review
description: Review a GitHub pull request in one pass against the linked issue's numbered acceptance criteria (AC-1..N) and this repo's own conventions. Use when asked to review a PR, audit a diff, check whether a PR satisfies its ACs, or act as a reviewer on open source work. Posts a single structured verdict comment. Read-only by default - never pushes code.
license: MIT
compatibility: >-
  Requires `gh` (GitHub CLI 2.0+) and a readable repository checkout. Read-only.
---

# MACO Review

One pass. One comment. No debate rounds.

This skill is the review engine of MACO. It is a **reviewer**, not a
orchestrator: it never spawns sub-agents, never loops, and never rewrites the
contributor's branch.

> **Why the directory is `code-review`**
> GitHub Copilot code review auto-loads skills from a review-focused directory
> name. Keeping this at `skills/code-review/` means Copilot picks it up with
> zero configuration. The `name` field stays `code-review` for that reason -
> do not rename the folder casually.

## Token discipline

This is the highest-volume MACO touchpoint, so it is budgeted hard.

- Read **only**: the diff, the linked issue's AC block, `CONTRIBUTING.md`,
  and the files the diff actually touches.
- Never read the whole repository. Never read the full issue thread.
- Never read files the diff does not touch, unless the diff deletes or
  rewrites a symbol they define.
- Target ceiling: **1,500 input tokens of repository content** per review.
  Exceeding that is a bug in your invocation, not a licence to read more.

## Inputs

| Input | Source | If missing |
|---|---|---|
| Diff | `gh pr diff <n>` | Stop - nothing to review |
| Acceptance criteria | `gh issue view <n> --json body -q .body` | Continue without AC mapping; say so in the verdict |
| Base conventions | `CONTRIBUTING.md`, then `docs/ARCHITECTURE.md` if present | Skip convention checks |
| Change intent | PR title + body, first paragraph only | Infer from diff; lower confidence |

Resolve the linked issue from the PR body (`Closes #12`, `Fixes #12`,
`Part of #12`) before any `gh` call beyond `gh pr view`.

## Procedure

1. **Anchor.** Read the diff once. List the files changed and, for each, the
   intent of the change in one clause. Do not comment yet.
2. **Map to ACs.** For each `AC-n` in the linked issue, decide one of:
   - `met` - you can point at a specific hunk that satisfies it
   - `partial` - some of it is satisfied
   - `missing` - no hunk addresses it
   - `untestable` - satisfied only by something the diff does not show
     (a manual step, a config change elsewhere, a comment claiming it)
   An AC you cannot map to a hunk is the most valuable thing you can report.
   Do not guess that it is met.
3. **Check for the four failures that actually matter.** In priority order:
   - **Missing AC coverage** - the PR does less than the issue asked.
   - **Unrequested scope** - the PR does more. Name the additions and ask
     whether they belong in a separate change.
   - **Convention violations** - only those stated in `CONTRIBUTING.md` or
     `ARCHITECTURE.md`. Do not invent house style.
   - **Correctness risk** - only where you can name the failing input or
     state. "Consider error handling" is not a finding.
4. **Assign severity.** `blocker` if it violates an AC, breaks a stated
   convention, or introduces a defect you can demonstrate. `warning`
   otherwise. `nit` for anything else - and collapse nits into one line.
5. **Post exactly one comment** with the template below.

## Never do these

- Never push, force-push, or create branches. Reviewers do not write code.
- Never post more than one comment per review. Batch every finding into it.
- Never restate the diff back at the author.
- Never raise a blocker you cannot describe concretely. If you cannot, it is
  a question, and questions go in the same comment as `questions`, not
  `blockers`.
- Never block on style the repo does not document.

## Verdict template

````markdown
## MACO Review

**Verdict:** `changes-requested` | `comment` | `approve`
**Confidence:** high | medium | low
*(low confidence = diff too large or ACs absent; say which)*

### Acceptance criteria

| AC | Status | Evidence |
|---|---|---|
| AC-1 | met | `src/foo.ts:42` |
| AC-2 | partial | `src/bar.ts:10-18` - handles empty case only |
| AC-3 | missing | no change addresses this |

### Blockers

1. **AC-3 unmet - `<one-line claim>`**
   `<file>:<line>` - <what the code does> vs <what AC-3 requires>.
   Fix: <the specific change, not "handle this properly">

### Warnings

- `<file>:<line>` - <issue>. <why it matters>

### Questions

- <anything you could not determine from the diff alone>

<sub>_Reviewed against `<issue-ref>` by MACO. Reply to this comment for a re-review._</sub>
````

## Re-reviews

If the PR has an existing MACO comment, read only that comment and the new
commits. Re-verify the ACs that were `partial` or `missing`. Do not re-report
warnings the contributor has already resolved. Post a fresh verdict comment
noting what changed; do not edit the old one.

## Local mode

This skill also works fully locally, which is the cheapest way to use MACO:
`gh pr checkout <n> && /code-review <n>`. Read the diff with
`git diff origin/<base>...HEAD` instead of `gh pr diff`. Nothing about the
review changes - only the transport does.

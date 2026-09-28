---
name: maco-contribute
description: Guide an open source contribution from issue claim to merged pull request - claim an issue, confirm acceptance criteria before writing code, open a conventionally-named branch, and respond to review feedback. Use when the user wants to contribute to a repo, pick up a GitHub issue, or get a PR ready to pass review first time.
license: MIT
compatibility: >-
  Requires `gh` (GitHub CLI 2.0+) with write access to a fork, and `git`.
---

# MACO Contribute

The contributor-side half of MACO. The review skill optimises for the
maintainer; this one optimises for the person submitting the PR.

The cheapest contribution is the one that never needed a review round. Every
step here exists to find out something before the reviewer has to ask.

## 1. Claim before you build

```
gh issue list --search "is:open is:issue label:good-first-issue" \
  --json number,title,labels,assignees
```

Never comment "I'd like to work on this" and start. That is the single
biggest source of wasted contributor effort in open source. Claim it, and
wait for assignment.

If no issues are labelled, look for `is:open is:issue label:maco:story` -
those already have numbered acceptance criteria and are the fastest path to a
merged PR, because the reviewer has nothing left to negotiate.

## 2. Read the ACs, then confirm only what is genuinely unclear

```
gh issue view <n> --json title,body,comments
```

Do not ask about anything the issue already answers. Before you comment back,
check you have actually read:

- the numbered acceptance criteria (`AC-1..N`)
- the scope boundary - what the issue explicitly does *not* cover
- any linked design doc or ADR

Post **one** comment listing the ACs you intend to satisfy, and naming only
the ACs that are genuinely ambiguous. Ambiguity is a legitimate question;
restating the issue is not.

```
gh issue comment <n> --body "..."
```

## 3. Branch and commit to the repo's grammar

Read `CONTRIBUTING.md` first. If it specifies a branch or commit format, that
format wins over anything below.

```
git switch -c <type>/<issue-number>-<slug>
# e.g. feat/142-note-timestamps
```

Commit subjects follow Conventional Commits when the repo does not specify
otherwise, and must reference the issue:

```
git commit -m "feat(notes): seek player on timestamp click

Closes #142"
```

One logical change per commit. Reviewers read the commit list before the diff.

## 4. Pre-flight before you open the PR

Run the deterministic checks yourself. Never hand a reviewer something a
compiler would have caught.

```
npm ci          # or the repo's documented install
npm test
npm run lint    # if present
```

Then use `maco-pr-ready` if it is available - it checks branch name, commit
grammar, PR body completeness and issue linkage in one pass.

## 5. Open the PR so the reviewer needs no questions

The PR body is the review's context budget. Include:

- what changed, in two sentences
- `Closes #<n>` - this is what lets the AC audit run at all
- how you verified it (the actual commands you ran, and their result)
- anything you deliberately did not do, and why

```
gh pr create --title "feat(notes): seek player on timestamp click" --body "..."
```

## 6. Respond to review

Review feedback is not a verdict on you. It is information you did not have.

- Address every blocker. Every one.
- If you disagree with a blocker, say so once, with a reason, and offer the
  alternative. Do not silently ignore it - a skipped blocker reads as a
  skipped blocker.
- `git push` the fix branch. Do not force-push onto a PR that has review
  history; the maintainer may be reading it.
- Re-request review only after the push lands.

## Scope discipline

The most common reason contributions stall is scope creep, not code quality.
If you found something else worth fixing, open a second issue or a second PR.
Do not fold it in "while I'm here" - you have now made the change unreviewable.

## If you are reviewing someone else's contribution

Use the `code-review` skill. This skill is for the contributor side only.

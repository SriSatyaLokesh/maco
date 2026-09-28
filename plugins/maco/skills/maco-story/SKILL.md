---
name: maco-story
description: Turn a rough feature request into a GitHub issue containing pure business logic and numbered acceptance criteria (AC-1..N), via a three-question interview. Use when asked to open an issue, spec out a feature, write a story, or break a request down before implementation. Strips all technical jargon from the output.
license: MIT
compatibility: >-
  Requires `gh` (GitHub CLI 2.0+) authenticated against the target repository.
---

# MACO Story

The intake skill. Three questions, one issue.

**Input:** a sentence of intent, from a maintainer.
**Output:** a GitHub issue a contributor can implement without asking a
follow-up question.

## Why the output is stripped of jargon

A contributor should not need to know your stack to know what you want. If the
issue says "add a Postgres trigger", the contributor must already know
Postgres, what a trigger is, and your schema. That is not a business
requirement. Push implementation into the issue body under a clearly marked
`Implementation notes` section that reviewers can ignore.

## Procedure

1. **Ask exactly three questions.** One at a time. Wait for each answer.
   - **Outcome** - "What can a user do that they cannot do today?"
   - **Edge cases** - "What should happen when X, Y or Z is missing, empty,
     duplicated, or arrives out of order?"
   - **Data boundaries** - "What is stored, who can see it, and what must
     never be stored?"

   If the request already answers one, skip it. Do not ask a question to
   appear thorough. Two questions is a valid intake.

2. **Strip jargon.** Walk the draft and remove every term that requires
   insider knowledge. `RLS policy` becomes "a user must never see another
   user's rows". Keep exact user-visible strings, error messages and numbers
   - those are requirements.

3. **Write numbered acceptance criteria.** `AC-1`, `AC-2`, ... Each must be:
   - a single observable outcome
   - independently verifiable
   - phrased so a test could be written from it alone
   - silent on *how* it is implemented

   Test: could a contributor who has never seen this codebase write a failing
   test for that AC? If not, rewrite it.

4. **Add the scope boundary.** An explicit "Out of scope" list. This is the
   highest-value part of the issue and the thing most issues omit. It is what
   prevents the "while I was in there" PR that stalls review.

5. **Publish.**

```
gh issue create \
  --title "<imperative summary, no ticket prefix>" \
  --body "$(cat <<'EOF'
## Outcome
<one paragraph, user-visible>

## Acceptance criteria
- AC-1 <observable outcome>
- AC-2 <observable outcome>

## Out of scope
- <explicit non-goal>
- <explicit non-goal>

## Open questions
- <only genuinely unresolved items, or "None">

## Implementation notes
<optional, non-binding, for reviewers>
EOF
)" \
  --label "maco:story"
```

Label comes from `maco.json` -> `labels.story`. If the label does not exist,
create it rather than dropping it: the label is what makes the issue
findable by `maco-contribute`.

## Rules

- **Never write code** in the output. This skill produces an issue, not a patch.
- **Never merge two requests** into one issue. Two outcomes, two issues.
- **Never invent an AC** the user did not agree to. If a criterion is your own
  inference, put it under `Open questions`, not under `Acceptance criteria`.
- If the request is a bug, do not use this skill. Write a reproduction
  instead - steps, actual, expected.
- Roughly 800 tokens. If you are over budget, you are writing implementation
  notes you did not need.

## Verify before publishing

- [ ] Every AC is independently testable.
- [ ] No term requires insider knowledge.
- [ ] `Out of scope` is non-empty. If you cannot write one, the issue is not
      ready - you do not yet know what it is.
- [ ] No sentence describes an implementation choice.

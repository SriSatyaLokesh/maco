---
name: Bug report
about: A skill said the wrong thing, or something is broken
title: ""
labels: ""
assignees: ""
---

<!--
Thanks for taking the time. Most MACO reports are "the agent said the wrong
thing", which is a real and valuable report. What makes it fixable is a real
artifact, not a paraphrase.
-->

## What happened

<!-- What did MACO do? Quote it verbatim. -->

## What it should have done

<!-- The assertion. "AC-2 was reported met, but the timestamp is never
     persisted" is fixable. "It was wrong" is not. -->

## The artifact

<!--
Link the issue, PR or diff. Real artifacts, redacted if needed - a synthetic
reproduction is very hard to act on.
-->

## Environment

<!-- All four. The same prompt behaves differently across hosts, and a bug that
     reproduces on one may not exist on another. -->

- **Skill:**
- **Host:** <!-- Claude Code / OpenCode / Copilot / Codex CLI / Antigravity -->
- **Model:**
- **Where it ran:** <!-- local / GitHub Actions -->

## Checks

- [ ] I searched existing issues for this
- [ ] I am not reporting a security problem (see [SECURITY.md](../SECURITY.md))
- [ ] The artifact is real, not invented

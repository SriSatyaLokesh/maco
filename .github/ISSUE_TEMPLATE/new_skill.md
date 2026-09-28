---
name: Skill proposal
about: Propose a new MACO skill
title: "[Skill]: <skill-name> - <imperative summary>"
labels: ["enhancement"]
assignees: ""
---

## Skill name

<!-- Lowercase, hyphen-separated. E.g. maco-changelog. The directory name must match. -->

## Trigger description

<!--
Third person, imperative, trigger shaped. Under 1024 characters.
This is the only text an agent host reads when deciding whether to activate the skill.
"Generate changelog entries from merged PR diffs" triggers;
"This skill helps you generate changelog entries" often does not.
-->

## The problem

<!-- What breaks today, or what manual workflow needs automation? -->

## Why existing skills do not cover it

<!--
Name the boundary. Which current skill is closest, and why does extending it fail?
A new skill must not dilute existing trigger accuracy.
-->

## Input and token budget

<!--
Every skill is budgeted like code. State the upper bounds:
- Lines of diff / trace / issue text read:
- Number of files touched:
- Estimated input token ceiling:
-->

## Negative constraints

<!--
What must this skill NEVER do?
Most of the value in MACO skills is in what they refuse to do.
Examples: never push to branch, never execute untrusted scripts, never post more than one comment.
-->

- Never 
- Never 
- Never 

## Tooling dependencies

<!--
MACO skills must only use `gh`, `git`, and `jq`.
Confirm no MCP servers, no vendor SDKs, and no runtime dependencies are needed.
-->

- [ ] Uses only `gh`, `git`, `jq`, and standard markdown
- [ ] Runs portably across Claude Code, Copilot, Codex, Antigravity, Gemini, Cursor, Windsurf, OpenCode, VS Code

## Eval test cases

<!--
How will you verify this skill with `maco-skill-eval`?
Provide three planned test scenarios:
1. Genuinely correct artifact
2. Defective / incomplete artifact
3. Edge case or budget-exceeding diff
-->

1. **Passing case:**
2. **Failing / missing case:**
3. **Budget / scope boundary case:**

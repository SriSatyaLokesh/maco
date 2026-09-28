# Changelog

All notable changes to MACO. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

MACO is pre-1.0, so minor versions may break skill output formats. Pin with
`gh skill install ... --pin <tag>` if you need reproducibility.

## [Unreleased]

Nothing yet.

## [0.1.0] - first release

First public release. Nine skills, the `maco@maco` Claude Code plugin, the
`.agents/skills/` mirror, two consumer workflow templates, and the full
community surface.

### Added

Seven interactive skills - these run in a session you already pay for, so they
are $0 marginal:

| Skill | Purpose |
|---|---|
| `code-review` | One-pass PR review mapped to the linked issue's `AC-1..N`. Posts one structured verdict, read-only. |
| `maco-story` | Three-question intake to a jargon-free issue with numbered ACs and an explicit out-of-scope list. |
| `maco-contribute` | Contributor path: claim, confirm ACs, branch, pre-flight, respond to review. |
| `maco-triage` | Classify an issue or PR queue. At most one comment per item; silence is a valid outcome. |
| `maco-pr-ready` | Deterministic pre-flight: linkage, branch name, commit grammar, body completeness, verification. |
| `maco-spec-to-issue` | Turns a PRD, architecture doc, ADR set, roadmap or traceability matrix into milestones and issues with ACs. Plans and dry-runs before it writes. |
| `maco-skill-eval` | Grades a skill's output against assertions written before the run. Names failure modes so a fix lands in the right layer. |

Two CI skills - bring your own provider key:

| Skill | Purpose |
|---|---|
| `maco-ac-audit` | Headless AC-to-diff mapping emitting strict JSON a workflow can gate on. |
| `maco-self-heal` | On red CI only: trace + diff + ACs to a minimal one-click `suggestion` patch. |

Distribution: the `maco@maco` Claude Code plugin reads `plugins/maco/skills/`
directly; Copilot, VS Code, Codex, Antigravity and OpenCode read the generated
`.agents/skills/` mirror. `scripts/maco.mjs detect` reports which hosts are
installed and prints the command for each.

### Packaging decisions worth recording

Three choices, each of which fails silently if reversed:

- **The mirror's provenance banner sits inside the frontmatter**, after the
  opening `---`, never before it. Frontmatter that does not begin at byte 0 is
  not frontmatter: a strict parser reads the whole file as body, the skill
  loads with no name and no description, and a skill that fails to load is
  indistinguishable from one that was never installed.
- **The mirror is a verbatim copy.** The generator never re-serialises
  frontmatter from parsed fields, so `license`, `compatibility`, `metadata`
  and multi-line descriptions cannot be dropped, and files under `references/`
  ship intact.
- **`validate` checks the mirror as well as the source.** The mirror is what
  five of the six supported hosts load, so validating only the source leaves
  the shipping artefact unchecked. It also reports ghost skills, a mirror file
  that does not open with `---`, and a missing or mismatched `name`.

`.gitattributes` forces LF in the working tree on every platform. With
`core.autocrlf` on Windows, CRLF would trip the validator's line-ending check
and break the byte-exact mirror comparison for every Windows contributor.

### Community surface

`CONTRIBUTING.md`, `AGENTS.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md` (including
the `pull_request_target` constraint and the per-role token table), `SUPPORT.md`,
this file, `CODEOWNERS`, `dependabot.yml`, and bug, feature and story issue
templates. `npm run validate` fails if any of them go missing, because a
marketplace plugin is judged on its onboarding before it is judged on its
skills.

No runtime dependencies. The scripts use Node built-ins only, which is what
keeps `npm run validate` reproducible and free.

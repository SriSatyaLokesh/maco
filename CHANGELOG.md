# Changelog

All notable changes to MACO. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

MACO is pre-1.0, so minor versions may break skill output formats. Pin with
`gh skill install ... --pin <tag>` if you need reproducibility.

## [Unreleased]

### Added

- `maco-spec-to-issue` - turns existing specification documents (PRD,
  architecture doc, ADR set, roadmap, traceability matrix) into a structured
  backlog of milestones and issues with numbered acceptance criteria. Plans and
  dry-runs before it writes; never files without one confirmation.
- `maco-skill-eval` - grades a skill's output against assertions written before
  the run, using real artifacts. Makes the manual test loop in `CONTRIBUTING.md`
  repeatable, and names failure modes (confident wrong, missing trigger, false
  trigger, over-confident, over-budget, drifted) so a fix lands in the right
  layer.

### Fixed

- **The generated skill mirror had its provenance banner before the YAML
  frontmatter instead of inside it.** Frontmatter that does not begin at byte
  zero is not frontmatter: strict parsers (gray-matter and similar) read the
  whole file as body, leaving the skill with no name and no description. Since
  `.agents/skills/` is the copy that 5 of the 6 supported hosts load, affected
  skills would not have loaded at all, and a skill that fails to load is
  indistinguishable from one that was never installed.
- The mirror is now a verbatim copy of the source with the banner injected after
  the opening `---`. It is no longer re-serialised from parsed frontmatter, so
  `license`, `compatibility`, `metadata` and multi-line descriptions can no
  longer be dropped or truncated by the generator.
- The mirror now includes every file in a skill directory, not just `SKILL.md`.
  Files under `references/` and `scripts/` were silently dropped, so a skill
  whose instructions pointed at them would have shipped broken.
- Removed mirrored skills with no source are deleted rather than left behind.
  A stale skill in the mirror keeps loading on every host.

### Added (packaging)

- `license` and `compatibility` frontmatter on all skills, per the agentskills.io
  specification. Both are copied verbatim into the mirror.
- `npm run validate` now checks the mirror, not only the source. Previously the
  copy that five hosts load was never validated, which is how the banner bug
  above shipped.
- `validate.mjs` reports ghost skills, a mirror file that does not open with
  `---`, a missing or mismatched `name`, and an over-length `description`.

### Documentation

- `SECURITY.md` - reporting path, the token each role needs, the
  `pull_request_target` constraint, and how to inspect a third-party skill
  before installing it.
- `SUPPORT.md` - where to ask, what makes a bug report actionable, and an
  explicit list of what is not a bug.
- `CODEOWNERS`, `CODE_OF_CONDUCT.md`, and bug / feature issue templates.
- `CONTRIBUTING.md` - added the rules that were previously only implicit:
  calibrate specificity per section, give a default rather than a menu, add
  what the agent does not know, keep long detail in `references/` with a stated
  trigger, and no runtime dependencies.

## [0.1.0]

Initial release. Seven skills, the `maco@maco` Claude Code plugin, the
`.agents/skills/` mirror, and two consumer workflow templates.

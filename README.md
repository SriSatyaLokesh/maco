# MACO

**M**aintainer-**A**ssisted **C**ontribution **O**rchestrator.

Portable AI pull-request review, acceptance-criteria gating, and CI
self-healing for GitHub. One plugin, six agent hosts, **your** model.

MACO is two-sided. It helps the **maintainer** decide which PRs are ready and
hands contributors a patch they can accept with one click. It helps the
**contributor** know what a PR needs before a human ever reads it.

---

## What it is not

Worth saying up front, because this is where agent tooling usually goes wrong.

- **Not a multi-agent council.** No debate rounds, no agent deadlock to
  manage, no TUI to babysit.
- **Not a vendor.** MACO never picks a model and never takes an API key. It
  declares *roles*; you map them to whatever you already pay for.
- **Not a bot that pushes to your contributors' branches.** The self-healer
  posts a suggestion. A human clicks it. That default is deliberate.
- **Not a replacement for `tsc`, ESLint, or your test suite.** A compiler
  catches type errors in 200ms for $0. An LLM is the fallback, not the first
  line.

## Cost

| Where MACO runs | Who pays | Cost |
|---|---|---|
| Interactive (`code-review`, `maco-story`, `maco-triage`) | you, in the session you already pay for | **$0 marginal** |
| CI (`maco-ac-audit`, `maco-self-heal`) | you, with your own provider key | your usage |

MACO adds no vendor. GitHub Actions minutes are free on public repositories, so
a public project can run the CI pieces at $0 too. `maco.json` carries a
`budget.maxRunsPerDay` guardrail, and the gate **fails open** - when the budget
is spent, a human comment replaces the model call rather than a red X.

## Install

```
# Claude Code
claude plugin marketplace add SriSatyaLokesh/maco
claude plugin install maco@maco

# everything else
npx skills add SriSatyaLokesh/maco --agent opencode
gh skill install SriSatyaLokesh/maco --agent copilot --scope project
```

Not sure which host you have?

```
node scripts/maco.mjs detect
```

### Portability

Claude Code loads `skills/` from *inside* a plugin directory. Every other host
- OpenCode, Copilot (CLI, cloud agent, **and code review**), VS Code agent
mode, Codex CLI, Antigravity - reads `.agents/skills/`, the agentskills.io
neutral path.

So MACO keeps one hand-written source of truth at
`plugins/maco/skills/` and generates one mirror at `.agents/skills/`:

```
plugins/maco/skills/   <- you edit here
        |
        |  npm run sync
        v
.agents/skills/        <- generated, committed, 5 hosts load this
        |
        v
Claude Code loads plugins/maco/skills/ directly
```

Copies, not symlinks - symlinks need elevation or developer mode on Windows,
and a marketplace consumer should not have to care about that. CI runs
`npm run check` and fails on drift, so the mirror can never quietly diverge
from the source.

Two details of the generator are load bearing, because getting either wrong
breaks the mirror *silently* on five of six hosts:

- **The provenance banner goes inside the frontmatter**, after the opening
  `---`, never before it. Frontmatter that does not start at byte 0 is not
  frontmatter: a strict parser reads the whole file as body, the skill loads
  with no name and no description, and a skill that fails to load looks exactly
  like a skill that was never installed.
- **The mirror is a verbatim copy.** The generator does not re-serialise
  frontmatter, so `license`, `compatibility`, `metadata` and multi-line
  descriptions cannot be dropped, and files under `references/` ship.

`npm run validate` checks the mirror as well as the source. Validating only the
source is what let the first of those bugs ship.

The `code-review` skill sits in a directory named `code-review` on purpose:
GitHub Copilot code review auto-loads skills from a review-focused directory
name, so Copilot picks it up with zero configuration.

## The skills

| Skill | Runs | What it does |
|---|---|---|
| [`code-review`](plugins/maco/skills/code-review/SKILL.md) | interactive | One-pass PR review mapped to the linked issue's `AC-1..N`. Posts exactly one structured verdict. Read-only. |
| [`maco-story`](plugins/maco/skills/maco-story/SKILL.md) | interactive | Three-question intake to a jargon-free issue with numbered ACs and an explicit out-of-scope list. |
| [`maco-spec-to-issue`](plugins/maco/skills/maco-spec-to-issue/SKILL.md) | interactive | Turns a PRD, architecture doc, ADR set or roadmap into milestones and issues with ACs. Plans and dry-runs before it writes. |
| [`maco-contribute`](plugins/maco/skills/maco-contribute/SKILL.md) | interactive | Contributor path: claim, confirm ACs, branch, pre-flight, respond to review. |
| [`maco-triage`](plugins/maco/skills/maco-triage/SKILL.md) | interactive / bulk | Classify an issue or PR queue. At most one comment per item; silence is a valid outcome. |
| [`maco-pr-ready`](plugins/maco/skills/maco-pr-ready/SKILL.md) | interactive | Deterministic pre-flight: linkage, branch name, commit grammar, body completeness, verification. |
| [`maco-ac-audit`](plugins/maco/skills/maco-ac-audit/SKILL.md) | **CI** | Headless AC-to-diff mapping that emits strict JSON a workflow can gate on. |
| [`maco-self-heal`](plugins/maco/skills/maco-self-heal/SKILL.md) | **CI** | On red CI only: trace + diff + ACs to a minimal one-click `suggestion` patch. |
| [`maco-skill-eval`](plugins/maco/skills/maco-skill-eval/SKILL.md) | maintainer | Grades a skill's output against assertions written before the run. For changing MACO, not for using it. |

Every skill is written against `gh`, `git` and `jq`. No harness-specific API,
no MCP server, no vendor SDK - that constraint is what makes 6-of-6 portability
real rather than aspirational.

### Which one do I want

- Specs written down, no backlog yet -> `maco-spec-to-issue`
- A rough idea you want turned into an issue -> `maco-story`
- An inbox you have not looked at this week -> `maco-triage`
- Somebody just opened a PR on you -> `code-review`
- You are about to open a PR -> `maco-pr-ready`
- You want to pick up work on someone else -> `maco-contribute`
- Your CI is red on a PR -> `maco-self-heal`, in CI
- You are changing MACO itself -> `maco-skill-eval`

## CI wiring

Copy the templates from [`.github/workflows/`](.github/workflows/) into your
repo and supply a provider call. Both workflows are **consumer templates** and
are not run against MACO's own repository.

- `maco-ac-audit.yml` - PR-triggered, advisory by default, budget-gated.
- `maco-self-heal.yml` - fires on `workflow_run` failure only, with the scope
  gate as a job condition so the model is never paid for a failure it should
  refuse.

The provider call is left as a stub on purpose. See
[docs/MODELS.md](docs/MODELS.md) for the four supported wirings and the
per-role tier guidance.

## Contributing

New skills are welcome, and the bar is lower than it looks: a real task you have
done, written down, with the budget it costs and the things it must never do.
Start with [CONTRIBUTING.md](CONTRIBUTING.md), and
[AGENTS.md](AGENTS.md) if you are an agent working on this repository.

```
npm run sync      # mirror plugins/maco/skills/ -> .agents/skills/
npm run check     # fail if the mirror is stale
npm run validate  # skills, mirror, marketplace manifest, config, community files, links
```

All three are deterministic and free. That is the point: MACO dogfoods its own
first automated check on itself, and it costs nothing.

## Community

- [Contributing](CONTRIBUTING.md) - the workflow, the style, and how to test a skill
- [Code of conduct](CODE_OF_CONDUCT.md) - participation standards
- [Security](SECURITY.md) - reporting a vulnerability, and MACO's threat model
- [Support](SUPPORT.md) - where to ask, and what is not a bug
- [Changelog](CHANGELOG.md) - release history

## Design

Full reasoning, including the alternatives that were rejected and the
measurements behind them, is in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
Model roles and how to wire a provider are in
[docs/MODELS.md](docs/MODELS.md).

A generated map of how the parts connect is in
[docs/codebase-map/](docs/codebase-map/README.md). It is a one-time snapshot
and nothing regenerates it.

## License

MIT. See [LICENSE](LICENSE). Copyright (c) 2026 Satya
([@SriSatyaLokesh](https://github.com/SriSatyaLokesh)).

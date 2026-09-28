# Contributing to MACO

## The one rule

**A skill is a prompt. Budget it like code, because it is code.**

Every skill states its own input limits - how many lines of trace, how many
files, how many tokens. When you add a skill or change one, carry that budget
with it. A skill that reads the whole repository to review a diff has
defeated the entire project.

The second rule, which follows from the first: **state the negative
constraints.** Most of the value in these skills is in what they refuse to do.
A skill that lists what it must never do is safe to extend. A skill that only
lists what it should do gets a new capability added to it by the next
contributor, and nobody notices when the capability was wrong.

## Workflow

```
plugins/maco/skills/<name>/SKILL.md   # you edit here
        |
        |  npm run sync
        v
.agents/skills/<name>/SKILL.md        # generated - do not hand-edit
```

```bash
npm run sync       # mirror skills into .agents/
npm run check      # fail if the mirror is stale
npm run validate   # skills, mirror, manifest, config, internal links
npm test           # runs check and validate
```

Commit the source **and** the regenerated mirror in the same commit. CI fails
on drift.

### Why the mirror is generated and not symlinked

`.agents/skills/` is the copy that 8 of the 9 supported hosts actually load:
Copilot (CLI, cloud agent and code review), VS Code agent mode, Codex CLI,
Google Antigravity, Google Gemini, Cursor, Windsurf, and OpenCode. Only Claude
Code reads the plugin's own `skills/`.

Symlinks would be tidier, but they need elevation or developer mode on Windows,
and a marketplace consumer on Windows should not have to think about that. So
it is a copy, generated, with a provenance banner inside the YAML frontmatter
and verified in CI. If you edit a mirrored file by hand, `npm run check` will
tell you, and it will be right to.

## Adding a skill

Start by opening an issue using the [Skill proposal](.github/ISSUE_TEMPLATE/new_skill.md) template.

1. `plugins/maco/skills/<name>/SKILL.md`
2. YAML frontmatter with `name` and `description`. The `name` must match the
   directory. The description must be third person, imperative, and trigger-
   shaped - it is the only text a host reads when deciding whether to load
   your skill. "Review a pull request" triggers. "This skill reviews pull
   requests" frequently does not.
3. Add `license` and `compatibility`. Both are spec fields, and the mirror
   copies them verbatim, so they reach the hosts that show them.
4. State the token/input budget in the skill body. It is not decoration.
5. State what the skill must never do. This is the part future maintainers
   will thank you for.
6. Put anything long in `references/`, and say in the body exactly when to read
   it. A reference file the agent never opens is dead weight; a reference file
   the agent opens eagerly costs you the budget you were trying to save.
7. Add the table row to the README.
8. `npm run sync && npm run validate`.

## Editing a skill

- Keep frontmatter `description` under 1024 characters; `npm run validate`
  fails above that.
- Keep the body under 500 lines and roughly 5,000 tokens. Everything the agent
  reads on every activation competes with the conversation for attention.
- Do not rename the `code-review` directory. GitHub Copilot code review
  auto-loads skills from a review-focused directory name. If it is renamed,
  Copilot silently stops loading it.
- Calibrate specificity per section, not per skill. Be **prescriptive** where
  an operation is fragile and a wrong order breaks something (`pull_request_target`
  must never check out untrusted code). Be **explanatory** where several
  approaches are valid and the agent should use judgement (what makes an
  acceptance criterion genuinely testable). A skill that is uniformly rigid is
  as wrong as one that is uniformly vague.
- Give a default, not a menu. If several tools would work, pick one and note the
  escape hatch in a clause.
- Add what the agent does not already know. Do not explain what HTTP is, what a
  GitHub milestone is, or what a pull request is. The agent knows. Spend the
  tokens on your conventions, your failure modes, and the specific things it
  would otherwise get wrong.
- Use LF endings and spaces. Tabs and CRLF are warned on.
- No em dashes in skill text, no marketing tone, no exclamation marks.

## Testing a skill

There is no unit test for a prompt. Use the
[`maco-skill-eval`](plugins/maco/skills/maco-skill-eval/SKILL.md) skill, which
runs a skill against real artifacts and grades it against assertions you write
**before** the run. The three canonical cases, in
`plugins/maco/skills/maco-skill-eval/references/eval-cases.md`, are:

- A real PR that is genuinely correct - it must come back `approve`.
- A real PR that skips one AC - it must come back `changes-requested` with that
  AC named as `missing`.
- A 2,000-line refactor diff - it must refuse or mark confidence low, not
  produce a confident partial review.

Run the whole case set when you change a skill, not just the case that
motivated the change. The regression is the failure mode worth hunting.

The failure mode worth hunting hardest is the **confident wrong verdict**. An
agent that says "I cannot determine this" is fine. An agent that invents an AC
mapping is how a project loses its contributors.

## Style

- Markdown. No framework, no templating engine. If it needs a renderer to be
  read, it cannot be reviewed in a diff.
- `gh`, `git`, `jq`. Nothing else. A skill that needs a fourth tool is a
  skill that will not run on a contributor's machine.
- Second person, imperative, present tense.
- State the negative constraints. Most of the value in these skills is in what
  they refuse to do.
- No em dashes in skill text, no marketing tone, no exclamation marks.

## Adding a CI workflow template

Workflows in `.github/workflows/` are **templates shipped to consumers**.
`ci.yml` validates their syntax; the others are not run against this repo.
A YAML error in a template is invisible until someone installs MACO, which is
why `ci.yml` parses them.

If you add a provider-specific adapter, reconsider. Four adapters to maintain
outlive the convenience; the docs show four wirings in about fifteen lines.

## Adding a dependency

Do not. MACO has no runtime dependencies and the scripts use only Node
built-ins, which is what keeps `npm run validate` reproducible and free. A
dependency is a permanent maintenance obligation, and the portability argument
in `docs/ARCHITECTURE.md` depends on skills running with `gh`, `git` and `jq`
and nothing else. If you genuinely need one, open an issue first and make the
case.

## Before you open a PR

```bash
npm run sync && npm run validate
```

If your change adds a label, it must be declared in `maco.json` -> `labels`.
`validate` cross-checks the labels referenced in skills, agents and workflows
against the config, because a typo there produces a silently missing label at
runtime.

## Reporting bugs in skills

See [SUPPORT.md](SUPPORT.md). The short version: a real artifact plus what it
said plus what it should have said is worth ten synthetic reproductions.

# Support

## Before opening anything

Most questions have a deterministic answer already written down:

| Your question | Read this |
|---|---|
| How do I install this on my agent? | [README](README.md#install) |
| Which host is mine? | `node scripts/maco.mjs detect` |
| Which model should each role use? | [docs/MODELS.md](docs/MODELS.md) |
| How do I wire a provider into the CI workflows? | [docs/MODELS.md](docs/MODELS.md#wiring-a-provider-into-the-ci-workflows) |
| Why is it built this way? | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |
| How do I change or add a skill? | [CONTRIBUTING.md](CONTRIBUTING.md) |
| Something is wrong or exploitable | [SECURITY.md](SECURITY.md) |

## Where to ask

- **A bug in MACO** -> an issue. See the templates.
- **A pull request** -> a PR. `npm run sync && npm run validate` first.
- **Security** -> private reporting, *not* an issue. [SECURITY.md](SECURITY.md).
- **"Will this work with my setup?"** -> a discussion. Do not open an issue for
  a question.

## What makes a bug report useful

MACO's skills are prompts, so most reports are "it said the wrong thing". That
is a real report, and it is the most valuable kind. Include:

1. **The skill name.**
2. **The input** - the issue, PR, or diff. Real artifacts, redacted if needed.
   A synthetic reproduction is very hard to act on.
3. **What it said**, quoted.
4. **What it should have said.**
5. **The host and model.** The same prompt behaves differently on different
   hosts, and a bug that reproduces on OpenCode may not exist on Claude Code.

If you hit a wrong verdict, you can run the systematic version yourself with the
[`maco-skill-eval`](plugins/maco/skills/maco-skill-eval/SKILL.md) skill. An eval
report with a real fixture is usually enough to fix the skill without any
follow-up questions.

## What is not a bug

- **The model ignored a rule in the skill.** Usually a model that is too weak
  for the role. Check [docs/MODELS.md](docs/MODELS.md) - the most common
  misconfiguration is a frontier model missing from `acAudit` or, more often, a
  cheap model doing work that needs `selfHeal`-grade reasoning.
- **A skill did not trigger.** Read the `description` field first; it is the
  only text the host sees when deciding. Report it as a missing or false
  trigger, and name the prompt you used.
- **The self-healer did not fire.** It is scoped to the workflow it watches.
  Check the trigger name matches and that the failure was not classified
  transient.
- **Cost is higher than expected.** Check which role ran. `budget.maxRunsPerDay`
  counts runs, not tokens.

## Response

MACO is maintained by one person. Expect:
- Acknowledgement of a good issue within a few days.
- A fix, or a reason it will not be fixed, within a few weeks.
- Silence on anything that turns out to be a configuration question.

That last one is not rudeness. It is the same discipline the skills are built
on: a maintainer who answers everything answers nothing, and the point of this
project is to remove the human bottleneck rather than relocate it.

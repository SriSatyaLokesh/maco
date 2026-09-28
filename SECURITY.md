# Security Policy

## Reporting a vulnerability

**Do not open a public issue for a security problem.**

Use GitHub's private reporting: `Security` -> `Report a vulnerability` on the
repository. If that is unavailable to you, open an issue whose entire body is
"security report, please open a private channel" and nothing else. Details move
to a private channel from there.

There is no monitored security mailbox. If you need one before launch, set it up
here rather than shipping a placeholder that bounces.

Include: what you did, what you expected, what happened, and the version or
commit. Expect an acknowledgement within a few days and a fix or an explanation
within a few weeks.

## Threat model

MACO runs agents with your credentials, in your repository, against pull
requests from people you do not know. That is the whole design, so the
interesting risks are specific.

### What MACO does with your token

| Role | Needs | Why |
|---|---|---|
| `maco-story`, `maco-spec-to-issue` | Issue write | Creating stories and issues |
| `maco-triage` | Read, plus the writes you approve | Labelling and first responses |
| `maco-pr-ready` | Read | Deterministic local checks |
| `code-review` | **Read only** | It posts a comment. It never pushes. |
| `maco-ac-audit` | Read on the diff | Gate only |
| `maco-self-heal` | Read on the diff | Posts a suggestion block |

If any MACO workflow asks for a token that can push to a contributor's branch,
that is a bug. Report it.

### The two failure modes worth defending against

**Untrusted code executing with a privileged token.** The audit template uses
`pull_request_target` so the workflow can read the PR. That trigger runs with
your repository's secrets in scope, so **it must never check out the PR head or
run any code from it.** It fetches the diff as text through `gh` and nothing
more. If you add a step that runs untrusted code under that trigger, you have
introduced a remote code execution vulnerability.

Verify before you extend: no `actions/checkout` of the PR head, no
`npm install` of PR-supplied manifests, no script from the diff under
`pull_request_target`. The self-heal workflow does not use that trigger at all,
precisely to avoid the problem.

**Agent over-reach.** An agent that pushes to a contributor's branch rewrites
someone's work without consent. MACO posts `suggestion` blocks and lets a human
click. Keep it that way. A "helpful" push from a bot is indistinguishable from
an attack to the person whose branch it touched.

### Installing third-party skills

If you install a MACO skill, you are installing a prompt that runs with your
permissions. There is no sandbox, because a skill has no sandbox to run in.

```bash
gh skill preview OWNER/REPO SKILL     # read it before you install it
```

Read it the way you would read a shell script you were about to run with your
credentials. This is not hypothetical caution: `gh skill` itself warns that
skills are not verified and may contain prompt injections.

## Security properties MACO maintains

These are enforced in CI and are the things to keep true when changing anything:

- `maco.json` holds roles and labels, **never** a model name, a key, or a
  vendor endpoint. MACO does not make model choices.
- API keys live in repository **secrets**. Repository *variables* are visible
  in the Actions UI to anyone with read access and leak through stray `set -x`.
- `budget.maxRunsPerDay` is a cost guardrail, not a security control. It counts
  runs, not tokens. Do not describe it as a limit.
- `failOpen: true` is the default. When the budget is spent the gate degrades
  to a human comment. A budget stop must never become a red X on a
  contributor's PR, and it must never silently pass a bad review either, which
  is why it degrades to a *comment* rather than a green check.
- Skills call `gh`, `git` and `jq`. No MCP server, no vendor SDK, no
  arbitrary code execution. This is a portability constraint and a security
  one, and it should not be relaxed for convenience.

## Supported versions

MACO is pre-1.0. Fixes land on `main` and are published as a release tag. There
is no long-term support branch. Pin with `--pin` in `gh skill install` if you
need reproducible installs.

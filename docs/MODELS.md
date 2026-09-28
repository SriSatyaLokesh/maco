# Models

## MACO does not choose your model

This is the single most important design decision in the project, and it is a
constraint rather than a feature.

MACO declares five **roles**. You map each role to a model ID your provider
understands, in `maco.json` -> `models.roles.<role>.default`, or leave it
`null` and let the host agent decide. MACO never bundles a vendor SDK, never
reads an API key, and never names a default.

The reason is distribution. A tool that hard-codes a model cannot be installed
by someone who pays for a different one, and a marketplace plugin that
requires a particular vendor's key is a plugin with a ceiling on its audience.

## The roles

| Role | Runs | Frequency | What it needs |
|---|---|---|---|
| `triage` | interactive / bulk | high | Cheap. Short classification over text you already have. |
| `intake` | interactive | low | Nothing special - it runs in the session you already pay for. |
| `acAudit` | **CI, every PR** | highest | Cheap *and* fast. Mechanical diff-to-AC mapping. |
| `selfHeal` | **CI, on failure only** | low | Real reasoning over a diff plus a trace. |
| `escalation` | rare | very low | Frontier. Only for contested or ambiguous reviews. |

Two of the five are CI roles, and those are the only ones with a metered cost.
Everything interactive is $0 marginal because it runs inside a session you are
already paying for.

## Tier guidance

MACO will not default you to a vendor, but it can tell you what each role
demands. Prices below are indicative per million tokens and will drift - check
your provider.

| Tier | Suits | Typical shape of a model here |
|---|---|---|
| Cheap + fast | `triage`, `acAudit` | Small fast model. A frontier model here is waste; these tasks are classification. |
| Mid | `selfHeal` | Needs to read a diff and a stack trace and produce a correct minimal patch. |
| Frontier | `escalation` | Ambiguous blockers, multi-file reasoning, disputes between agents. |
| Anything | `intake` | Whatever you already pay for locally. |

The single most common misconfiguration is a frontier model on `acAudit`. It
is the highest-frequency role and the most mechanical. It will cost several
times more and be no more accurate at mapping a diff to a list of criteria.

## Wiring a provider into the CI workflows

The two workflow templates ship with the model call stubbed out. That is
deliberate - a provider adapter is four lines of curl or one third-party action,
and shipping five of them would be four more things to maintain and break.

Pick one:

**1. Your provider's GitHub Action.** If your provider ships one, use it and
delete the stub step in `maco-ac-audit.yml`.

**2. A curl call.** Most providers are OpenAI-shaped. Replace the `Run AC audit`
step:

```yaml
- name: Run AC audit
  id: audit
  env:
    PROVIDER_URL: ${{ vars.MACO_PROVIDER_URL }}
    PROVIDER_KEY: ${{ secrets.MACO_PROVIDER_KEY }}
    MODEL: ${{ vars.MACO_AC_AUDIT_MODEL }}
  run: |
    set -euo pipefail
    jq -n --rawfile skills .agents/skills/maco-ac-audit/SKILL.md \
          --rawfile diff /tmp/pr.diff \
          --rawfile issue /tmp/issue-body.md \
          '{model: env.MODEL, messages: [
            {role: "system", content: $skills},
            {role: "user", content: ("Diff:\n" + $diff + "\n\nIssue:\n" + $issue)}
          ]}' > /tmp/payload.json
    curl -sS "$PROVIDER_URL" \
      -H "Authorization: Bearer $PROVIDER_KEY" \
      -H "Content-Type: application/json" \
      -d @/tmp/payload.json \
      | jq -r '.choices[0].message.content // .content[0].text' > /tmp/verdict.txt
```

**3. `gh aw`.** If you already use GitHub Agentic Workflows, this is the least
code. Note it is a technical-preview framework - keep the hand-written
fallback.

**4. A self-hosted runner** that already has your CLI of choice authenticated.

## Security

- Store the key in a **repository secret**, never a variable. Repository
  variables are visible in the Actions UI to anyone with read access and are
  routinely leaked in logs by a stray `set -x`.
- Scope the key as narrowly as your provider allows. `acAudit` and `selfHeal`
  never need write access to your repository - they post through `GITHUB_TOKEN`.
- Set an explicit spend limit at the provider. `maco.json` ->
  `budget.maxRunsPerDay` is a courtesy gate against runaway cost, not a
  security control. It counts runs, not tokens, and a single run with a large
  diff is not bounded by it.
- `pull_request_target` in the audit workflow runs with a privileged token.
  It fetches the diff via `gh` rather than checking out untrusted head code -
  keep it that way, and never add a step that executes a checkout of the PR
  head under `pull_request_target`.

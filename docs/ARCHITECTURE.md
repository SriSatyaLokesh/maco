# MACO architecture

This records the decisions that shaped MACO, the alternatives that were
rejected, and the reasoning. It exists so a future maintainer does not have to
rediscover why the obvious approach was the wrong one.

## 1. The design constraint that decides everything else

**MACO must be installable by someone who pays for a different model.**

That single constraint rules out bundling a vendor SDK, bundling an API key
exchange, and defaulting to any particular model. It is why the project
declares *roles* instead of models, and why the CI workflows ship with the
provider call stubbed rather than wired.

A marketplace plugin that requires one vendor's key has a ceiling on its
audience set by someone else's pricing page.

The second-order consequence: skills must not depend on any harness-specific
API. Every skill in MACO is written against `gh`, `git` and `jq`. That is what
makes 6-of-6 host portability real instead of aspirational - the skills are
transport-independent, and the host only has to be able to read a markdown
file and run a shell command.

## 2. Skill distribution

### The problem

Claude Code loads `skills/` from **inside** a plugin directory. No other host
does. Every other host reads `.agents/skills/`, the agentskills.io neutral
path. So a naive plugin gets its skills into 1 of 6 hosts.

### Measured discovery paths

| Host | `.agents/skills/` | `.claude/skills/` | Notes |
|---|---|---|---|
| OpenCode | yes | yes | reads all three of its own, `.claude`, `.agents` |
| GitHub Copilot (CLI, cloud agent, code review) | yes | yes | auto-loads code-review/ from workspace |
| VS Code agent skills | yes | yes | |
| Codex CLI | yes | no | |
| Antigravity | yes | no | native auto-discovery in workspace root |
| Google Gemini | yes | no | agentskills.io standard |
| Cursor | yes | no | reads .agents/skills/ in project |
| Windsurf | yes | no | reads .agents/skills/ in project |
| Claude Code | no | yes | via the plugin's own `skills/` dir |

### The decision

```
plugins/maco/skills/   <- hand-written source of truth
        |
        |  npm run sync  (scripts/sync-skills.mjs)
        v
.agents/skills/        <- generated, committed
```

One generated mirror, one direction, checked in CI with `npm run check`.
Claude Code reads the source directory directly. Everyone else reads the
mirror. 6 of 6, one script, no symlinks.

### Why copies and not symlinks

Symlinks on Windows require elevation or developer mode. A marketplace consumer
installing a plugin should not have to enable developer mode because the
plugin author preferred symlinks. Copies plus a drift check in CI is more
robust than a symlink, and drift is caught rather than assumed away.

### Two invariants the generator must not break

The mirror is the copy 5 of the 6 hosts load, so a defect in it is a product
defect, and it fails *silently*: a host whose frontmatter parser is strict
simply does not load the skill, and a skill that does not load is
indistinguishable from one that was never installed.

1. **The provenance banner goes inside the frontmatter**, after the opening
   `---`. Never before it. A `#` comment line ahead of `---` means the file no
   longer begins with frontmatter; strict parsers (gray-matter and similar)
   treat the whole thing as body, and the skill arrives with no name and no
   description, so nothing triggers it.

2. **The mirror is a verbatim copy.** The generator inserts the banner and
   changes nothing else. It must not re-serialise frontmatter from parsed
   fields, because a regex that guesses where a value ended will truncate a
   multi-line `description` and will drop `license`, `compatibility` and
   `metadata` entirely - fields the specification defines and hosts display.
   Sidecar files under `references/` and `scripts/` are copied as-is, so a
   skill whose instructions point at them still works.

`npm run validate` checks the mirror as well as the source. Validating only the
source is precisely what let the banner bug ship in the first place.

### Why `code-review` and not `maco-review`

GitHub documents that Copilot code review auto-loads skills from a
review-focused directory name. The folder is named `code-review` so Copilot
picks it up with no configuration. This is an awkward naming compromise
imposed by a host's convention, and it is worth knowing about before anyone
"tidies" it.

### Why no custom installer

`gh skill install OWNER/REPO SKILL --agent <host>` already installs to the
correct directory for the host. `npx skills add` covers the rest. Writing a
fourth installer would be more code to maintain for no capability. The
installer here, `scripts/maco.mjs`, only **detects** hosts and prints the
command to run.

## 3. One-pass review, not a council

The obvious design for AI review is several specialised agents that debate a
diff until consensus. MACO does not do this, for reasons that are measurable
rather than aesthetic:

- A council burns **40,000-60,000 tokens per PR**. A single frontier model
  reviewing the same diff against the same acceptance criteria in one pass
  costs roughly **1,500**. That is a ~96% reduction.
- A council takes **3-5 minutes**. A single pass takes **15-30 seconds**.
- Councils deadlock. Two reviewers arguing about whether a constraint is an
  acceptance criterion or an architectural boundary is a very common failure,
  and it consumes the maintainer's attention to resolve.
- Consensus requirements convert model uncertainty into *process* cost. A
  4-of-4 unanimity rule means one dissent blocks a merge, so the dissent has to
  be adjudicated by a human anyway.

Where determinism is available, determinism wins. `tsc`, ESLint, Dependency
Cruiser and the test suite already enforce boundaries at 200ms with zero
hallucination. An LLM is the fallback for the residue that genuinely needs
judgement, not the first line of defence.

## 4. The one automated comment rule

Every MACO skill that can comment on GitHub posts **at most one comment per
item, ever.**

The failure mode of AI triage is not being wrong. It is being verbose across a
hundred open items, which trains humans to ignore it and costs more than it
saves. Silence is a valid outcome, and for most of a triage queue it is the
correct one - a label is the entire response.

This is enforced three ways: in the skill text, in the `maco-triage-agent`
subagent prompt, and in the workflows (the re-review rule explicitly does not
re-report resolved warnings).

## 5. The self-heal scope gate

The self-healer is the component most likely to do damage, because it is the
only one that proposes code changes. Its gate is deliberately narrow:

- A failing **test** is a report about the implementation, not a typo. An
  agent that patches failing tests is an agent that deletes evidence. This is
  a **job condition** in the workflow, not a prompt instruction.
- Diff over ~20KB is refused. The root cause is not in it.
- More than one file, a public interface, a schema, or a dependency change is
  refused. Those need a human.
- If the root cause cannot be stated in one sentence, the outcome is
  `needs-info`, not a patch.
- Pushing is **off** by default. A bot pushing to a contributor's branch is the
  fastest available way to lose contributor trust.

Refusing is a success condition. A confidently wrong patch teaches maintainers
to ignore the next one, and the second patch is where the real cost lands.

## 6. Cost

| Surface | Cost | Why |
|---|---|---|
| All interactive skills | $0 marginal | runs in a session the user already pays for |
| CI skills | user-set | user supplies their own provider key |
| Public repo CI | $0 | GitHub Actions minutes are free on public repositories |

MACO adds a **capability**, not a **vendor**. A prior architecture in this
project's lineage was killed by adding a fifth vendor, so "does this introduce
a new bill?" is a permanent design question, not a per-release one.

`budget.maxRunsPerDay` is a courtesy guardrail, not a control. It counts runs,
not tokens; a single run over a large diff is unbounded by it. Real spend
limits belong at the provider.

## 7. What is deliberately absent

- **No MCP server.** It would add a process, a transport, and a failure mode to
  gain nothing that `gh` does not already provide.
- **No state machine, TUI, or port manager.** A maintainer reviews PRs in the
  GitHub web UI and on a phone. Anything requiring a local checkout and a
  running process to be useful will lose the contributors it is meant to serve.
- **No AST knowledge graph.** A maintained-incrementally code graph is a large
  ongoing maintenance burden for a benefit that ripgrep plus a file list
  captures for review purposes.
- **No vendored prompt framework.** Skills are plain markdown. Anything that
  cannot be read in a text editor cannot be reviewed by a human, and an
  unreviewable prompt is an unreviewable security surface.

## 8. Trade-offs accepted

| Accepted | In exchange for |
|---|---|
| No AST-level review | Contributors get a fast, non-blocking first pass; deep analysis stays a human or IDE concern |
| Advisory CI by default | Zero false-positive-blocked PRs on day one; enforcement is a one-line opt-in once measured |
| Stubbed provider calls in templates | Four fewer adapters to maintain, at the cost of a five-line copy-paste for the consumer |
| One generated mirror on disk | Reproducible installs and diffable changes, at the cost of a sync step enforced in CI |
| Narrow self-heal gate | Many real failures go unhealed - the alternative is wrong patches, which are more expensive |

## 9. Decisions closed

- **Naming. Resolved: MACO stands.** The project began as "Multi-Agent
  Orchestrator" and was pivoted away from multi-agent into a two-sided review
  and contribution tool. The name is kept as the brand, and the expansion
  recorded in `package.json`, `plugin.json` and the README is
  *Maintainer-Assisted Contribution Orchestrator*, which describes the product
  as it actually is. Nothing in the code depends on the expansion, so changing
  it later is a one-line edit in three files and a release note.

## 10. Open questions

- **Enforcement default.** The AC audit is advisory. When a public project has
  measured its false-positive rate, the default should flip. Until then
  advisory is the correct default, because a blocked PR from a bad first
  release costs contributors permanently.
- **Windows-first CI. Resolved:** `ci.yml` runs a dual-OS matrix over
  `ubuntu-latest` and `windows-latest` to validate path and line-ending
  assumptions on both platforms on every pull request.
- **Eval harness.** `maco-skill-eval` defines the method and the three
  canonical cases, but the cases are run by hand. Automating them means
  something can execute a skill against a fixture and diff the verdict, which
  needs a host-independent runner and a decision about which model to use for
  the reference output. Deferred until there is a second maintainer to disagree
  about the grading.
- **Real adoption numbers.** Every cost claim in this document is a projection
  from a single model call. The first honest measurement is a month of real
  PRs, and the numbers should be replaced with it rather than refined by
  estimate.

# Reading unfamiliar spec documents

Load this when the repository's documents use conventions you do not recognise,
or when the scope boundary in step 2 is genuinely ambiguous.

## Locating the boundary

Search patterns, in order of how often they actually appear:

| Pattern | Where it lives | Reliability |
|---|---|---|
| `## Non-goals`, `## Out of scope`, `## Explicit non-goals` | PRD, architecture | Highest. Written under pressure, rarely revised. |
| A table with a `Rejected` column | Trade-off register | High. Each row is a decision not to build something. |
| A `Revisit when` column | Trade-off register | High. Tells you which decisions are provisional. |
| `C1`, `C2`, numbered constraints | Constraints table | High, and the constraints are quotable as ACs. |
| A compliance or policy section | Varies | High, and non-negotiable. |
| `status: superseded` / `rejected` | ADRs | Reliable for *exclusion*. |

A decision not to build something, written down, is a stronger scope signal
than a paragraph describing what the project does.

## When a document must be read in full

Some documents cannot be decomposed from structure. A short design decision
record, or a section that is entirely one long argument, is fine to read
whole. Flag it:

> `docs/DATABASE.md` cannot be decomposed from headings - the tables are the
> spec. Read in full. Skipping the RLS section would produce issues that
> violate the authorisation model.

If several documents need this, stop and say so rather than working through
them silently. A backlog generated from a partially-read authorisation model is
worse than no backlog.

## Contradictions

When two sources disagree, the useful output is not a decision. It is an issue:

> **Title:** Spec conflict: quota refresh window
> `ARCHITECTURE.md 8.3` says the sweep runs nightly.
> `COST.md` tripwire 3 says refresh is skipped below a budget floor.
> These imply different retry behaviour when quota is exhausted at 23:00.
> Blocks #4 and #7.

Filing the conflict unblocks the dependent work and is itself a small, real
contribution. Silently picking a side hides it until a contributor builds the
wrong thing.

## Decomposition heuristics that survive contact

- **One observable outcome per issue.** If you cannot describe the change in a
  sentence a user could observe, it is more than one issue.
- **A constraint is not a task.** "Must run under 10ms CPU" is an AC on the
  task that needs CPU, not an issue of its own.
- **A migration is not a feature.** It is usually a chore, and it is usually
  blocked by the feature that needs it. File the blocker relationship
  explicitly.
- **Phase headings understate and overstate in equal measure.** "Phase 0:
  Foundation" usually hides one infrastructure chore nobody wants to own.
  Surface it as its own issue rather than folding it into the first feature.
- **When a spec names a file or a function, there is usually an unstated
  outcome behind it.** The file is the implementation; find the outcome and
  write the AC about the outcome.

## Budget discipline

The failure mode is reading everything. Concretely:

| Cost | Action |
|---|---|
| Cheap | Headings, tables, frontmatter, first paragraph |
| Medium | Any single section, on demand |
| Expensive | Whole document, only with a stated reason |

Stop and report rather than silently escalating. A spec you could not finish
reading is information the human needs.

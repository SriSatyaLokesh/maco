# Code map

A generated map of this repository: 429 concepts and 597 relationships across
19 groups, built from 38 of its 54 tracked files. Open
[`graph.html`](graph.html) in a browser. No server, no build, no network.

This page is the part meant for reading in a diff. The HTML is the part meant
for exploring.

- Raw data: [`graph.json`](graph.json), for tooling and queries
- Full audit report: [`GRAPH_REPORT.md`](GRAPH_REPORT.md)
- How it was produced: [`PROVENANCE.md`](PROVENANCE.md)

## What carries the structure

Ten concepts do most of the connecting. If you read nothing else, read these.

| Concept | Edges | What it is |
|---|---|---|
| `code-review` skill | 18 | The one-pass review mapped to `AC-1..N` |
| Generated skill mirror (`.agents/skills`) | 18 | The copy 5 of 6 hosts actually load |
| `maco-ac-audit` skill | 14 | The headless CI twin of `code-review` |
| `maco-spec-to-issue` skill | 13 | Specs decomposed into issues with ACs |
| The nine skills | 13 | The set, and the boundary between them |
| `maco-contribute` / `maco-self-heal` / `maco-skill-eval` | 11 each | Contributor path, CI repair, skill grading |
| `gh / git / jq` toolchain constraint | 10 | The portability constraint, in one node |

The mirror tying `code-review` for degree is the useful result. The generated
copy is not bookkeeping, it is load-bearing, which is what
`docs/ARCHITECTURE.md` section 2 argues on other grounds.

## The rule this project states five times

The most consistent finding is duplication of a single constraint across files
that do not link to each other.

| Stated as | In |
|---|---|
| `Agent Over-Reach (No Pushing to Contributor Branches)` | `SECURITY.md` |
| `One-Click Suggestion Default (No Bot Pushes)` | `README.md` |
| `Refusal Is Success` | `maco-self-heal` |
| `The One Automated Comment Rule` | `docs/ARCHITECTURE.md` |
| `Never Close Without A Human` | `maco-triage` |

All five edges are `INFERRED`, none is `EXTRACTED`, and that is the point: no
file cites the others, so nothing keeps them in step. One is prose in a
threat model, one is prose in a threat model, one is a job condition in a
workflow. A reader who only reads `SECURITY.md` does not learn that the
workflow enforces it too.

The same pattern shows up for two more rules:

- "A skill is a prompt, budget it like code" appears in `AGENTS.md` and again in
  `CONTRIBUTING.md` as two separate nodes.
- "Provider keys go in secrets, not variables" appears in `docs/MODELS.md` and in
  `AGENTS.md`'s non-negotiable list.

This is a documentation observation, not a defect. It is the kind of thing that
stays invisible until something is generated from the source and counted.

## Groups

The 19 clusters are uneven. Three of them are configuration schemas rather
than ideas, and together they hold about a quarter of the graph:

- `JSON Schema Definition`, `Schema Review Property Constraints`,
  `Schema AC Property Constraints`, `Label Schema Constraints` (98 nodes)
- `maco.json Config Fields`, `Model Role Declarations` (38 nodes)
- `package.json Manifest Fields` (21 nodes)

The remainder map to the actual concerns: the review, audit, self-heal and eval
skills (46), contribution workflow and skill authoring (52), CI roles, cost and
security (33), spec decomposition and issue intake (28), and so on. Full
labelling is in `graph.json` under `community_name`.

## Reading this honestly

- 234 of 429 nodes came from a language model reading 30 documents. Edges
  between those nodes are `INFERRED` or `AMBIGUOUS` and are reasoning, not
  measurement. The 190 structural nodes come from a deterministic parse of the 8
  JSON and `.mjs` files and carry `EXTRACTED` edges only.
- The build reported one self-loop edge and 14 edges collapsed by the undirected
  build, with zero dangling endpoints and zero unverified code nodes. Recorded
  in `GRAPH_REPORT.md` rather than suppressed.
- Token cost for the semantic pass is recorded as 0. The subagent usage figures
  were not readable during the run, and the number was left at 0 rather than
  estimated.
- This is a snapshot of one moment. It is allowed to age. Nothing regenerates it.

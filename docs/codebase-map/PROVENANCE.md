# Provenance

How `graph.html` and `graph.json` in this directory were produced, so they can
be regenerated deliberately rather than accidentally.

## Tool

- graphify 0.9.71 (`graphifyy` on PyPI), installed globally on the maintainer
  machine
- Not a dependency of this repository. `package.json` is unchanged and there is
  no vendor directory. Regenerating requires installing the tool first.

## Corpus

38 of 54 tracked files, about 22,600 words.

| Pass | Files | Method |
|---|---|---|
| Structural | 8 | Deterministic parse of the JSON and `.mjs` files |
| Semantic | 30 | A language model read each markdown and YAML file |

## Exclusions

| Excluded | Why |
|---|---|
| `.agents/` | The generated mirror, a verbatim copy of `plugins/maco/skills/`. Including it put 20 of 42 documents in the corpus and extracted every skill twice. |
| `.git/` | Not corpus. |
| `graphify-out/` | The tool's own output, to avoid re-ingesting it. |
| 16 remaining tracked files | Not a supported content type for this tool. |

## Files kept, and files dropped

Kept: `graph.html`, `graph.json`, `GRAPH_REPORT.md`, `manifest.json`,
`cost.json`.

Dropped from the tool's output directory:

| Dropped | Why |
|---|---|
| `cache/` (42 files) | Incremental AST and semantic cache, keyed by content hash. Machine-local build state. |
| `.graphify_python` | An absolute path to the generating machine's interpreter. Wrong on every other machine. |
| `.graphify_root` | Same: an absolute path to the generating machine. |
| `.graphify_labels.json` | Community labels, already written into `graph.json` nodes. |

`manifest.json` is kept so the tool can tell what changed. It is 8 KB and it is
the difference between a regeneration and a guess.

## Reproducing

From the repository root, with graphify installed globally:

```
graphify extract . --code-only     # deterministic structural pass
graphify cluster-only .            # labels communities, writes the graph
graphify export html               # must run from the repository root
```

The `--code-only` pass is the no-cost part. The semantic pass over the 30
documents is the part that needs a model, and it is what produced the 234
concept nodes. The tool uses Gemini for that when `GEMINI_API_KEY` or
`GOOGLE_API_KEY` is set; otherwise the calling agent does the extraction itself.

`graphify export html` resolves its input relative to the current directory and
takes no path argument. Running it from anywhere else fails with
`graph not found`.

## Known limits of this snapshot

- A one-time snapshot. No CI job, git hook, or npm script regenerates it, and
  that is deliberate. See the open question in issue #7 about whether this
  contradicts `docs/ARCHITECTURE.md` section 7.
- The 14 collapsed edges in an undirected build are bidirectional references
  between the same pair of nodes, not lost data. A `--directed` run would keep
  them apart at the cost of changing the traversal semantics.

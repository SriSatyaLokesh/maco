# Canonical eval cases

Load this when setting up an eval for the first time, or when adding a case.

Three cases cover most of what can go wrong. Keep them small enough to run in
one session each.

## Case 1: the correct change

**Fixture.** A merged PR that genuinely satisfies every AC in its linked issue.

**Assertion.** `code-review` returns `approve`. `maco-ac-audit` returns
`verdict: "pass"` with every AC `met`.

**What it catches.** False positives. A skill that flags correct code is worse
than no skill, because the maintainer learns to skip it. This is the case that
tells you whether the skill is worth having at all.

**Watch for.** Invented findings with no AC reference. Style commentary. A
`nit` on something the spec does not constrain.

## Case 2: one skipped criterion

**Fixture.** A PR where exactly one AC is untouched - a component was not
updated, or an accessibility requirement was dropped.

**Assertion.** `changes-requested`, naming the *specific* AC as `missing`.
`verdict: "fail"` with that AC `missing` and a file reference in `evidence`.

**What it catches.** The core competency. A review that says "some criteria
appear unmet" without naming which one costs the contributor a whole round
trip, which is the exact cost this project exists to remove.

**Watch for.** Correct verdict for the wrong reason. All three ACs reported
`partial` when only one was `missing` is a mapping failure, not a pass.

## Case 3: too large to review

**Fixture.** A 2,000 to 3,000 line refactor or dependency bump.

**Assertion.** Either `skipped`, or an explicit low-confidence marker.

**What it catches.** Over-confidence, which is the failure mode that costs the
most trust. A partial review that says `pass` is a false all-clear on code
nobody read.

**Watch for.** Silent truncation. The skill reviewing the first N files and
reporting confidence over all of them is worse than refusing, because the
output looks complete.

## Adding a case

Add one when you hit a real failure the three above do not cover. Keep the
fixture real and redact it if needed; synthetic fixtures tune a prompt to a
distribution that does not exist.

Record the case as: fixture, assertion, what it catches, what to watch for.

```markdown
## Case 4: PR that touches generated files

**Fixture.** A PR that regenerates a lockfile plus one hand-edited line.

**Assertion.** Generated files excluded from review; the hand-edited line
reviewed.

**What it catches.** Token waste and false findings on machine-generated diffs.
```

## Running the set

Per skill, in a fresh context each time:

```bash
npm run sync && npm run validate
# then, per case, in a clean session:
#   load the skill, give it the fixture, record the output and the cost
```

The full set is the regression suite. A change to one skill runs that skill's
whole set, not just the case that motivated the change.

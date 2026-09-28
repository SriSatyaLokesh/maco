Closes #

## What changed

<!-- Two sentences a non-author understands. -->

## Why

<!-- The problem being solved, or the issue number above. -->

## How this was verified

<!-- The literal commands you ran and their result. "Tests pass" is not verification. "npm test -> passed" is. -->

```
<command> -> <result>
```

## Deliberately not done

<!-- Required. This is what stops the follow-up review round where the reviewer asks "did you consider X". -->

- <what you left out, and why>

## Checklist

<!-- Delete lines that do not apply rather than leaving them unticked. -->

- [ ] `npm run sync && npm run validate` passes
- [ ] Source **and** regenerated `.agents/skills/` mirror are in this commit
- [ ] I edited `plugins/maco/skills/`, not the mirror
- [ ] No new runtime dependency

<!-- If you touched a SKILL.md, these apply too. -->

- [ ] Frontmatter `name` matches the directory
- [ ] The `description` is trigger shaped, not "This skill does X"
- [ ] Input/token budget is stated in the body
- [ ] The skill states what it must never do
- [ ] Ran the eval cases: a correct PR, a PR missing one AC, and an over-budget diff (or explained why not)
- [ ] Skill body has no em dashes, marketing tone or exclamation marks

## Reviewer note

<!-- Anything a reviewer should look at first. "The calibration rule in step 3 is the risky part, here is why" saves a round trip. -->

<what to look at first, and what you are unsure about>

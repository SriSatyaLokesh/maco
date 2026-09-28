---
name: Story (maco)
description: A request with numbered acceptance criteria and an explicit scope boundary. Use the maco-story skill to produce one.
title: "[Story] <imperative summary>"
labels: ["maco:story"]
---
body: |
  ## Outcome

  <What can a user do that they cannot do today? One paragraph, user-visible.
  No implementation terms.>

  ## Acceptance criteria

  <!-- Numbered, one observable outcome each, independently testable.
       A contributor who has never seen this codebase should be able to write
       a failing test for each line from the line alone. -->

  - [ ] AC-1 <observable outcome>
  - [ ] AC-2 <observable outcome>
  - [ ] AC-3 <observable outcome>

  ## Out of scope

  <!-- Required. This is the highest-value section and the one most often
       omitted. It is what prevents a "while I was in there" PR that
       stalls review. -->

  - <explicit non-goal>
  - <explicit non-goal>

  ## Open questions

  <!-- Only genuinely unresolved items, or "None". Do not put your own
       inferences here - if you believe something should be a criterion,
       propose it below and let the maintainer decide. -->

  None

  ## Implementation notes

  <!-- Optional and non-binding. Reviewers can ignore this. Reviewers should
       also ignore it when checking the criteria above. -->

  <optional context for reviewers>

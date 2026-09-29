# Graph Report - maco  (2026-09-29)

## Corpus Check
- Corpus is ~22,620 words - fits in a single context window. You may not need a graph.

## Summary
- 429 nodes · 597 edges · 19 communities (17 shown, 2 thin omitted)
- Extraction: 82% EXTRACTED · 18% INFERRED · 0% AMBIGUOUS · INFERRED: 108 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Contribution Workflow and Skill Authoring
- Review Audit Self-Heal and Eval Skills
- JSON Schema Definition
- CI Roles Cost and Security
- Community Docs and Release Process
- Spec Decomposition and Issue Intake
- Node Scripts: Detect and Sync
- maco.json Config Fields
- package.json Manifest Fields
- Schema Review Property Constraints
- Model Role Declarations
- Schema AC Property Constraints
- validate.mjs Check Functions
- Triage Skill and Agent
- Contributor Path and PR Pre-Flight
- Label Schema Constraints
- Template Sections and Style Rules
- Host Discovery Paths
- Problem-First Framing

## God Nodes (most connected - your core abstractions)
1. `code-review Skill` - 18 edges
2. `Generated Skill Mirror (.agents/skills)` - 18 edges
3. `maco-ac-audit Skill` - 14 edges
4. `maco-spec-to-issue Skill` - 13 edges
5. `The Nine Skills` - 13 edges
6. `maco-contribute Skill` - 11 edges
7. `maco-self-heal Skill` - 11 edges
8. `maco-skill-eval Skill` - 11 edges
9. `gh / git / jq Toolchain Constraint` - 10 edges
10. `maco-pr-ready Skill` - 9 edges

## Surprising Connections (you probably didn't know these)
- `Agent Over-Reach (No Pushing to Contributor Branches)` --semantically_similar_to--> `One-Click Suggestion Default (No Bot Pushes)`  [INFERRED] [semantically similar]
  SECURITY.md → README.md
- `"A Skill Is a Prompt, Budget It Like Code"` --semantically_similar_to--> `"A Skill Is a Prompt, Budget It Like Code" (Human Version)`  [INFERRED] [semantically similar]
  AGENTS.md → CONTRIBUTING.md
- `Repository Secrets, Not Variables` --semantically_similar_to--> `Non-Negotiable Security Constraints`  [INFERRED] [semantically similar]
  docs/MODELS.md → AGENTS.md
- `Feature Request Cost Section (Per-Invocation Token Budget)` --semantically_similar_to--> `"A Skill Is a Prompt, Budget It Like Code" (Human Version)`  [INFERRED] [semantically similar]
  .github/ISSUE_TEMPLATE/feature_request.md → CONTRIBUTING.md
- `pull_request_target Runs with a Privileged Token` --semantically_similar_to--> `Untrusted Code Executing With a Privileged Token`  [INFERRED] [semantically similar]
  docs/MODELS.md → SECURITY.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **The Acceptance-Criteria Gating Chain** — plugins_maco_skills_maco_story_skill_numbered_acceptance_criteria, plugins_maco_skills_code_review_skill_ac_mapping, plugins_maco_skills_maco_ac_audit_skill_ac_status_vocabulary, plugins_maco_skills_maco_pr_ready_skill_issue_linkage [EXTRACTED 1.00]
- **The Headless CI Pair** — plugins_maco_skills_maco_ac_audit_skill, plugins_maco_skills_maco_ac_audit_skill_maco_verdict_contract, plugins_maco_skills_maco_self_heal_skill, plugins_maco_skills_maco_self_heal_skill_suggestion_block, plugins_maco_skills_maco_ac_audit_skill_caller_provided_inputs [INFERRED 0.85]
- **Budget Gating And Refusal-As-Outcome** — plugins_maco_skills_code_review_skill_token_discipline, plugins_maco_skills_maco_ac_audit_skill_diff_budget_skip, plugins_maco_skills_maco_self_heal_skill_hard_input_limits, plugins_maco_skills_maco_self_heal_skill_refusal_is_success, plugins_maco_skills_maco_spec_to_issue_skill_budget_discipline, plugins_maco_skills_maco_skill_eval_skill_three_axes [INFERRED 0.75]
- **Skill Distribution Across Six Agent Hosts** — readme_skill_mirror, readme_host_portability, readme_zero_dependency_tooling, docs_architecture_measured_discovery_paths, docs_architecture_generated_mirror_decision, docs_architecture_generator_invariants [EXTRACTED 1.00]
- **AC Audit CI Gating Flow (Advisory, Budget-Gated)** — _github_workflows_maco_ac_audit_advisory_default, _github_workflows_maco_ac_audit_resolve_linked_issue, _github_workflows_maco_ac_audit_build_diff_payload, _github_workflows_maco_ac_audit_budget_gate, _github_workflows_maco_ac_audit_run_ac_audit, _github_workflows_maco_ac_audit_maco_verdict_block, _github_workflows_maco_ac_audit_publish_verdict [EXTRACTED 1.00]
- **Self-Heal Scoped Repair Flow (Suggest, Never Push)** — _github_workflows_maco_self_heal_workflow_run_trigger, _github_workflows_maco_self_heal_job_condition_test_failure_gate, _github_workflows_maco_self_heal_extract_failure_trace, _github_workflows_maco_self_heal_scope_gate, _github_workflows_maco_self_heal_diagnose_and_propose_patch, _github_workflows_maco_self_heal_suggestion_block, _github_workflows_maco_self_heal_post_suggestion [EXTRACTED 1.00]

## Communities (19 total, 2 thin omitted)

### Community 0 - "Contribution Workflow and Skill Authoring"
Cohesion: 0.06
Nodes (51): Bug Report Assertion Format ("What It Should Have Done"), Bug Report Environment Quad (Skill/Host/Model/Where), Why Existing Skills Do Not Cover It (Skill Boundary Section), Conventional Commit PR Title Convention, Skill Change Checklist in PR Template, How This Was Verified (Literal Commands and Results), JSON Entry Points Parse Check, Skill Mirror Drift Check (npm run check) (+43 more)

### Community 1 - "Review Audit Self-Heal and Eval Skills"
Cohesion: 0.07
Nodes (46): code-review Skill, AC Mapping, Why The Directory Is code-review, The Four Failures That Matter, Host Compatibility Declaration, Linked Issue Resolution, Local Mode, One Comment Per Review (+38 more)

### Community 2 - "JSON Schema Definition"
Cohesion: 0.05
Nodes (42): additionalProperties, additionalProperties, properties, required, type, additionalProperties, properties, required (+34 more)

### Community 3 - "CI Roles Cost and Security"
Cohesion: 0.10
Nodes (33): Dependabot GitHub Actions Updates, No npm Dependabot Ecosystem by Design, CI Validate Job, Budget Gate Step (fails open), Build Diff Payload (gh pr diff, never checkout), Checkout Step With PR Head Ref, workflow_run Trigger on Failed CI, Non-Negotiable Security Constraints (+25 more)

### Community 4 - "Community Docs and Release Process"
Cohesion: 0.10
Nodes (21): Issue Template Contact Links (Discussions, Private Security), Parse Consumer Workflow Templates (pyyaml), maco-verdict Fenced JSON Block, Publish Verdict Step, Run AC Audit (Provider Stub), Diagnose and Propose Patch (Provider Stub), No Dependency Additions, Release 0.1.0 (First Public Release) (+13 more)

### Community 5 - "Spec Decomposition and Issue Intake"
Cohesion: 0.10
Nodes (28): AC Extraction From Issue Body, Clean Context Run, Grading On Three Axes, Reading Unfamiliar Spec Documents, Boundary Pattern Reliability Table, Reading Cost Tiers, Contradiction Handling, Decomposition Heuristics (+20 more)

### Community 6 - "Node Scripts: Detect and Sync"
Cohesion: 0.12
Nodes (21): ref_node_child_process, ref_node_fs, ref_node_os, ref_node_path, ref_node_url, HOME, HOSTS, targetIdx (+13 more)

### Community 7 - "maco.json Config Fields"
Cohesion: 0.10
Nodes (20): ac, blockerSeverity, prefix, startAt, budget, failOpen, maxRunsPerDay, labels (+12 more)

### Community 8 - "package.json Manifest Fields"
Cohesion: 0.10
Nodes (20): bin, maco, description, engines, node, files, keywords, license (+12 more)

### Community 9 - "Schema Review Property Constraints"
Cohesion: 0.11
Nodes (20): maximum, minimum, type, description, items, type, uniqueItems, description (+12 more)

### Community 10 - "Model Role Declarations"
Cohesion: 0.12
Nodes (17): default, hint, default, hint, default, hint, models, roles (+9 more)

### Community 11 - "Schema AC Property Constraints"
Cohesion: 0.12
Nodes (17): additionalProperties, properties, required, type, description, enum, type, description (+9 more)

### Community 12 - "validate.mjs Check Functions"
Cohesion: 0.25
Nodes (16): checkCommunityFiles(), checkConfig(), checkInternalLinks(), checkMarketplace(), checkMirror(), checkSkills(), err(), fail (+8 more)

### Community 13 - "Triage Skill and Agent"
Cohesion: 0.18
Nodes (16): maco-triage-agent, At Most One Comment Per Item, Bulk Read Constraint, Triage Is Not Review, Reversible Closure, Silence Is A Valid Outcome, Story Label Resolved From maco.json, maco-triage Skill (+8 more)

### Community 14 - "Contributor Path and PR Pre-Flight"
Cohesion: 0.17
Nodes (16): maco-contribute Skill, Branch And Commit Grammar, Claim Before You Build, Confirm Only Genuine Ambiguity, The Contributor-Side Half, PR Body As The Review's Context Budget, Scope Discipline, maco-pr-ready Skill (+8 more)

### Community 15 - "Label Schema Constraints"
Cohesion: 0.13
Nodes (15): type, additionalProperties, properties, required, type, type, autofix, labels (+7 more)

### Community 16 - "Template Sections and Style Rules"
Cohesion: 0.18
Nodes (11): Feature Request Cost Section (Per-Invocation Token Budget), Numbered Acceptance Criteria (AC-1..N), Out Of Scope Section (Required), Story (maco) Issue Template, Deliberately Not Done (Required PR Section), Resolve Linked Issue (Closing Keyword Heuristic), Extract Failure Trace (20-line cap), "A Skill Is a Prompt, Budget It Like Code" (+3 more)

## Ambiguous Edges - Review These
- `Checkout Step With PR Head Ref` → `Untrusted Code Executing With a Privileged Token`  [AMBIGUOUS]
  .github/workflows/maco-ac-audit.yml · relation: conceptually_related_to

## Knowledge Gaps
- **148 isolated node(s):** `$schema`, `version`, `prefix`, `startAt`, `blockerSeverity` (+143 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 168 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Checkout Step With PR Head Ref` and `Untrusted Code Executing With a Privileged Token`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `properties` connect `JSON Schema Definition` to `Schema AC Property Constraints`, `Label Schema Constraints`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Why does `code-review Skill` connect `Review Audit Self-Heal and Eval Skills` to `Triage Skill and Agent`, `Contributor Path and PR Pre-Flight`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Why does `The Nine Skills` connect `Contribution Workflow and Skill Authoring` to `Template Sections and Style Rules`, `CI Roles Cost and Security`, `Community Docs and Release Process`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `code-review Skill` (e.g. with `Triage Is Not Review` and `maco-self-heal Skill`) actually correct?**
  _`code-review Skill` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `maco-ac-audit Skill` (e.g. with `maco-self-heal Skill` and `Issue Linkage Check`) actually correct?**
  _`maco-ac-audit Skill` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `The Nine Skills` (e.g. with `Skill Verification via maco-skill-eval` and `The One Automated Comment Rule`) actually correct?**
  _`The Nine Skills` has 4 INFERRED edges - model-reasoned connections that need verification._
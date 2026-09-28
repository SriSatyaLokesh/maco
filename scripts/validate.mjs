#!/usr/bin/env node
// MACO validator. Deterministic, $0, no model. Runs in CI on every PR.
//
//   node scripts/validate.mjs

import { readdir, readFile, stat } from "node:fs/promises"
import { existsSync } from "node:fs"
import { join, dirname, relative } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const fail = []
const warn = []
const err = (m) => fail.push(m)
const wrn = (m) => warn.push(m)

async function isDir(p) {
  try {
    return (await stat(p)).isDirectory()
  } catch {
    return false
  }
}

// ---------------------------------------------------------------- skills ----
const SKILL_SRC = join(ROOT, "plugins", "maco", "skills")

async function checkSkills() {
  if (!(await isDir(SKILL_SRC))) {
    err("plugins/maco/skills/ is missing - Claude Code would load no skills from this plugin")
    return
  }
  const entries = await readdir(SKILL_SRC, { withFileTypes: true })
  const dirs = entries.filter((e) => e.isDirectory())

  for (const d of dirs) {
    const file = join(SKILL_SRC, d.name, "SKILL.md")
    if (!existsSync(file)) {
      err(`${d.name}/SKILL.md is missing`)
      continue
    }
    const raw = await readFile(file, "utf8")
    const rel = relative(ROOT, file)

    const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
    if (!m) {
      err(`${rel}: no YAML frontmatter (agentskills.io requires it)`)
      continue
    }
    const fm = m[1]
    const name = fm.match(/^name:\s*(.+)$/m)?.[1]?.trim()
    const desc = fm.match(/^description:\s*([\s\S]+?)(?=\n[a-z][a-z-]*:|$)/m)?.[1]?.trim()

    if (!name) err(`${rel}: frontmatter missing \`name\``)
    else if (name !== d.name)
      wrn(`${rel}: frontmatter name "${name}" differs from directory "${d.name}"`)

    if (!desc) err(`${rel}: frontmatter missing \`description\``)
    else {
      if (desc.length > 1024) err(`${rel}: description is ${desc.length} chars (limit 1024)`)
      if (desc.length < 40) wrn(`${rel}: description is very short; the host may not trigger on it`)
      // Agentskills.io and the Claude Code spec both want third person,
      // trigger-shaped descriptions. "Review a PR" triggers; "This skill
      // reviews PRs" often does not.
      if (/^(this skill|this command|i |we )/i.test(desc))
        wrn(`${rel}: description should start with an imperative trigger, not "This skill..."`)
    }

    if (raw.includes("\r\n")) wrn(`${rel}: CRLF line endings`)
    if (/\t/.test(raw)) wrn(`${rel}: contains tab characters`)
    if (m[0].length + 200 > raw.length) err(`${rel}: frontmatter present but body is empty`)
  }
  console.log(`skills: ${dirs.length} checked`)
}

// ----------------------------------------------------------- marketplace ----
async function checkMarketplace() {
  const mp = join(ROOT, ".claude-plugin", "marketplace.json")
  if (!existsSync(mp)) {
    err(".claude-plugin/marketplace.json is missing - this repo is not installable as a marketplace")
    return
  }
  let json
  try {
    json = JSON.parse(await readFile(mp, "utf8"))
  } catch (e) {
    err(`.claude-plugin/marketplace.json is not valid JSON: ${e.message}`)
    return
  }
  if (!Array.isArray(json.plugins) || json.plugins.length === 0) {
    err("marketplace.json: `plugins` must be a non-empty array")
    return
  }
  for (const p of json.plugins) {
    if (!p.name) err(`marketplace.json: a plugin entry has no \`name\``)
    if (!p.description) wrn(`marketplace.json: plugin "${p.name}" has no description`)
    if (!p.source) {
      err(`marketplace.json: plugin "${p.name}" has no \`source\``)
    } else {
      const dir = join(ROOT, p.source)
      if (!(await isDir(dir))) {
        err(`marketplace.json: plugin "${p.name}" source does not exist: ${p.source}`)
        continue
      }
      const manifest = join(dir, ".claude-plugin", "plugin.json")
      if (!existsSync(manifest)) {
        err(`plugin "${p.name}": missing ${p.source}/.claude-plugin/plugin.json`)
        continue
      }
      const pj = JSON.parse(await readFile(manifest, "utf8"))
      if (pj.name !== p.name)
        err(`plugin "${p.name}": plugin.json name is "${pj.name}"`)
      for (const field of ["version", "description", "author"]) {
        if (!pj[field]) wrn(`plugin "${p.name}": plugin.json missing \`${field}\``)
      }
      if (!(await isDir(join(dir, "skills"))))
        err(`plugin "${p.name}": no skills/ directory - the plugin would install zero skills`)
    }
  }
  console.log(`marketplace: ${json.plugins.length} plugin(s) checked`)
}

// ----------------------------------------------------------------- config ----
async function checkConfig() {
  const cfgPath = join(ROOT, "maco.json")
  if (!existsSync(cfgPath)) {
    err("maco.json is missing")
    return
  }
  let cfg
  try {
    cfg = JSON.parse(await readFile(cfgPath, "utf8"))
  } catch (e) {
    err(`maco.json is not valid JSON: ${e.message}`)
    return
  }

  const schemaPath = join(ROOT, "schemas", "maco.schema.json")
  if (existsSync(schemaPath)) {
    try {
      JSON.parse(await readFile(schemaPath, "utf8"))
    } catch (e) {
      err(`schemas/maco.schema.json is not valid JSON: ${e.message}`)
    }
  } else {
    wrn("schemas/maco.schema.json is missing - $schema reference will dangle")
  }

  // Cross-check the labels used in maco.json against the ones workflows and
  // skills actually reference. A typo here means a silently missing label at
  // runtime, which is invisible until triage stops working.
  const used = new Set()
  for (const rel of ["plugins/maco/skills", "plugins/maco/agents", ".github/workflows"]) {
    const dir = join(ROOT, rel)
    if (!(await isDir(dir))) continue
    const stack = [dir]
    while (stack.length) {
      const cur = stack.pop()
      for (const e of await readdir(cur, { withFileTypes: true })) {
        const p = join(cur, e.name)
        if (e.isDirectory()) stack.push(p)
        else if (/\.(md|ya?ml|json)$/.test(e.name)) {
          for (const mm of (await readFile(p, "utf8")).matchAll(/maco:([a-z-]+)/g))
            used.add(mm[1])
        }
      }
    }
  }
  const declared = new Set(Object.values(cfg.labels ?? {}).map((l) => l.replace(/^maco:/, "")))
  for (const u of used) {
    if (!declared.has(u)) err(`label "maco:${u}" is used but not declared in maco.json -> labels`)
  }
  console.log(`config: maco.json checked (${declared.size} labels, ${used.size} referenced)`)
}

// -------------------------------------------------------------- readme links ----
async function checkInternalLinks() {
  const files = [
    "README.md",
    "AGENTS.md",
    "CONTRIBUTING.md",
    "SUPPORT.md",
    "SECURITY.md",
    "CHANGELOG.md",
    "CODE_OF_CONDUCT.md",
    "docs/ARCHITECTURE.md",
    "docs/MODELS.md",
  ]
  let checked = 0
  for (const f of files) {
    const p = join(ROOT, f)
    if (!existsSync(p)) continue
    const raw = await readFile(p, "utf8")
    for (const m of raw.matchAll(/\]\((?!https?:|#|mailto:)([^)#]+)(?:#[^)]*)?\)/g)) {
      const target = join(ROOT, m[1])
      if (!existsSync(target)) err(`${f}: broken relative link -> ${m[1]}`)
      checked++
    }
  }
  console.log(`links: ${checked} relative link(s) checked`)
}

// ---------------------------------------------------------------- mirror ----
//
// The mirror at .agents/skills/ is the copy that 5 of 6 hosts load - Copilot
// (CLI, cloud agent and code review), VS Code agent mode, Codex CLI,
// Antigravity and OpenCode. Only Claude Code reads plugins/maco/skills/.
//
// So a mirror defect is a product defect, and it fails silently: a host whose
// frontmatter parser is strict simply does not load the skill, and the missing
// skill is indistinguishable from one that was never installed. Checking the
// source alone is what let that class of bug ship.

const MIRROR = join(ROOT, ".agents", "skills")

/** Anchored at byte 0 on purpose - see rule 1 in sync-skills.mjs. */
function frontmatterOf(raw) {
  const m = raw.replace(/\r\n/g, "\n").match(/^---\n([\s\S]*?)\n---(?:\n|$)/)
  return m ? m[1] : null
}

function scalar(fm, key) {
  const re = new RegExp(`^${key}:[ \\t]*(.*)$`)
  for (const line of fm.split("\n")) {
    const hit = re.exec(line)
    if (hit) return (hit[1] ?? "").trim()
  }
  return null
}

async function checkMirror() {
  if (!(await isDir(MIRROR))) {
    err(".agents/skills/ is missing - 5 of 6 hosts would install zero skills")
    return
  }
  const names = (await readdir(SKILL_SRC, { withFileTypes: true }))
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort()

  if (names.length === 0) {
    err(".agents/skills/ exists but the source skill set is empty")
    return
  }

  for (const name of names) {
    const rel = `.agents/skills/${name}/SKILL.md`
    const file = join(MIRROR, name, "SKILL.md")
    if (!existsSync(file)) {
      err(`${rel} is missing - run: npm run sync`)
      continue
    }
    const raw = await readFile(file, "utf8")

    if (!raw.startsWith("---")) {
      err(
        `${rel}: does not start with \`---\`. A provenance banner before the ` +
          `frontmatter makes strict parsers treat the whole file as body, so ` +
          `the skill loads with no name and no description.`,
      )
      continue
    }

    const fm = frontmatterOf(raw)
    if (!fm) {
      err(`${rel}: frontmatter is not parseable`)
      continue
    }
    if (!/^# Generated by scripts\/sync-skills\.mjs/m.test(fm)) {
      wrn(`${rel}: missing the generated-by banner; this file may have been hand-edited`)
    }

    const declared = scalar(fm, "name")
    if (!declared) err(`${rel}: frontmatter missing \`name\``)
    else if (declared !== name) err(`${rel}: frontmatter name "${declared}" != directory "${name}"`)

    const desc = scalar(fm, "description")
    if (!desc) err(`${rel}: frontmatter missing \`description\``)
    else if (desc.length > 1024) err(`${rel}: description is ${desc.length} chars (limit 1024)`)
  }

  // A skill removed from the source but left in the mirror still loads on
  // every host, and nobody notices because it looks installed on purpose.
  for (const e of await readdir(MIRROR, { withFileTypes: true })) {
    if (e.isDirectory() && !e.name.startsWith(".") && !names.includes(e.name)) {
      err(`.agents/skills/${e.name}/ is a ghost skill - not in plugins/maco/skills/ - run: npm run sync`)
    }
  }

  console.log(`mirror: ${names.length} skill(s) checked`)
}

// --------------------------------------------------------- community hygiene ----
//
// A marketplace plugin is judged on its onboarding before it is judged on its
// skills. These files are what a stranger, a first-time contributor and a
// security researcher each look for first, and a missing one reads as "this
// project has no process" rather than "this file is missing".

async function checkCommunityFiles() {
  const required = [
    ["LICENSE", "no license means nobody may legally use or fork it"],
    ["README.md", "the marketplace storefront"],
    ["CONTRIBUTING.md", "how to contribute"],
    ["CODE_OF_CONDUCT.md", "participation standards"],
    ["SECURITY.md", "vulnerability reporting path"],
    ["SUPPORT.md", "where to ask questions"],
    ["CHANGELOG.md", "release history"],
    ["AGENTS.md", "instructions for agents working on this repo"],
    [".github/PULL_REQUEST_TEMPLATE.md", "PR template"],
    [".github/CODEOWNERS", "review routing"],
  ]
  for (const [f, why] of required) {
    if (!existsSync(join(ROOT, f))) err(`${f} is missing - ${why}`)
  }

  // An issue template with no frontmatter appears in the chooser as a blank
  // form, which is worse than offering no template at all.
  const tplDir = join(ROOT, ".github", "ISSUE_TEMPLATE")
  if (await isDir(tplDir)) {
    const names = (await readdir(tplDir)).filter((n) => n.endsWith(".md"))
    if (names.length === 0) {
      wrn(".github/ISSUE_TEMPLATE/ has no templates - the chooser will offer a blank issue")
    }
    for (const n of names) {
      const raw = await readFile(join(tplDir, n), "utf8")
      if (!raw.startsWith("---")) {
        err(`.github/ISSUE_TEMPLATE/${n}: no YAML frontmatter (needs name/about/title)`)
      }
    }
  } else {
    err(".github/ISSUE_TEMPLATE/ is missing - new issues arrive unstructured")
  }

  console.log(`community: ${required.length} required file(s) checked`)
}

// -------------------------------------------------------------------- run ----
console.log("maco validate\n")
await checkSkills()
await checkMirror()
await checkMarketplace()
await checkConfig()
await checkCommunityFiles()
await checkInternalLinks()

if (warn.length) {
  console.log(`\n${warn.length} warning(s)`)
  for (const w of warn) console.log(`  ~ ${w}`)
}
if (fail.length) {
  console.log(`\n${fail.length} error(s)`)
  for (const f of fail) console.log(`  ! ${f}`)
  process.exit(1)
}
console.log("\nok")

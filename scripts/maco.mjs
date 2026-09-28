#!/usr/bin/env node
// Detect which agent hosts are present and print - or perform - the install.
//
//   node scripts/maco.mjs detect
//   node scripts/maco.mjs install [--write] [--target <host>]
//
// MACO does not have a proprietary installer on purpose. `gh skill install` and
// `npx skills add` already do the right thing for 5 of 6 hosts. This script
// detects what is installed and tells you which single command to run, rather
// than becoming a fourth installer to maintain.

import { existsSync } from "node:fs"
import { homedir, platform } from "node:os"
import { join } from "node:path"
import { execFileSync } from "node:child_process"

const HOME = homedir()

const HOSTS = [
  {
    id: "claude-code",
    label: "Claude Code",
    // Claude Code reads the plugin from .claude/skills/ once the plugin is
    // enabled; the marketplace is the supported path.
    probe: () => [existsSync(join(HOME, ".claude")), existsSync(join(HOME, ".claude", "plugins"))],
    command: () =>
      "claude plugin marketplace add SriSatyaLokesh/maco\nclaude plugin install maco@maco",
  },
  {
    id: "opencode",
    label: "OpenCode",
    probe: () => [existsSync(join(HOME, ".config", "opencode")), existsSync(join(HOME, ".opencode"))],
    command: () => "npx skills add SriSatyaLokesh/maco --agent opencode",
  },
  {
    id: "copilot",
    label: "GitHub Copilot (CLI / cloud agent / code review)",
    probe: () => [existsSync(join(HOME, ".copilot")), existsSync(join(HOME, ".config", "github-copilot"))],
    command: () => "gh skill install SriSatyaLokesh/maco --agent copilot --scope project",
  },
  {
    id: "codex",
    label: "Codex CLI",
    probe: () => [existsSync(join(HOME, ".codex"))],
    command: () => "gh skill install SriSatyaLokesh/maco --agent codex --scope project",
  },
  {
    id: "antigravity",
    label: "Antigravity",
    // Antigravity auto-loads .agents/skills/ in the workspace root with zero configuration.
    probe: () => [existsSync(join(HOME, ".gemini")), existsSync(join(HOME, ".antigravity"))],
    command: () => "gh skill install SriSatyaLokesh/maco --agent antigravity --scope project",
  },
  {
    id: "gemini",
    label: "Google Gemini (CLI / Code Assist)",
    probe: () => [existsSync(join(HOME, ".gemini")), existsSync(join(HOME, ".config", "gemini"))],
    command: () => "gh skill install SriSatyaLokesh/maco --agent gemini --scope project",
  },
  {
    id: "cursor",
    label: "Cursor",
    probe: () => [
      existsSync(join(HOME, ".cursor")),
      existsSync(join(HOME, "AppData", "Roaming", "Cursor")),
      existsSync(join(HOME, ".config", "Cursor")),
    ],
    command: () => "gh skill install SriSatyaLokesh/maco --agent cursor --scope project",
  },
  {
    id: "windsurf",
    label: "Windsurf",
    probe: () => [
      existsSync(join(HOME, ".windsurf")),
      existsSync(join(HOME, ".codeium")),
      existsSync(join(HOME, "AppData", "Roaming", "Windsurf")),
    ],
    command: () => "gh skill install SriSatyaLokesh/maco --agent windsurf --scope project",
  },
  {
    id: "vscode",
    label: "VS Code agent skills",
    probe: () => [existsSync(join(HOME, ".vscode")), existsSync(join(HOME, "AppData", "Roaming", "Code"))],
    command: () => "gh skill install SriSatyaLokesh/maco --agent vscode --scope project",
  },
]

function detect() {
  return HOSTS.map((h) => {
    const [first, second] = h.probe()
    return { ...h, present: Boolean(first || second) }
  })
}

const mode = process.argv[2] ?? "detect"
const write = process.argv.includes("--write")
const targetIdx = process.argv.indexOf("--target")
const target = targetIdx > -1 ? process.argv[targetIdx + 1] : null

if (mode === "detect") {
  const hosts = detect()
  const found = hosts.filter((h) => h.present)
  console.log(`\nMACO hosts on this machine (${platform()})\n`)
  if (!found.length) {
    console.log("  none detected - MACO is portable, pick any host below\n")
  }
  for (const h of hosts) {
    console.log(`  ${h.present ? "+" : " "} ${h.label}${h.present ? "" : "   (not found)"}`)
  }
  console.log("\nInstall into any of them with:\n")
  for (const h of hosts) {
    console.log(`  ${h.id}:`)
    for (const line of h.command().split("\n")) console.log(`    ${line}`)
  }
  console.log("  universal (installs .agents/skills/ directly into project):")
  console.log("    npx skills add SriSatyaLokesh/maco")
  console.log("")
  process.exit(0)
}

if (mode === "install") {
  const hosts = detect()
  const chosen = target ? hosts.filter((h) => h.id === target) : hosts.filter((h) => h.present)

  if (target && !chosen.length) {
    console.error(`maco: unknown target "${target}". Known: ${hosts.map((h) => h.id).join(", ")}`)
    process.exit(1)
  }
  if (!chosen.length) {
    console.error("maco: no supported host detected. Pass --target <host> explicitly.")
    process.exit(1)
  }

  for (const h of chosen) {
    console.log(`\n${h.label}`)
    for (const line of h.command().split("\n")) console.log(`  ${line}`)
  }

  if (!write) {
    console.log("\n(dry run - pass --write to execute)")
    process.exit(0)
  }

  for (const h of chosen) {
    for (const line of h.command().split("\n")) {
      const [bin, ...args] = line.trim().split(/\s+/)
      try {
        execFileSync(bin, args, { stdio: "inherit" })
      } catch {
        console.error(`\nmaco: \`${bin}\` failed or is not installed. Run it manually:\n  ${line.trim()}`)
      }
    }
  }
  console.log("")
  process.exit(0)
}

if (mode === "help" || mode === "--help" || mode === "-h") {
  console.log(`
maco - detect agent hosts and print the install command for each

  node scripts/maco.mjs detect
      List which supported hosts are on this machine, and the install command
      for every one of them. This is the default when no command is given.

  node scripts/maco.mjs install
      Print the install command for each detected host. Dry run.

  node scripts/maco.mjs install --write
      Actually execute those commands.

  node scripts/maco.mjs install --target <host>
      Print (or run) the command for one host. Known ids:
      ${HOSTS.map((h) => h.id).join(", ")}

Agent names passed to \`gh skill install --agent\` are decided by the GitHub CLI,
not by MACO, and the accepted list changes between gh versions. If a command
below is rejected, run \`gh skill install --help\` for the current list.

MACO has no proprietary installer on purpose. \`gh skill install\` and
\`npx skills add\` already place skills correctly; this script only detects
hosts and tells you which single command to run.
`)
  process.exit(0)
}

console.error(`maco: unknown command "${mode}". Try: node scripts/maco.mjs help`)
process.exit(1)

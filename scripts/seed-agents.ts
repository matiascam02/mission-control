/**
 * Seed script: Insert all agents from src/lib/agents.ts into Convex.
 *
 * Usage:
 *   npx tsx scripts/seed-agents.ts
 *
 * Reads NEXT_PUBLIC_CONVEX_URL from .env.local (or pass as first CLI arg).
 * Idempotent: checks if agents already exist before inserting.
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import * as fs from "fs";
import * as path from "path";

// All agents to seed, matching src/lib/agents.ts
const agentsToSeed = [
  {
    name: "Hoyuelo",
    role: "Lead Coordinator",
    anime: "Mob Psycho 100",
    emoji: "\u{1F60A}",
    avatar_url: "/avatars/hoyuelo.png",
    level: "LEAD" as const,
    color: "#22c55e",
    session_key: "hoyuelo-session",
  },
  {
    name: "Reigen",
    role: "Business & Strategy",
    anime: "Mob Psycho 100",
    emoji: "\u{1F3A9}",
    avatar_url: "/avatars/reigen.png",
    level: "SPC" as const,
    color: "#eab308",
    session_key: "reigen-session",
  },
  {
    name: "Robin",
    role: "Research & Analysis",
    anime: "One Piece",
    emoji: "\u{1F4DA}",
    avatar_url: "/avatars/robin.png",
    level: "SPC" as const,
    color: "#8b5cf6",
    session_key: "robin-session",
  },
  {
    name: "Franky",
    role: "Developer",
    anime: "One Piece",
    emoji: "\u{1F916}",
    avatar_url: "/avatars/franky.png",
    level: "SPC" as const,
    color: "#3b82f6",
    session_key: "franky-session",
  },
  {
    name: "Nanami",
    role: "Project Management",
    anime: "Jujutsu Kaisen",
    emoji: "\u{1F454}",
    avatar_url: "/avatars/nanami.png",
    level: "SPC" as const,
    color: "#6366f1",
    session_key: "nanami-session",
  },
  {
    name: "Frieren",
    role: "Documentation",
    anime: "Frieren",
    emoji: "\u{2744}\u{FE0F}",
    avatar_url: "/avatars/frieren.png",
    level: "SPC" as const,
    color: "#06b6d4",
    session_key: "frieren-session",
  },
  {
    name: "Maomao",
    role: "Code Review",
    anime: "Apothecary Diaries",
    emoji: "\u{1F9EA}",
    avatar_url: "/avatars/maomao.png",
    level: "SPC" as const,
    color: "#ec4899",
    session_key: "maomao-session",
  },
  {
    name: "Rimuru",
    role: "UI/UX Lead",
    anime: "Slime",
    emoji: "\u{1F535}",
    avatar_url: "/avatars/rimuru.png",
    level: "SPC" as const,
    color: "#0ea5e9",
    session_key: "rimuru-session",
  },
];

function resolveConvexUrl(): string | null {
  if (process.argv[2]) return process.argv[2];
  if (process.env.NEXT_PUBLIC_CONVEX_URL) return process.env.NEXT_PUBLIC_CONVEX_URL;

  try {
    const envPath = path.resolve(__dirname, "..", ".env.local");
    const envContent = fs.readFileSync(envPath, "utf-8");
    const match = envContent.match(/NEXT_PUBLIC_CONVEX_URL\s*=\s*(.+)/);
    if (match) return match[1].trim();
  } catch {
    // fall through
  }

  return null;
}

async function main() {
  const convexUrl = resolveConvexUrl();
  if (!convexUrl) {
    console.error(
      "Error: No Convex URL found.\n" +
        "Provide it as:\n" +
        "  1. CLI argument:  npx tsx scripts/seed-agents.ts https://your-deployment.convex.cloud\n" +
        "  2. Env var:       NEXT_PUBLIC_CONVEX_URL=... npx tsx scripts/seed-agents.ts\n" +
        "  3. In .env.local: NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud"
    );
    process.exit(1);
  }

  console.log(`Seeding agents to: ${convexUrl}\n`);

  const client = new ConvexHttpClient(convexUrl);

  // Check existing agents
  const existing = await client.query(api.agents.list);
  const existingNames = new Set(existing.map((a: any) => a.name));

  let created = 0;
  let skipped = 0;

  for (const agent of agentsToSeed) {
    if (existingNames.has(agent.name)) {
      console.log(`  SKIP  ${agent.name} (already exists)`);
      skipped++;
      continue;
    }

    await client.mutation(api.agents.create, agent);
    console.log(`  ADD   ${agent.name} (${agent.role})`);
    created++;
  }

  console.log(`\nDone: ${created} created, ${skipped} skipped.`);
}

main().catch((err) => {
  console.error(`Fatal: ${err.message}`);
  process.exit(1);
});

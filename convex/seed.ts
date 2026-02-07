import { mutation } from "./_generated/server";

// Agent seed data matching src/lib/agents.ts
const SEED_AGENTS = [
  {
    name: "Hoyuelo",
    role: "Lead Coordinator",
    anime: "Mob Psycho 100",
    emoji: "\u{1F60A}",
    avatar_url: "/avatars/hoyuelo.png",
    level: "LEAD" as const,
    color: "#22c55e",
    status: "working" as const,
    current_task: "Building Mission Control",
  },
  {
    name: "Reigen",
    role: "Business & Strategy",
    anime: "Mob Psycho 100",
    emoji: "\u{1F3A9}",
    avatar_url: "/avatars/reigen.png",
    level: "SPC" as const,
    color: "#eab308",
    status: "idle" as const,
  },
  {
    name: "Robin",
    role: "Research & Analysis",
    anime: "One Piece",
    emoji: "\u{1F4DA}",
    avatar_url: "/avatars/robin.png",
    level: "SPC" as const,
    color: "#8b5cf6",
    status: "idle" as const,
  },
  {
    name: "Franky",
    role: "Developer",
    anime: "One Piece",
    emoji: "\u{1F916}",
    avatar_url: "/avatars/franky.png",
    level: "SPC" as const,
    color: "#3b82f6",
    status: "idle" as const,
  },
  {
    name: "Nanami",
    role: "Project Management",
    anime: "Jujutsu Kaisen",
    emoji: "\u{1F454}",
    avatar_url: "/avatars/nanami.png",
    level: "SPC" as const,
    color: "#6366f1",
    status: "idle" as const,
  },
  {
    name: "Frieren",
    role: "Documentation",
    anime: "Frieren",
    emoji: "\u{2744}\u{FE0F}",
    avatar_url: "/avatars/frieren.png",
    level: "SPC" as const,
    color: "#06b6d4",
    status: "idle" as const,
  },
  {
    name: "Maomao",
    role: "Code Review",
    anime: "Apothecary Diaries",
    emoji: "\u{1F9EA}",
    avatar_url: "/avatars/maomao.png",
    level: "SPC" as const,
    color: "#ec4899",
    status: "idle" as const,
  },
  {
    name: "Rimuru",
    role: "UI/UX Lead",
    anime: "Slime",
    emoji: "\u{1F535}",
    avatar_url: "/avatars/rimuru.png",
    level: "SPC" as const,
    color: "#0ea5e9",
    status: "done" as const,
    current_task: "Property Management UI",
  },
] as const;

// Seed the database with the 8 agents
// Checks for existing agents by name to avoid duplicates
export const seedAgents = mutation({
  handler: async (ctx) => {
    const existingAgents = await ctx.db.query("agents").collect();
    const existingNames = new Set(existingAgents.map((a) => a.name));

    const inserted: string[] = [];
    const skipped: string[] = [];

    for (const agent of SEED_AGENTS) {
      if (existingNames.has(agent.name)) {
        skipped.push(agent.name);
        continue;
      }

      await ctx.db.insert("agents", {
        name: agent.name,
        role: agent.role,
        anime: agent.anime,
        emoji: agent.emoji,
        avatar_url: agent.avatar_url,
        level: agent.level,
        color: agent.color,
        status: agent.status,
        current_task: "current_task" in agent ? agent.current_task : undefined,
        last_heartbeat: Date.now(),
      });

      inserted.push(agent.name);
    }

    return {
      inserted,
      skipped,
      total: existingAgents.length + inserted.length,
    };
  },
});

// Clear all agents (useful for resetting during development)
export const clearAgents = mutation({
  handler: async (ctx) => {
    const agents = await ctx.db.query("agents").collect();
    for (const agent of agents) {
      await ctx.db.delete(agent._id);
    }
    return { deleted: agents.length };
  },
});

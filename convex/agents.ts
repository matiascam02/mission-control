import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Query: Get all agents
export const list = query({
  handler: async (ctx) => {
    const agents = await ctx.db
      .query("agents")
      .order("desc")
      .collect();
    return agents;
  },
});

// Query: Get agent by ID
export const get = query({
  args: { id: v.id("agents") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

// Query: Get agents by status
export const byStatus = query({
  args: { status: v.string() },
  handler: async (ctx, { status }) => {
    return await ctx.db
      .query("agents")
      .withIndex("by_status", (q) => q.eq("status", status as any))
      .collect();
  },
});

// Mutation: Create agent
export const create = mutation({
  args: {
    name: v.string(),
    role: v.string(),
    anime: v.optional(v.string()),
    emoji: v.optional(v.string()),
    avatar_url: v.optional(v.string()),
    level: v.union(v.literal("LEAD"), v.literal("SPC"), v.literal("INT")),
    color: v.optional(v.string()),
    session_key: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("agents", {
      ...args,
      status: "idle",
      current_task: undefined,
      last_heartbeat: Date.now(),
    });
  },
});

// Mutation: Update agent status
export const updateStatus = mutation({
  args: {
    id: v.id("agents"),
    status: v.union(
      v.literal("idle"),
      v.literal("working"),
      v.literal("done"),
      v.literal("blocked")
    ),
    current_task: v.optional(v.string()),
  },
  handler: async (ctx, { id, status, current_task }) => {
    await ctx.db.patch(id, {
      status,
      current_task,
      last_heartbeat: Date.now(),
    });

    // Create activity log
    const agent = await ctx.db.get(id);
    if (agent) {
      await ctx.db.insert("activities", {
        type: "status_change",
        agent_id: id,
        title: `${agent.name} is now ${status}`,
        message: `Agent status changed to ${status}`,
        metadata: { previous_status: agent.status, new_status: status },
      });
    }
  },
});

// Mutation: Update last heartbeat
export const heartbeat = mutation({
  args: { id: v.id("agents") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, {
      last_heartbeat: Date.now(),
    });
  },
});

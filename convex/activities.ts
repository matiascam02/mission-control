import { query } from "./_generated/server";
import { v } from "convex/values";

// Query: Get recent activities
export const recent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 20 }) => {
    const activities = await ctx.db
      .query("activities")
      .order("desc")
      .take(limit);

    // Enrich with agent and task info
    return await Promise.all(
      activities.map(async (activity) => {
        const agent = activity.agent_id
          ? await ctx.db.get(activity.agent_id)
          : null;
        const task = activity.task_id
          ? await ctx.db.get(activity.task_id)
          : null;

        return {
          ...activity,
          agent,
          task,
        };
      })
    );
  },
});

// Query: Get activities by agent
export const byAgent = query({
  args: { agentId: v.id("agents"), limit: v.optional(v.number()) },
  handler: async (ctx, { agentId, limit = 20 }) => {
    return await ctx.db
      .query("activities")
      .withIndex("by_agent", (q) => q.eq("agent_id", agentId))
      .order("desc")
      .take(limit);
  },
});

// Query: Get activities by task
export const byTask = query({
  args: { taskId: v.id("tasks"), limit: v.optional(v.number()) },
  handler: async (ctx, { taskId, limit = 20 }) => {
    return await ctx.db
      .query("activities")
      .withIndex("by_task", (q) => q.eq("task_id", taskId))
      .order("desc")
      .take(limit);
  },
});

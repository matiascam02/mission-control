import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Query: Get all tasks
export const list = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("tasks")
      .order("desc")
      .collect();
  },
});

// Query: Get task by ID
export const get = query({
  args: { id: v.id("tasks") },
  handler: async (ctx, { id }) => {
    const task = await ctx.db.get(id);
    if (!task) return null;

    // Get assignees
    const assignees = await ctx.db
      .query("task_assignees")
      .withIndex("by_task", (q) => q.eq("task_id", id))
      .collect();

    const assigneeAgents = await Promise.all(
      assignees.map((a) => ctx.db.get(a.agent_id))
    );

    return {
      ...task,
      assignees: assigneeAgents.filter((a) => a !== null),
    };
  },
});

// Query: Get tasks by status
export const byStatus = query({
  args: { status: v.string() },
  handler: async (ctx, { status }) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_status", (q) => q.eq("status", status as any))
      .collect();
  },
});

// Mutation: Create task
export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    ),
    tags: v.optional(v.array(v.string())),
    assigneeIds: v.optional(v.array(v.id("agents"))),
  },
  handler: async (ctx, { assigneeIds = [], tags = [], ...args }) => {
    const taskId = await ctx.db.insert("tasks", {
      ...args,
      tags,
      status: assigneeIds.length > 0 ? "assigned" : "inbox",
    });

    // Assign agents
    for (const agentId of assigneeIds) {
      await ctx.db.insert("task_assignees", {
        task_id: taskId,
        agent_id: agentId,
      });
    }

    // Create activity
    await ctx.db.insert("activities", {
      type: "task_created",
      task_id: taskId,
      title: "New task created",
      message: `Task "${args.title}" was created`,
      metadata: { task_id: taskId },
    });

    return taskId;
  },
});

// Mutation: Update task status
export const updateStatus = mutation({
  args: {
    id: v.id("tasks"),
    status: v.union(
      v.literal("inbox"),
      v.literal("assigned"),
      v.literal("in_progress"),
      v.literal("review"),
      v.literal("done"),
      v.literal("blocked")
    ),
  },
  handler: async (ctx, { id, status }) => {
    const task = await ctx.db.get(id);
    if (!task) throw new Error("Task not found");

    await ctx.db.patch(id, { status });

    // Create activity
    await ctx.db.insert("activities", {
      type: "status_change",
      task_id: id,
      title: `Task moved to ${status}`,
      message: `"${task.title}" status changed to ${status}`,
      metadata: { previous_status: task.status, new_status: status },
    });
  },
});

// Mutation: Assign agent to task
export const assignAgent = mutation({
  args: {
    taskId: v.id("tasks"),
    agentId: v.id("agents"),
  },
  handler: async (ctx, { taskId, agentId }) => {
    // Check if already assigned
    const existing = await ctx.db
      .query("task_assignees")
      .withIndex("by_task", (q) => q.eq("task_id", taskId))
      .filter((q) => q.eq(q.field("agent_id"), agentId))
      .first();

    if (existing) return;

    await ctx.db.insert("task_assignees", {
      task_id: taskId,
      agent_id: agentId,
    });

    const task = await ctx.db.get(taskId);
    const agent = await ctx.db.get(agentId);

    if (task && agent) {
      await ctx.db.insert("activities", {
        type: "agent_assigned",
        task_id: taskId,
        agent_id: agentId,
        title: `${agent.name} assigned to task`,
        message: `${agent.name} was assigned to "${task.title}"`,
      });
    }
  },
});

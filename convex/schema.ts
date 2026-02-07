import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  agents: defineTable({
    name: v.string(),
    role: v.string(),
    anime: v.optional(v.string()),
    emoji: v.optional(v.string()),
    avatar_url: v.optional(v.string()),
    level: v.union(v.literal("LEAD"), v.literal("SPC"), v.literal("INT")),
    status: v.union(
      v.literal("idle"),
      v.literal("working"),
      v.literal("done"),
      v.literal("blocked")
    ),
    current_task: v.optional(v.string()),
    color: v.optional(v.string()),
    session_key: v.optional(v.string()),
    last_heartbeat: v.optional(v.number()),
  })
    .index("by_status", ["status"])
    .index("by_session_key", ["session_key"]),

  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("inbox"),
      v.literal("assigned"),
      v.literal("in_progress"),
      v.literal("review"),
      v.literal("done"),
      v.literal("blocked")
    ),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    ),
    tags: v.array(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_priority", ["priority"]),

  task_assignees: defineTable({
    task_id: v.id("tasks"),
    agent_id: v.id("agents"),
  })
    .index("by_task", ["task_id"])
    .index("by_agent", ["agent_id"]),

  activities: defineTable({
    type: v.string(),
    agent_id: v.optional(v.id("agents")),
    task_id: v.optional(v.id("tasks")),
    title: v.string(),
    description: v.optional(v.string()),
    message: v.string(),
    metadata: v.optional(v.any()),
  })
    .index("by_agent", ["agent_id"])
    .index("by_task", ["task_id"])
    .index("by_type", ["type"]),

  comments: defineTable({
    task_id: v.id("tasks"),
    agent_id: v.optional(v.id("agents")),
    content: v.string(),
  }).index("by_task", ["task_id"]),
});

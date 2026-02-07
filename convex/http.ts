import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const http = httpRouter();

// POST /agent/heartbeat - External agents report status
http.route({
  path: "/agent/heartbeat",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: "Invalid JSON body" }, 400);
    }

    const { sessionKey, status, currentTask } = body as {
      sessionKey?: string;
      status?: string;
      currentTask?: string;
    };

    if (!sessionKey || typeof sessionKey !== "string") {
      return jsonResponse({ error: "sessionKey is required" }, 400);
    }

    const validStatuses = ["idle", "working", "done", "blocked"];

    // Look up agent by session key
    const agent = await ctx.runQuery(internal.agents.bySessionKey, {
      sessionKey,
    });

    if (!agent) {
      return jsonResponse({ error: "Agent not found for this session key" }, 404);
    }

    // If status provided, update status + optional currentTask
    if (status) {
      if (!validStatuses.includes(status)) {
        return jsonResponse(
          { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
          400
        );
      }

      await ctx.runMutation(internal.agents.updateStatusInternal, {
        id: agent._id,
        status: status as "idle" | "working" | "done" | "blocked",
        current_task: currentTask,
      });
    } else {
      // Just a heartbeat ping - update timestamp only
      await ctx.runMutation(internal.agents.heartbeatInternal, {
        id: agent._id,
      });
    }

    return jsonResponse({
      ok: true,
      agent: agent.name,
      status: status || agent.status,
    });
  }),
});

// CORS preflight for /agent/heartbeat
http.route({
  path: "/agent/heartbeat",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, { status: 204, headers: corsHeaders });
  }),
});

// POST /agent/task-update - External agents update task status
http.route({
  path: "/agent/task-update",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: "Invalid JSON body" }, 400);
    }

    const { sessionKey, taskId, status } = body as {
      sessionKey?: string;
      taskId?: string;
      status?: string;
    };

    if (!sessionKey || typeof sessionKey !== "string") {
      return jsonResponse({ error: "sessionKey is required" }, 400);
    }
    if (!taskId || typeof taskId !== "string") {
      return jsonResponse({ error: "taskId is required" }, 400);
    }
    if (!status || typeof status !== "string") {
      return jsonResponse({ error: "status is required" }, 400);
    }

    const validStatuses = [
      "inbox",
      "assigned",
      "in_progress",
      "review",
      "done",
      "blocked",
    ];
    if (!validStatuses.includes(status)) {
      return jsonResponse(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        400
      );
    }

    // Authenticate agent by session key
    const agent = await ctx.runQuery(internal.agents.bySessionKey, {
      sessionKey,
    });

    if (!agent) {
      return jsonResponse({ error: "Agent not found for this session key" }, 404);
    }

    try {
      await ctx.runMutation(internal.tasks.updateStatusInternal, {
        taskId: taskId as any,
        agentId: agent._id,
        status: status as any,
      });
    } catch (err: any) {
      return jsonResponse({ error: err.message || "Failed to update task" }, 400);
    }

    return jsonResponse({
      ok: true,
      agent: agent.name,
      taskId,
      status,
    });
  }),
});

// CORS preflight for /agent/task-update
http.route({
  path: "/agent/task-update",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, { status: 204, headers: corsHeaders });
  }),
});

// GET /agents - List all agents
http.route({
  path: "/agents",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const agents = await ctx.runQuery(internal.agents.listInternal);
    return jsonResponse({ agents });
  }),
});

// CORS preflight for /agents
http.route({
  path: "/agents",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, { status: 204, headers: corsHeaders });
  }),
});

export default http;

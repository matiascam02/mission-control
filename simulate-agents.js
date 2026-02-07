#!/usr/bin/env node
/**
 * Simulate OpenClaw agents updating their status
 * Run this to see real-time updates in Mission Control
 */

const CONVEX_ENDPOINT = process.env.CONVEX_URL || "http://localhost:3000";

const agents = [
  { key: "hoyuelo-main", name: "Hoyuelo", emoji: "🦞" },
  { key: "franky-backend", name: "Franky", emoji: "⚙️" },
  { key: "robin-frontend", name: "Robin", emoji: "🌸" },
  { key: "rimuru-ux", name: "Rimuru", emoji: "💙" },
  { key: "reigen-devops", name: "Reigen", emoji: "🎯" }
];

const statuses = ["idle", "working", "done", "blocked"];

const tasks = [
  "Migrating Supabase to Convex",
  "Updating React components",
  "Testing real-time sync",
  "Reviewing code quality",
  "Deploying to Railway",
  "Optimizing queries",
  "Fixing UI bugs",
  "Writing documentation",
  "Setting up monitoring",
  "Refactoring components"
];

const activities = [
  "Started working on task",
  "Made significant progress",
  "Encountered a blocker",
  "Resolved issue",
  "Completed milestone",
  "Reviewing changes",
  "Running tests",
  "Pushing to repo"
];

async function updateAgent(agent) {
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const task = Math.random() > 0.3 ? tasks[Math.floor(Math.random() * tasks.length)] : undefined;
  
  try {
    const response = await fetch(`${CONVEX_ENDPOINT}/api/convex/agent/heartbeat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionKey: agent.key,
        status,
        currentTask: task
      })
    });
    
    const emoji = status === "working" ? "⚡" : status === "done" ? "✅" : status === "blocked" ? "🔴" : "💤";
    console.log(`${emoji} ${agent.emoji} ${agent.name} → ${status} ${task ? `(${task})` : ""}`);
    
    if (!response.ok) {
      console.error(`❌ Failed to update ${agent.name}:`, await response.text());
    }
  } catch (error) {
    console.error(`❌ Error updating ${agent.name}:`, error.message);
  }
}

async function simulateActivity() {
  const agent = agents[Math.floor(Math.random() * agents.length)];
  const activity = activities[Math.floor(Math.random() * activities.length)];
  
  console.log(`📝 ${agent.emoji} ${agent.name}: ${activity}`);
  
  await updateAgent(agent);
}

async function run() {
  console.log("🚀 Starting Mission Control Agent Simulator");
  console.log(`🔗 Endpoint: ${CONVEX_ENDPOINT}`);
  console.log(`👥 Simulating ${agents.length} agents\n`);
  
  // Initial update for all agents
  console.log("📊 Initializing all agents...\n");
  for (const agent of agents) {
    await updateAgent(agent);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log("\n🔄 Starting continuous simulation (Ctrl+C to stop)...\n");
  
  // Random updates every 2-5 seconds
  setInterval(() => {
    simulateActivity();
  }, 2000 + Math.random() * 3000);
}

run();

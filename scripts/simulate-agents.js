#!/usr/bin/env node

/**
 * Agent Simulator for Mission Control
 *
 * Sends heartbeat requests to the Convex HTTP endpoint to simulate
 * agents cycling through different statuses with realistic tasks.
 *
 * Usage:
 *   node scripts/simulate-agents.js [CONVEX_SITE_URL]
 *
 * The endpoint URL is resolved in this order:
 *   1. First CLI argument
 *   2. CONVEX_SITE_URL env var
 *   3. NEXT_PUBLIC_CONVEX_SITE_URL from .env.local
 */

const fs = require("fs");
const path = require("path");

// -- Configuration --

const agents = [
  {
    sessionKey: "hoyuelo-session",
    name: "Hoyuelo",
    tasks: [
      "Building Mission Control",
      "Coordinating sprint planning",
      "Reviewing architecture decisions",
      "Setting up team workflows",
    ],
  },
  {
    sessionKey: "reigen-session",
    name: "Reigen",
    tasks: [
      "Processing emails",
      "Drafting client proposals",
      "Updating business metrics",
      "Running competitive analysis",
    ],
  },
  {
    sessionKey: "robin-session",
    name: "Robin",
    tasks: [
      "Analyzing data patterns",
      "Writing research report",
      "Investigating API performance",
      "Cross-referencing documentation",
    ],
  },
  {
    sessionKey: "franky-session",
    name: "Franky",
    tasks: [
      "Deploying new build",
      "Fixing CI pipeline",
      "Refactoring auth module",
      "Writing integration tests",
    ],
  },
];

const statuses = ["idle", "working", "done", "blocked"];

const colors = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  red: "\x1b[31m",
};

const statusColors = {
  idle: colors.dim,
  working: colors.green,
  done: colors.blue,
  blocked: colors.red,
};

// -- Resolve endpoint URL --

function resolveEndpointUrl() {
  // 1. CLI argument
  if (process.argv[2]) {
    return process.argv[2];
  }

  // 2. Environment variable
  if (process.env.CONVEX_SITE_URL) {
    return process.env.CONVEX_SITE_URL;
  }

  // 3. Read from .env.local
  try {
    const envPath = path.resolve(__dirname, "..", ".env.local");
    const envContent = fs.readFileSync(envPath, "utf-8");
    const match = envContent.match(
      /NEXT_PUBLIC_CONVEX_SITE_URL\s*=\s*(.+)/
    );
    if (match) {
      return match[1].trim();
    }
  } catch {
    // .env.local not found, fall through
  }

  return null;
}

// -- Helpers --

function timestamp() {
  return new Date().toLocaleTimeString("en-US", { hour12: false });
}

function log(agent, status, task) {
  const color = statusColors[status] || colors.reset;
  const taskStr = task ? ` -> "${task}"` : "";
  console.log(
    `${colors.dim}[${timestamp()}]${colors.reset} ${colors.cyan}${agent.name.padEnd(10)}${colors.reset} ${color}${status.padEnd(8)}${colors.reset}${taskStr}`
  );
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDelay(minMs, maxMs) {
  return Math.floor(Math.random() * (maxMs - minMs)) + minMs;
}

// -- Main simulation --

async function sendHeartbeat(baseUrl, agent, status, currentTask) {
  const url = `${baseUrl}/agent/heartbeat`;
  const body = { sessionKey: agent.sessionKey, status };
  if (currentTask) {
    body.currentTask = currentTask;
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(
        `${colors.red}[ERROR] ${agent.name}: ${res.status} - ${err}${colors.reset}`
      );
      return false;
    }

    return true;
  } catch (err) {
    console.error(
      `${colors.red}[ERROR] ${agent.name}: ${err.message}${colors.reset}`
    );
    return false;
  }
}

async function simulateAgent(baseUrl, agent) {
  let statusIndex = 0;

  while (true) {
    const status = statuses[statusIndex % statuses.length];
    const currentTask = status === "working" ? randomItem(agent.tasks) : undefined;

    log(agent, status, currentTask);
    await sendHeartbeat(baseUrl, agent, status, currentTask);

    // Wait 2-5 seconds before next transition
    const delay = randomDelay(2000, 5000);
    await new Promise((r) => setTimeout(r, delay));

    statusIndex++;
  }
}

async function main() {
  const baseUrl = resolveEndpointUrl();

  if (!baseUrl) {
    console.error(
      `${colors.red}Error: No Convex site URL found.${colors.reset}\n` +
        `Provide it as:\n` +
        `  1. CLI argument:  node scripts/simulate-agents.js https://your-deployment.convex.site\n` +
        `  2. Env var:       CONVEX_SITE_URL=... node scripts/simulate-agents.js\n` +
        `  3. In .env.local: NEXT_PUBLIC_CONVEX_SITE_URL=https://your-deployment.convex.site`
    );
    process.exit(1);
  }

  console.log(
    `\n${colors.magenta}Mission Control Agent Simulator${colors.reset}`
  );
  console.log(`${colors.dim}Endpoint: ${baseUrl}${colors.reset}`);
  console.log(
    `${colors.dim}Agents:   ${agents.map((a) => a.name).join(", ")}${colors.reset}\n`
  );

  // Stagger agent starts so they don't all fire at once
  const promises = agents.map((agent, i) =>
    new Promise((resolve) => setTimeout(resolve, i * 800)).then(() =>
      simulateAgent(baseUrl, agent)
    )
  );

  await Promise.all(promises);
}

main().catch((err) => {
  console.error(`${colors.red}Fatal: ${err.message}${colors.reset}`);
  process.exit(1);
});

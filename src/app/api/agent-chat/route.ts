import { NextRequest, NextResponse } from 'next/server';

// OpenClaw Gateway configuration
const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || 'http://localhost:4445';
const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN;

// Map agent IDs to their session keys
const AGENT_SESSION_MAP: Record<string, string> = {
  'franky': 'franky',
  'reigen': 'reigen',
  'robin': 'robin',
  'nanami': 'nanami',
  'frieren': 'frieren',
  'maomao': 'maomao',
  'rimuru': 'rimuru',
  'hoyuelo': 'hoyuelo',
};

export async function POST(request: NextRequest) {
  try {
    const { agentId, message } = await request.json();

    if (!agentId || !message) {
      return NextResponse.json(
        { error: 'Missing agentId or message' },
        { status: 400 }
      );
    }

    if (!GATEWAY_TOKEN) {
      return NextResponse.json(
        { error: 'Gateway not configured' },
        { status: 500 }
      );
    }

    const sessionKey = AGENT_SESSION_MAP[agentId.toLowerCase()];
    if (!sessionKey) {
      return NextResponse.json(
        { error: `Unknown agent: ${agentId}` },
        { status: 404 }
      );
    }

    // Send message to agent via OpenClaw Gateway
    const response = await fetch(`${GATEWAY_URL}/api/sessions/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GATEWAY_TOKEN}`,
      },
      body: JSON.stringify({
        sessionKey,
        message: `[Mission Control Chat] ${message}`,
        timeoutSeconds: 120, // 2 minutes timeout for response
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gateway error:', errorText);
      return NextResponse.json(
        { error: 'Failed to reach agent', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Extract the agent's response
    const agentResponse = data.response || data.message || 'No response';

    return NextResponse.json({
      success: true,
      agentId,
      response: agentResponse,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Agent chat error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    agents: Object.keys(AGENT_SESSION_MAP),
    gatewayConfigured: !!GATEWAY_TOKEN,
  });
}

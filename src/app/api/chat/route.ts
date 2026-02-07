import { NextRequest, NextResponse } from 'next/server';

// This endpoint is deprecated. Chat now goes through /api/agent-chat.
// Kept as a stub to avoid 404s if anything still references it.

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Deprecated. Use /api/agent-chat instead.' },
    { status: 410 }
  );
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: 'Deprecated. Use /api/agent-chat instead.', messages: [] },
    { status: 410 }
  );
}

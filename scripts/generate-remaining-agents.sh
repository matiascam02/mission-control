#!/bin/bash
# 
# Generate remaining 6 agents with Opus 4.5 quality prompts
# Run this after reviewing Franky's sprites
#

set -e

cd /Users/matias-claw/.openclaw/workspace/mission-control

# Load environment
source .env.local
export $(cat .env.local | grep -v '^#' | xargs)

# Check FAL_KEY
if [ -z "$FAL_KEY" ]; then
  echo "❌ FAL_KEY not set!"
  exit 1
fi

echo "🚀 Generating remaining 6 agents with Opus 4.5 prompts"
echo ""
echo "Agents: maomao, reigen, robin, nanami, frieren, rimuru"
echo "Time estimate: ~25-30 minutes total"
echo ""
read -p "Press ENTER to continue or Ctrl+C to cancel..."

# Array of remaining agents
agents=("maomao" "reigen" "robin" "nanami" "frieren" "rimuru")

for agent in "${agents[@]}"; do
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🎨 Generating: $agent"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  node scripts/generate-opus-sprites.js "$agent"
  
  echo ""
  echo "✅ $agent complete!"
  echo "⏸️  Pausing 5s before next agent..."
  sleep 5
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 ALL AGENTS COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Generated sprites:"
ls -lh public/sprites/*/idle.png public/sprites/*/walk.png public/sprites/*/working.png public/sprites/*/done.png | grep -v "attack\|jump\|character"
echo ""
echo "✅ Done! Check OPUS_SPRITE_GENERATION_REPORT.md for details"

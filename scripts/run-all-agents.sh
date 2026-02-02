#!/bin/bash
# Generate sprites for all agents sequentially

cd /Users/matias-claw/.openclaw/workspace/mission-control
export FAL_KEY="e714987a-fb4c-4b0a-8210-684a38a5cbf2:4fa394721ab920ab382158759cc4c43b"

AGENTS=("maomao" "nanami" "reigen" "rimuru" "robin")

for agent in "${AGENTS[@]}"; do
  echo ""
  echo "=================================================="
  echo "Starting: $agent"
  echo "=================================================="
  node scripts/generate-all-sprites.js "$agent"
  
  if [ $? -eq 0 ]; then
    echo "✅ $agent complete"
  else
    echo "❌ $agent failed"
  fi
  
  echo "Waiting 10 seconds before next agent..."
  sleep 10
done

echo ""
echo "=================================================="
echo "🎉 ALL AGENTS COMPLETE"
echo "=================================================="

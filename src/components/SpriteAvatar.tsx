'use client';

import { useState, useEffect } from 'react';
import { AnimatedSprite, SPRITE_AGENTS, SpriteAgentName } from './AnimatedSprite';

interface SpriteAvatarProps {
  /** Agent name (must match a key in SPRITE_AGENTS) */
  agentName: string;
  /** Agent status for animation */
  status?: 'idle' | 'working' | 'done' | 'blocked';
  /** Size of the sprite (1 = 64px, 2 = 128px, etc.) */
  scale?: number;
  /** Fallback emoji if no sprite available */
  fallbackEmoji?: string;
  /** Fallback color for emoji background */
  fallbackColor?: string;
  /** Additional CSS classes */
  className?: string;
  /** Show glow effect when working */
  showGlow?: boolean;
}

/**
 * SpriteAvatar - Shows animated sprite for agents that have one,
 * falls back to emoji avatar for agents without sprites.
 * 
 * Usage:
 * ```tsx
 * <SpriteAvatar
 *   agentName="hoyuelo"
 *   status={agent.status}
 *   scale={1.5}
 *   fallbackEmoji="👻"
 *   fallbackColor="#4ADE80"
 * />
 * ```
 */
export function SpriteAvatar({
  agentName,
  status = 'idle',
  scale = 1,
  fallbackEmoji = '🤖',
  fallbackColor = '#f97316',
  className = '',
  showGlow = true,
}: SpriteAvatarProps) {
  const [hasSprite, setHasSprite] = useState(false);
  
  // Check if this agent has a sprite
  const normalizedName = agentName.toLowerCase() as SpriteAgentName;
  const spriteExists = normalizedName in SPRITE_AGENTS;

  useEffect(() => {
    setHasSprite(spriteExists);
  }, [spriteExists]);

  const size = 64 * scale;
  const glowActive = showGlow && status === 'working';

  if (hasSprite) {
    return (
      <div 
        className={`relative ${className}`}
        style={{
          width: size,
          height: size,
        }}
      >
        {/* Glow effect */}
        {glowActive && (
          <div 
            className="absolute inset-0 rounded-2xl animate-pulse opacity-50"
            style={{
              background: `radial-gradient(circle, ${fallbackColor}40 0%, transparent 70%)`,
              filter: 'blur(8px)',
            }}
          />
        )}
        
        <AnimatedSprite
          metadataPath={SPRITE_AGENTS[normalizedName]}
          status={status}
          scale={scale}
          playing={true}
          className="relative z-10"
        />
      </div>
    );
  }

  // Fallback to emoji avatar
  return (
    <div
      className={`flex items-center justify-center rounded-2xl transition-all ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: fallbackColor + '15',
        boxShadow: glowActive ? `0 4px 24px ${fallbackColor}40` : 'none',
        fontSize: size * 0.5,
      }}
    >
      {fallbackEmoji}
    </div>
  );
}

/**
 * Check if an agent name has an associated sprite
 */
export function hasAgentSprite(agentName: string): boolean {
  return agentName.toLowerCase() in SPRITE_AGENTS;
}

/**
 * Get list of all available sprite agent names
 */
export function getAvailableSpriteAgents(): string[] {
  return Object.keys(SPRITE_AGENTS);
}

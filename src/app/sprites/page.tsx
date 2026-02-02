'use client';

import { useState } from 'react';
import { AnimatedSprite, SPRITE_AGENTS, SpriteAgentName } from '@/components/AnimatedSprite';
import { ArrowLeft, Play, Pause, Zap, Activity, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

type AgentStatus = 'idle' | 'working' | 'done' | 'blocked';

export default function SpritesDemo() {
  const [selectedAgent] = useState<SpriteAgentName>('hoyuelo');
  const [currentAnimation, setCurrentAnimation] = useState<string | undefined>(undefined);
  const [currentStatus, setCurrentStatus] = useState<AgentStatus>('idle');
  const [scale, setScale] = useState(2);
  const [flipX, setFlipX] = useState(false);
  const [playing, setPlaying] = useState(true);

  const statuses: { value: AgentStatus; label: string; icon: typeof Activity }[] = [
    { value: 'idle', label: 'Idle', icon: Activity },
    { value: 'working', label: 'Working', icon: Zap },
    { value: 'done', label: 'Done', icon: CheckCircle2 },
    { value: 'blocked', label: 'Blocked', icon: AlertCircle },
  ];

  const animations = ['idle', 'working', 'walking'];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/"
            className="p-2 hover:bg-white/5 rounded-xl transition-colors"
          >
            <ArrowLeft size={20} className="text-zinc-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Sprite Animation System</h1>
            <p className="text-zinc-500 text-sm">POC: Hoyuelo (Dimple from Mob Psycho 100)</p>
          </div>
        </div>

        {/* Main Demo Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Preview */}
          <div className="bg-zinc-900/50 rounded-2xl border border-white/5 p-8 flex flex-col items-center">
            <h2 className="text-lg font-semibold mb-6 text-zinc-300">Preview</h2>
            
            {/* Sprite Canvas */}
            <div 
              className="bg-zinc-800/50 rounded-xl p-8 mb-6"
              style={{ 
                backgroundImage: 'repeating-conic-gradient(#27272a 0% 25%, #1f1f23 0% 50%)',
                backgroundSize: '16px 16px',
              }}
            >
              <AnimatedSprite
                metadataPath={SPRITE_AGENTS[selectedAgent]}
                animation={currentAnimation}
                status={currentStatus}
                scale={scale}
                flipX={flipX}
                playing={playing}
              />
            </div>

            {/* Playback Controls */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setPlaying(!playing)}
                className={`p-3 rounded-xl transition-colors ${
                  playing 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : 'bg-zinc-700/50 text-zinc-400 hover:bg-zinc-700'
                }`}
              >
                {playing ? <Pause size={20} /> : <Play size={20} />}
              </button>
              
              <button
                onClick={() => setFlipX(!flipX)}
                className={`px-4 py-2 rounded-xl text-sm transition-colors ${
                  flipX 
                    ? 'bg-blue-500/20 text-blue-400' 
                    : 'bg-zinc-700/50 text-zinc-400 hover:bg-zinc-700'
                }`}
              >
                {flipX ? '← Facing Left' : 'Facing Right →'}
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-6">
            {/* Status Selector */}
            <div className="bg-zinc-900/50 rounded-2xl border border-white/5 p-6">
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
                Agent Status (Auto-maps to animation)
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {statuses.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => {
                      setCurrentStatus(value);
                      setCurrentAnimation(undefined); // Let status control animation
                    }}
                    className={`p-3 rounded-xl flex items-center gap-2 transition-all ${
                      currentStatus === value && !currentAnimation
                        ? 'bg-orange-500/20 text-orange-400 ring-1 ring-orange-500/50'
                        : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700/50'
                    }`}
                  >
                    <Icon size={16} />
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Animation Override */}
            <div className="bg-zinc-900/50 rounded-2xl border border-white/5 p-6">
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
                Animation Override
              </h3>
              <div className="flex flex-wrap gap-2">
                {animations.map((anim) => (
                  <button
                    key={anim}
                    onClick={() => setCurrentAnimation(anim === currentAnimation ? undefined : anim)}
                    className={`px-4 py-2 rounded-xl text-sm transition-all ${
                      currentAnimation === anim
                        ? 'bg-purple-500/20 text-purple-400 ring-1 ring-purple-500/50'
                        : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700/50'
                    }`}
                  >
                    {anim}
                  </button>
                ))}
              </div>
              {currentAnimation && (
                <p className="mt-3 text-xs text-zinc-500">
                  Animation override active. Click again to use status-based animation.
                </p>
              )}
            </div>

            {/* Scale Control */}
            <div className="bg-zinc-900/50 rounded-2xl border border-white/5 p-6">
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
                Scale: {scale}x ({64 * scale}px)
              </h3>
              <input
                type="range"
                min="1"
                max="4"
                value={scale}
                onChange={(e) => setScale(parseInt(e.target.value))}
                className="w-full accent-orange-500"
              />
              <div className="flex justify-between text-xs text-zinc-500 mt-2">
                <span>1x (64px)</span>
                <span>2x (128px)</span>
                <span>3x (192px)</span>
                <span>4x (256px)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Integration Example */}
        <div className="mt-8 bg-zinc-900/50 rounded-2xl border border-white/5 p-6">
          <h3 className="text-lg font-semibold mb-4">Integration Example</h3>
          <pre className="bg-zinc-950 rounded-xl p-4 text-sm text-zinc-300 overflow-x-auto">
{`import { AnimatedSprite, SPRITE_AGENTS } from '@/components/AnimatedSprite';

// Basic usage - status-based animation
<AnimatedSprite
  metadataPath={SPRITE_AGENTS.hoyuelo}
  status={agent.status}  // 'idle' | 'working' | 'done' | 'blocked'
  scale={2}
/>

// With animation override
<AnimatedSprite
  metadataPath={SPRITE_AGENTS.hoyuelo}
  animation="walking"
  flipX={direction === 'left'}
  scale={2}
/>`}
          </pre>
        </div>

        {/* Sprite Sheet Preview */}
        <div className="mt-8 bg-zinc-900/50 rounded-2xl border border-white/5 p-6">
          <h3 className="text-lg font-semibold mb-4">Sprite Sheet</h3>
          <div className="bg-zinc-950 rounded-xl p-4 inline-block">
            <img 
              src="/sprites/hoyuelo.png" 
              alt="Hoyuelo sprite sheet"
              className="pixelated"
              style={{ 
                imageRendering: 'pixelated',
                width: 256 * 2,
                height: 192 * 2,
              }}
            />
          </div>
          <div className="mt-4 text-sm text-zinc-500">
            <p>Layout: 4 columns × 3 rows (64×64 per frame)</p>
            <ul className="mt-2 list-disc list-inside space-y-1">
              <li>Row 0: Idle (floating/bobbing)</li>
              <li>Row 1: Working (with sparkles)</li>
              <li>Row 2: Walking (side movement)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

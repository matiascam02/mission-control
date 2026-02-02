'use client';

import { useState, useEffect, useRef } from 'react';

interface SpriteConfig {
  src: string;
  frames: number;
  cols: number;
  rows: number;
  fps: number;
}

interface AgentSpriteProps {
  agentId: string;
  status: 'idle' | 'working' | 'walk' | 'done' | 'blocked';
  size?: number;
  className?: string;
}

// Sprite configurations for each agent
const SPRITE_CONFIGS: Record<string, Record<string, SpriteConfig>> = {
  hoyuelo: {
    idle: { src: '/sprites/hoyuelo-v2/idle.png', frames: 4, cols: 2, rows: 2, fps: 6 },
    working: { src: '/sprites/hoyuelo-v2/working.png', frames: 4, cols: 2, rows: 2, fps: 8 },
    walk: { src: '/sprites/hoyuelo-v2/walk.png', frames: 4, cols: 2, rows: 2, fps: 10 },
    done: { src: '/sprites/hoyuelo-v2/idle.png', frames: 4, cols: 2, rows: 2, fps: 4 },
    blocked: { src: '/sprites/hoyuelo-v2/idle.png', frames: 4, cols: 2, rows: 2, fps: 2 },
  },
  franky: {
    idle: { src: '/sprites/franky/idle.png', frames: 4, cols: 4, rows: 1, fps: 6 },
    working: { src: '/sprites/franky/attack.png', frames: 4, cols: 4, rows: 1, fps: 8 },
    walk: { src: '/sprites/franky/walk.png', frames: 4, cols: 4, rows: 1, fps: 8 },
    done: { src: '/sprites/franky/idle.png', frames: 4, cols: 4, rows: 1, fps: 4 },
    blocked: { src: '/sprites/franky/idle.png', frames: 4, cols: 4, rows: 1, fps: 2 },
  },
  maomao: {
    idle: { src: '/sprites/maomao/idle.png', frames: 4, cols: 4, rows: 1, fps: 6 },
    working: { src: '/sprites/maomao/attack.png', frames: 4, cols: 4, rows: 1, fps: 8 },
    walk: { src: '/sprites/maomao/walk.png', frames: 4, cols: 4, rows: 1, fps: 8 },
    done: { src: '/sprites/maomao/idle.png', frames: 4, cols: 4, rows: 1, fps: 4 },
    blocked: { src: '/sprites/maomao/idle.png', frames: 4, cols: 4, rows: 1, fps: 2 },
  },
  reigen: {
    idle: { src: '/sprites/reigen/idle.png', frames: 4, cols: 4, rows: 1, fps: 6 },
    working: { src: '/sprites/reigen/attack.png', frames: 4, cols: 4, rows: 1, fps: 8 },
    walk: { src: '/sprites/reigen/walk.png', frames: 4, cols: 4, rows: 1, fps: 8 },
    done: { src: '/sprites/reigen/idle.png', frames: 4, cols: 4, rows: 1, fps: 4 },
    blocked: { src: '/sprites/reigen/idle.png', frames: 4, cols: 4, rows: 1, fps: 2 },
  },
  robin: {
    idle: { src: '/sprites/robin/idle.png', frames: 4, cols: 4, rows: 1, fps: 6 },
    working: { src: '/sprites/robin/attack.png', frames: 4, cols: 4, rows: 1, fps: 8 },
    walk: { src: '/sprites/robin/walk.png', frames: 4, cols: 4, rows: 1, fps: 8 },
    done: { src: '/sprites/robin/idle.png', frames: 4, cols: 4, rows: 1, fps: 4 },
    blocked: { src: '/sprites/robin/idle.png', frames: 4, cols: 4, rows: 1, fps: 2 },
  },
  nanami: {
    idle: { src: '/sprites/nanami/idle.png', frames: 4, cols: 4, rows: 1, fps: 6 },
    working: { src: '/sprites/nanami/attack.png', frames: 4, cols: 4, rows: 1, fps: 8 },
    walk: { src: '/sprites/nanami/walk.png', frames: 4, cols: 4, rows: 1, fps: 8 },
    done: { src: '/sprites/nanami/idle.png', frames: 4, cols: 4, rows: 1, fps: 4 },
    blocked: { src: '/sprites/nanami/idle.png', frames: 4, cols: 4, rows: 1, fps: 2 },
  },
  frieren: {
    idle: { src: '/sprites/frieren/idle.png', frames: 4, cols: 4, rows: 1, fps: 6 },
    working: { src: '/sprites/frieren/attack.png', frames: 4, cols: 4, rows: 1, fps: 8 },
    walk: { src: '/sprites/frieren/walk.png', frames: 4, cols: 4, rows: 1, fps: 8 },
    done: { src: '/sprites/frieren/idle.png', frames: 4, cols: 4, rows: 1, fps: 4 },
    blocked: { src: '/sprites/frieren/idle.png', frames: 4, cols: 4, rows: 1, fps: 2 },
  },
  rimuru: {
    idle: { src: '/sprites/rimuru/idle.png', frames: 4, cols: 4, rows: 1, fps: 6 },
    working: { src: '/sprites/rimuru/attack.png', frames: 4, cols: 4, rows: 1, fps: 8 },
    walk: { src: '/sprites/rimuru/walk.png', frames: 4, cols: 4, rows: 1, fps: 8 },
    done: { src: '/sprites/rimuru/idle.png', frames: 4, cols: 4, rows: 1, fps: 4 },
    blocked: { src: '/sprites/rimuru/idle.png', frames: 4, cols: 4, rows: 1, fps: 2 },
  },
};

export function AgentSprite({ agentId, status, size = 64, className = '' }: AgentSpriteProps) {
  const [frame, setFrame] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const config = SPRITE_CONFIGS[agentId]?.[status] || SPRITE_CONFIGS[agentId]?.idle;

  useEffect(() => {
    if (!config) return;

    const img = new Image();
    img.src = config.src;
    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);
    };
  }, [config?.src]);

  useEffect(() => {
    if (!config) return;
    
    const interval = setInterval(() => {
      setFrame((f) => (f + 1) % config.frames);
    }, 1000 / config.fps);

    return () => clearInterval(interval);
  }, [config]);

  useEffect(() => {
    if (!canvasRef.current || !imageRef.current || !config || !imageLoaded) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imageRef.current;
    const frameWidth = img.width / config.cols;
    const frameHeight = img.height / config.rows;
    
    const col = frame % config.cols;
    const row = Math.floor(frame / config.cols);

    ctx.clearRect(0, 0, size, size);
    ctx.imageSmoothingEnabled = false; // Keep pixel art crisp
    
    ctx.drawImage(
      img,
      col * frameWidth,
      row * frameHeight,
      frameWidth,
      frameHeight,
      0,
      0,
      size,
      size
    );
  }, [frame, imageLoaded, config, size]);

  // Fallback to emoji if no sprite config
  if (!config) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={`${className} ${status === 'working' ? 'animate-pulse' : ''}`}
      style={{ 
        imageRendering: 'pixelated',
        filter: status === 'blocked' ? 'grayscale(0.5)' : undefined
      }}
    />
  );
}

// Check if agent has sprites
export function hasSprite(agentId: string): boolean {
  return agentId in SPRITE_CONFIGS;
}

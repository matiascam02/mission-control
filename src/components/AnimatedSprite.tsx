'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

// Sprite metadata types
export interface SpriteAnimation {
  name: string;
  description: string;
  row: number;
  frames: number;
  fps: number;
  loop: boolean;
}

export interface SpriteMetadata {
  name: string;
  displayName: string;
  character: string;
  description: string;
  spriteSheet: string;
  frameWidth: number;
  frameHeight: number;
  animations: Record<string, SpriteAnimation>;
  defaultAnimation: string;
  statusAnimationMap: Record<string, string>;
}

interface AnimatedSpriteProps {
  /** Path to the sprite metadata JSON file */
  metadataPath: string;
  /** Current animation to play (overrides status) */
  animation?: string;
  /** Agent status - maps to animation via statusAnimationMap */
  status?: 'idle' | 'working' | 'done' | 'blocked';
  /** Size multiplier (1 = original size, 2 = 2x, etc.) */
  scale?: number;
  /** Whether to flip horizontally (for walking direction) */
  flipX?: boolean;
  /** Whether the sprite is currently playing */
  playing?: boolean;
  /** Callback when animation completes (for non-looping animations) */
  onAnimationEnd?: () => void;
  /** Custom CSS class */
  className?: string;
  /** Custom inline styles */
  style?: React.CSSProperties;
}

export function AnimatedSprite({
  metadataPath,
  animation,
  status = 'idle',
  scale = 1,
  flipX = false,
  playing = true,
  onAnimationEnd,
  className = '',
  style = {},
}: AnimatedSpriteProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [metadata, setMetadata] = useState<SpriteMetadata | null>(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const animationFrameRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);

  // Load metadata
  useEffect(() => {
    fetch(metadataPath)
      .then((res) => res.json())
      .then((data: SpriteMetadata) => {
        setMetadata(data);
        // Load sprite sheet image
        const img = new Image();
        img.onload = () => {
          imageRef.current = img;
          setIsLoaded(true);
        };
        img.onerror = () => {
          console.error(`Failed to load sprite sheet: ${data.spriteSheet}`);
        };
        img.src = data.spriteSheet;
      })
      .catch((err) => {
        console.error(`Failed to load sprite metadata: ${metadataPath}`, err);
      });
  }, [metadataPath]);

  // Determine which animation to play
  const currentAnimationKey = animation || metadata?.statusAnimationMap[status] || metadata?.defaultAnimation || 'idle';
  const currentAnimation = metadata?.animations[currentAnimationKey];

  // Animation loop
  const animate = useCallback(
    (timestamp: number) => {
      if (!metadata || !currentAnimation || !playing) return;

      const frameInterval = 1000 / currentAnimation.fps;
      const elapsed = timestamp - lastFrameTimeRef.current;

      if (elapsed >= frameInterval) {
        lastFrameTimeRef.current = timestamp - (elapsed % frameInterval);

        setCurrentFrame((prev) => {
          const nextFrame = prev + 1;
          if (nextFrame >= currentAnimation.frames) {
            if (currentAnimation.loop) {
              return 0;
            } else {
              onAnimationEnd?.();
              return prev;
            }
          }
          return nextFrame;
        });
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    },
    [metadata, currentAnimation, playing, onAnimationEnd]
  );

  // Start/stop animation loop
  useEffect(() => {
    if (!isLoaded || !playing) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    lastFrameTimeRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isLoaded, playing, animate]);

  // Reset frame when animation changes
  useEffect(() => {
    setCurrentFrame(0);
  }, [currentAnimationKey]);

  // Draw current frame on canvas
  useEffect(() => {
    if (!isLoaded || !metadata || !currentAnimation || !canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { frameWidth, frameHeight } = metadata;
    const sourceX = currentFrame * frameWidth;
    const sourceY = currentAnimation.row * frameHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Handle flip
    if (flipX) {
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(
        imageRef.current,
        sourceX,
        sourceY,
        frameWidth,
        frameHeight,
        -frameWidth * scale,
        0,
        frameWidth * scale,
        frameHeight * scale
      );
      ctx.restore();
    } else {
      ctx.drawImage(
        imageRef.current,
        sourceX,
        sourceY,
        frameWidth,
        frameHeight,
        0,
        0,
        frameWidth * scale,
        frameHeight * scale
      );
    }
  }, [isLoaded, metadata, currentAnimation, currentFrame, scale, flipX]);

  if (!metadata) {
    return (
      <div
        className={`animate-pulse bg-zinc-800 rounded-lg ${className}`}
        style={{
          width: 64 * scale,
          height: 64 * scale,
          ...style,
        }}
      />
    );
  }

  const { frameWidth, frameHeight } = metadata;

  return (
    <canvas
      ref={canvasRef}
      width={frameWidth * scale}
      height={frameHeight * scale}
      className={`pixelated ${className}`}
      style={{
        imageRendering: 'pixelated',
        ...style,
      }}
    />
  );
}

// Hook for getting sprite metadata
export function useSpriteMetadata(metadataPath: string) {
  const [metadata, setMetadata] = useState<SpriteMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(metadataPath)
      .then((res) => res.json())
      .then((data: SpriteMetadata) => {
        setMetadata(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, [metadataPath]);

  return { metadata, loading, error };
}

// Available sprite agents - extend this as more sprites are added
export const SPRITE_AGENTS = {
  hoyuelo: '/sprites/hoyuelo.json',
} as const;

export type SpriteAgentName = keyof typeof SPRITE_AGENTS;

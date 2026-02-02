'use client';

import { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import { DbAgent } from '@/lib/supabase';
import { Maximize2, Minimize2, Zap } from 'lucide-react';

// Import isometric engine
import { TILE_WIDTH, TILE_HEIGHT } from '@/lib/isometric-engine/renderTypes';
import { gridToScreen } from '@/lib/isometric-engine/utils';
import { drawGreenBaseTile } from '@/lib/isometric-engine/drawing';
import { selectSpriteSource, getSpriteRenderInfo } from '@/lib/isometric-engine/buildingSprite';
import { loadSpriteImage, getCachedImage } from '@/lib/isometric-engine/imageLoader';
import { getActiveSpritePack } from '@/lib/isometric-engine/renderConfig';
import { Tile, BuildingType } from '@/lib/isometric-engine/types';

interface AgentPosition {
  agentId: string;
  x: number;
  y: number;
  status: 'idle' | 'working' | 'done' | 'blocked';
}

interface IsometricWorldProps {
  agents: DbAgent[];
  width?: number;
  height?: number;
}

const GRID_SIZE = 24;
const ZOOM_MIN = 0.3;
const ZOOM_MAX = 2.0;

function createTile(x: number, y: number, type: BuildingType = 'grass'): Tile {
  return {
    x, y,
    zone: 'none',
    building: {
      type,
      level: 1,
      population: 0,
      jobs: 0,
      powered: true,
      watered: true,
      onFire: false,
      fireProgress: 0,
      age: 0,
      constructionProgress: 100,
      abandoned: false
    },
    landValue: 10,
    pollution: 0,
    crime: 0,
    traffic: 0,
    hasSubway: false
  };
}

export function IsometricWorld({ agents, width = 800, height = 600 }: IsometricWorldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(0.8);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Generate world tiles
  const tiles = useMemo(() => {
    const grid: Tile[][] = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      const row: Tile[] = [];
      for (let x = 0; x < GRID_SIZE; x++) {
        let type: BuildingType = 'grass';
        
        // Create office buildings in center
        if (x >= 10 && x <= 14 && y >= 10 && y <= 14) {
          if (Math.random() < 0.4) type = 'office_low';
          else if (Math.random() < 0.2) type = 'office_high';
        }
        // Trees around edges
        else if (x < 3 || x > GRID_SIZE - 4 || y < 3 || y > GRID_SIZE - 4) {
          if (Math.random() < 0.3) type = 'tree';
        }
        // Scattered buildings
        else {
          const rand = Math.random();
          if (rand < 0.05) type = 'house_small';
          else if (rand < 0.08) type = 'shop_small';
          else if (rand < 0.15) type = 'tree';
        }
        
        row.push(createTile(x, y, type));
      }
      grid.push(row);
    }
    return grid;
  }, []);

  // Map agents to world positions
  const agentPositions: AgentPosition[] = useMemo(() => {
    return agents.map((agent, index) => {
      // Distribute agents around the center
      const angle = (index / agents.length) * Math.PI * 2;
      const radius = 5;
      const centerX = Math.floor(GRID_SIZE / 2);
      const centerY = Math.floor(GRID_SIZE / 2);
      
      return {
        agentId: agent.id,
        x: Math.floor(centerX + Math.cos(angle) * radius),
        y: Math.floor(centerY + Math.sin(angle) * radius),
        status: agent.status as any,
      };
    });
  }, [agents]);

  // Load sprites
  useEffect(() => {
    const pack = getActiveSpritePack();
    const sourcesToLoad = [
      pack.src,
      pack.constructionSrc,
      pack.abandonedSrc,
      pack.parksSrc,
      pack.parksConstructionSrc,
      '/assets/water.png'
    ].filter(Boolean) as string[];

    sourcesToLoad.forEach(src => {
      loadSpriteImage(src, true).then(() => {
        setImagesLoaded(prev => prev + 1);
      });
    });
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#1a1a1a'; // Dark background
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    const centerX = width / 2;
    const centerY = height / 2;
    
    ctx.translate(centerX + offset.x, centerY + offset.y);
    ctx.scale(zoom, zoom);

    // Draw tiles
    if (tiles && tiles.length > 0) {
      const gridSize = tiles.length;
      
      // Painter's algorithm
      for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
          const tile = tiles[y][x];
          const screenPos = gridToScreen(x, y, 0, 0);
          
          // Draw base tile
          if (tile.building.type === 'water') {
            ctx.fillStyle = '#4fa4b8';
            ctx.beginPath();
            ctx.moveTo(screenPos.screenX, screenPos.screenY - TILE_HEIGHT/2);
            ctx.lineTo(screenPos.screenX + TILE_WIDTH/2, screenPos.screenY);
            ctx.lineTo(screenPos.screenX, screenPos.screenY + TILE_HEIGHT/2);
            ctx.lineTo(screenPos.screenX - TILE_WIDTH/2, screenPos.screenY);
            ctx.fill();
          } else {
            drawGreenBaseTile(ctx, screenPos.screenX, screenPos.screenY, tile, zoom);
          }

          // Draw building
          if (tile.building.type !== 'grass' && tile.building.type !== 'water') {
            const activePack = getActiveSpritePack();
            const sourceResult = selectSpriteSource(tile.building.type, tile.building, x, y, activePack);
            const img = getCachedImage(sourceResult.source, true);

            if (img) {
              const renderInfo = getSpriteRenderInfo(
                tile.building.type,
                tile.building,
                x, 
                y, 
                screenPos.screenX,
                screenPos.screenY,
                img.width,
                img.height
              );

              if (renderInfo) {
                const s = renderInfo.coords;
                if (s) {
                  const p = renderInfo.positioning;
                  
                  ctx.save();
                  if (renderInfo.shouldFlip) {
                    ctx.translate(p.drawX + p.destWidth, p.drawY);
                    ctx.scale(-1, 1);
                    ctx.drawImage(img, s.sx, s.sy, s.sw, s.sh, 0, 0, p.destWidth, p.destHeight);
                  } else {
                    ctx.drawImage(img, s.sx, s.sy, s.sw, s.sh, p.drawX, p.drawY, p.destWidth, p.destHeight);
                  }
                  ctx.restore();
                }
              }
            }
          }

          // Draw agent markers
          const agentAtPos = agentPositions.find(ap => ap.x === x && ap.y === y);
          if (agentAtPos) {
            const agent = agents.find(a => a.id === agentAtPos.agentId);
            if (agent) {
              // Draw agent marker above the tile
              const markerY = screenPos.screenY - 40;
              
              // Glow effect for working agents
              if (agent.status === 'working') {
                ctx.save();
                ctx.fillStyle = (agent.color || '#f97316') + '30';
                ctx.beginPath();
                ctx.arc(screenPos.screenX, markerY, 20, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
              }
              
              // Agent circle
              ctx.save();
              ctx.fillStyle = agent.color || '#f97316';
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.arc(screenPos.screenX, markerY, 12, 0, Math.PI * 2);
              ctx.fill();
              ctx.stroke();
              
              // Agent emoji
              ctx.font = '16px Arial';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(agent.emoji || '🤖', screenPos.screenX, markerY);
              ctx.restore();
              
              // Agent name label
              ctx.save();
              ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
              ctx.roundRect(screenPos.screenX - 30, markerY + 18, 60, 16, 4);
              ctx.fill();
              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 10px sans-serif';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(agent.name, screenPos.screenX, markerY + 26);
              ctx.restore();
            }
          }
        }
      }
    }

    ctx.restore();
  }, [width, height, tiles, offset, zoom, imagesLoaded, agents, agentPositions]);

  useEffect(() => {
    let animationFrameId: number;
    const renderLoop = () => {
      draw();
      animationFrameId = requestAnimationFrame(renderLoop);
    };
    renderLoop();
    return () => cancelAnimationFrame(animationFrameId);
  }, [draw]);

  // Interaction handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMouse({ x: e.clientX, y: e.clientY });
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const dx = e.clientX - lastMouse.x;
      const dy = e.clientY - lastMouse.y;
      setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setLastMouse({ x: e.clientX, y: e.clientY });
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  const handleWheel = (e: React.WheelEvent) => {
    const zoomFactor = 1.1;
    const direction = e.deltaY > 0 ? 1/zoomFactor : zoomFactor;
    setZoom(prev => Math.min(Math.max(prev * direction, ZOOM_MIN), ZOOM_MAX));
  };

  const resetView = () => {
    setOffset({ x: 0, y: 0 });
    setZoom(0.8);
  };

  const activeCount = agents.filter(a => a.status === 'working').length;

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50' : ''} bg-[#1a1a1a] rounded-2xl overflow-hidden border border-white/5`}>
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
              <Zap size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Mission Control World</h3>
              <p className="text-xs text-zinc-400">
                {activeCount} {activeCount === 1 ? 'agent' : 'agents'} active • {agents.length} total
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={resetView}
              className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-white transition-colors"
            >
              Reset View
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors"
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={isFullscreen ? window.innerWidth : width}
        height={isFullscreen ? window.innerHeight : height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className="w-full h-full"
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      />

      {/* Controls hint */}
      <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/10">
        <p className="text-xs text-zinc-400">
          <span className="font-semibold text-white">Drag</span> to pan • <span className="font-semibold text-white">Scroll</span> to zoom
        </p>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm px-4 py-3 rounded-lg border border-white/10 space-y-2">
        <p className="text-xs font-semibold text-white mb-2">Agent Status</p>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
          <span className="text-xs text-zinc-300">Working</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-zinc-400"></div>
          <span className="text-xs text-zinc-300">Idle</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-400"></div>
          <span className="text-xs text-zinc-300">Done</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <span className="text-xs text-zinc-300">Blocked</span>
        </div>
      </div>
    </div>
  );
}

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Tile } from './types';
import { TILE_WIDTH, TILE_HEIGHT } from './renderTypes';
import { gridToScreen } from './utils';
import { drawGreenBaseTile } from './drawing';
import { selectSpriteSource, getSpriteRenderInfo } from './buildingSprite';
import { loadSpriteImage, getCachedImage } from './imageLoader';
import { getActiveSpritePack } from './renderConfig';

interface IsometricMapProps {
  width: number;
  height: number;
  tiles: Tile[][];
  scale?: number;
}

export const IsometricMap: React.FC<IsometricMapProps> = ({ 
  width, 
  height, 
  tiles, 
  scale = 1 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
  const [imagesLoaded, setImagesLoaded] = useState(0);

  // Camera settings
  const ZOOM_MIN = 0.2;
  const ZOOM_MAX = 3.0;
  const [zoom, setZoom] = useState(scale);

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
    ctx.fillStyle = '#87CEEB'; // Sky blue background
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    const centerX = width / 2;
    const centerY = height / 2;
    
    ctx.translate(centerX + offset.x, centerY + offset.y);
    ctx.scale(zoom, zoom);

    // Draw tiles
    if (tiles && tiles.length > 0) {
        const gridSize = tiles.length;
        // Simple painter's algorithm
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                const tile = tiles[y][x];
                const screenPos = gridToScreen(x, y, 0, 0);
                
                // Draw base tile
                if (tile.building.type === 'water') {
                     ctx.fillStyle = '#4fa4b8'; // Water color
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
                     const img = getCachedImage(sourceResult.source, true); // true = use filtered (transparent bg)

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
                                 
                                 // Flip if needed
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
            }
        }
    }

    ctx.restore();
  }, [width, height, tiles, offset, zoom, imagesLoaded]);

  useEffect(() => {
    let animationFrameId: number;
    const renderLoop = () => {
      draw();
      animationFrameId = requestAnimationFrame(renderLoop);
    };
    renderLoop();
    return () => cancelAnimationFrame(animationFrameId);
  }, [draw]);

  // Handle interaction (pan/zoom)
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

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    />
  );
};

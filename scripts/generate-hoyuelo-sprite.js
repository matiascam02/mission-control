/**
 * Hoyuelo (Dimple) Sprite Sheet Generator
 * Creates a 64x64 pixel art sprite sheet for the floating green spirit
 * 
 * Layout: 4 columns x 3 rows
 * - Row 0: Idle (floating/bobbing)
 * - Row 1: Working (sparkles/typing)
 * - Row 2: Walking (moving)
 */

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const FRAME_WIDTH = 64;
const FRAME_HEIGHT = 64;
const COLS = 4;
const ROWS = 3;

// Hoyuelo color palette (Dimple from Mob Psycho 100)
const COLORS = {
  body: '#4ADE80',           // Main green
  bodyDark: '#22C55E',       // Darker green for shading
  bodyLight: '#86EFAC',      // Lighter green for highlights
  bodyGlow: '#BBF7D0',       // Glow/brightest
  eye: '#1F2937',            // Dark gray for eyes
  eyeWhite: '#FFFFFF',       // Eye whites
  mouth: '#16A34A',          // Mouth color
  sparkle: '#FDE047',        // Yellow sparkles
  sparkleWhite: '#FFFFFF',   // White sparkles
  outline: '#166534',        // Dark green outline
};

function drawPixel(ctx, x, y, color, size = 1) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, size, size);
}

function drawCircle(ctx, cx, cy, radius, color) {
  // Simple pixelated circle using midpoint algorithm
  ctx.fillStyle = color;
  for (let y = -radius; y <= radius; y++) {
    for (let x = -radius; x <= radius; x++) {
      if (x * x + y * y <= radius * radius) {
        ctx.fillRect(cx + x, cy + y, 1, 1);
      }
    }
  }
}

function drawEllipse(ctx, cx, cy, rx, ry, color) {
  ctx.fillStyle = color;
  for (let y = -ry; y <= ry; y++) {
    for (let x = -rx; x <= rx; x++) {
      if ((x * x) / (rx * rx) + (y * y) / (ry * ry) <= 1) {
        ctx.fillRect(cx + x, cy + y, 1, 1);
      }
    }
  }
}

function drawHoyueloBase(ctx, offsetX, offsetY, yOffset = 0) {
  const cx = offsetX + 32;
  const cy = offsetY + 32 + yOffset;
  
  // Outer glow
  drawEllipse(ctx, cx, cy, 18, 16, COLORS.bodyGlow);
  
  // Main body (elliptical blob shape)
  drawEllipse(ctx, cx, cy, 16, 14, COLORS.body);
  
  // Shading (bottom)
  drawEllipse(ctx, cx, cy + 4, 12, 8, COLORS.bodyDark);
  
  // Highlight (top)
  drawEllipse(ctx, cx - 4, cy - 6, 6, 4, COLORS.bodyLight);
  
  // Eyes - wide and mischievous
  // Left eye
  drawEllipse(ctx, cx - 6, cy - 2, 4, 5, COLORS.eyeWhite);
  drawCircle(ctx, cx - 6, cy - 1, 2, COLORS.eye);
  drawPixel(ctx, cx - 7, cy - 3, COLORS.eyeWhite);
  
  // Right eye
  drawEllipse(ctx, cx + 6, cy - 2, 4, 5, COLORS.eyeWhite);
  drawCircle(ctx, cx + 6, cy - 1, 2, COLORS.eye);
  drawPixel(ctx, cx + 5, cy - 3, COLORS.eyeWhite);
  
  // Mischievous grin
  ctx.fillStyle = COLORS.mouth;
  // Simple curved line
  for (let x = -6; x <= 6; x++) {
    const yPos = Math.round(Math.abs(x) * 0.3);
    drawPixel(ctx, cx + x, cy + 6 + yPos, COLORS.mouth);
    if (Math.abs(x) < 5) {
      drawPixel(ctx, cx + x, cy + 7 + yPos, COLORS.mouth);
    }
  }
}

function drawSparkle(ctx, x, y, size = 3) {
  ctx.fillStyle = COLORS.sparkleWhite;
  // Cross shape
  for (let i = -size; i <= size; i++) {
    drawPixel(ctx, x + i, y, COLORS.sparkleWhite);
    drawPixel(ctx, x, y + i, COLORS.sparkleWhite);
  }
  // Yellow corners
  ctx.fillStyle = COLORS.sparkle;
  drawPixel(ctx, x - 1, y - 1, COLORS.sparkle);
  drawPixel(ctx, x + 1, y - 1, COLORS.sparkle);
  drawPixel(ctx, x - 1, y + 1, COLORS.sparkle);
  drawPixel(ctx, x + 1, y + 1, COLORS.sparkle);
}

function generateSpriteSheet() {
  const canvas = createCanvas(FRAME_WIDTH * COLS, FRAME_HEIGHT * ROWS);
  const ctx = canvas.getContext('2d');
  
  // Enable image smoothing off for pixel art
  ctx.imageSmoothingEnabled = false;
  
  // Clear with transparency
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Row 0: Idle animation (floating/bobbing)
  const idleOffsets = [-2, -1, 0, -1];
  for (let frame = 0; frame < 4; frame++) {
    const offsetX = frame * FRAME_WIDTH;
    const offsetY = 0;
    drawHoyueloBase(ctx, offsetX, offsetY, idleOffsets[frame]);
  }
  
  // Row 1: Working animation (sparkles around)
  const workingSparkles = [
    [{ x: 10, y: 15 }, { x: 50, y: 20 }],
    [{ x: 15, y: 10 }, { x: 48, y: 25 }, { x: 12, y: 50 }],
    [{ x: 52, y: 12 }, { x: 8, y: 30 }, { x: 50, y: 48 }],
    [{ x: 10, y: 20 }, { x: 55, y: 15 }, { x: 45, y: 50 }],
  ];
  for (let frame = 0; frame < 4; frame++) {
    const offsetX = frame * FRAME_WIDTH;
    const offsetY = FRAME_HEIGHT;
    drawHoyueloBase(ctx, offsetX, offsetY, -1);
    // Add sparkles
    workingSparkles[frame].forEach(s => {
      drawSparkle(ctx, offsetX + s.x, offsetY + s.y, 2);
    });
  }
  
  // Row 2: Walking animation (slight side-to-side movement)
  const walkOffsets = [
    { x: -3, y: 0, squash: 1.0 },
    { x: -1, y: -2, squash: 0.95 },
    { x: 2, y: 0, squash: 1.0 },
    { x: 0, y: -2, squash: 0.95 },
  ];
  for (let frame = 0; frame < 4; frame++) {
    const offsetX = frame * FRAME_WIDTH + walkOffsets[frame].x;
    const offsetY = FRAME_HEIGHT * 2;
    drawHoyueloBase(ctx, offsetX, offsetY, walkOffsets[frame].y);
  }
  
  return canvas;
}

// Generate and save
const canvas = generateSpriteSheet();
const outputPath = path.join(__dirname, '../public/sprites/hoyuelo.png');

// Ensure directory exists
const dir = path.dirname(outputPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Save as PNG
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync(outputPath, buffer);

console.log(`✅ Generated Hoyuelo sprite sheet: ${outputPath}`);
console.log(`   Dimensions: ${FRAME_WIDTH * COLS}x${FRAME_HEIGHT * ROWS} (${COLS}x${ROWS} frames of ${FRAME_WIDTH}x${FRAME_HEIGHT})`);

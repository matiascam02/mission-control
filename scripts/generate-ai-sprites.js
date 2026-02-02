/**
 * AI Sprite Sheet Generator using fal.ai nano-banana-pro
 * Generates pixel art sprite sheets for agent characters
 */

const { fal } = require('@fal-ai/client');
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Configure fal.ai
fal.config({
  credentials: process.env.FAL_KEY,
});

const FRAME_SIZE = 64;
const FRAMES_PER_ROW = 4;
const ROWS = 3;

// Character definitions
const CHARACTERS = {
  hoyuelo: {
    name: 'Hoyuelo',
    description: 'Dimple from Mob Psycho 100 - a mischievous green floating spirit/ghost with a round blob-like body, big eyes, and a wide grin',
    color: '#4ADE80',
    prompts: {
      idle: 'Pixel art sprite sheet, 2x2 grid of 4 frames showing a cute green floating spirit ghost blob character (Dimple from Mob Psycho 100) in idle floating animation, bobbing up and down gently, big round eyes, mischievous smile, transparent background, 64x64 pixel art style, retro game aesthetic, simple clean design',
      working: 'Pixel art sprite sheet, 2x2 grid of 4 frames showing a cute green floating spirit ghost blob character (Dimple from Mob Psycho 100) with sparkles and magical effects around it, working/typing animation, yellow sparkle particles, transparent background, 64x64 pixel art style, retro game aesthetic',
      walking: 'Pixel art sprite sheet, 2x2 grid of 4 frames showing a cute green floating spirit ghost blob character (Dimple from Mob Psycho 100) in walking/moving animation sequence, floating side to side, transparent background, 64x64 pixel art style, retro game aesthetic, smooth animation frames',
    },
  },
};

async function downloadImage(url, outputPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(outputPath);
    
    protocol.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Follow redirect
        downloadImage(response.headers.location, outputPath).then(resolve).catch(reject);
        return;
      }
      
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(outputPath);
      });
    }).on('error', (err) => {
      fs.unlink(outputPath, () => {}); // Delete partial file
      reject(err);
    });
  });
}

async function generateSpriteImage(prompt, outputName) {
  console.log(`\n🎨 Generating: ${outputName}`);
  console.log(`   Prompt: ${prompt.substring(0, 80)}...`);
  
  try {
    const result = await fal.subscribe('fal-ai/nano-banana-pro', {
      input: {
        prompt: prompt,
        num_images: 1,
        aspect_ratio: '1:1',
        output_format: 'png',
        resolution: '1K',
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === 'IN_PROGRESS') {
          process.stdout.write('.');
        }
      },
    });
    
    console.log('\n   ✅ Generated!');
    
    if (result.data && result.data.images && result.data.images.length > 0) {
      return result.data.images[0].url;
    }
    throw new Error('No images in response');
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    throw error;
  }
}

async function composeSpriteSheet(imagePaths, outputPath) {
  console.log('\n📦 Composing sprite sheet...');
  
  const canvas = createCanvas(FRAME_SIZE * FRAMES_PER_ROW, FRAME_SIZE * ROWS);
  const ctx = canvas.getContext('2d');
  
  // Clear with transparency
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Load and draw each row's sprite sheet
  for (let row = 0; row < imagePaths.length; row++) {
    try {
      const img = await loadImage(imagePaths[row]);
      
      // The AI generates 2x2 grid, we need to extract and place in our format
      // Source is likely 1024x1024 (1K resolution) with 2x2 grid = 512x512 per frame
      const srcFrameSize = Math.min(img.width, img.height) / 2;
      
      // Extract 4 frames from 2x2 grid and place in a row
      for (let frame = 0; frame < 4; frame++) {
        const srcRow = Math.floor(frame / 2);
        const srcCol = frame % 2;
        const srcX = srcCol * srcFrameSize;
        const srcY = srcRow * srcFrameSize;
        
        const destX = frame * FRAME_SIZE;
        const destY = row * FRAME_SIZE;
        
        ctx.drawImage(
          img,
          srcX, srcY, srcFrameSize, srcFrameSize,
          destX, destY, FRAME_SIZE, FRAME_SIZE
        );
      }
      
      console.log(`   Row ${row}: ✅`);
    } catch (err) {
      console.error(`   Row ${row}: ❌ ${err.message}`);
    }
  }
  
  // Save the composed sprite sheet
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  console.log(`\n✅ Saved: ${outputPath}`);
  
  return outputPath;
}

async function generateCharacterSprites(characterId) {
  const character = CHARACTERS[characterId];
  if (!character) {
    throw new Error(`Unknown character: ${characterId}`);
  }
  
  console.log(`\n${'='.repeat(50)}`);
  console.log(`🎮 Generating sprites for: ${character.name}`);
  console.log(`   ${character.description}`);
  console.log(`${'='.repeat(50)}`);
  
  const tempDir = path.join(__dirname, '../.temp-sprites');
  const outputDir = path.join(__dirname, '../public/sprites');
  
  // Create directories
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  
  const animations = ['idle', 'working', 'walking'];
  const tempPaths = [];
  
  for (const anim of animations) {
    const prompt = character.prompts[anim];
    const tempPath = path.join(tempDir, `${characterId}-${anim}.png`);
    
    try {
      // Generate the sprite sheet
      const imageUrl = await generateSpriteImage(prompt, `${characterId}-${anim}`);
      
      // Download to temp
      await downloadImage(imageUrl, tempPath);
      console.log(`   Downloaded: ${tempPath}`);
      
      tempPaths.push(tempPath);
    } catch (error) {
      console.error(`   Failed to generate ${anim}: ${error.message}`);
      // Use placeholder for failed generations
      tempPaths.push(null);
    }
  }
  
  // Filter out failed generations and compose
  const validPaths = tempPaths.filter(p => p !== null);
  
  if (validPaths.length > 0) {
    const outputPath = path.join(outputDir, `${characterId}-ai.png`);
    await composeSpriteSheet(validPaths, outputPath);
    
    // Clean up temp files
    for (const tempPath of validPaths) {
      try {
        fs.unlinkSync(tempPath);
      } catch (e) {}
    }
    
    console.log(`\n🎉 Complete! AI sprite sheet saved to: ${outputPath}`);
    return outputPath;
  } else {
    console.error('\n❌ All generations failed');
    return null;
  }
}

// Main execution
async function main() {
  const characterId = process.argv[2] || 'hoyuelo';
  
  if (!process.env.FAL_KEY) {
    console.error('❌ FAL_KEY environment variable not set!');
    console.error('   Set it with: export FAL_KEY="your-api-key"');
    process.exit(1);
  }
  
  try {
    await generateCharacterSprites(characterId);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main();

#!/usr/bin/env node
/**
 * FRANKY WORKING SPRITE - HIGH QUALITY VERSION
 * 
 * Strategy: Generate at 1024x256px (4 frames × 256x256) for maximum detail
 * The game will scale it dynamically with crisp pixel art rendering
 * This matches the hoyuelo-v2 quality approach (high res, game scales)
 */

const { fal } = require('@fal-ai/client');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

fal.config({
  credentials: process.env.FAL_KEY,
});

async function downloadImage(url, outputPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(outputPath);
    
    protocol.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        downloadImage(response.headers.location, outputPath).then(resolve).catch(reject);
        return;
      }
      
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(outputPath);
      });
    }).on('error', (err) => {
      fs.unlink(outputPath, () => {});
      reject(err);
    });
  });
}

async function generateSprite() {
  // Detailed prompt focused on pixel art quality
  const apiPrompt = `Professional pixel art sprite sheet of Franky from One Piece working hard animation. 4 frames arranged horizontally showing progressive intensity. Frame 1: Franky in focused work pose with minimal tech effects. Frame 2: Building intensity with glowing circuits and small sparks. Frame 3: Peak effort with heavy electric sparks and energy effects. Frame 4: EXPLOSIVE MAXIMUM POWER with massive electric storm, bright yellow lightning bolts radiating outward, cyan energy burst, dramatic finale like a power unleashing. Character design: Large blue cyborg with distinctive pompadour hairstyle, sunglasses, mechanical body with visible tech panels and glowing energy core in chest. Color palette: deep blue metal body, bright cyan circuits and highlights, electric yellow energy effects, white sparks. Style: high quality retro pixel art, 16-bit game aesthetic, vibrant saturated colors, transparent background, clean anti-aliased edges, professional game sprite quality similar to Hollow Knight or Celeste. Progressive animation from calm to explosive. Very detailed pixel work.`;
  
  console.log('\n🤖 FRANKY WORKING SPRITE - HIGH QUALITY GENERATION');
  console.log('   Target: 1024x256px (4 frames × 256x256)');
  console.log('   Quality: Match hoyuelo-v2 level');
  console.log('   Model: fal-ai/nano-banana-pro\n');
  
  console.log('🎨 Generating...');
  
  try {
    const result = await fal.subscribe('fal-ai/nano-banana-pro', {
      input: {
        prompt: apiPrompt,
        num_images: 1,
        image_size: {
          width: 1024,
          height: 256
        },
        output_format: 'png',
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === 'IN_PROGRESS') {
          process.stdout.write('.');
        }
      },
    });
    
    console.log('\n✅ Generated!');
    
    if (result.data && result.data.images && result.data.images.length > 0) {
      return result.data.images[0].url;
    }
    throw new Error('No images in response');
  } catch (error) {
    console.error(`❌ Generation error: ${error.message}`);
    throw error;
  }
}

async function main() {
  if (!process.env.FAL_KEY) {
    console.error('❌ FAL_KEY not set!');
    process.exit(1);
  }
  
  const outputPath = path.join(__dirname, 'output', 'working-hq.png');
  
  // Create output directory
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  try {
    const imageUrl = await generateSprite();
    
    console.log('\n💾 Downloading...');
    await downloadImage(imageUrl, outputPath);
    console.log('✅ Downloaded!');
    
    // Verify
    const { execSync } = require('child_process');
    const fileInfo = execSync(`file "${outputPath}"`).toString();
    console.log(`\n🔍 ${fileInfo.trim()}`);
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 FRANKY WORKING SPRITE COMPLETE');
    console.log('='.repeat(60));
    console.log(`File: ${outputPath}`);
    console.log('\nNext steps:');
    console.log('1. Review the sprite quality');
    console.log('2. If approved, copy to: public/sprites/franky/attack.png');
    console.log('   (attack.png is used for "working" status in the game)');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  }
}

main();

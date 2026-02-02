#!/usr/bin/env node
/**
 * FRANKY WORKING SPRITE - HIGH QUALITY REGENERATION
 * 
 * Goal: Match or exceed hoyuelo-v2/working.png quality
 * Output: 256x64px (4 frames of 64x64px horizontal)
 * 
 * Strategy:
 * 1. Generate at high resolution for quality
 * 2. Resize to exact 256x64px
 * 3. Verify output matches specs
 */

const { fal } = require('@fal-ai/client');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Configure fal.ai
fal.config({
  credentials: process.env.FAL_KEY,
});

const FRANKY = {
  name: 'Franky',
  series: 'One Piece',
  coreDesign: 'cybernetic/tech character with blue metallic body, humanoid but clearly mechanical',
  palette: ['deep blue #1E3A8A', 'cyan #06B6D4', 'white highlights #FFFFFF', 'electric yellow #FDE047'],
  details: 'tech panels, glowing circuits, expressive robotic face, mechanical joints, energy core visible',
  personality: 'confident, energetic, SUPER enthusiast',
};

const WORKING_PROMPT = `
ULTRA HIGH QUALITY PIXEL ART SPRITE SHEET - FRANKY WORKING HARD
⭐ MAXIMUM QUALITY - MATCH HOYUELO GOLD STANDARD ⭐

TECHNICAL SPECS:
- Layout: 4 frames arranged horizontally (Frame1 | Frame2 | Frame3 | Frame4)
- Style: Premium 2D pixel art, MAXIMUM DETAIL AND VIBRANCY
- Background: Fully transparent (alpha channel)
- Palette: SATURATED, HIGH CONTRAST, vibrant blue/cyan/yellow colors
- Quality: Professional game sprite quality

CHARACTER: Franky from One Piece
Design: Large cybernetic man with bright blue pompadour hair, sunglasses, robotic body
Colors: Deep blue metal (#1E3A8A), bright cyan circuits (#06B6D4), white highlights (#FFFFFF), electric yellow energy (#FDE047)
Details: Tech panels, glowing circuits, mechanical joints, visible energy core in chest, confident expression
Personality: Energetic, SUPER pose ready, confident cyborg shipwright

ANIMATION SEQUENCE (4 frames - PROGRESSIVE INTENSITY):

Frame 1: Focused Work State
- Franky hunched over workbench/tools
- Concentrated expression, visor glowing
- Minimal tech effects (1-2 small circuit sparkles)
- Stable stance, tools in hand
- Base blue/cyan palette

Frame 2: Intensity Building  
- More dynamic pose, welding/building motion
- Tech systems activating (3-5 circuit glows)
- Sparks from welding/work
- Energy core in chest starting to glow
- Brighter cyan highlights appearing (+20% saturation)

Frame 3: Peak Effort
- Full dynamic action, arms moving
- Heavy tech effects (8-12 electric sparks)
- Multiple systems online:
  * Circuits glowing bright cyan
  * Energy core pulsing yellow
  * Electric arcs between body parts
  * Data streams/binary code effects
- Yellow/cyan energy radiating
- High saturation (+40% brightness on effects)

Frame 4: MAXIMUM ROBOT POWER (GOLD STANDARD QUALITY)
- EXPLOSIVE tech energy effect
- Franky's signature SUPER pose or ultimate tech activation
- Complete system overload:
  * Electric storm: Yellow lightning bolts radiating outward
  * Data explosion: Binary code, circuit patterns bursting
  * Energy core: Blazing bright yellow/white center
  * Full body glow: Bright cyan aura surrounding entire character
- Maximum particle density (15-20+ sparks/effects)
- "+" shaped sparkles radiating outward (like hoyuelo style)
- Electric discharge effects in all directions
- Bright cyan and yellow energy fills the frame
- Palette: MAXIMUM VIBRANCY (full saturation, electric brilliance)
- Visual intensity matching hoyuelo's frame 4 explosive finale

FRANKY WORKING EFFECTS:
- Electric sparks: Bright yellow/cyan, sharp 1-2 pixel bolts
- Data streams: Flowing binary code lines (01010 aesthetic)  
- Circuit glow: Cyan/blue lines lighting up across body panels
- Energy core: Pulsing bright yellow center in chest
- Welding sparks: Orange/yellow work sparks from tools
- Tech panels: Sequential lighting up of body armor sections
- Cooling vents: Steam/vapor effects from overload
- Cola power: Optional bubble effects (his fuel source)

QUALITY REQUIREMENTS:
- Frame 1→4: Clear explosive progression
- Shading: 4-5 levels minimum for depth and dimension
- Effects layering: Background glow, mid-layer particles, foreground sparkles
- Color harmony: Electric yellow/cyan complement base blue
- Silhouette: Franky recognizable even at max effects
- Professional polish: Every pixel intentional, no noise
- Readability: Clear character form throughout all frames

STYLE REFERENCE:
- Match the explosive energy of hoyuelo-v2/working.png frame 4
- Vibrant saturated colors that POP
- Clean pixel art style with smooth anti-aliasing
- Professional game sprite quality (Hollow Knight, Celeste level)

MOOD: Maximum productivity, robot power unleashed, SUPER energy!
`.trim();

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
  // Condensed prompt for API (token limits)
  const apiPrompt = `Ultra high quality pixel art sprite sheet, 4 frames horizontal layout showing Franky from One Piece (blue cyborg with pompadour), working hard animation sequence: calm focused -> building intensity -> peak effort -> EXPLOSIVE MAXIMUM POWER with electric storm effects. Progressive energy: Frame 1 minimal effects, Frame 2 circuits glowing, Frame 3 heavy sparks, Frame 4 MASSIVE electric explosion with yellow lightning and cyan energy radiating everywhere like explosive finale. Colors: deep blue metal, bright cyan circuits, electric yellow energy, white sparks. Transparent background. Professional game pixel art quality, highly detailed, vibrant saturated colors. Each frame shows clear progression. Style: retro pixel art, 2D sprite, clean anti-aliasing.`;
  
  console.log('\n🤖 FRANKY WORKING SPRITE GENERATION');
  console.log('   Target: Match hoyuelo-v2/working.png quality');
  console.log('   Output: 256x64px (4 frames × 64x64px)');
  console.log('   Model: fal-ai/nano-banana-pro\n');
  
  console.log('🎨 Generating at high resolution...');
  
  try {
    const result = await fal.subscribe('fal-ai/nano-banana-pro', {
      input: {
        prompt: apiPrompt,
        num_images: 1,
        aspect_ratio: '16:9',
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

async function resizeImage(inputPath, outputPath, width, height) {
  console.log(`\n🔄 Resizing to ${width}x${height}px...`);
  
  try {
    // Use macOS sips for high-quality resize
    const cmd = `sips -z ${height} ${width} "${inputPath}" --out "${outputPath}"`;
    await execAsync(cmd);
    console.log('✅ Resized!');
  } catch (error) {
    console.error(`❌ Resize error: ${error.message}`);
    throw error;
  }
}

async function verifyImage(imagePath) {
  console.log('\n🔍 Verifying output...');
  
  try {
    const { stdout } = await execAsync(`file "${imagePath}"`);
    console.log(`   ${stdout.trim()}`);
    
    const { stdout: sipsInfo } = await execAsync(`sips -g pixelWidth -g pixelHeight "${imagePath}"`);
    console.log(`   ${sipsInfo.trim()}`);
    
    // Check if it's 256x64
    if (sipsInfo.includes('256') && sipsInfo.includes('64')) {
      console.log('✅ Correct dimensions: 256x64px');
      return true;
    } else {
      console.log('⚠️  Warning: Dimensions may not be exactly 256x64');
      return false;
    }
  } catch (error) {
    console.error(`❌ Verification error: ${error.message}`);
    return false;
  }
}

async function main() {
  if (!process.env.FAL_KEY) {
    console.error('❌ FAL_KEY not set!');
    console.error('   Run: export FAL_KEY="your-key"');
    process.exit(1);
  }
  
  const outputDir = path.join(__dirname, 'output');
  const rawPath = path.join(outputDir, 'working-raw.png');
  const finalPath = path.join(outputDir, 'working.png');
  
  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  try {
    // Step 1: Generate
    const imageUrl = await generateSprite();
    
    // Step 2: Download
    console.log('\n💾 Downloading...');
    await downloadImage(imageUrl, rawPath);
    console.log('✅ Downloaded to output/working-raw.png');
    
    // Step 3: Resize to 256x64
    await resizeImage(rawPath, finalPath, 256, 64);
    console.log('✅ Saved to output/working.png');
    
    // Step 4: Verify
    const verified = await verifyImage(finalPath);
    
    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('🎉 FRANKY WORKING SPRITE COMPLETE');
    console.log('='.repeat(60));
    console.log(`Raw file:   ${rawPath}`);
    console.log(`Final file: ${finalPath}`);
    console.log(`Verified:   ${verified ? '✅ YES' : '⚠️  CHECK MANUALLY'}`);
    console.log('='.repeat(60));
    console.log('\nNext: Review the sprite and compare to hoyuelo-v2/working.png');
    
  } catch (error) {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  }
}

main();

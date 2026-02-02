#!/usr/bin/env node
/**
 * Combine 4 frames into a horizontal sprite sheet
 * Input: frame1.png, frame2.png, frame3.png, frame4.png (each 512x512)
 * Output: 2048x512 (or scaled down to 1024x256 or 256x64)
 */

const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

async function combineFrames() {
  const outputDir = path.join(__dirname, 'output');
  const frameSize = 512;
  const numFrames = 4;
  
  // Target sizes - let's do both high-res and low-res versions
  const sizes = [
    { width: 2048, height: 512, name: 'working-2048x512.png' },
    { width: 1024, height: 256, name: 'working-1024x256.png' },
    { width: 512, height: 128, name: 'working-512x128.png' },
    { width: 256, height: 64, name: 'working-256x64.png' },
  ];
  
  // Load all frames
  console.log('📂 Loading frames...');
  const frames = [];
  for (let i = 1; i <= numFrames; i++) {
    const framePath = path.join(outputDir, `frame${i}.png`);
    const img = await loadImage(framePath);
    frames.push(img);
    console.log(`   ✅ frame${i}.png`);
  }
  
  // Generate each size
  for (const size of sizes) {
    console.log(`\n🎨 Creating ${size.name} (${size.width}x${size.height})...`);
    
    const canvas = createCanvas(size.width, size.height);
    const ctx = canvas.getContext('2d');
    
    // Disable smoothing for crisp pixel art
    ctx.imageSmoothingEnabled = false;
    
    const frameWidth = size.width / numFrames;
    const frameHeight = size.height;
    
    // Draw each frame
    for (let i = 0; i < numFrames; i++) {
      ctx.drawImage(
        frames[i],
        i * frameWidth,
        0,
        frameWidth,
        frameHeight
      );
    }
    
    // Save
    const outputPath = path.join(outputDir, size.name);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
    
    console.log(`   ✅ Saved: ${size.name}`);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🎉 SPRITE SHEETS CREATED');
  console.log('='.repeat(60));
  console.log('Created 4 versions:');
  sizes.forEach(s => {
    const filePath = path.join(outputDir, s.name);
    const stats = fs.statSync(filePath);
    console.log(`  ${s.name.padEnd(25)} ${(stats.size / 1024).toFixed(1)}KB`);
  });
  console.log('='.repeat(60));
  console.log('\n💡 Recommendation: Use working-1024x256.png or working-512x128.png');
  console.log('   These balance quality and file size well.');
}

combineFrames().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});

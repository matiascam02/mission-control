/**
 * Generate sprite sheets for all agents using fal.ai
 * Based on the Hoyuelo sprite generation approach
 */

const { fal } = require('@fal-ai/client');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Configure fal.ai
fal.config({
  credentials: process.env.FAL_KEY,
});

// Agent definitions with reference images and character descriptions
const AGENTS = {
  franky: {
    name: 'Franky',
    description: 'Franky from One Piece - a large cyborg with blue pompadour hair, sunglasses, Hawaiian shirt, and mechanical arms. Very muscular build with a distinctive SUPER pose.',
    style: 'anime, shonen, bold colors',
    baseImage: '/Users/matias-claw/Documents/Data/Agents-img/franky.png',
  },
  frieren: {
    name: 'Frieren',
    description: 'Frieren from Frieren: Beyond Journey\'s End - a small elf mage with long white hair in twin tails, green eyes, white and gold robes, stoic expression. Carries a staff.',
    style: 'anime, fantasy, soft colors',
    baseImage: '/Users/matias-claw/Documents/Data/Agents-img/frieren.png',
  },
  maomao: {
    name: 'Maomao',
    description: 'Maomao from The Apothecary Diaries - a young woman with dark hair in buns, sharp analytical eyes, wearing traditional Chinese court attire. Often seen with medicinal herbs.',
    style: 'anime, historical chinese, muted earth tones',
    baseImage: '/Users/matias-claw/Documents/Data/Agents-img/maomao.png',
  },
  nanami: {
    name: 'Nanami',
    description: 'Nanami Kento from Jujutsu Kaisen - a serious businessman with blonde hair parted 7:3, wearing glasses, blue dress shirt with tie, and tan suit. Professional demeanor.',
    style: 'anime, modern, professional colors',
    baseImage: '/Users/matias-claw/Documents/Data/Agents-img/nanami.png',
  },
  reigen: {
    name: 'Reigen',
    description: 'Reigen Arataka from Mob Psycho 100 - a con artist with dark hair, wearing a pink/purple suit and red tie. Confident smirk, often in dynamic poses with salt.',
    style: 'anime, comedic, vibrant colors',
    baseImage: '/Users/matias-claw/Documents/Data/Agents-img/reigen.png',
  },
  rimuru: {
    name: 'Rimuru',
    description: 'Rimuru Tempest from That Time I Got Reincarnated as a Slime - in human form: androgynous with long blue hair, golden eyes, wearing a black jacket with gold trim. Can also be a blue slime.',
    style: 'anime, fantasy, blue and gold colors',
    baseImage: '/Users/matias-claw/Documents/Data/Agents-img/rimuru.png',
  },
  robin: {
    name: 'Robin',
    description: 'Nico Robin from One Piece - a tall woman with long black hair, dark eyes, wearing stylish outfits often in purple/blue tones. Calm, intellectual demeanor.',
    style: 'anime, shonen, elegant colors',
    baseImage: '/Users/matias-claw/Documents/Data/Agents-img/robin.png',
  },
};

// Sprite animation types
const SPRITE_TYPES = {
  character: {
    frames: '1x1',
    description: 'single standing pose, front-facing, full body visible',
  },
  walk: {
    frames: '4x1',
    description: '4-frame walking cycle animation, side view, smooth step sequence',
  },
  idle: {
    frames: '4x1',
    description: '4-frame idle breathing/bobbing animation, front-facing, subtle movement',
  },
  jump: {
    frames: '4x1',
    description: '4-frame jumping animation sequence: crouch, lift-off, peak, landing',
  },
  attack: {
    frames: '4x1',
    description: '4-frame attack animation, dynamic action pose with windup and follow-through',
  },
};

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

async function generateSprite(agentId, spriteType, agent, spriteInfo) {
  const prompt = `Pixel art sprite sheet, ${spriteInfo.frames} grid showing ${agent.description}, ${spriteInfo.description}, transparent background, 64x64 pixel art style, ${agent.style}, retro game aesthetic, clean design, simple shapes`;
  
  console.log(`\n🎨 Generating: ${agentId}/${spriteType}`);
  console.log(`   Prompt: ${prompt.substring(0, 100)}...`);
  
  try {
    const result = await fal.subscribe('fal-ai/nano-banana-pro', {
      input: {
        prompt: prompt,
        num_images: 1,
        aspect_ratio: spriteInfo.frames === '1x1' ? '1:1' : '16:9',
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

async function generateAgentSprites(agentId, agent) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🎮 Generating sprites for: ${agent.name}`);
  console.log(`   ${agent.description.substring(0, 80)}...`);
  console.log(`${'='.repeat(60)}`);
  
  const outputDir = path.join(__dirname, '../public/sprites', agentId);
  
  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`📁 Created directory: ${outputDir}`);
  }
  
  const results = {};
  
  // Generate each sprite type
  for (const [spriteType, spriteInfo] of Object.entries(SPRITE_TYPES)) {
    try {
      const imageUrl = await generateSprite(agentId, spriteType, agent, spriteInfo);
      const outputPath = path.join(outputDir, `${spriteType}.png`);
      
      await downloadImage(imageUrl, outputPath);
      console.log(`   ✅ Saved: ${spriteType}.png`);
      
      results[spriteType] = 'success';
      
      // Wait a bit between generations to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`   ❌ Failed ${spriteType}: ${error.message}`);
      results[spriteType] = 'failed';
    }
  }
  
  // Summary
  const successful = Object.values(results).filter(r => r === 'success').length;
  const total = Object.keys(results).length;
  
  console.log(`\n📊 ${agent.name} Summary: ${successful}/${total} sprites generated`);
  
  return results;
}

async function main() {
  const agentId = process.argv[2];
  
  if (!process.env.FAL_KEY) {
    console.error('❌ FAL_KEY environment variable not set!');
    console.error('   Run: export FAL_KEY="your-key" or add to .env.local');
    process.exit(1);
  }
  
  console.log('🚀 AI Sprite Sheet Generator');
  console.log('   Using fal.ai nano-banana-pro model\n');
  
  try {
    if (agentId && agentId !== 'all') {
      // Generate for specific agent
      const agent = AGENTS[agentId];
      if (!agent) {
        console.error(`❌ Unknown agent: ${agentId}`);
        console.error(`   Available: ${Object.keys(AGENTS).join(', ')}`);
        process.exit(1);
      }
      await generateAgentSprites(agentId, agent);
    } else {
      // Generate for all agents
      const allResults = {};
      
      for (const [id, agent] of Object.entries(AGENTS)) {
        allResults[id] = await generateAgentSprites(id, agent);
        console.log('\n   ⏸️  Pausing 5s before next agent...\n');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
      
      // Final summary
      console.log('\n' + '='.repeat(60));
      console.log('🎉 ALL AGENTS COMPLETE');
      console.log('='.repeat(60));
      for (const [id, results] of Object.entries(allResults)) {
        const successful = Object.values(results).filter(r => r === 'success').length;
        const total = Object.keys(results).length;
        const status = successful === total ? '✅' : '⚠️';
        console.log(`${status} ${id}: ${successful}/${total} sprites`);
      }
    }
  } catch (error) {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  }
}

main();

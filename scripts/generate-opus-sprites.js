/**
 * OPUS 4.5 QUALITY SPRITE GENERATOR
 * 
 * Ultra-detailed prompts crafted by Claude Opus to match the quality
 * of hoyuelo-v2/working.png gold standard
 * 
 * Generates: idle.png, walk.png, working.png, done.png
 * Each: 256x64px (4 frames of 64x64px horizontal)
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

// OPUS 4.5 ULTRA-DETAILED AGENT DEFINITIONS
const AGENTS = {
  franky: {
    name: 'Franky',
    series: 'One Piece',
    coreDesign: 'cybernetic/tech character with blue metallic body, humanoid but clearly mechanical',
    palette: ['deep blue #1E3A8A', 'cyan #06B6D4', 'white highlights #FFFFFF', 'electric yellow #FDE047'],
    details: 'tech panels, glowing circuits, expressive robotic face, mechanical joints, energy core visible',
    personality: 'confident, energetic, SUPER enthusiast',
  },
  maomao: {
    name: 'Maomao',
    series: 'The Apothecary Diaries',
    coreDesign: 'young woman with dark hair in twin buns, sharp analytical eyes, traditional Chinese court attire',
    palette: ['dark brown hair #3C2317', 'jade green robes #047857', 'gold trim #F59E0B', 'pale skin #FEF3C7'],
    details: 'intricate robe patterns, medicinal herb pouch, sharp focused expression, elegant posture',
    personality: 'analytical, curious, cautious, herb expert',
  },
  reigen: {
    name: 'Reigen Arataka',
    series: 'Mob Psycho 100',
    coreDesign: 'charismatic con artist with dark hair, confident smirk, wearing pink/purple suit',
    palette: ['dark hair #1F2937', 'pink suit #EC4899', 'red tie #DC2626', 'skin tone #FDE68A'],
    details: 'slicked back hair, sharp suit lines, dramatic hand gestures, salt particles, exaggerated expressions',
    personality: 'charismatic, opportunistic, surprisingly wise, dramatic',
  },
  robin: {
    name: 'Nico Robin',
    series: 'One Piece',
    coreDesign: 'tall elegant woman with long black hair, calm demeanor, stylish purple/blue outfit',
    palette: ['black hair #0F172A', 'purple dress #7C3AED', 'tan skin #FCD34D', 'blue accents #3B82F6'],
    details: 'flowing hair, confident posture, archaeological book, flower petals (devil fruit power), calm expression',
    personality: 'intellectual, calm, mysterious, archaeological scholar',
  },
  nanami: {
    name: 'Nanami Kento',
    series: 'Jujutsu Kaisen',
    coreDesign: 'serious businessman with blonde hair parted 7:3, glasses, blue shirt and tan suit',
    palette: ['blonde hair #FDE047', 'blue shirt #2563EB', 'tan suit #92400E', 'silver glasses #E5E7EB'],
    details: 'sharp hair part, rectangular glasses, tie loosened when working hard, cursed energy sparks, professional stance',
    personality: 'professional, serious, dedicated, overtime-hating salaryman',
  },
  frieren: {
    name: 'Frieren',
    series: 'Frieren: Beyond Journey\'s End',
    coreDesign: 'small elf mage with long white hair in twin tails, green eyes, white and gold robes',
    palette: ['white hair #F3F4F6', 'green eyes #10B981', 'white robes #FFFFFF', 'gold trim #FBBF24'],
    details: 'pointed elf ears, stoic expression, magical staff, spell book, mana particles, flowing robes',
    personality: 'stoic, ancient elf, powerful mage, emotionally reserved',
  },
  rimuru: {
    name: 'Rimuru Tempest',
    series: 'That Time I Got Reincarnated as a Slime',
    coreDesign: 'androgynous with long blue hair, golden eyes, black jacket with gold trim',
    palette: ['blue hair #3B82F6', 'golden eyes #F59E0B', 'black jacket #1F2937', 'gold trim #FCD34D'],
    details: 'slime form transitions, glowing eyes, magical aura, demon lord energy, fluid movement',
    personality: 'friendly, powerful, strategic, former salaryman turned slime demon lord',
  },
};

// OPUS 4.5 SPRITE DEFINITIONS - ULTRA DETAILED
const SPRITE_TYPES = {
  idle: {
    resolution: '256x64',
    frameSize: '64x64',
    frames: 4,
    promptTemplate: (agent) => `
ULTRA HIGH QUALITY PIXEL ART SPRITE SHEET - IDLE ANIMATION

TECHNICAL SPECS:
- Resolution: 256x64 pixels (4 frames of 64x64px horizontally arranged)
- Style: Premium 2D pixel art, professional game quality
- Background: Fully transparent (alpha channel)
- Pixel precision: Clean anti-aliasing, consistent style

CHARACTER: ${agent.name} from ${agent.series}
Design: ${agent.coreDesign}
Palette: ${agent.palette.join(', ')}
Details: ${agent.details}
Personality: ${agent.personality}

ANIMATION SEQUENCE (4 frames):
Frame 1: Neutral standing pose, relaxed
Frame 2: Subtle breathing - chest rises slightly, shoulders up 1-2 pixels
Frame 3: Peak of breath, slight bob upward
Frame 4: Exhale, return to near-neutral

QUALITY REQUIREMENTS:
- Each frame: character centered, consistent size/position
- Smooth motion: 2-3 pixel maximum movement between frames
- Color depth: 8-12 colors per sprite including shading
- Shading: 3-4 levels (base, shadow, highlight, outline)
- Expression: Calm, characteristic of personality
- Silhouette: Clear and readable at distance
- Anti-aliasing: Consistent across all frames

EFFECTS:
- Very subtle: 1-2 small ambient particles if character-appropriate
- Breathing motion: organic, natural rhythm
- No dramatic effects (save for working/done)

MOOD: Calm, resting, ready state
`.trim(),
  },
  
  walk: {
    resolution: '256x64',
    frameSize: '64x64',
    frames: 4,
    promptTemplate: (agent) => `
ULTRA HIGH QUALITY PIXEL ART SPRITE SHEET - WALK CYCLE

TECHNICAL SPECS:
- Resolution: 256x64 pixels (4 frames of 64x64px horizontally arranged)
- Style: Premium 2D pixel art, professional game quality
- Background: Fully transparent
- View: Side profile or 3/4 view

CHARACTER: ${agent.name} from ${agent.series}
Design: ${agent.coreDesign}
Palette: ${agent.palette.join(', ')}
Details: ${agent.details}
Personality: ${agent.personality}

ANIMATION SEQUENCE (4 frames - standard walk cycle):
Frame 1: Contact - right foot forward, left foot back, weight shift
Frame 2: Down - both feet planted, body lowered slightly
Frame 3: Passing - left foot forward passing right, body rises
Frame 4: Up - left foot forward, right foot back, highest point

QUALITY REQUIREMENTS:
- Smooth weight transfer: body bobs naturally with steps
- Arm swing: opposite arm swings forward with leg (natural gait)
- Head bob: 2-3 pixels up/down following body rhythm
- Consistent speed: equal spacing between key poses
- Clothing physics: subtle fabric movement, flowing elements
- Character personality: walk style matches character (confident/cautious/etc)

EFFECTS:
- Small dust/step particles on ground contact frames (1-2 pixels)
- Motion lines minimal or none
- Clothing/hair: subtle trailing movement

MOOD: Purposeful movement, personality-appropriate stride
`.trim(),
  },
  
  working: {
    resolution: '256x64',
    frameSize: '64x64',
    frames: 4,
    promptTemplate: (agent) => `
ULTRA HIGH QUALITY PIXEL ART SPRITE SHEET - WORKING HARD ANIMATION
⭐ THIS IS THE KEY SPRITE - MUST MATCH HOYUELO GOLD STANDARD QUALITY ⭐

TECHNICAL SPECS:
- Resolution: 256x64 pixels (4 frames of 64x64px horizontally arranged)
- Style: Premium 2D pixel art, MAXIMUM DETAIL AND VIBRANCY
- Background: Fully transparent
- Palette: SATURATED, HIGH CONTRAST, vibrant colors

CHARACTER: ${agent.name} from ${agent.series}
Design: ${agent.coreDesign}
Palette: ${agent.palette.join(', ')} + vibrant effect colors
Details: ${agent.details}
Personality: ${agent.personality}

ANIMATION SEQUENCE (4 frames - PROGRESSIVE INTENSITY):
Frame 1: Focused work state
- Character in concentrated pose (hunched over, focused eyes)
- Minimal energy effects (1-2 small sparkles)
- Stable, grounded stance
- Base palette colors

Frame 2: Intensity Building
- More dynamic pose, slight motion blur on active parts
- Energy particles appearing (3-5 sparkles/effects)
- Character-specific power manifestation begins:
  * Tech characters: circuits glowing, data streams
  * Magic characters: mana particles, spell glyphs  
  * Physical characters: sweat, motion lines, aura
- Palette: introducing brighter highlights (+20% saturation)

Frame 3: Peak Effort
- Dynamic action pose, full engagement
- Heavy energy effects (8-12 particles/effects)
- Character power at high intensity:
  * Tech: electric sparks, energy waves, system overload
  * Magic: spell circles, elemental effects, magical aura
  * Physical: speed lines, impact effects, power aura
- Multiple light sources from effects
- Palette: Highly saturated (+40% brightness on effects)

Frame 4: MAXIMUM OUTPUT (GOLD STANDARD QUALITY)
- EXPLOSIVE energy effect (controlled, not chaotic)
- Character surrounded by power manifestation:
  * Tech: Data explosion, electric storm, systems at max
  * Magic: Spell burst, massive aura, elemental eruption
  * Physical: Power explosion, ultimate technique activation
- Maximum particle density (15-20+ effect pixels)
- "+" shaped sparkles radiating outward (like hoyuelo)
- Bright aura/glow around entire character
- Palette: MAXIMUM VIBRANCY (full saturation, bright highlights)
- Similar visual intensity to hoyuelo's frame 4 flame explosion

QUALITY REQUIREMENTS:
- Frame 1→4: Clear progression of intensity
- Shading: 4-5 levels minimum for depth
- Effects: Layered (background glow, mid particles, foreground sparkles)
- Color harmony: Effects complement base palette
- Readability: Character silhouette visible even with max effects
- Professional polish: Every pixel intentional

CHARACTER-SPECIFIC WORKING EFFECTS:
${getWorkingEffects(agent.name)}

MOOD: Intense focus, maximum productivity, power unleashed
REFERENCE: Match the quality and visual impact of hoyuelo-v2/working.png
`.trim(),
  },
  
  done: {
    resolution: '256x64',
    frameSize: '64x64',
    frames: 4,
    promptTemplate: (agent) => `
ULTRA HIGH QUALITY PIXEL ART SPRITE SHEET - TASK COMPLETE ANIMATION

TECHNICAL SPECS:
- Resolution: 256x64 pixels (4 frames of 64x64px horizontally arranged)
- Style: Premium 2D pixel art, celebratory quality
- Background: Fully transparent
- Palette: Bright, positive, satisfying colors

CHARACTER: ${agent.name} from ${agent.series}
Design: ${agent.coreDesign}
Palette: ${agent.palette.join(', ')} + celebratory effect colors
Details: ${agent.details}
Personality: ${agent.personality}

ANIMATION SEQUENCE (4 frames - CELEBRATION):
Frame 1: Completion moment
- Character stands upright from working pose
- Relief/satisfaction expression
- Residual energy particles fading (3-4 sparkles)
- Relaxed posture

Frame 2: Recognition
- Character-appropriate victory gesture:
  * Confident: Thumbs up, peace sign, confident smirk
  * Professional: Nod, satisfied expression, adjusting glasses
  * Energetic: Fist pump, big smile, jumping preparation
- Small celebration effects appear (stars, sparkles)

Frame 3: Peak celebration
- Full expression of satisfaction:
  * Arms raised, victory pose, happy expression
  * OR calm satisfaction (depends on personality)
- Maximum celebration particles (8-10 stars/sparkles)
- Bright positive aura
- Slight upward motion (1-2 pixels bob)

Frame 4: Settling
- Return to confident standing pose
- Satisfied expression, maybe wiping brow or adjusting clothing
- Fading celebration effects (2-3 sparkles remaining)
- Ready for next task

QUALITY REQUIREMENTS:
- Expression: Clear personality-based satisfaction
- Effects: Positive, bright, stars/sparkles in character theme colors
- Motion: Organic celebration appropriate to character
- Polish: Smooth transition from working state to ready state

CELEBRATION EFFECTS:
- Star sparkles: "✨" style in palette colors
- Small "!" or "♪" symbols if character-appropriate  
- Gentle glow/aura suggesting accomplishment
- Confetti-style pixels (1-2 pixels, 4-6 pieces)

MOOD: Satisfaction, accomplishment, ready for more
`.trim(),
  },
};

function getWorkingEffects(agentName) {
  const effects = {
    franky: `
- Electric sparks: Bright yellow/cyan, 1-2 pixels
- Data streams: Flowing pixel lines, binary code aesthetic
- Circuit glow: Blue/cyan internal lighting
- Energy core: Pulsing bright core in chest
- Tech overload: System panels lighting up sequentially
- Robot steam/cooling vents activating`,
    
    maomao: `
- Medicinal herbs: Small green leaf particles
- Analytical sparkles: Sharp geometric shapes (hexagons)
- Concentration lines: Fine detail work indication
- Mortar & pestle motion blur
- Chemical reaction bubbles: Small rising dots
- Scholarly aura: Book pages, formula symbols`,
    
    reigen: `
- Salt particles: White pixel scatter
- Con artist sparkle: Exaggerated gold stars
- "Psychic" energy: Purple/pink wavy lines (fake but flashy)
- Dramatic pose effects: Speed lines, impact stars
- Sweat drops: Effort showing through facade
- Business card flutter: Dynamic rectangles`,
    
    robin: `
- Flower petals: Purple/blue petals from devil fruit
- Book pages: Archaeological research papers floating
- Hana Hana no Mi: Sprouting hands/arms effects
- Historical glyphs: Ancient text symbols
- Intellectual aura: Soft purple/blue glow
- Mysterious shadows: Poneglyph-style patterns`,
    
    nanami: `
- Cursed energy: Yellow/gold ratio sparks
- Ratio Technique: "7:3" effect visualization
- Professional determination: Sharp geometric energy
- Overtime frustration: Subtle stress marks
- Tie loosening: Progressive casual-ification
- Cleaver weapon glow: Cursed tool enhancement`,
    
    frieren: `
- Mana particles: White/blue magical sparkles
- Spell circles: Geometric magic formation
- Ancient elf magic: Runes, glyphs floating
- Staff glow: Crystal/gem brilliance
- Elemental magic: Ice/nature themed effects
- Grimoire pages: Spell book animation`,
    
    rimuru: `
- Slime form hints: Blue liquid effects
- Demon lord aura: Dark purple/red energy
- Great Sage analysis: Digital HUD elements
- Predator skill: Absorption/transformation effects
- Tempest energy: Wind/storm particles
- Evolution glow: Transformation sparkles`,
  };
  
  return effects[agentName] || '- Generic energy particles and work effects';
}

// Download helper (same as original)
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
  const detailedPrompt = spriteInfo.promptTemplate(agent);
  
  // Condensed version for API (has token limits)
  const apiPrompt = `High quality pixel art sprite sheet, 256x64px (4 frames 64x64px horizontal), ${agent.coreDesign}, ${spriteType} animation, ${agent.details}, colors: ${agent.palette.join(', ')}, transparent background, ${spriteType === 'working' ? 'MAXIMUM INTENSITY progressive energy effects like explosive finale' : spriteInfo.resolution}, professional game quality, vibrant saturated colors, smooth animation`;
  
  console.log(`\n🎨 Generating: ${agentId}/${spriteType}.png`);
  console.log(`   Character: ${agent.name} from ${agent.series}`);
  console.log(`   Prompt length: ${detailedPrompt.length} chars (using condensed: ${apiPrompt.length})`);
  
  try {
    const result = await fal.subscribe('fal-ai/nano-banana-pro', {
      input: {
        prompt: apiPrompt,
        num_images: 1,
        aspect_ratio: '16:9', // For 256x64
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
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🎮 OPUS 4.5 SPRITE GENERATION: ${agent.name}`);
  console.log(`   Series: ${agent.series}`);
  console.log(`   Design: ${agent.coreDesign}`);
  console.log(`${'='.repeat(70)}`);
  
  const outputDir = path.join(__dirname, '../public/sprites', agentId);
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const results = {};
  
  // Generate in order: idle, walk, working, done
  for (const spriteType of ['idle', 'walk', 'working', 'done']) {
    const spriteInfo = SPRITE_TYPES[spriteType];
    
    try {
      const imageUrl = await generateSprite(agentId, spriteType, agent, spriteInfo);
      const outputPath = path.join(outputDir, `${spriteType}.png`);
      
      await downloadImage(imageUrl, outputPath);
      console.log(`   💾 Saved: ${spriteType}.png`);
      
      results[spriteType] = 'success';
      
      // Wait between generations
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (error) {
      console.error(`   ❌ Failed ${spriteType}: ${error.message}`);
      results[spriteType] = 'failed';
    }
  }
  
  const successful = Object.values(results).filter(r => r === 'success').length;
  const total = Object.keys(results).length;
  
  console.log(`\n📊 ${agent.name} Complete: ${successful}/${total} sprites generated`);
  console.log(`${'='.repeat(70)}\n`);
  
  return results;
}

async function main() {
  const agentId = process.argv[2];
  
  if (!process.env.FAL_KEY) {
    console.error('❌ FAL_KEY environment variable not set!');
    console.error('   Set it in .env.local or export FAL_KEY="your-key"');
    process.exit(1);
  }
  
  console.log('🚀 OPUS 4.5 QUALITY SPRITE GENERATOR');
  console.log('   Ultra-detailed prompts for maximum quality');
  console.log('   Target: Match hoyuelo-v2/working.png gold standard');
  console.log('   Model: fal.ai/nano-banana-pro\n');
  
  try {
    if (agentId && agentId !== 'all') {
      const agent = AGENTS[agentId];
      if (!agent) {
        console.error(`❌ Unknown agent: ${agentId}`);
        console.error(`   Available: ${Object.keys(AGENTS).join(', ')}`);
        process.exit(1);
      }
      await generateAgentSprites(agentId, agent);
    } else {
      // Generate all
      console.log('🎯 Generating sprites for ALL 7 agents...\n');
      
      const allResults = {};
      for (const [id, agent] of Object.entries(AGENTS)) {
        allResults[id] = await generateAgentSprites(id, agent);
        
        if (id !== Object.keys(AGENTS)[Object.keys(AGENTS).length - 1]) {
          console.log('⏸️  Pausing 5s before next agent...\n');
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
      
      // Final summary
      console.log('\n' + '='.repeat(70));
      console.log('🎉 OPUS 4.5 GENERATION COMPLETE - ALL AGENTS');
      console.log('='.repeat(70));
      for (const [id, results] of Object.entries(allResults)) {
        const successful = Object.values(results).filter(r => r === 'success').length;
        const total = Object.keys(results).length;
        const status = successful === total ? '✅' : '⚠️';
        console.log(`${status} ${id.padEnd(10)} ${successful}/${total} sprites (idle, walk, working, done)`);
      }
      console.log('='.repeat(70));
    }
  } catch (error) {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  }
}

main();

/**
 * HP Odonto Video Renderer
 * Generates MP4 videos from scene JSON using Playwright screen recording.
 * No Remotion needed — just HTML animations + Chrome recording.
 */

const fs = require('fs');
const path = require('path');

async function renderVideoFromScenes(scenesPath, outputPath, options = {}) {
  const { chromium } = eval("require")('playwright');

  const scenesData = JSON.parse(fs.readFileSync(scenesPath, 'utf-8'));
  const scenes = scenesData.props?.scenes || scenesData.scenes || scenesData;

  if (!Array.isArray(scenes) || scenes.length === 0) {
    throw new Error('No scenes found in JSON');
  }

  const procedure = scenesData.props?.procedure || options.procedure || '';
  const clientName = scenesData.props?.client || options.clientName || '';
  const primaryColor = options.primaryColor || '#1A2744';
  const accentColor = options.accentColor || '#C9A84C';
  const totalDuration = scenes.reduce((sum, s) => sum + (s.duration || 3), 0);

  console.log(`[VideoRenderer] Rendering ${scenes.length} scenes (${totalDuration}s total)`);

  // Generate animated HTML with CSS transitions
  const html = generateVideoHTML(scenes, { primaryColor, accentColor, clientName, procedure });

  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    
  });

  try {
    const context = await browser.newContext({
      viewport: { width: 1080, height: 1920 },
      recordVideo: {
        dir: outputDir,
        size: { width: 1080, height: 1920 },
      },
    });

    const page = await context.newPage();
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000); // Wait for fonts

    // Play through each scene
    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      const duration = (scene.duration || 3) * 1000;

      // Trigger scene transition
      await page.evaluate((idx) => {
        const event = new CustomEvent('showScene', { detail: { index: idx } });
        document.dispatchEvent(event);
      }, i);

      console.log(`[VideoRenderer] Scene ${i + 1}/${scenes.length}: "${scene.type}" (${scene.duration}s)`);
      await page.waitForTimeout(duration);
    }

    // Extra time for final scene
    await page.waitForTimeout(500);

    // Close to save video
    await page.close();
    await context.close();

    // Find the recorded video file
    const videoFiles = fs.readdirSync(outputDir).filter(f => f.endsWith('.webm'));
    if (videoFiles.length > 0) {
      const recordedPath = path.join(outputDir, videoFiles[videoFiles.length - 1]);

      // Convert webm to mp4 with ffmpeg
      const { execSync } = require('child_process');
      try {
        execSync(`ffmpeg -i "${recordedPath}" -c:v libx264 -preset fast -crf 23 -y "${outputPath}" -loglevel quiet`, {
          timeout: 60000,
        });
        // Cleanup webm
        fs.unlinkSync(recordedPath);
        const stat = fs.statSync(outputPath);
        console.log(`[VideoRenderer] MP4 saved: ${outputPath} (${(stat.size / 1024 / 1024).toFixed(1)} MB)`);
        return outputPath;
      } catch (e) {
        // If ffmpeg fails, rename webm as output
        const webmOutput = outputPath.replace('.mp4', '.webm');
        fs.renameSync(recordedPath, webmOutput);
        console.log(`[VideoRenderer] WebM saved (ffmpeg failed): ${webmOutput}`);
        return webmOutput;
      }
    }

    throw new Error('No video file was recorded');
  } finally {
    await browser.close();
  }
}

function generateVideoHTML(scenes, opts) {
  const { primaryColor, accentColor, clientName, procedure } = opts;

  const sceneStyles = {
    hook: { bg: primaryColor, text: '#FFFFFF', size: '64px' },
    problem: { bg: '#1A1A1A', text: '#FFFFFF', size: '52px' },
    product: { bg: '#FFFFFF', text: '#1A1A1A', size: '48px' },
    benefit: { bg: accentColor, text: '#FFFFFF', size: '56px' },
    cta: { bg: primaryColor, text: '#FFFFFF', size: '44px' },
  };

  const sceneDivs = scenes.map((scene, i) => {
    const style = sceneStyles[scene.type] || sceneStyles.hook;
    const label = {
      hook: '', problem: 'O PROBLEMA', product: 'A SOLUÇÃO', benefit: '', cta: '',
    }[scene.type] || '';

    return `
      <div class="scene" id="scene-${i}" style="
        background: ${style.bg};
        color: ${style.text};
        opacity: ${i === 0 ? 1 : 0};
        transform: ${i === 0 ? 'scale(1)' : 'scale(0.95)'};
      ">
        ${label ? `<div class="label" style="color: ${accentColor}">${label}</div>` : ''}
        <div class="scene-text" style="font-size: ${style.size}">
          ${scene.text}
        </div>
        ${scene.type === 'cta' ? `
          <div class="cta-btn" style="background: ${accentColor}; color: ${primaryColor}">
            Agende agora
          </div>
          <div class="client-name">${clientName}</div>
        ` : ''}
      </div>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html>
<head>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  width: 1080px; height: 1920px; overflow: hidden;
  font-family: 'Inter', sans-serif; background: #000;
}
.scene {
  position: absolute; top: 0; left: 0;
  width: 1080px; height: 1920px;
  display: flex; flex-direction: column;
  justify-content: center; align-items: center;
  padding: 80px; text-align: center;
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.scene-text {
  font-weight: 800; line-height: 1.2;
  max-width: 920px;
  text-shadow: 0 4px 20px rgba(0,0,0,0.15);
}
.label {
  font-size: 22px; font-weight: 600;
  letter-spacing: 4px; text-transform: uppercase;
  margin-bottom: 30px;
}
.cta-btn {
  margin-top: 50px; padding: 24px 60px;
  font-size: 32px; font-weight: 700;
  border-radius: 50px;
}
.client-name {
  margin-top: 30px; font-size: 20px;
  opacity: 0.6;
}
</style>
</head>
<body>
${sceneDivs}
<script>
let currentScene = 0;
document.addEventListener('showScene', (e) => {
  const idx = e.detail.index;
  // Hide current
  const prev = document.getElementById('scene-' + currentScene);
  if (prev) { prev.style.opacity = '0'; prev.style.transform = 'scale(0.95)'; }
  // Show new
  const next = document.getElementById('scene-' + idx);
  if (next) { next.style.opacity = '1'; next.style.transform = 'scale(1)'; }
  currentScene = idx;
});
</script>
</body>
</html>`;
}

module.exports = { renderVideoFromScenes };

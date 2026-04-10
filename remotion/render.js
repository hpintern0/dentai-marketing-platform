const { bundle } = require('@remotion/bundler');
const { renderMedia, selectComposition } = require('@remotion/renderer');
const path = require('path');
const fs = require('fs');

async function renderVideo(scenesPath, outputPath, compositionId = 'AdVideo') {
  console.log(`[Remotion] Bundling project...`);

  const bundleLocation = await bundle({
    entryPoint: path.resolve(__dirname, './index.ts'),
    webpackOverride: (config) => config,
  });

  let inputProps = {};
  if (scenesPath && fs.existsSync(scenesPath)) {
    const scenesData = JSON.parse(fs.readFileSync(scenesPath, 'utf-8'));
    inputProps = scenesData.props || scenesData;
  }

  console.log(`[Remotion] Selecting composition: ${compositionId}`);
  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: compositionId,
    inputProps,
  });

  const finalOutput = outputPath || path.resolve(__dirname, '../outputs/video/ad.mp4');
  const outputDir = path.dirname(finalOutput);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(`[Remotion] Rendering ${compositionId} to ${finalOutput}...`);

  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: 'h264',
    outputLocation: finalOutput,
    inputProps,
    onProgress: ({ progress }) => {
      if (Math.round(progress * 100) % 10 === 0) {
        console.log(`[Remotion] Rendering: ${Math.round(progress * 100)}%`);
      }
    },
  });

  console.log(`[Remotion] Done! Output: ${finalOutput}`);
  return finalOutput;
}

// CLI support
if (require.main === module) {
  const args = process.argv.slice(2);
  const scenesPath = args[0];
  const outputPath = args[1];
  const compositionId = args[2] || 'AdVideo';

  renderVideo(scenesPath, outputPath, compositionId)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Remotion] Error:', err);
      process.exit(1);
    });
}

module.exports = { renderVideo };

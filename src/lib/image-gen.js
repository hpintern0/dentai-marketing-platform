/**
 * HP Odonto — Image Generation via OpenAI GPT Image 2
 * Generates professional marketing images for dental campaigns.
 */

const fs = require('fs');
const path = require('path');

let OpenAI;

function getOpenAI() {
  if (!OpenAI) {
    const mod = eval("require")('openai');
    OpenAI = mod.default || mod;
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

/**
 * Generate a marketing image using GPT Image 2
 * @param {string} prompt — detailed image description
 * @param {object} options — size, quality, outputPath
 * @returns {Buffer} — PNG image buffer
 */
async function generateImage(prompt, options = {}) {
  const {
    size = '1024x1024',
    quality = 'medium',
    outputPath,
  } = options;

  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not set');
  }

  const openai = getOpenAI();

  console.log(`[ImageGen] Generating image (${size}, ${quality})...`);
  console.log(`[ImageGen] Prompt: ${prompt.substring(0, 100)}...`);

  const MAX_RETRIES = 3;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await openai.images.generate({
        model: 'gpt-image-1',
        prompt,
        n: 1,
        size,
        quality,
      });

      const imageData = response.data[0];

      if (!imageData) throw new Error('No image returned');

      // Get the image as base64 or URL
      let buffer;
      if (imageData.b64_json) {
        buffer = Buffer.from(imageData.b64_json, 'base64');
      } else if (imageData.url) {
        // Download from URL
        const https = require('https');
        buffer = await new Promise((resolve, reject) => {
          https.get(imageData.url, (res) => {
            const chunks = [];
            res.on('data', c => chunks.push(c));
            res.on('end', () => resolve(Buffer.concat(chunks)));
            res.on('error', reject);
          }).on('error', reject);
        });
      }

      if (!buffer || buffer.length < 1000) {
        throw new Error('Generated image is empty or too small');
      }

      console.log(`[ImageGen] Generated! (${(buffer.length / 1024).toFixed(0)} KB)`);

      // Save to file if path provided
      if (outputPath) {
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(outputPath, buffer);
        console.log(`[ImageGen] Saved: ${outputPath}`);
      }

      return buffer;

    } catch (err) {
      const status = err?.status || 0;
      const isRetryable = status === 429 || status === 502 || status === 503 || status === 529;

      if (isRetryable && attempt < MAX_RETRIES) {
        const delay = 3000 * attempt;
        console.warn(`[ImageGen] Attempt ${attempt}/${MAX_RETRIES} failed (${status}). Retrying in ${delay}ms...`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }
}

/**
 * Generate multiple carousel slides
 */
async function generateCarouselSlides(slidePrompts, options = {}) {
  const results = [];
  for (let i = 0; i < slidePrompts.length; i++) {
    console.log(`[ImageGen] Slide ${i + 1}/${slidePrompts.length}`);
    try {
      const buffer = await generateImage(slidePrompts[i], {
        size: '1024x1024',
        quality: options.quality || 'medium',
        outputPath: options.outputDir
          ? path.join(options.outputDir, `slide_${String(i + 1).padStart(2, '0')}.png`)
          : undefined,
      });
      results.push({ index: i + 1, buffer, success: true });
    } catch (err) {
      console.error(`[ImageGen] Slide ${i + 1} failed: ${err.message}`);
      results.push({ index: i + 1, buffer: null, success: false, error: err.message });
    }
  }
  return results;
}

module.exports = { generateImage, generateCarouselSlides };

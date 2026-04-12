const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function analyzeInstagramProfile(username, outputDir, clientId) {
  username = username.replace('@', '');
  if (!outputDir) {
    outputDir = path.resolve(__dirname, `../../outputs/instagram_${username}`);
  }
  fs.mkdirSync(outputDir, { recursive: true });

  console.log(`[IG Pipeline] Starting analysis of @${username}`);

  // Step 1: Scrape profile — prefer authenticated scraper for better results
  console.log(`[IG Pipeline] Step 1: Scraping profile...`);
  let scrapeSuccess = false;

  // Try authenticated scraper first (gets real data)
  if (process.env.INSTAGRAM_USERNAME && process.env.INSTAGRAM_PASSWORD) {
    try {
      console.log(`[IG Pipeline] Using authenticated scraper...`);
      const authScraperPath = path.join(__dirname, 'browser-scraper-auth.js');
      const { scrapeProfileAuth } = require(authScraperPath);
      const result = await scrapeProfileAuth(username, outputDir, 12);
      if (result && result.posts && result.posts.length > 0) {
        scrapeSuccess = true;
        console.log(`[IG Pipeline] Auth scraper: ${result.posts.length} posts collected`);
      } else {
        console.warn(`[IG Pipeline] Auth scraper returned 0 posts, trying fallback...`);
      }
    } catch (authErr) {
      console.error(`[IG Pipeline] Auth scraper failed: ${authErr.message}`);
    }
  }

  // Fallback to non-auth scraper
  if (!scrapeSuccess) {
    try {
      console.log(`[IG Pipeline] Using non-auth scraper as fallback...`);
      const scraperPath = path.join(__dirname, 'browser-scraper.js');
      const { scrapeProfile } = require(scraperPath);
      await scrapeProfile(username, outputDir, 12);
    } catch (err) {
      console.error(`[IG Pipeline] Fallback scraper also failed: ${err.message}`);
    }
  }

  const dataPath = path.join(outputDir, 'instagram_data.json');
  if (!fs.existsSync(dataPath)) {
    throw new Error('Scraping failed — no data file generated');
  }

  // After scraping, upload images to Supabase
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const { uploadScrapedImagesToSupabase } = require('./upload-to-supabase');
      if (clientId) {
        await uploadScrapedImagesToSupabase(clientId, outputDir);
      }
    } catch (err) {
      console.warn('[IG Pipeline] Image upload failed:', err.message);
    }
  }

  // Step 2: Download videos with yt-dlp (best effort)
  console.log(`[IG Pipeline] Step 2: Downloading videos...`);
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    const reels = data.posts.filter(p => p.is_video || p.is_reel);
    const videosDir = path.join(outputDir, 'videos');
    fs.mkdirSync(videosDir, { recursive: true });

    for (const reel of reels.slice(0, 8)) {
      const vidPath = path.join(videosDir, `${reel.shortcode}.mp4`);
      if (fs.existsSync(vidPath) && fs.statSync(vidPath).size > 10000) continue;

      try {
        execSync(`yt-dlp -o "${vidPath}" --no-overwrites --quiet "${reel.url}"`, {
          timeout: 30000,
          stdio: 'pipe',
        });
        console.log(`[IG Pipeline] Video downloaded: ${reel.shortcode}`);
      } catch {
        // yt-dlp may not be installed on server — that's ok
      }
    }
  } catch (err) {
    console.warn(`[IG Pipeline] Video download step failed (non-critical): ${err.message}`);
  }

  // Step 3: Analyze with Claude Vision + transcribe
  console.log(`[IG Pipeline] Step 3: Analyzing with AI...`);
  try {
    const analyzerPath = path.join(__dirname, 'analyzer.py');
    execSync(`python3 "${analyzerPath}" "${dataPath}" "${outputDir}"`, {
      timeout: 300000,
      env: { ...process.env },
      stdio: 'pipe',
    });
  } catch (err) {
    console.warn(`[IG Pipeline] Python analyzer failed, using JS fallback...`);
    // Fallback: analyze with Claude directly from Node
    await analyzeWithClaude(dataPath, outputDir);
  }

  // Step 4: Read insights
  const insightsPath = path.join(outputDir, 'insights.json');
  if (fs.existsSync(insightsPath)) {
    const insights = JSON.parse(fs.readFileSync(insightsPath, 'utf-8'));
    console.log(`[IG Pipeline] Analysis complete!`);
    return insights;
  }

  // If no Python insights, try profile_intelligence.json
  const intelPath = path.join(outputDir, 'profile_intelligence.json');
  if (fs.existsSync(intelPath)) {
    const intel = JSON.parse(fs.readFileSync(intelPath, 'utf-8'));
    return intel.intelligence || intel;
  }

  throw new Error('Analysis failed — no insights generated');
}

// Fallback Claude analysis without Python
async function analyzeWithClaude(dataPath, outputDir) {
  const { generateJSON } = require('../../src/lib/ai-cjs');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  const profile = data.profile;
  const posts = data.posts;
  const captions = posts.map(p => p.caption).filter(Boolean).slice(0, 10).join('\n---\n');

  const insights = await generateJSON(
    `Voce e um analista de marketing de Instagram especializado em odontologia. Analise os dados de um perfil e gere insights estruturados.`,
    `Perfil: @${profile.username}
Nome: ${profile.full_name}
Bio: ${profile.biography}
Seguidores: ${profile.followers}
Posts: ${profile.posts_count}
Posts analisados: ${posts.length}
Tipos: ${posts.filter(p => p.is_video).length} videos, ${posts.filter(p => !p.is_video).length} imagens

Captions recentes:
${captions.substring(0, 3000)}

Gere JSON com: profile_summary, specialty_focus, target_audience, tone_of_voice, content_strategy (object com primary_content_types array, posting_frequency string, content_pillars array), top_formats (array), recurring_themes (array), high_performance_hooks (array), predominant_tone, posting_frequency, hashtag_usage (array), cta_patterns (array), qualitative_notes, strengths (array), weaknesses (array), opportunities (array), recommendations (array)`,
    { maxTokens: 4096 },
  );

  fs.writeFileSync(path.join(outputDir, 'insights.json'), JSON.stringify(insights, null, 2));
  return insights;
}

module.exports = { analyzeInstagramProfile };

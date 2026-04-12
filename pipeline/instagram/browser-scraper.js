/**
 * HP Odonto Instagram Browser Scraper
 * Uses Playwright to access Instagram like a real browser.
 * Extracts posts, images, videos, captions, and metrics.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(dest);
    mod.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        downloadFile(response.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      response.pipe(file);
      file.on('finish', () => { file.close(); resolve(dest); });
    }).on('error', (err) => { fs.unlink(dest, () => {}); reject(err); });
  });
}

async function scrapeProfile(username, outputDir, maxPosts = 12) {
  username = username.replace('@', '');

  console.log(`[Browser Scraper] Starting: @${username}`);
  console.log(`[Browser Scraper] Output: ${outputDir}`);

  fs.mkdirSync(path.join(outputDir, 'posts'), { recursive: true });
  fs.mkdirSync(path.join(outputDir, 'videos'), { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
    locale: 'pt-BR',
  });

  const page = await context.newPage();

  try {
    // Go to profile
    console.log(`[Browser Scraper] Loading profile page...`);
    await page.goto(`https://www.instagram.com/${username}/`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    // Wait for page to render
    await page.waitForTimeout(5000);

    // Close login/signup popup if it appears
    for (const selector of [
      'div[role="dialog"] button:has-text("Not Now")',
      'div[role="dialog"] button:has-text("Agora não")',
      'div[role="dialog"] [aria-label="Close"]',
      'div[role="dialog"] svg[aria-label="Close"]',
      'button[class*="close"]',
    ]) {
      try {
        const btn = await page.$(selector);
        if (btn) { await btn.click(); console.log('[Browser Scraper] Closed popup'); break; }
      } catch {}
    }
    // Also try pressing Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(2000);

    // Extract profile info from the page
    console.log(`[Browser Scraper] Extracting profile data...`);

    const profileData = await page.evaluate(() => {
      const getMeta = (prop) => {
        const el = document.querySelector(`meta[property="${prop}"]`) || document.querySelector(`meta[name="${prop}"]`);
        return el ? el.getAttribute('content') : null;
      };

      // Try to get data from meta tags and page content
      const description = getMeta('og:description') || '';
      const title = getMeta('og:title') || document.title || '';

      // Parse followers/following/posts from description
      // Format: "X Followers, Y Following, Z Posts - See Instagram photos and videos from Name (@user)"
      const statsMatch = description.match(/([\d,.KMkm]+)\s*Followers.*?([\d,.KMkm]+)\s*Following.*?([\d,.KMkm]+)\s*Posts/i);

      const parseNum = (s) => {
        if (!s) return 0;
        s = s.replace(/,/g, '');
        if (s.includes('K') || s.includes('k')) return parseFloat(s) * 1000;
        if (s.includes('M') || s.includes('m')) return parseFloat(s) * 1000000;
        return parseInt(s) || 0;
      };

      // Get bio from page
      const bioEl = document.querySelector('div.-vDIg span, section main header section div span');
      const bio = bioEl ? bioEl.textContent : '';

      // Get profile pic
      const picEl = document.querySelector('img[alt*="profile picture"], header img');
      const profilePic = picEl ? picEl.src : null;

      return {
        username: window.location.pathname.replace(/\//g, ''),
        full_name: title.split('(')[0].trim().split('•')[0].trim(),
        biography: bio,
        followers: statsMatch ? parseNum(statsMatch[1]) : 0,
        following: statsMatch ? parseNum(statsMatch[2]) : 0,
        posts_count: statsMatch ? parseNum(statsMatch[3]) : 0,
        profile_pic_url: profilePic,
        og_description: description,
      };
    });

    console.log(`[Browser Scraper] Profile: ${profileData.full_name}`);
    console.log(`[Browser Scraper] Followers: ${profileData.followers}`);

    // Download profile picture
    if (profileData.profile_pic_url) {
      try {
        await downloadFile(profileData.profile_pic_url, path.join(outputDir, 'profile_pic.jpg'));
        console.log(`[Browser Scraper] Profile pic saved`);
      } catch {}
    }

    // Collect post links by scrolling
    console.log(`[Browser Scraper] Collecting posts...`);

    let postLinks = [];
    let scrollAttempts = 0;
    const maxScrolls = 5;

    while (postLinks.length < maxPosts && scrollAttempts < maxScrolls) {
      const newLinks = await page.evaluate(() => {
        const links = [];
        document.querySelectorAll('a[href*="/p/"], a[href*="/reel/"]').forEach(a => {
          const href = a.getAttribute('href');
          if (href && !links.includes(href)) {
            links.push(href);
          }
        });
        return links;
      });

      postLinks = [...new Set([...postLinks, ...newLinks])];
      console.log(`[Browser Scraper] Found ${postLinks.length} posts so far...`);

      if (postLinks.length >= maxPosts) break;

      // Scroll down
      await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2));
      await page.waitForTimeout(2000);
      scrollAttempts++;
    }

    postLinks = postLinks.slice(0, maxPosts);
    console.log(`[Browser Scraper] Will analyze ${postLinks.length} posts`);

    // Visit each post and extract data
    const postsData = [];

    for (let i = 0; i < postLinks.length; i++) {
      const postUrl = `https://www.instagram.com${postLinks[i]}`;
      console.log(`[Browser Scraper] Post ${i + 1}/${postLinks.length}: ${postLinks[i]}`);

      try {
        await page.goto(postUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await page.waitForTimeout(2000);

        // Close popups
        try {
          const closeBtn = await page.$('button:has-text("Not Now"), button:has-text("Agora não")');
          if (closeBtn) await closeBtn.click();
        } catch {}

        const postData = await page.evaluate(() => {
          const getMeta = (prop) => {
            const el = document.querySelector(`meta[property="${prop}"]`);
            return el ? el.getAttribute('content') : null;
          };

          // Get caption
          const captionEl = document.querySelector('div[class*="Caption"] span, h1 + div span, article span[dir="auto"]');
          let caption = captionEl ? captionEl.textContent : '';

          // Get likes
          const likesEl = document.querySelector('section span[class*="likes"], a[href*="liked_by"] span');
          let likes = 0;
          if (likesEl) {
            const text = likesEl.textContent.replace(/[,.]/g, '');
            likes = parseInt(text) || 0;
          }

          // Get images
          const images = [];
          document.querySelectorAll('article img[src*="instagram"], div[role="presentation"] img').forEach(img => {
            if (img.src && img.src.includes('instagram') && !img.src.includes('profile_pic') && img.width > 200) {
              images.push(img.src);
            }
          });

          // Get videos
          const videos = [];
          document.querySelectorAll('article video source, article video').forEach(v => {
            const src = v.src || v.querySelector('source')?.src;
            if (src) videos.push(src);
          });

          // Get date
          const timeEl = document.querySelector('time[datetime]');
          const date = timeEl ? timeEl.getAttribute('datetime') : null;

          // Determine type
          const isVideo = videos.length > 0;
          const isCarousel = document.querySelectorAll('button[aria-label*="Next"], button[aria-label*="Próximo"]').length > 0;

          return {
            caption,
            likes,
            images: [...new Set(images)],
            videos: [...new Set(videos)],
            date,
            is_video: isVideo,
            is_carousel: isCarousel,
            type: isVideo ? 'video' : (isCarousel ? 'carousel' : 'image'),
            og_image: getMeta('og:image'),
          };
        });

        const shortcode = postLinks[i].split('/').filter(Boolean).pop();

        // Extract hashtags from caption
        const hashtags = [];
        if (postData.caption) {
          const matches = postData.caption.match(/#[\w\u00C0-\u024F]+/g);
          if (matches) hashtags.push(...matches.map(h => h.slice(1)));
        }

        const postInfo = {
          shortcode,
          url: postUrl,
          type: postData.type,
          caption: postData.caption,
          hashtags,
          likes: postData.likes,
          date: postData.date,
          is_video: postData.is_video,
          media_files: [],
        };

        // Download images
        const allImages = [...postData.images];
        if (postData.og_image && !allImages.includes(postData.og_image)) {
          allImages.unshift(postData.og_image);
        }

        for (let j = 0; j < Math.min(allImages.length, 1); j++) {
          const imgUrl = allImages[j];
          const imgPath = path.join(outputDir, 'posts', `${shortcode}_${j}.jpg`);
          try {
            await downloadFile(imgUrl, imgPath);
            postInfo.media_files.push(imgPath);
            console.log(`  → Image saved`);
          } catch (e) {
            console.log(`  → Image download failed: ${e.message}`);
          }
        }

        // Download videos
        for (const vidUrl of postData.videos.slice(0, 1)) {
          const vidPath = path.join(outputDir, 'videos', `${shortcode}.mp4`);
          try {
            await downloadFile(vidUrl, vidPath);
            postInfo.media_files.push(vidPath);
            console.log(`  → Video saved`);
          } catch (e) {
            console.log(`  → Video download failed: ${e.message}`);
          }
        }

        postsData.push(postInfo);

      } catch (err) {
        console.log(`  → Error: ${err.message}`);
      }
    }

    // Calculate metrics
    const avgLikes = postsData.length > 0
      ? Math.round(postsData.reduce((sum, p) => sum + p.likes, 0) / postsData.length)
      : 0;

    const allHashtags = {};
    postsData.forEach(p => p.hashtags.forEach(h => { allHashtags[h] = (allHashtags[h] || 0) + 1; }));
    const topHashtags = Object.entries(allHashtags)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([tag, count]) => ({ tag, count }));

    const report = {
      profile: { ...profileData, scraped_at: new Date().toISOString() },
      metrics: {
        avg_likes: avgLikes,
        total_posts_analyzed: postsData.length,
        video_count: postsData.filter(p => p.is_video).length,
        image_count: postsData.filter(p => !p.is_video && p.type !== 'carousel').length,
        carousel_count: postsData.filter(p => p.type === 'carousel').length,
        top_hashtags: topHashtags,
      },
      posts: postsData,
    };

    // Save report
    const reportPath = path.join(outputDir, 'instagram_data.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`\n[Browser Scraper] Complete!`);
    console.log(`  Posts: ${postsData.length}`);
    console.log(`  Images: ${postsData.filter(p => !p.is_video).length}`);
    console.log(`  Videos: ${postsData.filter(p => p.is_video).length}`);
    console.log(`  Report: ${reportPath}`);

    return report;

  } catch (err) {
    console.error(`[Browser Scraper] Error: ${err.message}`);

    // Take screenshot for debugging
    try {
      await page.screenshot({ path: path.join(outputDir, 'debug_screenshot.png') });
      console.log(`[Browser Scraper] Debug screenshot saved`);
    } catch {}

    return null;
  } finally {
    await browser.close();
  }
}

// CLI
if (require.main === module) {
  const username = process.argv[2];
  const outputDir = process.argv[3] || `outputs/instagram_${username?.replace('@', '')}`;
  const maxPosts = parseInt(process.argv[4]) || 12;

  if (!username) {
    console.log('Usage: node browser-scraper.js <username> [output_dir] [max_posts]');
    process.exit(1);
  }

  scrapeProfile(username, outputDir, maxPosts)
    .then(r => { if (!r) process.exit(1); })
    .catch(e => { console.error(e); process.exit(1); });
}

module.exports = { scrapeProfile };

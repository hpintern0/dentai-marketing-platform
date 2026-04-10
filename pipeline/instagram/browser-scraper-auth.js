/**
 * DentAI Instagram Browser Scraper — Authenticated Version
 * Logs into Instagram with credentials, then scrapes profiles including videos.
 * Downloads reels/videos for Whisper transcription.
 *
 * Usage:
 *   node browser-scraper-auth.js <username> [output_dir] [max_posts]
 *
 * Env vars:
 *   INSTAGRAM_USERNAME — your IG login email/username
 *   INSTAGRAM_PASSWORD — your IG login password
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const COOKIES_PATH = path.join(__dirname, '.ig_cookies.json');

async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(dest);
    mod.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Referer': 'https://www.instagram.com/',
      }
    }, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        file.close();
        fs.unlinkSync(dest);
        return downloadFile(response.headers.location, dest).then(resolve).catch(reject);
      }
      response.pipe(file);
      file.on('finish', () => { file.close(); resolve(dest); });
    }).on('error', (err) => { fs.unlink(dest, () => {}); reject(err); });
  });
}

async function login(page, username, password) {
  console.log(`[Auth] Logging in as ${username}...`);

  await page.goto('https://www.instagram.com/accounts/login/', {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });
  await page.waitForTimeout(5000);

  // Take screenshot for debug
  await page.screenshot({ path: path.join(__dirname, 'login_debug.png') });

  // Accept cookies if prompted
  for (const sel of ['button:has-text("Allow")', 'button:has-text("Accept")', 'button:has-text("Permitir")', 'button:has-text("Allow all cookies")', 'button:has-text("Aceitar")']) {
    try {
      const btn = await page.$(sel);
      if (btn) { await btn.click(); console.log('[Auth] Accepted cookies'); break; }
    } catch {}
  }
  await page.waitForTimeout(2000);

  // Wait for login form to appear
  try {
    await page.waitForSelector('input[name="username"], input[aria-label*="username"], input[aria-label*="telefone"], input[aria-label*="Phone"]', { timeout: 15000 });
  } catch {
    console.log('[Auth] Login form not found, trying alternative selectors...');
    await page.screenshot({ path: path.join(__dirname, 'login_form_debug.png') });
  }

  // Fill login form — try multiple selectors
  const usernameSelectors = ['input[name="username"]', 'input[aria-label*="username"]', 'input[aria-label*="telefone"]', 'input[aria-label*="Phone"]', 'input[type="text"]'];
  const passwordSelectors = ['input[name="password"]', 'input[aria-label*="password"]', 'input[aria-label*="Senha"]', 'input[type="password"]'];

  for (const sel of usernameSelectors) {
    try {
      const el = await page.$(sel);
      if (el) { await el.fill(username); console.log(`[Auth] Username filled via ${sel}`); break; }
    } catch {}
  }
  await page.waitForTimeout(500);

  for (const sel of passwordSelectors) {
    try {
      const el = await page.$(sel);
      if (el) { await el.fill(password); console.log(`[Auth] Password filled via ${sel}`); break; }
    } catch {}
  }
  await page.waitForTimeout(500);

  // Click login button
  for (const sel of ['button[type="submit"]', 'button:has-text("Log in")', 'button:has-text("Entrar")', 'div[role="button"]:has-text("Log in")']) {
    try {
      const btn = await page.$(sel);
      if (btn) { await btn.click(); console.log(`[Auth] Login clicked via ${sel}`); break; }
    } catch {}
  }
  await page.waitForTimeout(8000);

  // Handle "Save Login Info" popup
  try {
    const notNow = await page.$('button:has-text("Not Now"), button:has-text("Agora não")');
    if (notNow) await notNow.click();
    await page.waitForTimeout(2000);
  } catch {}

  // Handle notifications popup
  try {
    const notNow = await page.$('button:has-text("Not Now"), button:has-text("Agora não")');
    if (notNow) await notNow.click();
    await page.waitForTimeout(1000);
  } catch {}

  // Check if logged in by looking for profile icon or feed
  const loggedIn = await page.evaluate(() => {
    return !!document.querySelector('svg[aria-label="Home"], svg[aria-label="Início"], a[href*="/direct/"]');
  });

  if (loggedIn) {
    console.log(`[Auth] Login successful!`);
  } else {
    console.log(`[Auth] Login may have failed — continuing anyway...`);
  }
}

async function saveCookies(context) {
  const cookies = await context.cookies();
  fs.writeFileSync(COOKIES_PATH, JSON.stringify(cookies, null, 2));
  console.log(`[Auth] Cookies saved (${cookies.length} cookies)`);
}

async function loadCookies(context) {
  if (fs.existsSync(COOKIES_PATH)) {
    const cookies = JSON.parse(fs.readFileSync(COOKIES_PATH, 'utf-8'));
    await context.addCookies(cookies);
    console.log(`[Auth] Cookies loaded (${cookies.length} cookies)`);
    return true;
  }
  return false;
}

async function scrapeProfileAuth(targetUsername, outputDir, maxPosts = 12) {
  targetUsername = targetUsername.replace('@', '');

  const igUser = process.env.INSTAGRAM_USERNAME;
  const igPass = process.env.INSTAGRAM_PASSWORD;

  if (!igUser || !igPass) {
    console.error('[Auth] Set INSTAGRAM_USERNAME and INSTAGRAM_PASSWORD env vars');
    process.exit(1);
  }

  console.log(`[Scraper] Target: @${targetUsername}`);
  console.log(`[Scraper] Output: ${outputDir}`);
  console.log(`[Scraper] Max posts: ${maxPosts}`);

  fs.mkdirSync(path.join(outputDir, 'posts'), { recursive: true });
  fs.mkdirSync(path.join(outputDir, 'videos'), { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
    locale: 'pt-BR',
  });

  const page = await context.newPage();

  try {
    // Try loading saved cookies first
    const hasCookies = await loadCookies(context);

    if (hasCookies) {
      // Verify if cookies are still valid
      await page.goto('https://www.instagram.com/', { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(3000);
      const isLoggedIn = await page.evaluate(() => {
        return !!document.querySelector('svg[aria-label="Home"], svg[aria-label="Início"], a[href*="/direct/"]');
      });
      if (!isLoggedIn) {
        console.log('[Auth] Saved cookies expired, logging in fresh...');
        await login(page, igUser, igPass);
        await saveCookies(context);
      } else {
        console.log('[Auth] Logged in via saved cookies');
      }
    } else {
      await login(page, igUser, igPass);
      await saveCookies(context);
    }

    // Navigate to target profile
    console.log(`\n[Scraper] Loading @${targetUsername}...`);
    await page.goto(`https://www.instagram.com/${targetUsername}/`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
    await page.waitForTimeout(4000);

    // Extract profile info
    console.log(`[Scraper] Extracting profile data...`);

    const profileData = await page.evaluate(() => {
      const getMeta = (prop) => {
        const el = document.querySelector(`meta[property="${prop}"]`) || document.querySelector(`meta[name="${prop}"]`);
        return el ? el.getAttribute('content') : null;
      };

      const description = getMeta('og:description') || '';
      const title = getMeta('og:title') || document.title || '';

      // Parse stats from header section
      let followers = 0, following = 0, postsCount = 0;

      // Try meta description format
      const statsMatch = description.match(/([\d,.KMkm]+)\s*Followers.*?([\d,.KMkm]+)\s*Following.*?([\d,.KMkm]+)\s*Posts/i);
      const parseNum = (s) => {
        if (!s) return 0;
        s = s.replace(/,/g, '').replace(/\./g, '');
        if (s.match(/[Kk]/)) return parseFloat(s) * 1000;
        if (s.match(/[Mm]/)) return parseFloat(s) * 1000000;
        return parseInt(s) || 0;
      };

      if (statsMatch) {
        followers = parseNum(statsMatch[1]);
        following = parseNum(statsMatch[2]);
        postsCount = parseNum(statsMatch[3]);
      }

      // Also try reading from header li elements
      const headerLis = document.querySelectorAll('header li, header ul li');
      headerLis.forEach(li => {
        const text = li.textContent || '';
        if (text.match(/seguidores|followers/i)) {
          const num = text.replace(/[^\d,.KMkm]/g, '');
          if (num) followers = parseNum(num);
        }
        if (text.match(/seguindo|following/i)) {
          const num = text.replace(/[^\d,.KMkm]/g, '');
          if (num) following = parseNum(num);
        }
        if (text.match(/publica|posts/i)) {
          const num = text.replace(/[^\d,.KMkm]/g, '');
          if (num) postsCount = parseNum(num);
        }
      });

      // Bio
      const bioEl = document.querySelector('header section > div > span, header div.-vDIg span');
      const bio = bioEl ? bioEl.textContent.trim() : '';

      // Profile pic
      const picEl = document.querySelector('header img, img[alt*="profile picture"]');
      const profilePic = picEl ? picEl.src : null;

      return {
        username: window.location.pathname.replace(/\//g, ''),
        full_name: title.split('(')[0].trim().split('•')[0].trim(),
        biography: bio || description.split(' - ').pop()?.trim() || '',
        followers,
        following,
        posts_count: postsCount,
        profile_pic_url: profilePic,
        og_description: description,
      };
    });

    console.log(`[Scraper] Profile: ${profileData.full_name}`);
    console.log(`[Scraper] Followers: ${profileData.followers.toLocaleString()}`);
    console.log(`[Scraper] Posts: ${profileData.posts_count}`);

    // Download profile picture
    if (profileData.profile_pic_url) {
      try {
        await downloadFile(profileData.profile_pic_url, path.join(outputDir, 'profile_pic.jpg'));
      } catch {}
    }

    // Collect post links
    console.log(`\n[Scraper] Collecting posts...`);
    let postLinks = [];
    let scrollAttempts = 0;

    while (postLinks.length < maxPosts && scrollAttempts < 8) {
      const newLinks = await page.evaluate(() => {
        const links = [];
        document.querySelectorAll('a[href*="/p/"], a[href*="/reel/"]').forEach(a => {
          const href = a.getAttribute('href');
          if (href && !links.includes(href)) links.push(href);
        });
        return links;
      });
      postLinks = [...new Set([...postLinks, ...newLinks])];
      if (postLinks.length >= maxPosts) break;
      await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2));
      await page.waitForTimeout(2000);
      scrollAttempts++;
    }

    postLinks = postLinks.slice(0, maxPosts);
    console.log(`[Scraper] Found ${postLinks.length} posts to analyze`);

    // Visit each post
    const postsData = [];

    for (let i = 0; i < postLinks.length; i++) {
      const postUrl = `https://www.instagram.com${postLinks[i]}`;
      const shortcode = postLinks[i].split('/').filter(Boolean).pop();
      const isReel = postLinks[i].includes('/reel/');

      console.log(`\n[Scraper] Post ${i + 1}/${postLinks.length}: ${shortcode} ${isReel ? '(REEL)' : ''}`);

      try {
        await page.goto(postUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await page.waitForTimeout(3000);

        const postData = await page.evaluate(() => {
          const getMeta = (prop) => {
            const el = document.querySelector(`meta[property="${prop}"]`);
            return el ? el.getAttribute('content') : null;
          };

          // Caption — try multiple selectors
          let caption = '';
          const captionSelectors = [
            'article div[class*="Caption"] span',
            'article h1 + div span',
            'article span[dir="auto"]',
            'div[class*="Caption"] span[dir="auto"]',
            'ul li span[dir="auto"]',
          ];
          for (const sel of captionSelectors) {
            const el = document.querySelector(sel);
            if (el && el.textContent.length > 10) {
              caption = el.textContent;
              break;
            }
          }

          // Likes
          let likes = 0;
          const likesSelectors = [
            'section span[class*="likes"]',
            'a[href*="liked_by"] span',
            'button span[class*="Like"]',
          ];
          for (const sel of likesSelectors) {
            const el = document.querySelector(sel);
            if (el) {
              const text = el.textContent.replace(/[,.]/g, '').replace(/\D/g, '');
              likes = parseInt(text) || 0;
              if (likes > 0) break;
            }
          }

          // Comments count
          let comments = 0;
          const commentsEl = document.querySelector('a[href*="comments"] span, ul li span[class*="Comment"]');
          if (commentsEl) {
            comments = parseInt(commentsEl.textContent.replace(/\D/g, '')) || 0;
          }

          // Images
          const images = [];
          document.querySelectorAll('article img[src*="instagram"], div[role="presentation"] img, img[class*="x5yr21d"]').forEach(img => {
            if (img.src && img.src.includes('instagram') && !img.src.includes('profile_pic') && img.width > 200) {
              images.push(img.src);
            }
          });

          // Videos — get src from video elements
          const videos = [];
          document.querySelectorAll('video').forEach(v => {
            // Try src directly
            if (v.src && v.src.startsWith('http')) videos.push(v.src);
            // Try source elements
            v.querySelectorAll('source').forEach(s => {
              if (s.src && s.src.startsWith('http')) videos.push(s.src);
            });
          });

          // Also check for blob URLs — we'll handle these differently
          const hasBlobVideo = document.querySelector('video[src^="blob:"]') !== null;

          // View count for reels
          let viewCount = 0;
          document.querySelectorAll('span').forEach(span => {
            const t = span.textContent || '';
            if ((t.includes('view') || t.includes('visualizaç')) && !viewCount) {
              const num = t.replace(/\D/g, '');
              if (num) viewCount = parseInt(num);
            }
          });

          // Date
          const timeEl = document.querySelector('time[datetime]');
          const date = timeEl ? timeEl.getAttribute('datetime') : null;

          return {
            caption,
            likes,
            comments,
            images: [...new Set(images)],
            videos: [...new Set(videos)],
            has_blob_video: hasBlobVideo,
            view_count: viewCount,
            date,
            og_image: getMeta('og:image'),
            og_video: getMeta('og:video'),
            og_type: getMeta('og:type'),
          };
        });

        // If og:video exists (direct video URL from meta tag), use it
        if (postData.og_video && !postData.videos.includes(postData.og_video)) {
          postData.videos.unshift(postData.og_video);
        }

        const isVideo = isReel || postData.videos.length > 0 || postData.has_blob_video;
        const isCarousel = await page.$('button[aria-label*="Next"], button[aria-label*="Próximo"]') !== null;

        // Extract hashtags
        const hashtags = [];
        if (postData.caption) {
          const matches = postData.caption.match(/#[\w\u00C0-\u024F]+/g);
          if (matches) hashtags.push(...matches.map(h => h.slice(1)));
        }

        const postInfo = {
          shortcode,
          url: postUrl,
          type: isVideo ? 'video' : (isCarousel ? 'carousel' : 'image'),
          caption: postData.caption,
          hashtags,
          likes: postData.likes,
          comments: postData.comments,
          view_count: postData.view_count,
          date: postData.date,
          is_video: isVideo,
          is_reel: isReel,
          media_files: [],
        };

        // Download thumbnail/image
        const allImages = [...postData.images];
        if (postData.og_image) allImages.unshift(postData.og_image);
        for (const imgUrl of [...new Set(allImages)].slice(0, 1)) {
          const imgPath = path.join(outputDir, 'posts', `${shortcode}.jpg`);
          try {
            await downloadFile(imgUrl, imgPath);
            postInfo.media_files.push(imgPath);
            console.log(`  → Image/thumbnail saved`);
          } catch (e) {
            console.log(`  → Image download failed`);
          }
        }

        // Download video
        if (postData.videos.length > 0) {
          for (const vidUrl of postData.videos.slice(0, 1)) {
            if (vidUrl.startsWith('blob:')) continue;
            const vidPath = path.join(outputDir, 'videos', `${shortcode}.mp4`);
            try {
              await downloadFile(vidUrl, vidPath);
              const stat = fs.statSync(vidPath);
              if (stat.size > 10000) {
                postInfo.media_files.push(vidPath);
                console.log(`  → Video saved (${(stat.size / 1024 / 1024).toFixed(1)} MB)`);
              } else {
                fs.unlinkSync(vidPath);
                console.log(`  → Video too small, discarded`);
              }
            } catch (e) {
              console.log(`  → Video download failed: ${e.message}`);
            }
          }
        }

        // For reels without direct video URL, try to intercept network requests
        if (isReel && postInfo.media_files.filter(f => f.endsWith('.mp4')).length === 0) {
          console.log(`  → Attempting video capture via network interception...`);
          try {
            const videoPage = await context.newPage();
            let capturedVideoUrl = null;

            videoPage.on('response', async (response) => {
              const url = response.url();
              const contentType = response.headers()['content-type'] || '';
              if ((contentType.includes('video') || url.includes('.mp4')) && !capturedVideoUrl) {
                capturedVideoUrl = url;
              }
            });

            await videoPage.goto(postUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
            await videoPage.waitForTimeout(5000);

            // Try to play the video to trigger loading
            try {
              await videoPage.click('video', { timeout: 3000 });
              await videoPage.waitForTimeout(3000);
            } catch {}

            await videoPage.close();

            if (capturedVideoUrl) {
              const vidPath = path.join(outputDir, 'videos', `${shortcode}.mp4`);
              try {
                await downloadFile(capturedVideoUrl, vidPath);
                const stat = fs.statSync(vidPath);
                if (stat.size > 10000) {
                  postInfo.media_files.push(vidPath);
                  console.log(`  → Video captured via network (${(stat.size / 1024 / 1024).toFixed(1)} MB)`);
                } else {
                  fs.unlinkSync(vidPath);
                }
              } catch {}
            } else {
              console.log(`  → Could not capture video URL`);
            }
          } catch (e) {
            console.log(`  → Network capture failed: ${e.message}`);
          }
        }

        console.log(`  Caption: ${(postData.caption || '').substring(0, 80)}...`);
        console.log(`  Likes: ${postData.likes} | Comments: ${postData.comments} | Views: ${postData.view_count}`);

        postsData.push(postInfo);

      } catch (err) {
        console.log(`  → Error: ${err.message}`);
      }
    }

    // Metrics
    const avgLikes = postsData.length > 0
      ? Math.round(postsData.reduce((s, p) => s + p.likes, 0) / postsData.length) : 0;
    const avgComments = postsData.length > 0
      ? Math.round(postsData.reduce((s, p) => s + p.comments, 0) / postsData.length) : 0;
    const avgEngagement = profileData.followers > 0
      ? ((avgLikes + avgComments) / profileData.followers * 100).toFixed(2) : 0;

    const allHashtags = {};
    postsData.forEach(p => p.hashtags.forEach(h => { allHashtags[h] = (allHashtags[h] || 0) + 1; }));

    const report = {
      profile: { ...profileData, scraped_at: new Date().toISOString() },
      metrics: {
        avg_likes: avgLikes,
        avg_comments: avgComments,
        avg_engagement_rate: parseFloat(avgEngagement),
        total_posts_analyzed: postsData.length,
        video_count: postsData.filter(p => p.is_video).length,
        image_count: postsData.filter(p => !p.is_video && p.type !== 'carousel').length,
        carousel_count: postsData.filter(p => p.type === 'carousel').length,
        reel_count: postsData.filter(p => p.is_reel).length,
        top_hashtags: Object.entries(allHashtags).sort((a, b) => b[1] - a[1]).slice(0, 20).map(([tag, count]) => ({ tag, count })),
      },
      posts: postsData,
    };

    const reportPath = path.join(outputDir, 'instagram_data.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Save cookies for next time
    await saveCookies(context);

    console.log(`\n${'='.repeat(50)}`);
    console.log(`[Scraper] COMPLETE — @${targetUsername}`);
    console.log(`${'='.repeat(50)}`);
    console.log(`  Posts: ${postsData.length}`);
    console.log(`  Images: ${postsData.filter(p => !p.is_video).length}`);
    console.log(`  Videos/Reels: ${postsData.filter(p => p.is_video).length}`);
    console.log(`  Videos downloaded: ${postsData.filter(p => p.media_files.some(f => f.endsWith('.mp4'))).length}`);
    console.log(`  Avg likes: ${avgLikes}`);
    console.log(`  Avg engagement: ${avgEngagement}%`);
    console.log(`  Report: ${reportPath}`);

    return report;

  } catch (err) {
    console.error(`[Scraper] Fatal error: ${err.message}`);
    try {
      await page.screenshot({ path: path.join(outputDir, 'error_screenshot.png') });
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
    console.log('Usage: INSTAGRAM_USERNAME=x INSTAGRAM_PASSWORD=y node browser-scraper-auth.js <target> [output_dir] [max_posts]');
    process.exit(1);
  }

  scrapeProfileAuth(username, outputDir, maxPosts)
    .then(r => { if (!r) process.exit(1); })
    .catch(e => { console.error(e); process.exit(1); });
}

module.exports = { scrapeProfileAuth };

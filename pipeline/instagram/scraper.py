#!/usr/bin/env python3
"""
HP Odonto Instagram Profile Scraper
Scrapes public Instagram profiles using Instaloader.
Downloads posts, reels, captions, and metadata.
"""

import instaloader
import json
import os
import sys
from datetime import datetime
from pathlib import Path

def scrape_profile(username, output_dir, max_posts=12):
    """Scrape an Instagram profile and save all data."""

    # Clean username
    username = username.strip().lstrip('@')

    print(f"[Scraper] Starting scrape of @{username}")
    print(f"[Scraper] Output: {output_dir}")
    print(f"[Scraper] Max posts: {max_posts}")

    # Create output directories
    os.makedirs(output_dir, exist_ok=True)
    posts_dir = os.path.join(output_dir, 'posts')
    videos_dir = os.path.join(output_dir, 'videos')
    os.makedirs(posts_dir, exist_ok=True)
    os.makedirs(videos_dir, exist_ok=True)

    # Initialize Instaloader
    L = instaloader.Instaloader(
        download_pictures=True,
        download_videos=True,
        download_video_thumbnails=True,
        download_geotags=False,
        download_comments=False,
        save_metadata=True,
        compress_json=False,
        post_metadata_txt_pattern='',
        max_connection_attempts=3,
        request_timeout=30,
        dirname_pattern=posts_dir,
        filename_pattern='{date_utc:%Y%m%d}_{shortcode}',
    )

    try:
        # Load profile
        print(f"[Scraper] Loading profile @{username}...")
        profile = instaloader.Profile.from_username(L.context, username)

        # Extract profile data
        profile_data = {
            'username': profile.username,
            'full_name': profile.full_name,
            'biography': profile.biography,
            'followers': profile.followers,
            'following': profile.followees,
            'posts_count': profile.mediacount,
            'is_verified': profile.is_verified,
            'is_business': profile.is_business_account,
            'business_category': profile.business_category_name if profile.is_business_account else None,
            'external_url': profile.external_url,
            'profile_pic_url': str(profile.profile_pic_url),
            'scraped_at': datetime.now().isoformat(),
        }

        print(f"[Scraper] Profile loaded:")
        print(f"  Name: {profile.full_name}")
        print(f"  Bio: {profile.biography[:100]}...")
        print(f"  Followers: {profile.followers:,}")
        print(f"  Posts: {profile.mediacount}")

        # Download profile picture
        try:
            L.download_profilepic(profile)
            print(f"[Scraper] Profile pic downloaded")
        except Exception as e:
            print(f"[Scraper] Could not download profile pic: {e}")

        # Scrape recent posts
        posts_data = []
        post_count = 0

        print(f"\n[Scraper] Downloading up to {max_posts} recent posts...")

        for post in profile.get_posts():
            if post_count >= max_posts:
                break

            post_count += 1
            print(f"[Scraper] Post {post_count}/{max_posts}: {post.shortcode} ({post.typename})")

            post_info = {
                'shortcode': post.shortcode,
                'url': f"https://www.instagram.com/p/{post.shortcode}/",
                'type': post.typename,  # GraphImage, GraphVideo, GraphSidecar
                'caption': post.caption if post.caption else '',
                'hashtags': list(post.caption_hashtags) if post.caption_hashtags else [],
                'mentions': list(post.caption_mentions) if post.caption_mentions else [],
                'likes': post.likes,
                'comments': post.comments,
                'date': post.date_utc.isoformat(),
                'is_video': post.is_video,
                'video_duration': post.video_duration if post.is_video else None,
                'video_view_count': post.video_view_count if post.is_video else None,
                'engagement_rate': round((post.likes + post.comments) / max(profile.followers, 1) * 100, 2),
                'media_files': [],
            }

            # Download post media
            try:
                L.download_post(post, target=Path(posts_dir))

                # Find downloaded files
                date_prefix = post.date_utc.strftime('%Y%m%d')
                for f in os.listdir(posts_dir):
                    if post.shortcode in f:
                        filepath = os.path.join(posts_dir, f)
                        post_info['media_files'].append(filepath)

                        # Move videos to videos dir
                        if f.endswith('.mp4'):
                            video_dest = os.path.join(videos_dir, f)
                            os.rename(filepath, video_dest)
                            post_info['media_files'][-1] = video_dest
                            print(f"  → Video saved: {f}")
                        elif f.endswith(('.jpg', '.png')):
                            print(f"  → Image saved: {f}")

            except Exception as e:
                print(f"  → Download error: {e}")

            posts_data.append(post_info)

        # Calculate aggregate metrics
        if posts_data:
            avg_likes = sum(p['likes'] for p in posts_data) / len(posts_data)
            avg_comments = sum(p['comments'] for p in posts_data) / len(posts_data)
            avg_engagement = sum(p['engagement_rate'] for p in posts_data) / len(posts_data)

            video_posts = [p for p in posts_data if p['is_video']]
            image_posts = [p for p in posts_data if not p['is_video']]
            carousel_posts = [p for p in posts_data if p['type'] == 'GraphSidecar']

            all_hashtags = []
            for p in posts_data:
                all_hashtags.extend(p['hashtags'])

            hashtag_freq = {}
            for h in all_hashtags:
                hashtag_freq[h] = hashtag_freq.get(h, 0) + 1
            top_hashtags = sorted(hashtag_freq.items(), key=lambda x: -x[1])[:20]

            metrics = {
                'avg_likes': round(avg_likes),
                'avg_comments': round(avg_comments),
                'avg_engagement_rate': round(avg_engagement, 2),
                'total_posts_analyzed': len(posts_data),
                'video_count': len(video_posts),
                'image_count': len(image_posts),
                'carousel_count': len(carousel_posts),
                'top_hashtags': [{'tag': h, 'count': c} for h, c in top_hashtags],
                'posting_frequency': f"~{len(posts_data)} posts in recent period",
            }
        else:
            metrics = {}

        # Compile full report
        report = {
            'profile': profile_data,
            'metrics': metrics,
            'posts': posts_data,
        }

        # Save JSON report
        report_path = os.path.join(output_dir, 'instagram_data.json')
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2)

        print(f"\n[Scraper] Complete!")
        print(f"  Posts scraped: {len(posts_data)}")
        print(f"  Images: {len([p for p in posts_data if not p['is_video']])}")
        print(f"  Videos: {len([p for p in posts_data if p['is_video']])}")
        print(f"  Report: {report_path}")

        return report

    except instaloader.exceptions.ProfileNotExistsException:
        print(f"[Scraper] ERROR: Profile @{username} not found")
        return None
    except instaloader.exceptions.LoginRequiredException:
        print(f"[Scraper] ERROR: Login required for @{username} (private profile?)")
        return None
    except Exception as e:
        print(f"[Scraper] ERROR: {e}")
        return None


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python scraper.py <username> [output_dir] [max_posts]")
        sys.exit(1)

    username = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else f'outputs/instagram_{username}'
    max_posts = int(sys.argv[3]) if len(sys.argv) > 3 else 12

    result = scrape_profile(username, output_dir, max_posts)
    if result:
        print(f"\nDone! {len(result['posts'])} posts scraped.")
    else:
        sys.exit(1)

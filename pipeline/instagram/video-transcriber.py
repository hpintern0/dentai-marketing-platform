#!/usr/bin/env python3
"""
DentAI Video Downloader + Transcriber
Downloads Instagram reels via yt-dlp and transcribes with Whisper.
"""

import json
import os
import sys
import subprocess
import shutil

def find_ytdlp():
    """Find yt-dlp binary."""
    for path in [
        shutil.which('yt-dlp'),
        os.path.expanduser('~/Library/Python/3.9/bin/yt-dlp'),
        os.path.expanduser('~/Library/Python/3.10/bin/yt-dlp'),
        os.path.expanduser('~/Library/Python/3.11/bin/yt-dlp'),
        '/usr/local/bin/yt-dlp',
    ]:
        if path and os.path.exists(path):
            return path
    return None


def download_videos(data_path, output_dir=None):
    """Download all reel videos from scraped data."""
    with open(data_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    if output_dir is None:
        output_dir = os.path.dirname(data_path)

    videos_dir = os.path.join(output_dir, 'videos')
    os.makedirs(videos_dir, exist_ok=True)

    ytdlp = find_ytdlp()
    if not ytdlp:
        print("[Video] yt-dlp not found! Install with: pip install yt-dlp")
        return []

    reels = [p for p in data['posts'] if p.get('is_video') or p.get('is_reel')]
    print(f"[Video] Found {len(reels)} reels to download")

    downloaded = []

    for i, post in enumerate(reels):
        shortcode = post['shortcode']
        url = post['url']
        output_path = os.path.join(videos_dir, f"{shortcode}.mp4")

        # Skip if already downloaded
        if os.path.exists(output_path) and os.path.getsize(output_path) > 10000:
            print(f"[Video] {i+1}/{len(reels)}: {shortcode} — already downloaded")
            downloaded.append({'shortcode': shortcode, 'path': output_path, 'url': url})
            continue

        print(f"[Video] {i+1}/{len(reels)}: Downloading {shortcode}...")

        try:
            result = subprocess.run([
                ytdlp,
                '-o', output_path,
                '--no-overwrites',
                '--quiet',
                '--no-warnings',
                url,
            ], capture_output=True, text=True, timeout=60)

            if os.path.exists(output_path) and os.path.getsize(output_path) > 10000:
                size_mb = os.path.getsize(output_path) / 1024 / 1024
                print(f"  → Downloaded ({size_mb:.1f} MB)")
                downloaded.append({'shortcode': shortcode, 'path': output_path, 'url': url})
            else:
                print(f"  → Failed: {result.stderr[:100] if result.stderr else 'Unknown error'}")
        except subprocess.TimeoutExpired:
            print(f"  → Timeout")
        except Exception as e:
            print(f"  → Error: {e}")

    print(f"\n[Video] Downloaded {len(downloaded)}/{len(reels)} videos")
    return downloaded


def transcribe_videos(videos, output_dir):
    """Transcribe all downloaded videos with Whisper."""
    try:
        import whisper
    except ImportError:
        print("[Transcribe] Whisper not installed! Install with: pip install openai-whisper")
        return []

    print(f"\n[Transcribe] Loading Whisper model (base)...")
    model = whisper.load_model("base")

    transcriptions = []

    for i, video in enumerate(videos):
        shortcode = video['shortcode']
        video_path = video['path']
        print(f"\n[Transcribe] {i+1}/{len(videos)}: {shortcode}")

        # Extract audio
        audio_path = video_path.replace('.mp4', '.wav')
        try:
            subprocess.run([
                'ffmpeg', '-i', video_path,
                '-vn', '-acodec', 'pcm_s16le', '-ar', '16000', '-ac', '1',
                audio_path, '-y', '-loglevel', 'quiet'
            ], check=True, timeout=30)
        except Exception as e:
            print(f"  → Audio extraction failed: {e}")
            continue

        # Transcribe
        try:
            result = model.transcribe(audio_path, language="pt")
            text = result.get('text', '').strip()

            # Cleanup audio
            os.remove(audio_path)

            if text and len(text) > 5:
                print(f"  → Transcribed ({len(text)} chars)")
                print(f"  → \"{text[:150]}...\"")

                # Save individual transcription
                txt_path = os.path.join(output_dir, 'videos', f"{shortcode}_transcription.txt")
                with open(txt_path, 'w', encoding='utf-8') as f:
                    f.write(text)

                transcriptions.append({
                    'shortcode': shortcode,
                    'url': video.get('url', ''),
                    'text': text,
                    'word_count': len(text.split()),
                    'char_count': len(text),
                })
            else:
                print(f"  → No speech detected")
        except Exception as e:
            print(f"  → Transcription error: {e}")
            if os.path.exists(audio_path):
                os.remove(audio_path)

    # Save all transcriptions
    if transcriptions:
        trans_path = os.path.join(output_dir, 'transcriptions.json')
        with open(trans_path, 'w', encoding='utf-8') as f:
            json.dump(transcriptions, f, ensure_ascii=False, indent=2)
        print(f"\n[Transcribe] Saved {len(transcriptions)} transcriptions to {trans_path}")

    return transcriptions


def main():
    if len(sys.argv) < 2:
        print("Usage: python video-transcriber.py <instagram_data.json> [output_dir]")
        sys.exit(1)

    data_path = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else os.path.dirname(data_path)

    # Step 1: Download
    videos = download_videos(data_path, output_dir)

    if not videos:
        print("No videos to transcribe")
        sys.exit(0)

    # Step 2: Transcribe
    transcriptions = transcribe_videos(videos, output_dir)

    # Summary
    print(f"\n{'='*50}")
    print(f"  VIDEO ANALYSIS COMPLETE")
    print(f"{'='*50}")
    print(f"  Videos downloaded: {len(videos)}")
    print(f"  Transcriptions: {len(transcriptions)}")
    for t in transcriptions:
        print(f"\n  [{t['shortcode']}] ({t['word_count']} words)")
        print(f"  \"{t['text'][:200]}\"")
    print(f"\n{'='*50}")


if __name__ == '__main__':
    main()

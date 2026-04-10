#!/usr/bin/env python3
"""
DentAI Instagram Intelligence Pipeline
Scrape + Analyze in one command.

Usage:
  python run.py @dra.claudiadiniz
  python run.py @dra.claudiadiniz --max-posts 6
"""

import sys
import os
import argparse

# Add parent to path
sys.path.insert(0, os.path.dirname(__file__))

from scraper import scrape_profile
from analyzer import analyze_profile


def main():
    parser = argparse.ArgumentParser(description='DentAI Instagram Intelligence')
    parser.add_argument('username', help='Instagram username (with or without @)')
    parser.add_argument('--max-posts', type=int, default=12, help='Max posts to scrape (default: 12)')
    parser.add_argument('--output', help='Output directory')
    parser.add_argument('--skip-scrape', action='store_true', help='Skip scraping, only analyze existing data')
    args = parser.parse_args()

    username = args.username.strip().lstrip('@')
    output_dir = args.output or os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
        'outputs', f'instagram_{username}'
    )

    print(f"{'='*60}")
    print(f"  DentAI Instagram Intelligence")
    print(f"  Profile: @{username}")
    print(f"  Output: {output_dir}")
    print(f"{'='*60}\n")

    # Step 1: Scrape
    if not args.skip_scrape:
        print("STEP 1: Scraping Instagram profile...\n")
        result = scrape_profile(username, output_dir, args.max_posts)
        if not result:
            print("Scraping failed!")
            sys.exit(1)
    else:
        print("STEP 1: Skipping scrape (using existing data)\n")

    # Step 2: Analyze
    data_path = os.path.join(output_dir, 'instagram_data.json')
    if not os.path.exists(data_path):
        print(f"No data file found at {data_path}")
        sys.exit(1)

    print("\nSTEP 2: Analyzing with Claude AI...\n")
    report = analyze_profile(data_path, output_dir)

    if report and 'intelligence' in report:
        intel = report['intelligence']
        print(f"\n{'='*60}")
        print(f"  INTELLIGENCE REPORT: @{username}")
        print(f"{'='*60}")
        print(f"\n  {intel.get('profile_summary', 'N/A')}")
        print(f"\n  Tom: {intel.get('tone_of_voice', 'N/A')}")
        print(f"  Audiência: {intel.get('target_audience', 'N/A')}")
        print(f"  Formatos: {', '.join(intel.get('top_formats', []))}")
        print(f"  Temas: {', '.join(intel.get('recurring_themes', []))}")
        print(f"\n  Pontos fortes:")
        for s in intel.get('strengths', []):
            print(f"    + {s}")
        print(f"\n  Oportunidades:")
        for o in intel.get('opportunities', []):
            print(f"    → {o}")
        print(f"\n  Output completo: {output_dir}")
        print(f"{'='*60}")
    else:
        print("Analysis failed!")
        sys.exit(1)


if __name__ == '__main__':
    main()

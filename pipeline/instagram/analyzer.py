#!/usr/bin/env python3
"""
HP Odonto Instagram Profile Analyzer
Uses Claude Vision to analyze images and Whisper to transcribe videos.
Generates comprehensive profile intelligence.
"""

import json
import os
import sys
import base64
import subprocess
from pathlib import Path

# Anthropic SDK
try:
    import anthropic
except ImportError:
    print("[Analyzer] Installing anthropic SDK...")
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'anthropic', '-q'])
    import anthropic


def get_claude():
    """Get Anthropic client."""
    api_key = os.environ.get('ANTHROPIC_API_KEY')
    if not api_key:
        raise ValueError("ANTHROPIC_API_KEY not set")
    return anthropic.Anthropic(api_key=api_key)


def encode_image(image_path):
    """Encode image to base64 for Claude Vision."""
    with open(image_path, 'rb') as f:
        data = base64.standard_b64encode(f.read()).decode('utf-8')

    ext = Path(image_path).suffix.lower()
    media_types = {'.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp'}
    media_type = media_types.get(ext, 'image/jpeg')

    return data, media_type


def transcribe_video(video_path):
    """Transcribe video audio using Whisper."""
    try:
        import whisper
    except ImportError:
        print(f"[Analyzer] Whisper not available, skipping transcription of {video_path}")
        return None

    print(f"[Analyzer] Transcribing: {os.path.basename(video_path)}")

    # Extract audio from video
    audio_path = video_path.replace('.mp4', '.wav')
    try:
        subprocess.run([
            'ffmpeg', '-i', video_path, '-vn', '-acodec', 'pcm_s16le',
            '-ar', '16000', '-ac', '1', audio_path, '-y', '-loglevel', 'quiet'
        ], check=True, timeout=60)
    except (subprocess.CalledProcessError, FileNotFoundError) as e:
        print(f"[Analyzer] FFmpeg error: {e}")
        return None

    # Transcribe with Whisper
    try:
        model = whisper.load_model("base")
        result = model.transcribe(audio_path, language="pt")
        text = result.get('text', '').strip()

        # Cleanup
        if os.path.exists(audio_path):
            os.remove(audio_path)

        if text:
            print(f"[Analyzer] Transcribed ({len(text)} chars): {text[:100]}...")
            return text
        else:
            print(f"[Analyzer] No speech detected")
            return None
    except Exception as e:
        print(f"[Analyzer] Whisper error: {e}")
        if os.path.exists(audio_path):
            os.remove(audio_path)
        return None


def analyze_image_with_claude(client, image_path, caption=''):
    """Analyze a single image with Claude Vision."""
    try:
        data, media_type = encode_image(image_path)
    except Exception as e:
        print(f"[Analyzer] Could not read image {image_path}: {e}")
        return None

    prompt = f"""Analise esta imagem de um post de Instagram de um perfil odontológico.

{"Caption do post: " + caption[:500] if caption else "Sem caption."}

Responda em JSON com esta estrutura:
{{
  "visual_description": "descrição breve do que aparece na imagem",
  "content_type": "antes_depois | procedimento | educativo | lifestyle | equipe | consultorio | depoimento | humor | outro",
  "visual_style": "clean | colorido | escuro | minimalista | editorial | clinico",
  "has_text_overlay": true/false,
  "text_overlay_content": "texto que aparece na imagem, se houver",
  "colors_dominant": ["cor1", "cor2"],
  "quality_score": 1-10,
  "marketing_approach": "breve análise da abordagem de marketing",
  "emotional_appeal": "qual emoção/gatilho o post usa"
}}"""

    try:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            messages=[{
                "role": "user",
                "content": [
                    {"type": "image", "source": {"type": "base64", "media_type": media_type, "data": data}},
                    {"type": "text", "text": prompt}
                ]
            }]
        )
        text = response.content[0].text.strip()
        if text.startswith('```'):
            text = text.replace('```json\n', '').replace('```\n', '').replace('```', '')
        return json.loads(text)
    except Exception as e:
        print(f"[Analyzer] Claude Vision error: {e}")
        return None


def analyze_profile(data_path, output_dir=None):
    """Full profile analysis: images + videos + captions."""

    with open(data_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    profile = data['profile']
    posts = data['posts']
    metrics = data.get('metrics', {})

    if output_dir is None:
        output_dir = os.path.dirname(data_path)

    print(f"\n[Analyzer] Analyzing @{profile['username']}")
    print(f"[Analyzer] Posts to analyze: {len(posts)}")

    client = get_claude()

    # Analyze each post
    analyzed_posts = []
    all_captions = []
    all_transcriptions = []
    video_analyses = []

    for i, post in enumerate(posts):
        print(f"\n[Analyzer] Post {i+1}/{len(posts)}: {post['shortcode']} ({post['type']})")

        post_analysis = {
            'shortcode': post['shortcode'],
            'type': post['type'],
            'caption': post['caption'][:500] if post['caption'] else '',
            'likes': post.get('likes', 0),
            'comments': post.get('comments', 0),
            'engagement_rate': post.get('engagement_rate', 0),
            'date': post['date'],
            'hashtags': post['hashtags'],
        }

        if post['caption']:
            all_captions.append(post['caption'])

        # Analyze images
        image_files = [f for f in post.get('media_files', []) if f.endswith(('.jpg', '.png', '.jpeg'))]
        if image_files:
            img = image_files[0]  # Analyze first image
            print(f"  Analyzing image: {os.path.basename(img)}")
            visual = analyze_image_with_claude(client, img, post['caption'])
            if visual:
                post_analysis['visual_analysis'] = visual

        # Transcribe videos
        video_files = [f for f in post.get('media_files', []) if f.endswith('.mp4')]
        if video_files:
            for vid in video_files:
                transcription = transcribe_video(vid)
                if transcription:
                    post_analysis['transcription'] = transcription
                    all_transcriptions.append({
                        'shortcode': post['shortcode'],
                        'text': transcription,
                        'duration': post.get('video_duration'),
                        'views': post.get('video_view_count'),
                    })

        analyzed_posts.append(post_analysis)

    # Generate comprehensive intelligence report with Claude
    print(f"\n[Analyzer] Generating intelligence report...")

    captions_text = "\n---\n".join(all_captions[:10])
    transcriptions_text = "\n---\n".join([t['text'] for t in all_transcriptions[:5]])

    visual_summaries = []
    for p in analyzed_posts:
        if 'visual_analysis' in p:
            v = p['visual_analysis']
            visual_summaries.append(f"- {v.get('content_type', 'N/A')}: {v.get('visual_description', 'N/A')} (estilo: {v.get('visual_style', 'N/A')}, marketing: {v.get('marketing_approach', 'N/A')})")

    intelligence_prompt = f"""Analise os dados abaixo de um perfil odontológico no Instagram e gere um relatório de inteligência competitiva COMPLETO.

PERFIL:
- Username: @{profile['username']}
- Nome: {profile['full_name']}
- Bio: {profile['biography']}
- Seguidores: {profile['followers']:,}
- Posts: {profile['posts_count']}
- Categoria: {profile.get('business_category', 'N/A')}
- URL: {profile.get('external_url', 'N/A')}

MÉTRICAS:
- Média de likes: {metrics.get('avg_likes', 'N/A')}
- Média de comentários: {metrics.get('avg_comments', 'N/A')}
- Taxa de engajamento média: {metrics.get('avg_engagement_rate', 'N/A')}%
- Posts analisados: {metrics.get('total_posts_analyzed', 0)}
- Vídeos: {metrics.get('video_count', 0)} | Imagens: {metrics.get('image_count', 0)} | Carrosséis: {metrics.get('carousel_count', 0)}
- Top hashtags: {json.dumps(metrics.get('top_hashtags', [])[:10])}

ANÁLISE VISUAL DOS POSTS:
{chr(10).join(visual_summaries[:10])}

CAPTIONS RECENTES (últimos posts):
{captions_text[:3000]}

TRANSCRIÇÕES DE VÍDEOS:
{transcriptions_text[:3000] if transcriptions_text else 'Nenhuma transcrição disponível'}

Gere um JSON com esta estrutura:
{{
  "profile_summary": "resumo de 2-3 frases sobre o posicionamento do perfil",
  "specialty_focus": "especialidade principal do perfil",
  "target_audience": "público-alvo identificado",
  "tone_of_voice": "tom de voz predominante (formal/informal/educativo/aspiracional/etc)",
  "content_strategy": {{
    "primary_content_types": ["tipo1", "tipo2"],
    "posting_frequency": "estimativa de frequência",
    "best_performing_format": "formato com mais engajamento",
    "content_pillars": ["pilar1", "pilar2", "pilar3"]
  }},
  "visual_identity": {{
    "dominant_colors": ["cor1", "cor2"],
    "style": "descrição do estilo visual",
    "quality_level": "alta/média/baixa",
    "consistency": "alta/média/baixa"
  }},
  "top_formats": ["formato1", "formato2", "formato3"],
  "recurring_themes": ["tema1", "tema2", "tema3"],
  "high_performance_hooks": ["hook1", "hook2", "hook3"],
  "predominant_tone": "descrição detalhada do tom",
  "posting_frequency": "frequência identificada",
  "hashtag_usage": ["hashtag1", "hashtag2"],
  "cta_patterns": ["cta1", "cta2"],
  "qualitative_notes": "observações qualitativas importantes",
  "video_strategy": {{
    "topics_covered": ["tópico1", "tópico2"],
    "average_duration": "duração estimada",
    "presentation_style": "como a pessoa se apresenta nos vídeos",
    "hooks_used": ["hook de abertura 1", "hook 2"],
    "cta_in_videos": "como faz CTA nos vídeos"
  }},
  "strengths": ["ponto forte 1", "ponto forte 2", "ponto forte 3"],
  "weaknesses": ["ponto fraco 1", "ponto fraco 2"],
  "opportunities": ["oportunidade 1", "oportunidade 2"],
  "recommendations": ["recomendação 1 para o nosso cliente", "recomendação 2"]
}}"""

    try:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=4096,
            messages=[{"role": "user", "content": intelligence_prompt}]
        )
        text = response.content[0].text.strip()
        if text.startswith('```'):
            text = text.replace('```json\n', '').replace('```\n', '').replace('```', '')
        intelligence = json.loads(text)
    except Exception as e:
        print(f"[Analyzer] Intelligence generation error: {e}")
        intelligence = {"error": str(e)}

    # Compile final report
    report = {
        'profile': profile,
        'metrics': metrics,
        'intelligence': intelligence,
        'analyzed_posts': analyzed_posts,
        'transcriptions': all_transcriptions,
        'analyzed_at': __import__('datetime').datetime.now().isoformat(),
    }

    # Save reports
    report_path = os.path.join(output_dir, 'profile_intelligence.json')
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    # Save insights in Supabase-compatible format
    insights = intelligence if isinstance(intelligence, dict) else {}
    insights_path = os.path.join(output_dir, 'insights.json')
    with open(insights_path, 'w', encoding='utf-8') as f:
        json.dump(insights, f, ensure_ascii=False, indent=2)

    print(f"\n[Analyzer] Intelligence report saved: {report_path}")
    print(f"[Analyzer] Insights saved: {insights_path}")

    return report


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python analyzer.py <instagram_data.json> [output_dir]")
        sys.exit(1)

    data_path = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else None

    report = analyze_profile(data_path, output_dir)
    if report and 'intelligence' in report:
        intel = report['intelligence']
        print(f"\n{'='*60}")
        print(f"INTELIGÊNCIA: @{report['profile']['username']}")
        print(f"{'='*60}")
        print(f"Resumo: {intel.get('profile_summary', 'N/A')}")
        print(f"Tom: {intel.get('tone_of_voice', 'N/A')}")
        print(f"Formatos top: {', '.join(intel.get('top_formats', []))}")
        print(f"Temas: {', '.join(intel.get('recurring_themes', []))}")
        print(f"Pontos fortes: {', '.join(intel.get('strengths', []))}")

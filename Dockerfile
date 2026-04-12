FROM node:20-slim

# Install system dependencies (ffmpeg, Python, pip, Chromium deps)
RUN apt-get update && apt-get install -y \
  libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 \
  libxkbcommon0 libxcomposite1 libxdamage1 libxrandr2 libgbm1 \
  libpango-1.0-0 libcairo2 libasound2 libxshmfence1 \
  fonts-noto-color-emoji fonts-liberation ffmpeg \
  python3 python3-pip python3-venv \
  && rm -rf /var/lib/apt/lists/*

# Install Python packages
RUN pip3 install --break-system-packages yt-dlp anthropic openai-whisper 2>/dev/null || \
    pip3 install yt-dlp anthropic openai-whisper

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --production=false

# Install Playwright Chromium (reliable, correct version)
RUN npx playwright install chromium --with-deps

COPY . .

# Cache bust
ARG CACHEBUST=4

# Supabase values baked at build time
ENV NEXT_PUBLIC_SUPABASE_URL=https://zmtjlpcgfaczbrqwhejk.supabase.co
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptdGpscGNnZmFjemJycXdoZWprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MjAxNjUsImV4cCI6MjA5MTM5NjE2NX0.fmr8gu6ywI98jkB9fIBla4ApQ48Mh8W2fgzfw53Lef8
ENV NEXT_PUBLIC_APP_URL=https://dentai-marketing-platform-production.up.railway.app

RUN npm run build

EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]

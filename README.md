# DentAI Marketing Platform

<!-- Badges -->
![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18-green)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

> Plataforma completa de automacao de marketing com IA para agencias odontologicas. Gera conteudo para Instagram, YouTube e Threads com conhecimento especializado em odontologia e conformidade com as normas do CFO.

<!-- Screenshot -->
<!-- ![Dashboard Screenshot](docs/screenshots/dashboard.png) -->

---

## Indice

- [Funcionalidades](#funcionalidades)
- [Arquitetura](#arquitetura)
- [Pre-requisitos](#pre-requisitos)
- [Inicio Rapido](#inicio-rapido)
- [Configuracao com Docker](#configuracao-com-docker)
- [Deploy no Railway](#deploy-no-railway)
- [Pipeline de Conteudo](#pipeline-de-conteudo)
- [Paginas do Frontend](#paginas-do-frontend)
- [Sistema de Agentes](#sistema-de-agentes)
- [Base de Conhecimento](#base-de-conhecimento)
- [Contribuindo](#contribuindo)
- [Licenca](#licenca)

---

## Funcionalidades

- **Geracao de conteudo com IA** — Textos, legendas e roteiros gerados pelo Claude (claude-sonnet-4-20250514) com conhecimento odontologico especializado
- **Pesquisa de mercado automatizada** — Analise de concorrentes e tendencias via Tavily AI
- **Criacao de imagens** — Renderizacao HTML para PNG via Playwright com templates personalizaveis
- **Producao de video** — Composicoes Remotion para Reels e YouTube Shorts
- **Pipeline de producao completo** — Pesquisa, criacao, revisao (ate 3 rodadas), aprovacao humana e distribuicao
- **Chat com IA** — Interface de chat para briefings e ajustes em tempo real via Socket.IO
- **Conformidade CFO** — Validacao automatica contra regras do Conselho Federal de Odontologia
- **Agendamento de posts** — Calendario integrado com publicacao automatica
- **Dashboard analitico** — Metricas de campanhas, engajamento e desempenho
- **Multi-cliente** — Gerenciamento de multiplas clinicas e dentistas

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 14)                 │
│              App Router + Tailwind + TypeScript          │
├──────────┬──────────┬───────────┬───────────────────────┤
│Dashboard │Campanhas │   Chat    │    Agendamento        │
└────┬─────┴────┬─────┴─────┬─────┴───────────┬───────────┘
     │          │           │                 │
     ▼          ▼           ▼                 ▼
┌─────────────────────────────────────────────────────────┐
│              API Routes + Socket.IO Server               │
├─────────────────────────────────────────────────────────┤
│                    BullMQ Job Queue                      │
│                   (Upstash Redis)                        │
├──────────┬──────────┬───────────┬───────────────────────┤
│ Pesquisa │Criacao   │  Revisao  │   Distribuicao        │
│  Agent   │ Agents   │  Agent    │     Agent             │
└────┬─────┴────┬─────┴─────┬─────┴───────────┬───────────┘
     │          │           │                 │
     ▼          ▼           ▼                 ▼
┌──────────┐ ┌──────────┐ ┌─────────┐ ┌──────────────────┐
│ Tavily   │ │ Claude   │ │Playwright│ │  Instagram API   │
│ API      │ │ API      │ │ Remotion │ │  YouTube API     │
└──────────┘ └──────────┘ └─────────┘ └──────────────────┘
                    │
                    ▼
          ┌──────────────────┐
          │     Supabase     │
          │ PostgreSQL + S3  │
          └──────────────────┘
```

---

## Pre-requisitos

- **Node.js** 18 ou superior
- **npm** 9 ou superior
- **Conta Supabase** — banco de dados e storage ([supabase.com](https://supabase.com))
- **Conta Upstash** — Redis para filas BullMQ ([upstash.com](https://upstash.com))
- **Chave Anthropic** — API do Claude ([console.anthropic.com](https://console.anthropic.com))
- **Chave Tavily** — pesquisa de mercado ([tavily.com](https://tavily.com))
- **Docker** (opcional) — para execucao containerizada

---

## Inicio Rapido

### 1. Clone o repositorio

```bash
git clone https://github.com/seu-usuario/dentai-marketing-platform.git
cd dentai-marketing-platform
```

### 2. Execute o script de setup

```bash
chmod +x setup.sh
./setup.sh
```

O script ira instalar dependencias, criar arquivos de ambiente e configurar o projeto.

### 3. Configure as variaveis de ambiente

```bash
cp .env.local.example .env.local
```

Edite `.env.local` com suas credenciais:

```bash
# Obrigatorias
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
UPSTASH_REDIS_URL=rediss://default:seu-token@seu-endpoint.upstash.io:6379
ANTHROPIC_API_KEY=sk-ant-sua-chave
TAVILY_API_KEY=tvly-sua-chave
```

### 4. Execute as migracoes do banco

```bash
# Via Supabase CLI
npx supabase db push

# Ou execute manualmente o SQL em:
# supabase/migrations/001_create_tables.sql
```

### 5. Popule dados iniciais (opcional)

```bash
# Seed com dados de exemplo
npx supabase db seed
```

### 6. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

### 7. Inicie o worker da pipeline (em outro terminal)

```bash
npm run pipeline:worker
```

---

## Configuracao com Docker

### Docker Compose

```bash
docker-compose up -d
```

Isso ira iniciar:
- Aplicacao Next.js na porta 3000
- Worker BullMQ
- Redis local (desenvolvimento)

### Build manual

```bash
docker build -t dentai-platform .
docker run -p 3000:3000 --env-file .env.local dentai-platform
```

---

## Deploy no Railway

### 1. Conecte o repositorio

1. Acesse [railway.app](https://railway.app) e crie um novo projeto
2. Conecte seu repositorio GitHub
3. Railway detectara automaticamente o Dockerfile

### 2. Configure as variaveis de ambiente

No painel do Railway, adicione todas as variaveis listadas em `.env.local.example`.

### 3. Deploy

O deploy sera automatico a cada push na branch `main`. Para deploy manual:

```bash
# Instale o Railway CLI
npm i -g @railway/cli

# Login e deploy
railway login
railway up
```

### 4. Dominio personalizado

Configure seu dominio nas configuracoes do projeto no Railway.

---

## Pipeline de Conteudo

### Fluxo de Execucao

```
Pesquisa → Criacao (paralelo) → Revisao (ate 3 rodadas) → Aprovacao Humana → Distribuicao
```

### Executar pipeline de demonstracao

```bash
npm run pipeline:run
```

### Executar com payload personalizado

```bash
node pipeline/orchestrator.js --payload '{
  "clientId": "uuid-do-cliente",
  "campaignType": "instagram_carousel",
  "topic": "clareamento dental",
  "platforms": ["instagram", "threads"]
}'
```

### Etapas da Pipeline

| Etapa | Agente | Descricao |
|-------|--------|-----------|
| 1. Pesquisa | `ai-research` | Analisa mercado, concorrentes e tendencias |
| 2. Copy | `ai-copywriter` | Gera textos e legendas |
| 3. Visual | `ai-designer` | Cria layouts e renderiza imagens |
| 4. Video | `ai-video` | Produz composicoes Remotion |
| 5. Revisao | `ai-reviewer` | Valida conformidade CFO e qualidade |
| 6. Distribuicao | `ai-distributor` | Publica nas plataformas |

---

## Paginas do Frontend

| Rota | Descricao |
|------|-----------|
| `/` | Dashboard principal com metricas e campanhas recentes |
| `/campaigns` | Lista de campanhas com filtros e busca |
| `/campaigns/new` | Criacao de nova campanha via chat com IA |
| `/campaigns/[id]` | Detalhes da campanha, pecas e aprovacao |
| `/calendar` | Calendario de agendamento de posts |
| `/clients` | Gerenciamento de clinicas e perfis |
| `/settings` | Configuracoes da plataforma |

<!-- Screenshots -->
<!-- ![Campaigns Page](docs/screenshots/campaigns.png) -->
<!-- ![Calendar Page](docs/screenshots/calendar.png) -->

---

## Sistema de Agentes

Cada agente da pipeline possui um arquivo `SKILL.md` em `skills/` que define suas instrucoes, restricoes e formato de saida. Os agentes utilizam o Claude API para gerar conteudo especializado.

### Agentes disponiveis

- **ai-research** — Pesquisa de mercado e analise de concorrentes via Tavily
- **ai-copywriter** — Geracao de textos, legendas e hashtags
- **ai-designer** — Criacao de layouts visuais e briefings de design
- **ai-video** — Roteiros e composicoes para video
- **ai-reviewer** — Revisao de conformidade CFO e controle de qualidade
- **ai-distributor** — Publicacao e agendamento nas plataformas

### Adicionar novo agente

1. Crie o arquivo do agente em `pipeline/agents/ai-novo-agente.js`
2. Crie as instrucoes em `skills/novo-agente.SKILL.md`
3. Registre no orquestrador em `pipeline/orchestrator.js`
4. Adicione ao grafo de dependencias

---

## Base de Conhecimento

O diretorio `knowledge/` contem informacoes especializadas que alimentam os agentes:

- **Procedimentos odontologicos** — Descricoes tecnicas e termos corretos
- **Regulamentacao CFO** — Regras de publicidade odontologica
- **Termos proibidos** — Lista de expressoes que nao podem ser usadas
- **Templates de conteudo** — Modelos aprovados para diferentes plataformas
- **Boas praticas** — Diretrizes de engajamento e tom de voz

---

## Contribuindo

Contribuicoes sao bem-vindas! Siga os passos abaixo:

1. Faca um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/minha-feature`)
3. Faca commit das alteracoes (`git commit -m 'Adiciona minha feature'`)
4. Faca push para a branch (`git push origin feature/minha-feature`)
5. Abra um Pull Request

### Diretrizes

- Siga o padrao de codigo existente (TypeScript no frontend, CommonJS na pipeline)
- Adicione testes para novas funcionalidades
- Mantenha a documentacao atualizada
- Todo conteudo gerado deve respeitar as normas do CFO
- Commits em portugues ou ingles sao aceitos

---

## Licenca

Este projeto esta licenciado sob a licenca MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<p align="center">
  Feito com IA para a odontologia brasileira
</p>

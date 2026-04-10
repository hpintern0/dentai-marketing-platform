# HP Odonto Marketing Platform - Supabase Database Setup

## Prerequisites

- [Supabase CLI](https://supabase.com/docs/guides/cli/getting-started) installed
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) running (for local development)
- Or a Supabase project at [supabase.com](https://supabase.com)

## Local Development Setup

### 1. Start Supabase locally

```bash
supabase start
```

This will start all Supabase services (Postgres, Auth, Storage, Studio) locally using Docker.

### 2. Run migrations

Migrations run automatically when you start Supabase. To run them manually:

```bash
supabase db reset
```

This drops the database, recreates it, and runs all migration files in order:

- `001_create_tables.sql` - Creates all tables, indexes, triggers, and RLS policies
- `002_seed_data.sql` - Inserts 3 example dental clinics, 5 reference profiles, and 1 sample campaign
- `003_storage_buckets.sql` - Creates storage buckets for media assets

### 3. Access the local dashboard

After `supabase start`, open Supabase Studio at:

```
http://127.0.0.1:54323
```

## Production Deployment

### 1. Link to your Supabase project

```bash
supabase link --project-ref <your-project-ref>
```

### 2. Push migrations to production

```bash
supabase db push
```

### 3. Set environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

## Schema Overview

| Table | Description |
|---|---|
| `clients` | Dental clinics/professionals with branding config |
| `reference_profiles` | Instagram benchmark profiles for analysis |
| `campaigns` | Marketing campaigns with brief and pipeline status |
| `campaign_pieces` | Individual content pieces (ads, carousels, captions) |
| `scheduled_posts` | Posts scheduled for publishing |
| `chat_messages` | Chat-based brief conversation history |
| `pipeline_jobs` | Individual agent job tracking |
| `media_assets` | Uploaded files metadata |

## Storage Buckets

| Bucket | Purpose | Max Size |
|---|---|---|
| `dental-campaigns` | Generated campaign content | 50MB |
| `client-assets` | Client logos, photos, assets | 20MB |

## Useful Commands

```bash
# Check migration status
supabase migration list

# Create a new migration
supabase migration new <migration_name>

# Generate TypeScript types from schema
supabase gen types typescript --local > src/types/database.ts

# View local database logs
supabase db logs
```

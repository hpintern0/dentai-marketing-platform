'use client';
import { useState, useEffect, useCallback } from 'react';

interface ScheduledPost {
  id: string;
  campaign_id: string;
  client_id: string;
  platform: string;
  scheduled_at: string;
  media_urls: string[];
  caption: string;
  status: string;
  campaigns?: { name: string };
  clients?: { name: string };
}

export function useScheduledPosts(month: number, year: number, clientId?: string) {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('month', String(month));
      params.set('year', String(year));
      if (clientId) params.set('client_id', clientId);

      const res = await fetch(`/api/scheduled-posts?${params}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (err) {
      console.error('Failed to fetch scheduled posts', err);
    } finally {
      setLoading(false);
    }
  }, [month, year, clientId]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  return { posts, loading, refetch: fetchPosts };
}

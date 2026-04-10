'use client';
import { useState, useEffect, useCallback } from 'react';

interface Campaign {
  id: string;
  client_id: string;
  name: string;
  status: string;
  created_at: string;
  clients?: { name: string };
}

export function useCampaigns(clientId?: string) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const params = clientId ? `?client_id=${clientId}` : '';
      const res = await fetch(`/api/campaigns${params}`);
      const data = await res.json();
      setCampaigns(data);
    } catch (err) {
      console.error('Failed to fetch campaigns', err);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  return { campaigns, loading, refetch: fetchCampaigns };
}

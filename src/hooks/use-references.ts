'use client';
import { useState, useEffect, useCallback } from 'react';

interface ReferenceProfile {
  id: string;
  instagram_handle: string;
  specialty: string;
  category: string;
  notes?: string;
  client_id?: string;
  analysis_status: string;
  last_analyzed_at?: string;
  insights?: any;
  clients?: { id: string; name: string };
}

export function useReferences(filters?: { specialty?: string; category?: string; client_id?: string }) {
  const [references, setReferences] = useState<ReferenceProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReferences = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters?.specialty && filters.specialty !== 'Todas') params.set('specialty', filters.specialty);
      if (filters?.category && filters.category !== 'Todas') params.set('category', filters.category);
      if (filters?.client_id) params.set('client_id', filters.client_id);

      const res = await fetch(`/api/references?${params}`);
      const data = await res.json();
      setReferences(data);
    } catch (err) {
      console.error('Failed to fetch references', err);
    } finally {
      setLoading(false);
    }
  }, [filters?.specialty, filters?.category, filters?.client_id]);

  useEffect(() => { fetchReferences(); }, [fetchReferences]);

  const addReference = async (profile: any) => {
    const res = await fetch('/api/references', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    if (res.ok) await fetchReferences();
    return res;
  };

  const analyzeReference = async (id: string) => {
    const res = await fetch(`/api/references/${id}/analyze`, { method: 'POST' });
    if (res.ok) await fetchReferences();
    return res;
  };

  return { references, loading, refetch: fetchReferences, addReference, analyzeReference };
}

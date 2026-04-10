'use client';
import { useState, useEffect } from 'react';

interface Client {
  id: string;
  name: string;
  specialty: string;
  city: string;
  state: string;
  instagram_handle: string;
  cro_number: string;
  tone: string;
  color_palette: any;
  typography: any;
  active_platforms: string[];
  default_ctas: string[];
}

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = async (search?: string) => {
    setLoading(true);
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : '';
      const res = await fetch(`/api/clients${params}`);
      if (!res.ok) throw new Error('Failed to fetch clients');
      const data = await res.json();
      setClients(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClients(); }, []);

  return { clients, loading, error, refetch: fetchClients };
}

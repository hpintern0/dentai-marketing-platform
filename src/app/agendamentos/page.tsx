'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
  User,
  Instagram,
  Image,
  Video,
  Layers,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface ScheduledPost {
  id: string;
  campaign_id: string;
  client_id: string;
  platform: string;
  scheduled_at: string;
  media_urls: string[];
  caption: string;
  status: string;
  content_type?: string;
  campaigns?: { id: string; name: string };
  clients?: { id: string; name: string };
}

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const formatIcons: Record<string, typeof Image> = {
  image: Image,
  carousel: Layers,
  video: Video,
  reels: Video,
  stories: Image,
};

// Simple hash for consistent color assignment
function clientColor(name: string): string {
  const colors = [
    'bg-blue-500', 'bg-purple-500', 'bg-teal-500', 'bg-orange-500',
    'bg-pink-500', 'bg-indigo-500', 'bg-rose-500', 'bg-emerald-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default function AgendamentosPage() {
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set('month', String(month + 1));
        params.set('year', String(year));

        const res = await fetch(`/api/scheduled-posts?${params}`);
        if (!res.ok) throw new Error('Erro ao carregar agendamentos');
        const json = await res.json();
        setPosts(Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : []);
      } catch (err: any) {
        setError(err.message ?? 'Erro inesperado');
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, [year, month]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevDays = new Date(year, month, 0).getDate();

    const days: { day: number; inMonth: boolean; dateStr: string }[] = [];

    // Previous month filler — when month is 0 (January), previous month is December (12) of previous year
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = prevDays - i;
      const prevMonth = month === 0 ? 12 : month;
      const prevYear = month === 0 ? year - 1 : year;
      days.push({
        day: d,
        inMonth: false,
        dateStr: `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      });
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({
        day: d,
        inMonth: true,
        dateStr: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      });
    }

    // Next month filler
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const nextMonth = month + 2 > 12 ? 1 : month + 2;
      const nextYear = month + 2 > 12 ? year + 1 : year;
      days.push({
        day: d,
        inMonth: false,
        dateStr: `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      });
    }

    return days;
  }, [year, month]);

  const postsByDate = useMemo(() => {
    const map: Record<string, ScheduledPost[]> = {};
    posts.forEach((post) => {
      const dateStr = post.scheduled_at.split('T')[0];
      if (!map[dateStr]) map[dateStr] = [];
      map[dateStr].push(post);
    });
    return map;
  }, [posts]);

  // Get unique clients for legend
  const uniqueClients = useMemo(() => {
    const seen = new Map<string, string>();
    posts.forEach((p) => {
      const name = p.clients?.name ?? 'Desconhecido';
      if (!seen.has(name)) seen.set(name, clientColor(name));
    });
    return Array.from(seen.entries()).map(([name, color]) => ({ name, color }));
  }, [posts]);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => {
    const now = new Date();
    setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Agendamentos</h1>
        <p className="mt-1 text-sm text-gray-500">
          Calendário de publicações agendadas
        </p>
      </div>

      {error && (
        <div className="card border-red-200 bg-red-50">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Calendar */}
      <div className="card !p-0 overflow-hidden">
        {/* Month Navigation */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <button
            onClick={prevMonth}
            className="rounded-lg p-2 hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">
              {MONTHS[month]} {year}
            </h2>
            {loading && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
            <button
              onClick={goToToday}
              className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Hoje
            </button>
          </div>
          <button
            onClick={nextMonth}
            className="rounded-lg p-2 hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50/50">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="px-2 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {calendarDays.map((cell, idx) => {
            const dayPosts = postsByDate[cell.dateStr] || [];
            const isToday = cell.dateStr === todayStr;
            return (
              <div
                key={idx}
                className={`min-h-[100px] border-b border-r border-gray-100 p-1.5 ${
                  cell.inMonth ? 'bg-white' : 'bg-gray-50/50'
                } ${idx % 7 === 0 ? 'border-l-0' : ''}`}
              >
                <div
                  className={`mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                    isToday
                      ? 'bg-hp-purple text-white'
                      : cell.inMonth
                      ? 'text-gray-900'
                      : 'text-gray-300'
                  }`}
                >
                  {cell.day}
                </div>
                <div className="space-y-1">
                  {dayPosts.slice(0, 3).map((post) => {
                    const name = post.clients?.name ?? 'Post';
                    const color = clientColor(name);
                    return (
                      <button
                        key={post.id}
                        onClick={() => setSelectedPost(post)}
                        className={`w-full truncate rounded px-1.5 py-0.5 text-left text-[10px] font-medium text-white ${color} hover:opacity-80 transition-opacity`}
                      >
                        {post.campaigns?.name ?? post.caption?.slice(0, 30) ?? 'Post'}
                      </button>
                    );
                  })}
                  {dayPosts.length > 3 && (
                    <p className="text-[10px] text-gray-400 px-1">
                      +{dayPosts.length - 3} mais
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      {uniqueClients.length > 0 && (
        <div className="card !p-4">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Clientes</h3>
          <div className="flex flex-wrap gap-4">
            {uniqueClients.map((c) => (
              <div key={c.name} className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${c.color}`} />
                <span className="text-xs text-gray-600">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && posts.length === 0 && !error && (
        <div className="py-12 text-center text-sm text-gray-500">
          Nenhum agendamento para este mês.
        </div>
      )}

      {/* Post Detail Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Detalhes do Agendamento
              </h2>
              <button onClick={() => setSelectedPost(null)}>
                <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Preview */}
              <div className="flex h-32 items-center justify-center rounded-lg bg-gradient-to-br from-hp-purple-50 to-hp-accent-50">
                {(() => {
                  const format = selectedPost.content_type ?? 'image';
                  const Icon = formatIcons[format] || Image;
                  return <Icon className="h-10 w-10 text-hp-purple-300" />;
                })()}
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">
                  {selectedPost.campaigns?.name ?? 'Post agendado'}
                </h3>
                {selectedPost.caption && (
                  <p className="mt-1 text-sm text-gray-600 line-clamp-3">{selectedPost.caption}</p>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="h-4 w-4 text-gray-400" />
                  {selectedPost.clients?.name ?? 'Cliente'}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="h-4 w-4 text-gray-400" />
                  {new Date(selectedPost.scheduled_at).toLocaleString('pt-BR')}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Instagram className="h-4 w-4 text-gray-400" />
                  {selectedPost.platform}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setSelectedPost(null)}
                  className="btn-secondary flex-1"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

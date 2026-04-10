'use client';

import { useState, useMemo } from 'react';
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
} from 'lucide-react';

interface ScheduledPost {
  id: number;
  title: string;
  client: string;
  clientColor: string;
  date: string; // YYYY-MM-DD
  time: string;
  format: string;
  platform: string;
}

const scheduledPosts: ScheduledPost[] = [
  { id: 1, title: 'Carrossel - Implantes', client: 'Dr. Ricardo Silva', clientColor: 'bg-blue-500', date: '2026-04-10', time: '09:00', format: 'carousel', platform: 'Instagram' },
  { id: 2, title: 'Reels - Clareamento', client: 'Clinica Sorriso', clientColor: 'bg-purple-500', date: '2026-04-10', time: '14:00', format: 'video', platform: 'Instagram' },
  { id: 3, title: 'Post - Ortodontia', client: 'Dra. Camila Mendes', clientColor: 'bg-teal-500', date: '2026-04-11', time: '10:00', format: 'image', platform: 'Instagram' },
  { id: 4, title: 'Carrossel - Facetas', client: 'Dr. Fernando Oliveira', clientColor: 'bg-orange-500', date: '2026-04-12', time: '11:00', format: 'carousel', platform: 'Instagram' },
  { id: 5, title: 'Reels - Depoimento', client: 'Dr. Ricardo Silva', clientColor: 'bg-blue-500', date: '2026-04-14', time: '09:00', format: 'video', platform: 'Instagram' },
  { id: 6, title: 'Post - Higiene Bucal', client: 'Dra. Camila Mendes', clientColor: 'bg-teal-500', date: '2026-04-15', time: '08:00', format: 'image', platform: 'Instagram' },
  { id: 7, title: 'Carrossel - Protese', client: 'Clinica OdontoPlus', clientColor: 'bg-pink-500', date: '2026-04-16', time: '12:00', format: 'carousel', platform: 'Instagram' },
  { id: 8, title: 'Post - Tecnologia 3D', client: 'Dr. Ricardo Silva', clientColor: 'bg-blue-500', date: '2026-04-18', time: '10:00', format: 'image', platform: 'Instagram' },
  { id: 9, title: 'Reels - Antes/Depois', client: 'Clinica Sorriso', clientColor: 'bg-purple-500', date: '2026-04-20', time: '15:00', format: 'video', platform: 'Instagram' },
  { id: 10, title: 'Post - Sorriso Perfeito', client: 'Dr. Fernando Oliveira', clientColor: 'bg-orange-500', date: '2026-04-22', time: '09:00', format: 'image', platform: 'Instagram' },
  { id: 11, title: 'Carrossel - Cuidados', client: 'Clinica OdontoPlus', clientColor: 'bg-pink-500', date: '2026-04-25', time: '11:00', format: 'carousel', platform: 'Instagram' },
  { id: 12, title: 'Reels - FAQ Implante', client: 'Dr. Ricardo Silva', clientColor: 'bg-blue-500', date: '2026-04-28', time: '14:00', format: 'video', platform: 'Instagram' },
];

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const formatIcons: Record<string, typeof Image> = {
  image: Image,
  carousel: Layers,
  video: Video,
};

export default function AgendamentosPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 1)); // April 2026
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevDays = new Date(year, month, 0).getDate();

    const days: { day: number; inMonth: boolean; dateStr: string }[] = [];

    // Previous month filler
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = prevDays - i;
      const m = month === 0 ? 12 : month;
      const y = month === 0 ? year - 1 : year;
      days.push({
        day: d,
        inMonth: false,
        dateStr: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
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
      const m = month + 2 > 12 ? 1 : month + 2;
      const y = month + 2 > 12 ? year + 1 : year;
      days.push({
        day: d,
        inMonth: false,
        dateStr: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      });
    }

    return days;
  }, [year, month]);

  const postsByDate = useMemo(() => {
    const map: Record<string, ScheduledPost[]> = {};
    scheduledPosts.forEach((post) => {
      if (!map[post.date]) map[post.date] = [];
      map[post.date].push(post);
    });
    return map;
  }, []);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const today = '2026-04-10';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Agendamentos</h1>
        <p className="mt-1 text-sm text-gray-500">
          Calendario de publicacoes agendadas
        </p>
      </div>

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
          <h2 className="text-lg font-semibold text-gray-900">
            {MONTHS[month]} {year}
          </h2>
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
            const posts = postsByDate[cell.dateStr] || [];
            const isToday = cell.dateStr === today;
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
                      ? 'bg-dental-blue text-white'
                      : cell.inMonth
                      ? 'text-gray-900'
                      : 'text-gray-300'
                  }`}
                >
                  {cell.day}
                </div>
                <div className="space-y-1">
                  {posts.slice(0, 3).map((post) => (
                    <button
                      key={post.id}
                      onClick={() => setSelectedPost(post)}
                      className={`w-full truncate rounded px-1.5 py-0.5 text-left text-[10px] font-medium text-white ${post.clientColor} hover:opacity-80 transition-opacity`}
                    >
                      {post.title}
                    </button>
                  ))}
                  {posts.length > 3 && (
                    <p className="text-[10px] text-gray-400 px-1">
                      +{posts.length - 3} mais
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="card !p-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-700">Clientes</h3>
        <div className="flex flex-wrap gap-4">
          {[
            { name: 'Dr. Ricardo Silva', color: 'bg-blue-500' },
            { name: 'Clinica Sorriso', color: 'bg-purple-500' },
            { name: 'Dra. Camila Mendes', color: 'bg-teal-500' },
            { name: 'Dr. Fernando Oliveira', color: 'bg-orange-500' },
            { name: 'Clinica OdontoPlus', color: 'bg-pink-500' },
          ].map((c) => (
            <div key={c.name} className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${c.color}`} />
              <span className="text-xs text-gray-600">{c.name}</span>
            </div>
          ))}
        </div>
      </div>

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
              <div className="flex h-32 items-center justify-center rounded-lg bg-gradient-to-br from-dental-blue-50 to-dental-teal-50">
                {(() => {
                  const Icon = formatIcons[selectedPost.format] || Image;
                  return <Icon className="h-10 w-10 text-dental-blue-300" />;
                })()}
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">
                  {selectedPost.title}
                </h3>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="h-4 w-4 text-gray-400" />
                  {selectedPost.client}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="h-4 w-4 text-gray-400" />
                  {selectedPost.date} as {selectedPost.time}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Instagram className="h-4 w-4 text-gray-400" />
                  {selectedPost.platform}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  {(() => {
                    const Icon = formatIcons[selectedPost.format] || Image;
                    return <Icon className="h-4 w-4 text-gray-400" />;
                  })()}
                  {selectedPost.format === 'carousel'
                    ? 'Carrossel'
                    : selectedPost.format === 'video'
                    ? 'Video'
                    : 'Imagem'}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setSelectedPost(null)}
                  className="btn-secondary flex-1"
                >
                  Fechar
                </button>
                <button className="btn-primary flex-1">Editar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

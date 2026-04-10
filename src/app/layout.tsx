'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  UserSearch,
  MessageSquarePlus,
  Megaphone,
  Library,
  CalendarDays,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clientes', label: 'Clientes', icon: Users },
  { href: '/referencias', label: 'Referências', icon: UserSearch },
  { href: '/nova-campanha', label: 'Nova Campanha', icon: MessageSquarePlus },
  { href: '/campanhas', label: 'Campanhas', icon: Megaphone },
  { href: '/biblioteca', label: 'Biblioteca', icon: Library },
  { href: '/agendamentos', label: 'Agendamentos', icon: CalendarDays },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <div className="flex h-screen overflow-hidden">
          {/* Mobile overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <aside
            className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-gradient-to-b from-dental-blue-900 to-dental-blue-800 transition-transform duration-300 lg:static lg:translate-x-0 ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            {/* Brand */}
            <div className="flex h-16 items-center gap-3 border-b border-white/10 px-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-dental-teal">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">DentAI</h1>
                <p className="text-[10px] uppercase tracking-widest text-dental-teal-300">
                  Marketing Platform
                </p>
              </div>
              <button
                className="ml-auto lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5 text-white/70" />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname?.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-white/15 text-white shadow-sm'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="border-t border-white/10 p-4">
              <div className="rounded-lg bg-white/10 p-3">
                <p className="text-xs font-medium text-white/90">
                  Pipeline ativo
                </p>
                <p className="mt-1 text-xs text-dental-teal-300">
                  3 campanhas em execucao
                </p>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Top bar (mobile) */}
            <header className="flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-4 lg:px-8">
              <button
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6 text-gray-600" />
              </button>
              <div className="flex-1" />
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-dental-blue-100 flex items-center justify-center">
                  <span className="text-xs font-semibold text-dental-blue-700">
                    DT
                  </span>
                </div>
              </div>
            </header>

            {/* Page content */}
            <main className="flex-1 overflow-y-auto p-4 lg:p-8">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}

'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { ToastProvider } from '@/components/ui/toast';
import { AuthGuard } from '@/components/auth-guard';
import { useAuth } from '@/hooks/use-auth';
import { signOut } from '@/lib/auth';
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
  LogOut,
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
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  const isLoginPage = pathname === '/login';

  async function handleSignOut() {
    try {
      await signOut();
      router.push('/login');
    } catch {
      // Force redirect even if signOut fails
      router.push('/login');
    }
  }

  // Login page renders without sidebar/chrome
  if (isLoginPage) {
    return (
      <html lang="pt-BR">
        <head>
          <title>DentAI — Marketing Odontológico com IA</title>
          <meta name="description" content="Plataforma de automação de conteúdo com IA para agências de marketing odontológico" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
          <meta property="og:title" content="DentAI Marketing Platform" />
          <meta property="og:description" content="Sistema completo de automação de conteúdo de marketing para clínicas odontológicas" />
          <meta property="og:type" content="website" />
          <meta name="theme-color" content="#1e3a5f" />
        </head>
        <body className={inter.className}>
          <ToastProvider>
            <AuthGuard>
              {children}
            </AuthGuard>
          </ToastProvider>
        </body>
      </html>
    );
  }

  return (
    <html lang="pt-BR">
      <head>
        <title>DentAI — Marketing Odontológico com IA</title>
        <meta name="description" content="Plataforma de automação de conteúdo com IA para agências de marketing odontológico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta property="og:title" content="DentAI Marketing Platform" />
        <meta property="og:description" content="Sistema completo de automação de conteúdo de marketing para clínicas odontológicas" />
        <meta property="og:type" content="website" />
        <meta name="theme-color" content="#1e3a5f" />
      </head>
      <body className={inter.className}>
        <ToastProvider>
        <AuthGuard>
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

            {/* User info & Logout */}
            <div className="border-t border-white/10 p-4">
              <div className="rounded-lg bg-white/10 p-3">
                {user ? (
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-white/90">
                        {user.email}
                      </p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      title="Sair"
                      className="flex-shrink-0 rounded-md p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-white/50">Carregando...</p>
                )}
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
                {user && (
                  <span className="hidden text-sm text-gray-600 sm:inline">
                    {user.email}
                  </span>
                )}
                <div className="h-8 w-8 rounded-full bg-dental-blue-100 flex items-center justify-center">
                  <span className="text-xs font-semibold text-dental-blue-700">
                    {user?.email?.substring(0, 2).toUpperCase() || '...'}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  title="Sair"
                  className="rounded-md p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </header>

            {/* Page content */}
            <main className="flex-1 overflow-y-auto p-4 lg:p-8">
              {children}
            </main>
          </div>
        </div>
        </AuthGuard>
        </ToastProvider>
      </body>
    </html>
  );
}

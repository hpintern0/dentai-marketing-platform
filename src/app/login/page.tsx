'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: Integrate with Supabase Auth
    console.log('Login attempt:', { email });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-dental-blue-900 via-dental-blue-800 to-dental-blue-700 px-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-dental-teal shadow-lg">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">DentAI</h1>
          <p className="mt-1 text-sm text-white/70">
            Plataforma de Marketing Odontol&oacute;gico com IA
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white p-8 shadow-2xl">
          <h2 className="mb-6 text-center text-xl font-semibold text-gray-800">
            Entrar na sua conta
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                E-mail
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-dental-blue-500 focus:ring-2 focus:ring-dental-blue-500/20"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Senha
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-dental-blue-500 focus:ring-2 focus:ring-dental-blue-500/20"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full rounded-lg bg-dental-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-dental-blue-600 focus:outline-none focus:ring-2 focus:ring-dental-blue-500/50"
            >
              Entrar
            </button>
          </form>

          {/* Forgot password */}
          <div className="mt-5 text-center">
            <a
              href="#"
              className="text-sm text-dental-blue-600 hover:text-dental-blue-500 hover:underline"
            >
              Esqueci minha senha
            </a>
          </div>
        </div>

        {/* Footer note */}
        <p className="mt-6 text-center text-xs text-white/50">
          &copy; 2026 DentAI. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}

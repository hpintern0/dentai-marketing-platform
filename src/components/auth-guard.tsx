'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session && pathname !== '/login') {
        router.replace('/login');
      } else if (session && pathname === '/login') {
        router.replace('/dashboard');
      } else {
        setAuthenticated(!!session);
      }
      setChecked(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && pathname !== '/login') {
        router.replace('/login');
      }
      setAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, [pathname, router]);

  // Don't render anything until we've checked auth
  if (!checked) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-dental-blue-600" />
      </div>
    );
  }

  // Login page doesn't need auth
  if (pathname === '/login') {
    return <>{children}</>;
  }

  // Protected pages need auth
  if (!authenticated) {
    return null;
  }

  return <>{children}</>;
}

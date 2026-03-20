'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        // 记录来源页，登录后跳回
        const redirect = window.location.pathname;
        router.replace(`/login?redirect=${encodeURIComponent(redirect)}`);
      } else {
        setChecking(false);
      }
    });
  }, [router]);

  if (checking) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400">加载中…</div>
      </main>
    );
  }

  return <>{children}</>;
}

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import AuthForm from '../components/AuthForm';
import { ArrowRight } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const handleLoginSuccess = () => {
    router.push(redirect);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            返回首页
          </button>
        </div>
      </div>
      <AuthForm onLoginSuccess={handleLoginSuccess} />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-gray-400">加载中…</div></div>}>
      <LoginContent />
    </Suspense>
  );
}

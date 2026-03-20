'use client';

import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header';
import SettingsPage from '@/app/components/SettingsPage';

export default function Page() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="py-8 px-4">
        <SettingsPage onBack={() => router.push('/')} />
      </div>
    </div>
  );
}

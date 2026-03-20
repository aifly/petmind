'use client';

import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header';
import PetNameGenerator from '@/app/components/PetNameGenerator';

export default function Page() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="py-8 px-4">
        <PetNameGenerator onBack={() => router.push('/')} />
      </div>
    </div>
  );
}

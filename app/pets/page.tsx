'use client';

import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import PetProfile from '@/app/components/PetProfile';

export default function Page() {
  const router = useRouter();
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="py-8 px-4">
          <PetProfile onBack={() => router.push('/')} />
        </div>
      </div>
    </ProtectedRoute>
  );
}

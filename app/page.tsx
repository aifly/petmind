'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Brain, ArrowRight, Stethoscope, Calendar, LogOut, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import PetNameGenerator from './components/PetNameGenerator';
import PersonalityAnalyzer from './components/PersonalityAnalyzer';
import HealthConsultation from './components/HealthConsultation';
import PetCalendar from './components/PetCalendar';
import AuthForm from './components/AuthForm';

const features = [
  {
    id: 'name',
    name: '魔法命名',
    desc: 'AI 为你的毛孩子取个独特的名字',
    icon: Sparkles,
  },
  {
    id: 'personality',
    name: '性格分析',
    desc: '深度解析你爱宠的性格特点',
    icon: Brain,
  },
  {
    id: 'health',
    name: '健康咨询',
    desc: 'AI 提供初步健康建议',
    icon: Stethoscope,
  },
  {
    id: 'calendar',
    name: '宠物日历',
    desc: '管理日程和健康提醒',
    icon: Calendar,
  },
];

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  useEffect(() => {
    // 检查当前用户
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // 监听登录状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const handleLoginSuccess = () => {
    // 登录成功后会通过 onAuthStateChange 自动更新
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400">加载中…</div>
      </main>
    );
  }

  // 如果没有登录，显示登录页面
  if (!user) {
    return <AuthForm onLoginSuccess={handleLoginSuccess} />;
  }

  // 功能页面
  if (activeFeature === 'name') {
    return (
      <main className="min-h-screen bg-gray-100 py-8 px-4">
        <PetNameGenerator onBack={() => setActiveFeature(null)} />
      </main>
    );
  }

  if (activeFeature === 'personality') {
    return (
      <main className="min-h-screen bg-gray-100 py-8 px-4">
        <PersonalityAnalyzer onBack={() => setActiveFeature(null)} />
      </main>
    );
  }

  if (activeFeature === 'health') {
    return (
      <main className="min-h-screen bg-gray-100 py-8 px-4">
        <HealthConsultation onBack={() => setActiveFeature(null)} />
      </main>
    );
  }

  if (activeFeature === 'calendar') {
    return (
      <main className="min-h-screen bg-gray-100 py-8 px-4">
        <PetCalendar onBack={() => setActiveFeature(null)} />
      </main>
    );
  }

  // 首页
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header with User */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-lg font-semibold text-gray-900">
            PetMind<span className="text-gray-400">.ai</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span className="max-w-[150px] truncate">{user.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="退出登录"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 pt-12 pb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            用 AI 关爱你的毛孩子
          </h1>
          <p className="text-lg text-gray-600 max-w-lg mx-auto">
            智能命名 · 性格分析 · 健康咨询 · 日历管理
          </p>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">选择功能</h2>
          <p className="text-gray-500">探索 AI 为你的宠物带来的神奇体验</p>
        </div>

        <div className="space-y-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <button
                key={feature.id}
                onClick={() => setActiveFeature(feature.id)}
                className="w-full p-6 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all text-left flex items-center gap-5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
              >
                <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6 text-white" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-0.5">
                    {feature.name}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {feature.desc}
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" aria-hidden="true" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-400 text-sm border-t border-gray-200 bg-white">
        <p>Made with ♥ by PetMind.ai</p>
      </footer>
    </main>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Brain, ArrowRight, Stethoscope, Calendar, LogOut, User, Heart, Utensils, Camera, MessageCircle, TrendingUp, ShoppingBag } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import PetNameGenerator from './components/PetNameGenerator';
import PersonalityAnalyzer from './components/PersonalityAnalyzer';
import HealthConsultation from './components/HealthConsultation';
import PetCalendar from './components/PetCalendar';
import PetProfile from './components/PetProfile';
import FeedingGuide from './components/FeedingGuide';
import AiConsultation from './components/AiConsultation';
import GrowthTracker from './components/GrowthTracker';
import ProductRecommendation from './components/ProductRecommendation';
import PhotoAnalysis from './components/PhotoAnalysis';
import AuthForm from './components/AuthForm';

const features = [
  {
    id: 'profile',
    name: '宠物档案',
    desc: '管理宠物信息和疫苗记录',
    icon: Heart,
    highlight: true,
  },
  {
    id: 'photo',
    name: 'AI 照片识别',
    desc: '识别品种、健康检查、情绪解读',
    icon: Camera,
  },
  {
    id: 'feeding',
    name: '喂养建议',
    desc: 'AI 定制科学喂养方案',
    icon: Utensils,
  },
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
    id: 'consult',
    name: 'AI 问诊',
    desc: '多轮对话深度咨询',
    icon: MessageCircle,
  },
  {
    id: 'growth',
    name: '成长记录',
    desc: '体重身高追踪和AI分析',
    icon: TrendingUp,
  },
  {
    id: 'product',
    name: '用品推荐',
    desc: 'AI 推荐合适的产品',
    icon: ShoppingBag,
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
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400">加载中…</div>
      </main>
    );
  }

  if (!user) {
    return <AuthForm onLoginSuccess={() => {}} />;
  }

  if (activeFeature === 'profile') {
    return (
      <main className="min-h-screen bg-gray-100 py-8 px-4">
        <PetProfile onBack={() => setActiveFeature(null)} />
      </main>
    );
  }

  if (activeFeature === 'photo') {
    return (
      <main className="min-h-screen bg-gray-100 py-8 px-4">
        <PhotoAnalysis onBack={() => setActiveFeature(null)} />
      </main>
    );
  }

  if (activeFeature === 'feeding') {
    return (
      <main className="min-h-screen bg-gray-100 py-8 px-4">
        <FeedingGuide onBack={() => setActiveFeature(null)} />
      </main>
    );
  }

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

  if (activeFeature === 'consult') {
    return (
      <main className="min-h-screen bg-gray-100 py-8 px-4">
        <AiConsultation onBack={() => setActiveFeature(null)} />
      </main>
    );
  }

  if (activeFeature === 'growth') {
    return (
      <main className="min-h-screen bg-gray-100 py-8 px-4">
        <GrowthTracker onBack={() => setActiveFeature(null)} />
      </main>
    );
  }

  if (activeFeature === 'product') {
    return (
      <main className="min-h-screen bg-gray-100 py-8 px-4">
        <ProductRecommendation onBack={() => setActiveFeature(null)} />
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

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
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
            智能命名 · 性格分析 · 健康咨询 · 日程管理
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
                className={`w-full p-6 rounded-2xl border shadow-sm hover:shadow-md transition-all text-left flex items-center gap-5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 ${
                  feature.highlight
                    ? 'bg-gray-900 border-gray-900'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  feature.highlight ? 'bg-white' : 'bg-gray-900'
                }`}>
                  <Icon className={`w-6 h-6 ${feature.highlight ? 'text-gray-900' : 'text-white'}`} aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <h3 className={`text-lg font-semibold mb-0.5 ${
                    feature.highlight ? 'text-white' : 'text-gray-900'
                  }`}>
                    {feature.name}
                  </h3>
                  <p className={`text-sm ${feature.highlight ? 'text-gray-300' : 'text-gray-500'}`}>
                    {feature.desc}
                  </p>
                </div>
                <ArrowRight className={`w-5 h-5 ${feature.highlight ? 'text-gray-400' : 'text-gray-400'}`} aria-hidden="true" />
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

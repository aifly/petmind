'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Brain, ArrowRight, Stethoscope, Calendar, LogOut, User, Heart, Utensils, Camera, MessageCircle, TrendingUp, ShoppingBag, PawPrint, MapPin, Settings, Shield, Clipboard } from 'lucide-react';
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
import NearbyHospitals from './components/NearbyHospitals';
import SettingsPage from './components/SettingsPage';
import PhotoAnalysis from './components/PhotoAnalysis';
import AuthForm from './components/AuthForm';

const featureGroups = [
  {
    title: '🐾 宠物管理',
    features: [
      { id: 'profile', name: '宠物档案', desc: '信息记录、疫苗管理', icon: PawPrint, color: 'bg-amber-500' },
      { id: 'growth', name: '成长记录', desc: '体重身高追踪分析', icon: TrendingUp, color: 'bg-green-500' },
      { id: 'calendar', name: '宠物日历', desc: '日程安排、健康提醒', icon: Calendar, color: 'bg-blue-500' },
    ]
  },
  {
    title: '🤖 AI 智能服务',
    features: [
      { id: 'photo', name: 'AI 照片识别', desc: '品种、健康、情绪分析', icon: Camera, color: 'bg-purple-500' },
      { id: 'name', name: '魔法命名', desc: 'AI 创意取名', icon: Sparkles, color: 'bg-pink-500' },
      { id: 'personality', name: '性格分析', desc: '深度解析性格特点', icon: Brain, color: 'bg-indigo-500' },
    ]
  },
  {
    title: '💊 健康医疗',
    features: [
      { id: 'feeding', name: '喂养建议', desc: '科学喂养方案', icon: Utensils, color: 'bg-orange-500' },
      { id: 'health', name: '健康咨询', desc: '初步健康建议', icon: Stethoscope, color: 'bg-red-500' },
      { id: 'consult', name: 'AI 问诊', desc: '多轮深度咨询', icon: MessageCircle, color: 'bg-cyan-500' },
    ]
  },
  {
    title: '🛒 其他服务',
    features: [
      { id: 'product', name: '用品推荐', desc: 'AI 推荐合适产品', icon: ShoppingBag, color: 'bg-teal-500' },
      { id: 'hospital', name: '附近医院', desc: '查找周边宠物医院', icon: MapPin, color: 'bg-red-500' },
      { id: 'settings', name: '设置', desc: '语言、主题等设置', icon: Settings, color: 'bg-gray-500' },
    ]
  },
];

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [pendingFeature, setPendingFeature] = useState<string | null>(null);

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

  const handleFeatureClick = (featureId: string) => {
    // 定义需要登录才能访问的功能
    const protectedFeatures = ['profile', 'growth', 'calendar'];
    
    if (protectedFeatures.includes(featureId) && !user) {
      // 需要登录的功能，显示登录框
      setPendingFeature(featureId);
      setShowAuth(true);
    } else {
      // 不需要登录的功能，直接进入
      setActiveFeature(featureId);
    }
  };

  const handleLoginSuccess = () => {
    setShowAuth(false);
    if (pendingFeature) {
      setActiveFeature(pendingFeature);
      setPendingFeature(null);
    }
  };

  const handleSkipAuth = () => {
    setShowAuth(false);
    setPendingFeature(null);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400">加载中…</div>
      </main>
    );
  }

  // 显示登录表单（当点击需要登录的功能时）
  if (showAuth) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 py-3">
            <button
              onClick={handleSkipAuth}
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

  if (activeFeature === 'hospital') {
    return (
      <main className="min-h-screen bg-gray-100 py-8 px-4">
        <NearbyHospitals onBack={() => setActiveFeature(null)} />
      </main>
    );
  }

  if (activeFeature === 'settings') {
    return (
      <main className="min-h-screen bg-gray-100 py-8 px-4">
        <SettingsPage onBack={() => setActiveFeature(null)} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
              <PawPrint className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">PetMind<span className="text-amber-500">.ai</span></span>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                  <User className="w-4 h-4" />
                  <span className="max-w-[120px] truncate">{user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="退出登录"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                <User className="w-4 h-4" />
                登录 / 注册
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-sm text-amber-400 mb-6">
            <Sparkles className="w-4 h-4" />
            <span>AI 智能宠物管理平台</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            用 AI 关爱你的毛孩子
          </h1>
          <p className="text-lg text-gray-300 max-w-xl mx-auto">
            智能命名 · 性格分析 · 健康咨询 · 成长追踪
          </p>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-4 py-12 -mt-8">
        {featureGroups.map((group, groupIndex) => (
          <div key={group.title} className="mb-10">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              {group.title}
            </h2>
            <div className={`grid gap-4 ${
              group.features.length === 1 ? 'grid-cols-1 max-w-sm' :
              group.features.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
              'grid-cols-1 md:grid-cols-3'
            }`}>
              {group.features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <button
                    key={feature.id}
                    onClick={() => handleFeatureClick(feature.id)}
                    className="group bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-lg hover:border-gray-300 transition-all text-left relative overflow-hidden"
                  >
                    <div className={`absolute top-0 right-0 w-20 h-20 ${feature.color} opacity-10 rounded-bl-full`} />
                    <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {feature.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {feature.desc}
                    </p>
                    <div className="mt-4 flex items-center text-sm font-medium text-gray-900 group-hover:text-amber-500 transition-colors">
                      <span>进入</span>
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-400 text-sm border-t border-gray-200 bg-white/50">
        <p>Made with ♥ by PetMind.ai</p>
      </footer>
    </main>
  );
}

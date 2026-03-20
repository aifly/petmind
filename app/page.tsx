'use client';

import { Sparkles, Brain, ArrowRight, Stethoscope, Calendar, Utensils, Camera, MessageCircle, TrendingUp, ShoppingBag, PawPrint, MapPin, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Header from './components/Header';

const featureGroups = [
  {
    title: '🐾 宠物管理',
    features: [
      { id: 'pets',        name: '宠物档案',    desc: '信息记录、疫苗管理',   icon: PawPrint,       color: 'bg-amber-500',  protected: true  },
      { id: 'pets/growth', name: '成长记录',    desc: '体重身高追踪分析',     icon: TrendingUp,     color: 'bg-green-500',  protected: true  },
      { id: 'calendar',    name: '宠物日历',    desc: '日程安排、健康提醒',   icon: Calendar,       color: 'bg-blue-500',   protected: true  },
    ]
  },
  {
    title: '🤖 AI 智能服务',
    features: [
      { id: 'photo',       name: 'AI 照片识别', desc: '品种、健康、情绪分析', icon: Camera,         color: 'bg-purple-500', protected: false },
      { id: 'name',        name: '魔法命名',    desc: 'AI 创意取名',          icon: Sparkles,       color: 'bg-pink-500',   protected: false },
      { id: 'personality', name: '性格分析',    desc: '深度解析性格特点',     icon: Brain,          color: 'bg-indigo-500', protected: false },
    ]
  },
  {
    title: '💊 健康医疗',
    features: [
      { id: 'feeding',     name: '喂养建议',    desc: '科学喂养方案',         icon: Utensils,       color: 'bg-orange-500', protected: false },
      { id: 'health',      name: '健康咨询',    desc: '初步健康建议',         icon: Stethoscope,    color: 'bg-red-500',    protected: false },
      { id: 'consult',     name: 'AI 问诊',     desc: '多轮深度咨询',         icon: MessageCircle,  color: 'bg-cyan-500',   protected: false },
    ]
  },
  {
    title: '🛒 其他服务',
    features: [
      { id: 'product',     name: '用品推荐',    desc: 'AI 推荐合适产品',      icon: ShoppingBag,    color: 'bg-teal-500',   protected: false },
      { id: 'hospital',    name: '附近医院',    desc: '查找周边宠物医院',     icon: MapPin,         color: 'bg-red-500',    protected: false },
      { id: 'settings',    name: '设置',        desc: '语言、主题等设置',     icon: Settings,       color: 'bg-gray-500',   protected: false },
    ]
  },
];

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Header />

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
        {featureGroups.map((group) => (
          <div key={group.title} className="mb-10">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">{group.title}</h2>
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
                    onClick={() => router.push(`/${feature.id}`)}
                    className="group bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-lg hover:border-gray-300 transition-all text-left relative overflow-hidden"
                  >
                    <div className={`absolute top-0 right-0 w-20 h-20 ${feature.color} opacity-10 rounded-bl-full`} />
                    <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{feature.name}</h3>
                    <p className="text-sm text-gray-500">{feature.desc}</p>
                    {feature.protected && (
                      <span className="inline-block mt-2 text-xs text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">需要登录</span>
                    )}
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

      <footer className="text-center py-8 text-gray-400 text-sm border-t border-gray-200 bg-white/50">
        <p>Made with ♥ by PetMind.ai</p>
      </footer>
    </main>
  );
}

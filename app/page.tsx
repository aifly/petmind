'use client';

import { useState } from 'react';
import PetNameGenerator from './components/PetNameGenerator';
import PersonalityAnalyzer from './components/PersonalityAnalyzer';
import { Sparkles, Brain, Heart } from 'lucide-react';

const features = [
  {
    id: 'name',
    name: '名字生成',
    desc: '为宠物取个特别的名字',
    icon: Sparkles,
    color: 'from-blue-500 to-purple-500',
  },
  {
    id: 'personality',
    name: '性格分析',
    desc: 'AI 分析宠物性格特点',
    icon: Brain,
    color: 'from-purple-500 to-pink-500',
  },
];

export default function Home() {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          PetMind.ai
        </h1>
        <p className="text-gray-600 text-lg max-w-xl mx-auto">
          AI 驱动的宠物助手，为你的毛孩子提供智能命名、性格分析等服务
        </p>
      </header>

      {/* Feature Selection */}
      {!activeFeature && (
        <div className="max-w-2xl mx-auto mb-8">
          <h2 className="text-center text-lg font-medium text-gray-700 mb-6">
            选择功能
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <button
                  key={feature.id}
                  onClick={() => setActiveFeature(feature.id)}
                  className={`p-6 rounded-2xl bg-gradient-to-r ${feature.color} text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all text-left`}
                >
                  <Icon className="w-8 h-8 mb-3" />
                  <h3 className="text-xl font-bold mb-1">{feature.name}</h3>
                  <p className="text-white/80 text-sm">{feature.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Content */}
      {activeFeature === 'name' && (
        <PetNameGenerator onBack={() => setActiveFeature(null)} />
      )}
      {activeFeature === 'personality' && (
        <PersonalityAnalyzer onBack={() => setActiveFeature(null)} />
      )}

      {/* Footer */}
      <footer className="text-center mt-12 text-gray-400 text-sm">
        <p className="flex items-center justify-center gap-1">
          <Heart className="w-4 h-4 text-red-400" />
          © 2025 PetMind.ai · 用 AI 关爱每一个毛孩子
        </p>
      </footer>
    </main>
  );
}

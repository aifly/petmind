'use client';

import { useState } from 'react';
import { Sparkles, Brain, ArrowRight, Star } from 'lucide-react';
import PetNameGenerator from './components/PetNameGenerator';
import PersonalityAnalyzer from './components/PersonalityAnalyzer';

const features = [
  {
    id: 'name',
    name: '魔法命名',
    desc: 'AI 为你的毛孩子取个独特的名字',
    icon: Sparkles,
    bg: 'bg-gray-900',
    hoverBg: 'hover:bg-gray-800',
    borderColor: 'border-gray-200',
  },
  {
    id: 'personality',
    name: '性格分析',
    desc: '深度解析你爱宠的性格特点',
    icon: Brain,
    bg: 'bg-gray-700',
    hoverBg: 'hover:bg-gray-600',
    borderColor: 'border-gray-200',
  },
];

export default function Home() {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

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

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 pt-16 pb-12 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full mb-8">
            <Star className="w-4 h-4 text-gray-600" aria-hidden="true" />
            <span className="text-sm font-medium text-gray-600">AI 驱动的宠物助手</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            PetMind<span className="text-gray-400">.ai</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-gray-600 max-w-lg mx-auto mb-8">
            用人工智能关爱每一个毛孩子
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-12 pt-4">
            {[
              { value: '10,000+', label: '宠物名字生成' },
              { value: '5,000+', label: '性格分析报告' },
              { value: '98%', label: '用户满意度' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-xl font-semibold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
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
                className={`w-full p-6 rounded-2xl bg-white border ${feature.borderColor} shadow-sm hover:shadow-md transition-all text-left flex items-center gap-5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400`}
              >
                {/* Icon */}
                <div className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center shrink-0`}>
                  <Icon className="w-6 h-6 text-white" aria-hidden="true" />
                </div>

                {/* Text */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-0.5">
                    {feature.name}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {feature.desc}
                  </p>
                </div>

                {/* Arrow */}
                <ArrowRight className="w-5 h-5 text-gray-400" aria-hidden="true" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-400 text-sm border-t border-gray-200 bg-white">
        <p>Made with ♥ by PetMind.ai</p>
        <p className="mt-1">© 2025 · 用 AI 关爱每一个毛孩子</p>
      </footer>
    </main>
  );
}

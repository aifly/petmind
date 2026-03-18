'use client';

import { useState } from 'react';
import { Sparkles, Dog, Cat, Bird, Fish, Rabbit, ChevronLeft, Wand2, Heart, Loader2, Copy, Check } from 'lucide-react';

const petTypes = [
  { id: 'cat', name: '猫咪', icon: Cat, color: 'bg-orange-500', activeColor: 'bg-orange-600', textColor: 'text-orange-600', lightBg: 'bg-orange-50' },
  { id: 'dog', name: '狗狗', icon: Dog, color: 'bg-amber-600', activeColor: 'bg-amber-700', textColor: 'text-amber-600', lightBg: 'bg-amber-50' },
  { id: 'bird', name: '鸟类', icon: Bird, color: 'bg-sky-500', activeColor: 'bg-sky-600', textColor: 'text-sky-600', lightBg: 'bg-sky-50' },
  { id: 'fish', name: '鱼类', icon: Fish, color: 'bg-teal-500', activeColor: 'bg-teal-600', textColor: 'text-teal-600', lightBg: 'bg-teal-50' },
  { id: 'rabbit', name: '兔子', icon: Rabbit, color: 'bg-rose-500', activeColor: 'bg-rose-600', textColor: 'text-rose-600', lightBg: 'bg-rose-50' },
];

const genders = [
  { id: 'male', name: '小王子', emoji: '👑', color: 'bg-sky-500', activeColor: 'bg-sky-600' },
  { id: 'female', name: '小公主', emoji: '👸', color: 'bg-pink-500', activeColor: 'bg-pink-600' },
];

const styles = [
  { id: 'cute', name: '可爱风', desc: '软萌甜美', emoji: '🍬' },
  { id: 'cool', name: '酷炫风', desc: '霸气个性', emoji: '😎' },
  { id: 'elegant', name: '优雅风', desc: '文艺气质', emoji: '🎭' },
  { id: 'funny', name: '搞笑风', desc: '幽默有趣', emoji: '🤪' },
  { id: 'food', name: '食物风', desc: '美食主题', emoji: '🍜' },
];

interface GeneratedName {
  name: string;
  meaning: string;
}

interface PetNameGeneratorProps {
  onBack: () => void;
}

export default function PetNameGenerator({ onBack }: PetNameGeneratorProps) {
  const [petType, setPetType] = useState('cat');
  const [gender, setGender] = useState('male');
  const [style, setStyle] = useState('cute');
  const [personality, setPersonality] = useState('');
  const [names, setNames] = useState<GeneratedName[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generateNames = async () => {
    setLoading(true);
    setError('');
    setNames([]);
    
    try {
      const response = await fetch('/api/generate-names', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ petType, gender, style, personality }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setNames(data.names || []);
    } catch (err) {
      setError('生成失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const copyName = async (name: string, index: number) => {
    await navigator.clipboard.writeText(name);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gray-900 px-6 py-5">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
              aria-label="返回"
            >
              <ChevronLeft className="w-5 h-5 text-gray-300" />
            </button>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Wand2 className="w-5 h-5" />
                魔法名字生成器
              </h2>
              <p className="text-gray-400 text-sm">为你的毛孩子取个独一无二的名字</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Pet Type Selection */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <Heart className="w-4 h-4 text-gray-500" aria-hidden="true" />
              选择你的宠物
            </label>
            <div className="grid grid-cols-5 gap-2">
              {petTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = petType === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => setPetType(type.id)}
                    onKeyDown={(e) => e.key === 'Enter' && setPetType(type.id)}
                    aria-pressed={isSelected}
                    className={`group flex flex-col items-center p-3 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 ${
                      isSelected 
                        ? type.color + ' text-white shadow-md' 
                        : type.lightBg + ' hover:bg-gray-100'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : type.textColor}`} aria-hidden="true" />
                    <span className={`mt-1.5 text-xs font-medium ${isSelected ? 'text-white' : 'text-gray-600'}`}>
                      {type.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Gender Selection */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <span className="text-gray-500" aria-hidden="true">⚥</span>
              性别
            </label>
            <div className="flex gap-3">
              {genders.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGender(g.id)}
                  onKeyDown={(e) => e.key === 'Enter' && setGender(g.id)}
                  aria-pressed={gender === g.id}
                  className={`flex-1 py-3 px-4 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 ${
                    gender === g.id 
                      ? g.color + ' text-white shadow-md' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span className="text-lg mr-1.5" aria-hidden="true">{g.emoji}</span>
                  <span className="font-medium">{g.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Style Selection */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <Sparkles className="w-4 h-4 text-gray-500" aria-hidden="true" />
              名字风格
            </label>
            <div className="grid grid-cols-3 gap-2">
              {styles.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStyle(s.id)}
                  onKeyDown={(e) => e.key === 'Enter' && setStyle(s.id)}
                  aria-pressed={style === s.id}
                  className={`p-3 rounded-xl transition-all text-left focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 ${
                    style === s.id
                      ? 'bg-gray-900 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="text-lg block mb-1" aria-hidden="true">{s.emoji}</span>
                  <span className="text-sm font-medium block">{s.name}</span>
                  <span className={`text-xs block ${style === s.id ? 'text-gray-300' : 'text-gray-500'}`}>
                    {s.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Personality Input */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <span className="text-gray-500" aria-hidden="true">✨</span>
              性格特点（可选）
            </label>
            <textarea
              value={personality}
              onChange={(e) => setPersonality(e.target.value)}
              placeholder="描述一下你爱宠的性格，比如：活泼好动、粘人精、高冷范儿…"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-200 focus:outline-none transition-all resize-none text-gray-700 placeholder:text-gray-400"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-center text-sm">
              {error}
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={generateNames}
            disabled={loading}
            className="w-full py-3.5 bg-gray-900 text-white font-medium rounded-xl shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                AI 生成中…
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                生成专属名字
              </>
            )}
          </button>

          {/* Generated Names */}
          {names.length > 0 && (
            <div className="animate-fade-in">
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                为你推荐的名字
              </h3>
              <div className="space-y-2">
                {names.map((item, index) => (
                  <div
                    key={index}
                    className="group flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
                  >
                    <div>
                      <span className="text-lg font-semibold text-gray-900">{item.name}</span>
                      <p className="text-sm text-gray-500 mt-0.5">{item.meaning}</p>
                    </div>
                    <button
                      onClick={() => copyName(item.name, index)}
                      className="p-2 rounded-lg bg-white border border-gray-200 hover:border-gray-300 text-gray-500 hover:text-gray-900 transition-all focus:outline-none focus:ring-2 focus:ring-gray-400"
                      aria-label={`复制名字 ${item.name}`}
                    >
                      {copiedIndex === index ? (
                        <Check className="w-4 h-4 text-green-600" aria-hidden="true" />
                      ) : (
                        <Copy className="w-4 h-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

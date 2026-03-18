'use client';

import { useState } from 'react';
import { Sparkles, Dog, Cat, Bird, Fish, Rabbit } from 'lucide-react';

const petTypes = [
  { id: 'cat', name: '猫咪', icon: Cat },
  { id: 'dog', name: '狗狗', icon: Dog },
  { id: 'bird', name: '鸟类', icon: Bird },
  { id: 'fish', name: '鱼类', icon: Fish },
  { id: 'rabbit', name: '兔子', icon: Rabbit },
];

const styles = [
  { id: 'cute', name: '可爱风', desc: '软萌甜美' },
  { id: 'cool', name: '酷炫风', desc: '霸气个性' },
  { id: 'elegant', name: '优雅风', desc: '文艺气质' },
  { id: 'funny', name: '搞笑风', desc: '幽默有趣' },
  { id: 'food', name: '食物风', desc: '美食主题' },
];

export default function PetNameGenerator() {
  const [petType, setPetType] = useState('cat');
  const [gender, setGender] = useState('male');
  const [style, setStyle] = useState('cute');
  const [personality, setPersonality] = useState('');
  const [names, setNames] = useState<{name: string; meaning: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateNames = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/generate-names', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ petType, gender, personality, style }),
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

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          🐾 宠物名字生成器
        </h2>
        <p className="text-gray-500">为你的毛孩子取个特别的名字</p>
      </div>

      {/* 宠物类型 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">选择宠物类型</label>
        <div className="grid grid-cols-5 gap-2">
          {petTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => setPetType(type.id)}
                className={`flex flex-col items-center p-3 rounded-xl transition-all ${
                  petType === type.id
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-6 h-6 mb-1" />
                <span className="text-xs">{type.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 性别 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">性别</label>
        <div className="flex gap-3">
          {[
            { id: 'male', name: '♂ 公', emoji: '👦' },
            { id: 'female', name: '♀ 母', emoji: '👧' },
          ].map((g) => (
            <button
              key={g.id}
              onClick={() => setGender(g.id)}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                gender === g.id
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {g.emoji} {g.name}
            </button>
          ))}
        </div>
      </div>

      {/* 风格 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">名字风格</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {styles.map((s) => (
            <button
              key={s.id}
              onClick={() => setStyle(s.id)}
              className={`py-3 px-4 rounded-xl text-left transition-all ${
                style === s.id
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <div className="font-medium">{s.name}</div>
              <div className={`text-xs ${style === s.id ? 'text-blue-100' : 'text-gray-400'}`}>
                {s.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 性格描述 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          性格特点（可选）
        </label>
        <input
          type="text"
          value={personality}
          onChange={(e) => setPersonality(e.target.value)}
          placeholder="比如：活泼好动、懒洋洋、粘人..."
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
        />
      </div>

      {/* 生成按钮 */}
      <button
        onClick={generateNames}
        disabled={loading}
        className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 animate-spin" />
            正在生成...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5" />
            生成名字
          </span>
        )}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl text-center">
          {error}
        </div>
      )}

      {/* 结果展示 */}
      {names.length > 0 && (
        <div className="mt-8 space-y-3">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🎉 为你推荐的名字</h3>
          {names.map((item, index) => (
            <div
              key={index}
              className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <div className="text-xl font-bold text-gray-800">{item.name}</div>
                  <div className="text-sm text-gray-600 mt-1">{item.meaning}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

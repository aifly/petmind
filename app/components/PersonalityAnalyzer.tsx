'use client';

import { useState } from 'react';
import { Brain, Sparkles, ChevronLeft } from 'lucide-react';

const petTypes = [
  { id: 'cat', name: '猫咪' },
  { id: 'dog', name: '狗狗' },
  { id: 'bird', name: '鸟类' },
  { id: 'rabbit', name: '兔子' },
  { id: 'hamster', name: '仓鼠' },
];

const ageOptions = [
  { id: 'baby', name: '幼年期（0-1岁）' },
  { id: 'young', name: '青年期（1-3岁）' },
  { id: 'adult', name: '成年期（3-7岁）' },
  { id: 'senior', name: '老年期（7岁+）' },
];

interface PersonalityAnalyzerProps {
  onBack: () => void;
}

export default function PersonalityAnalyzer({ onBack }: PersonalityAnalyzerProps) {
  const [petType, setPetType] = useState('cat');
  const [age, setAge] = useState('young');
  const [behaviors, setBehaviors] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const analyzePersonality = async () => {
    if (!behaviors.trim()) {
      setError('请描述一下宠物的行为表现');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/analyze-personality', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ petType, age, behaviors }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setAnalysis(data.analysis);
    } catch (err) {
      setError('分析失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-500" />
            宠物性格分析
          </h2>
          <p className="text-gray-500 text-sm">AI 分析你爱宠的性格特点</p>
        </div>
      </div>

      {/* 宠物类型 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">宠物类型</label>
        <div className="flex flex-wrap gap-2">
          {petTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setPetType(type.id)}
              className={`px-4 py-2 rounded-xl transition-all ${
                petType === type.id
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type.name}
            </button>
          ))}
        </div>
      </div>

      {/* 年龄 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">年龄段</label>
        <div className="grid grid-cols-2 gap-2">
          {ageOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setAge(option.id)}
              className={`px-4 py-3 rounded-xl text-left transition-all ${
                age === option.id
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {option.name}
            </button>
          ))}
        </div>
      </div>

      {/* 行为描述 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          行为表现描述
        </label>
        <textarea
          value={behaviors}
          onChange={(e) => setBehaviors(e.target.value)}
          placeholder="描述一下你爱宠的日常行为，比如：&#10;- 喜欢粘着人还是独立？&#10;- 对新环境反应如何？&#10;- 和其他宠物/人相处怎样？&#10;- 有什么特别的习惯？"
          rows={5}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all resize-none"
        />
      </div>

      {/* 分析按钮 */}
      <button
        onClick={analyzePersonality}
        disabled={loading}
        className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 animate-spin" />
            AI 分析中...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Brain className="w-5 h-5" />
            开始分析
          </span>
        )}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl text-center">
          {error}
        </div>
      )}

      {/* 分析结果 */}
      {analysis && (
        <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            性格分析报告
          </h3>
          <div className="prose prose-purple max-w-none">
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {analysis}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

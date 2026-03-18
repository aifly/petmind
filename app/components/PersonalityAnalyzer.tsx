'use client';

import { useState } from 'react';
import { Brain, Sparkles, ChevronLeft, PawPrint, Calendar, MessageCircle, Wand2, Loader2 } from 'lucide-react';

const petTypes = [
  { id: 'cat', name: '猫咪', emoji: '🐱', color: 'bg-orange-500', textColor: 'text-orange-600', lightBg: 'bg-orange-50' },
  { id: 'dog', name: '狗狗', emoji: '🐕', color: 'bg-amber-600', textColor: 'text-amber-600', lightBg: 'bg-amber-50' },
  { id: 'bird', name: '鸟类', emoji: '🐦', color: 'bg-sky-500', textColor: 'text-sky-600', lightBg: 'bg-sky-50' },
  { id: 'rabbit', name: '兔子', emoji: '🐰', color: 'bg-rose-500', textColor: 'text-rose-600', lightBg: 'bg-rose-50' },
  { id: 'hamster', name: '仓鼠', emoji: '🐹', color: 'bg-yellow-500', textColor: 'text-yellow-600', lightBg: 'bg-yellow-50' },
];

const ageOptions = [
  { id: 'baby', name: '幼年期', desc: '0-1岁', emoji: '🍼' },
  { id: 'young', name: '青年期', desc: '1-3岁', emoji: '🎾' },
  { id: 'adult', name: '成年期', desc: '3-7岁', emoji: '🌟' },
  { id: 'senior', name: '老年期', desc: '7岁+', emoji: '🎋' },
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
    setAnalysis('');
    
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
                <Brain className="w-5 h-5" />
                性格分析
              </h2>
              <p className="text-gray-400 text-sm">AI 深度解析你爱宠的性格特点</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Pet Type Selection */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <PawPrint className="w-4 h-4 text-gray-500" aria-hidden="true" />
              选择宠物类型
            </label>
            <div className="grid grid-cols-5 gap-2">
              {petTypes.map((type) => {
                const isSelected = petType === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => setPetType(type.id)}
                    onKeyDown={(e) => e.key === 'Enter' && setPetType(type.id)}
                    aria-pressed={isSelected}
                    className={`flex flex-col items-center p-3 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 ${
                      isSelected 
                        ? type.color + ' text-white shadow-md' 
                        : type.lightBg + ' hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-2xl mb-1" aria-hidden="true">{type.emoji}</span>
                    <span className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-gray-600'}`}>
                      {type.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Age Selection */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <Calendar className="w-4 h-4 text-gray-500" aria-hidden="true" />
              年龄阶段
            </label>
            <div className="grid grid-cols-4 gap-2">
              {ageOptions.map((option) => {
                const isSelected = age === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => setAge(option.id)}
                    onKeyDown={(e) => e.key === 'Enter' && setAge(option.id)}
                    aria-pressed={isSelected}
                    className={`p-3 rounded-xl transition-all text-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 ${
                      isSelected
                        ? 'bg-gray-900 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="text-xl mb-1 block" aria-hidden="true">{option.emoji}</span>
                    <span className="text-sm font-medium block">{option.name}</span>
                    <span className={`text-xs ${isSelected ? 'text-gray-400' : 'text-gray-500'}`}>
                      {option.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Behavior Description */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <MessageCircle className="w-4 h-4 text-gray-500" aria-hidden="true" />
              行为表现描述
            </label>
            <textarea
              value={behaviors}
              onChange={(e) => setBehaviors(e.target.value)}
              placeholder="描述一下你爱宠的日常行为，比如：

• 喜欢粘着人还是独立？
• 对新环境反应如何？
• 和其他宠物/人相处怎样？
• 有什么特别的习惯？"
              rows={5}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-200 focus:outline-none transition-all resize-none text-gray-700 placeholder:text-gray-400"
            />
            <p className="text-xs text-gray-400 mt-2 text-right">描述越详细，分析越准确</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-center text-sm">
              {error}
            </div>
          )}

          {/* Analyze Button */}
          <button
            onClick={analyzePersonality}
            disabled={loading}
            className="w-full py-3.5 bg-gray-900 text-white font-medium rounded-xl shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                AI 分析中…
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" aria-hidden="true" />
                开始深度分析
              </>
            )}
          </button>

          {/* Analysis Result */}
          {analysis && (
            <div className="p-5 bg-gray-50 rounded-xl border border-gray-200 animate-fade-in">
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                性格分析报告
              </h3>
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm">
                {analysis}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

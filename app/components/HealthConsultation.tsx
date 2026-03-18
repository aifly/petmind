'use client';

import { useState } from 'react';
import { Heart, ChevronLeft, Stethoscope, Loader2, Send } from 'lucide-react';

const commonIssues = [
  { id: 'digestion', name: '消化问题', emoji: '🤢' },
  { id: 'skin', name: '皮肤问题', emoji: '🩹' },
  { id: 'behavior', name: '行为异常', emoji: '😾' },
  { id: 'eyes', name: '眼睛问题', emoji: '👁️' },
  { id: 'ears', name: '耳朵问题', emoji: '👂' },
  { id: 'teeth', name: '牙齿口腔', emoji: '🦷' },
  { id: 'joints', name: '关节问题', emoji: '🦴' },
  { id: 'breathing', name: '呼吸问题', emoji: '😮‍💨' },
];

const petTypes = [
  { id: 'cat', name: '猫咪', emoji: '🐱' },
  { id: 'dog', name: '狗狗', emoji: '🐕' },
  { id: 'bird', name: '鸟类', emoji: '🐦' },
  { id: 'rabbit', name: '兔子', emoji: '🐰' },
  { id: 'other', name: '其他', emoji: '🐾' },
];

interface HealthConsultationProps {
  onBack: () => void;
}

export default function HealthConsultation({ onBack }: HealthConsultationProps) {
  const [petType, setPetType] = useState('dog');
  const [selectedIssue, setSelectedIssue] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [duration, setDuration] = useState('');
  const [advice, setAdvice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getAdvice = async () => {
    if (!selectedIssue || !symptoms.trim()) {
      setError('请选择问题类型并描述症状');
      return;
    }

    setLoading(true);
    setError('');
    setAdvice('');
    
    try {
      const response = await fetch('/api/health-consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ petType, issue: selectedIssue, symptoms, duration }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setAdvice(data.advice);
    } catch (err) {
      setError('获取建议失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
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
                <Stethoscope className="w-5 h-5" />
                健康咨询
              </h2>
              <p className="text-gray-400 text-sm">AI 提供初步健康建议（仅供参考）</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Pet Type */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <span className="text-gray-500" aria-hidden="true">🐾</span>
              宠物类型
            </label>
            <div className="flex flex-wrap gap-2">
              {petTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setPetType(type.id)}
                  aria-pressed={petType === type.id}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 ${
                    petType === type.id
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type.emoji} {type.name}
                </button>
              ))}
            </div>
          </div>

          {/* Issue Type */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <Heart className="w-4 h-4 text-gray-500" aria-hidden="true" />
              问题类型
            </label>
            <div className="grid grid-cols-4 gap-2">
              {commonIssues.map((issue) => (
                <button
                  key={issue.id}
                  onClick={() => setSelectedIssue(issue.id)}
                  aria-pressed={selectedIssue === issue.id}
                  className={`p-3 rounded-xl text-center transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 ${
                    selectedIssue === issue.id
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="text-xl block mb-1" aria-hidden="true">{issue.emoji}</span>
                  <span className="text-xs font-medium">{issue.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Symptoms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              详细症状描述
            </label>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="描述宠物的具体症状，如：呕吐频率、皮肤红肿部位、精神状态等…"
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-200 focus:outline-none transition-all resize-none text-gray-700 placeholder:text-gray-400"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              持续时间
            </label>
            <div className="flex gap-2">
              {['今天', '1-3天', '1周以内', '1周以上'].map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`px-4 py-2 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 ${
                    duration === d
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Warning */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-sm text-amber-800">
              <strong>⚠️ 免责声明：</strong>本服务仅提供一般性健康建议，不能替代专业兽医诊断。如症状严重，请立即就医。
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-center text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={getAdvice}
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
                <Send className="w-4 h-4" aria-hidden="true" />
                获取健康建议
              </>
            )}
          </button>

          {/* Advice Result */}
          {advice && (
            <div className="p-5 bg-gray-50 rounded-xl border border-gray-200 animate-fade-in">
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Stethoscope className="w-4 h-4" aria-hidden="true" />
                健康建议
              </h3>
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm">
                {advice}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

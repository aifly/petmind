'use client';

import { useState } from 'react';
import { Camera, ChevronLeft, Upload, Loader2, Sparkles, Dog, Cat, Bird, Fish, Rabbit } from 'lucide-react';
import toast from 'react-hot-toast';

interface PetInfo {
  type: string;
  breed: string;
  color: string;
  features: string[];
  healthNotes: string[];
  confidence: number;
}

const petIcons: Record<string, any> = {
  dog: Dog,
  cat: Cat,
  bird: Bird,
  fish: Fish,
  rabbit: Rabbit,
};

interface PhotoAnalyzerProps {
  onBack: () => void;
}

export default function PhotoAnalyzer({ onBack }: PhotoAnalyzerProps) {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<string>('');

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('图片大小不能超过 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target?.result as string);
      setResult('');
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async () => {
    if (!image) {
      toast.error('请先上传图片');
      return;
    }

    setAnalyzing(true);
    setResult('');

    try {
      const response = await fetch('/api/analyze-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setResult(data.analysis);
    } catch (error: any) {
      toast.error(error.message || '分析失败，请重试');
    } finally {
      setAnalyzing(false);
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
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="返回"
            >
              <ChevronLeft className="w-5 h-5 text-gray-300" />
            </button>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Camera className="w-5 h-5" />
                AI 照片识别
              </h2>
              <p className="text-gray-400 text-sm">上传宠物照片，AI 帮你识别品种和健康状态</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Upload Area */}
          <div className="mb-6">
            <label
              className={`relative block w-full h-64 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
                image
                  ? 'border-gray-300 bg-gray-50'
                  : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
              }`}
            >
              {image ? (
                <img
                  src={image}
                  alt="上传的宠物照片"
                  className="w-full h-full object-contain rounded-2xl"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                  <Upload className="w-12 h-12 mb-3" />
                  <p className="text-lg font-medium">点击上传宠物照片</p>
                  <p className="text-sm mt-1">支持 JPG、PNG，最大 10MB</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </label>
          </div>

          {/* Analyze Button */}
          <button
            onClick={analyzeImage}
            disabled={!image || analyzing}
            className="w-full py-3.5 bg-gray-900 text-white font-medium rounded-xl shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                AI 分析中…
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                开始识别
              </>
            )}
          </button>

          {/* Result */}
          {result && (
            <div className="mt-6 p-5 bg-gray-50 rounded-xl border border-gray-200 animate-fade-in">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                识别结果
              </h3>
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm">
                {result}
              </div>
            </div>
          )}

          {/* Tips */}
          {!image && (
            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">📸 拍照建议</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 光线充足，宠物面部清晰可见</li>
                <li>• 侧面或正面照效果更佳</li>
                <li>• 避免模糊或过度曝光的照片</li>
                <li>• 可识别品种、毛色、健康状态等</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

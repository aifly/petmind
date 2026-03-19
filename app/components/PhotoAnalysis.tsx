'use client';

import { useState, useEffect } from 'react';
import { Camera, ChevronLeft, Upload, Sparkles, Loader2, Dog, Heart, Smile } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

const analysisTypes = [
  { id: 'breed', name: '品种识别', desc: '识别品种和特征', icon: Dog },
  { id: 'health', name: '健康检查', desc: '初步健康评估', icon: Heart },
  { id: 'emotion', name: '情绪解读', desc: '了解它的心情', icon: Smile },
];

interface PhotoAnalysisProps {
  onBack: () => void;
}

export default function PhotoAnalysis({ onBack }: PhotoAnalysisProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [analysisType, setAnalysisType] = useState('breed');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('请选择图片文件');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('图片大小不能超过 10MB');
        return;
      }
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setResult('');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file?.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setResult('');
    }
  };

  const analyze = async () => {
    if (!selectedFile) {
      toast.error('请先上传图片');
      return;
    }

    setLoading(true);
    setResult('');

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('analysisType', analysisType);

      const response = await fetch('/api/photo-analysis', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setResult(data.result);
    } catch (error: any) {
      toast.error(error.message || '分析失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    setSelectedFile(null);
    setPreview('');
    setResult('');
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
              <p className="text-gray-400 text-sm">上传宠物照片，AI 帮你分析</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Analysis Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">选择分析类型</label>
            <div className="grid grid-cols-3 gap-3">
              {analysisTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setAnalysisType(type.id)}
                    className={`p-4 rounded-xl transition-all ${
                      analysisType === type.id
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="w-6 h-6 mx-auto mb-2" />
                    <span className="font-medium block">{type.name}</span>
                    <span className={`text-xs ${analysisType === type.id ? 'text-gray-300' : 'text-gray-500'}`}>
                      {type.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Upload Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">上传宠物照片</label>
            
            {!preview ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  dragOver ? 'border-gray-500 bg-gray-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-1">点击或拖拽上传图片</p>
                <p className="text-gray-400 text-sm">支持 JPG、PNG 格式，最大 10MB</p>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-xl"
                />
                <button
                  onClick={clearImage}
                  className="absolute top-3 right-3 px-3 py-1.5 bg-black/60 text-white text-sm rounded-lg hover:bg-black/80 transition-colors"
                >
                  更换图片
                </button>
              </div>
            )}
          </div>

          {/* Analyze Button */}
          <button
            onClick={analyze}
            disabled={loading || !selectedFile}
            className="w-full py-3.5 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                AI 分析中…
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                开始分析
              </>
            )}
          </button>

          {/* Result */}
          {result && (
            <div className="p-5 bg-gray-50 rounded-xl border border-gray-200 animate-fade-in">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                分析结果
              </h3>
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm">
                {result}
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">📸 拍照小贴士</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 光线充足，避免逆光</li>
              <li>• 正面照更有利于品种识别</li>
              <li>• 健康检查需要清晰的五官照片</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

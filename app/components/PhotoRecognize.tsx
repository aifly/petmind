'use client';

import { useState, useEffect, useRef } from 'react';
import { Camera, Upload, Loader2, Sparkles, ChevronLeft, PawPrint, Heart, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

interface Pet {
  id: string;
  name: string;
  type: string;
  breed?: string;
}

const petTypes = [
  { id: 'dog', name: '狗狗', emoji: '🐕' },
  { id: 'cat', name: '猫咪', emoji: '🐱' },
  { id: 'bird', name: '鸟类', emoji: '🐦' },
  { id: 'rabbit', name: '兔子', emoji: '🐰' },
  { id: 'other', name: '其他', emoji: '🐾' },
];

interface PhotoRecognizeProps {
  onBack: () => void;
}

export default function PhotoRecognize({ onBack }: PhotoRecognizeProps) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchPets(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) fetchPets(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchPets = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('pets')
        .select('id, name, type, breed')
        .eq('user_id', userId);
      setPets(data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('请选择图片文件');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('图片大小不能超过 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
      setResult('');
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async () => {
    if (!image) return;

    setAnalyzing(true);
    setResult('');

    try {
      const response = await fetch('/api/photo-recognize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          image: image,
          petType: selectedPet?.type,
        }),
      });
      const data = await response.json();
      
      if (data.error) throw new Error(data.error);
      setResult(data.result || '识别完成');
    } catch (error: any) {
      toast.error(error.message || '识别失败，请重试');
    } finally {
      setAnalyzing(false);
    }
  };

  const getPetEmoji = (type: string) => {
    return petTypes.find(t => t.id === type)?.emoji || '🐾';
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
              <p className="text-gray-400 text-sm">上传照片，AI 帮你识别宠物品种和健康状态</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Select Pet */}
          {pets.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                关联宠物（可选）
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedPet(null)}
                  className={`px-4 py-2 rounded-xl text-sm transition-all ${
                    !selectedPet
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  不关联
                </button>
                {pets.map((pet) => (
                  <button
                    key={pet.id}
                    onClick={() => setSelectedPet(pet)}
                    className={`px-4 py-2 rounded-xl text-sm transition-all flex items-center gap-2 ${
                      selectedPet?.id === pet.id
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span>{getPetEmoji(pet.type)}</span>
                    <span>{pet.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              上传照片
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                image
                  ? 'border-gray-300 bg-gray-50'
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }`}
            >
              {image ? (
                <div className="relative">
                  <img
                    src={image}
                    alt="Selected"
                    className="max-h-64 mx-auto rounded-xl"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setImage(null);
                      setResult('');
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600 mb-1">点击上传宠物照片</p>
                  <p className="text-gray-400 text-sm">支持 JPG、PNG，大小不超过 10MB</p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>

          {/* Notice */}
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
            <div className="flex gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">识别范围</p>
                <ul className="text-amber-700 space-y-0.5">
                  <li>• 宠物品种识别</li>
                  <li>• 外观特征描述</li>
                  <li>• 健康状态初步判断（仅供参考）</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Analyze Button */}
          <button
            onClick={analyzeImage}
            disabled={!image || analyzing}
            className="w-full py-3.5 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                AI 识别中…
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
            <div className="p-5 bg-gray-50 rounded-xl border border-gray-200 animate-fade-in">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                识别结果
              </h3>
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm">
                {result}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

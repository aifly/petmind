'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag, Star, ChevronLeft, PawPrint, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

interface Pet {
  id: string;
  name: string;
  type: string;
  breed?: string;
  age?: number;
}

const petTypes = [
  { id: 'dog', name: '狗狗', emoji: '🐕' },
  { id: 'cat', name: '猫咪', emoji: '🐱' },
  { id: 'bird', name: '鸟类', emoji: '🐦' },
  { id: 'rabbit', name: '兔子', emoji: '🐰' },
  { id: 'hamster', name: '仓鼠', emoji: '🐹' },
  { id: 'fish', name: '鱼类', emoji: '🐠' },
  { id: 'other', name: '其他', emoji: '🐾' },
];

const categories = [
  { id: 'food', name: '主粮', icon: '🍚' },
  { id: 'snack', name: '零食', icon: '🦴' },
  { id: 'toy', name: '玩具', icon: '🎾' },
  { id: 'health', name: '保健', icon: '💊' },
  { id: 'supply', name: '用品', icon: '🏠' },
  { id: 'clean', name: '清洁', icon: '🛁' },
];

interface ProductRecommendationProps {
  onBack: () => void;
}

export default function ProductRecommendation({ onBack }: ProductRecommendationProps) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('food');
  const [recommendations, setRecommendations] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [user, setUser] = useState<any>(null);

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
        .select('*')
        .eq('user_id', userId);
      setPets(data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const getRecommendations = async () => {
    if (!selectedPet && !selectedCategory) {
      toast.error('请选择宠物或用品类别');
      return;
    }

    setGenerating(true);
    setRecommendations('');

    const petTypeName = selectedPet 
      ? petTypes.find(t => t.id === selectedPet.type)?.name || '宠物'
      : '宠物';
    const categoryName = categories.find(c => c.id === selectedCategory)?.name || '宠物用品';

    const prompt = `作为宠物用品推荐专家，请根据以下信息推荐合适的宠物用品：

${selectedPet ? `宠物名字：${selectedPet.name}
宠物品种：${selectedPet.breed || '普通'}` : ''}
宠物类型：${petTypeName}
用品类别：${categoryName}

请为每种推荐的产品提供：
1. 产品名称
2. 适用年龄/体重范围
3. 主要特点
4. 推荐理由

请推荐 3-5 款具体的产品，用简洁的中文描述。`;

    try {
      const response = await fetch('/api/generate-names', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, type: 'feeding' }),
      });
      const data = await response.json();
      
      if (data.error) throw new Error(data.error);
      setRecommendations(data.advice || data.names?.[0]?.meaning || '推荐生成完成');
    } catch (error: any) {
      toast.error(error.message || '生成失败');
    } finally {
      setGenerating(false);
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
                <ShoppingBag className="w-5 h-5" />
                宠物用品推荐
              </h2>
              <p className="text-gray-400 text-sm">AI 为你推荐合适的宠物用品</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Select Pet */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              选择宠物（可选）
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
                通用推荐
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

          {/* Select Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              用品类别
            </label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`p-3 rounded-xl text-center transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span className="text-2xl block mb-1">{cat.icon}</span>
                  <span className="text-sm">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={getRecommendations}
            disabled={generating}
            className="w-full py-3.5 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                AI 推荐中…
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                获取推荐
              </>
            )}
          </button>

          {/* Recommendations */}
          {recommendations && (
            <div className="p-5 bg-gray-50 rounded-xl border border-gray-200 animate-fade-in">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500" />
                推荐结果
              </h3>
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm">
                {recommendations}
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">💡 购买小贴士</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 根据宠物年龄和体重选择合适的产品</li>
              <li>• 优先选择口碑好的品牌</li>
              <li>• 注意查看产品成分和保质期</li>
              <li>• 首次购买可先买小包装试用</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

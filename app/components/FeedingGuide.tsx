'use client';

import { useState, useEffect } from 'react';
import { Utensils, ChevronLeft, PawPrint, Scale, Calendar, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

interface Pet {
  id: string;
  name: string;
  type: string;
  breed?: string;
  gender?: string;
  birth_date?: string;
  weight?: number;
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

interface FeedingGuideProps {
  onBack: () => void;
}

export default function FeedingGuide({ onBack }: FeedingGuideProps) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [advice, setAdvice] = useState('');
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
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPets(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const now = new Date();
    const years = now.getFullYear() - birth.getFullYear();
    const months = now.getMonth() - birth.getMonth() + years * 12;
    return { years, months };
  };

  const generateAdvice = async (pet: Pet) => {
    setGenerating(true);
    setAdvice('');

    const age = calculateAge(pet.birth_date);
    const petTypeName = petTypes.find(t => t.id === pet.type)?.name || '宠物';

    const prompt = `作为专业宠物营养师，请为以下宠物提供详细的喂养建议：

宠物类型：${petTypeName}
品种：${pet.breed || '未知'}
性别：${pet.gender === 'male' ? '公' : pet.gender === 'female' ? '母' : '未知'}
年龄：${age ? (age.years > 0 ? `${age.years}岁` : `${age.months}个月`) : '未知'}
体重：${pet.weight ? pet.weight + 'kg' : '未知'}

请提供：
1. 每日喂食量建议（具体克数或次数）
2. 推荐食物类型和品牌建议
3. 喂食时间安排
4. 需要补充的营养品
5. 禁忌食物清单
6. 特殊注意事项

请用简洁清晰的格式回答。`;

    try {
      const response = await fetch('/api/generate-names', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, type: 'feeding' }),
      });
      const data = await response.json();
      
      if (data.error) throw new Error(data.error);
      setAdvice(data.advice || data.names?.[0]?.meaning || '生成失败，请重试');
    } catch (error: any) {
      toast.error(error.message || '生成失败，请重试');
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
                <Utensils className="w-5 h-5" />
                智能喂养建议
              </h2>
              <p className="text-gray-400 text-sm">AI 为你的宠物定制喂养方案</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12 text-gray-400">加载中…</div>
          ) : pets.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🐾</div>
              <p className="text-gray-500 mb-2">还没有添加宠物</p>
              <p className="text-gray-400 text-sm">请先在宠物档案中添加你的毛孩子</p>
            </div>
          ) : (
            <>
              <p className="text-gray-600 mb-4">选择一只宠物获取专属喂养建议：</p>
              <div className="space-y-3">
                {pets.map((pet) => (
                  <button
                    key={pet.id}
                    onClick={() => {
                      setSelectedPet(pet);
                      generateAdvice(pet);
                    }}
                    className={`w-full p-4 rounded-xl border transition-all text-left flex items-center gap-4 ${
                      selectedPet?.id === pet.id
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                      selectedPet?.id === pet.id ? 'bg-white/20' : 'bg-gray-200'
                    }`}>
                      {getPetEmoji(pet.type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{pet.name}</h3>
                      <p className={`text-sm ${selectedPet?.id === pet.id ? 'text-gray-300' : 'text-gray-500'}`}>
                        {petTypes.find(t => t.id === pet.type)?.name}
                        {pet.breed && ` · ${pet.breed}`}
                        {pet.weight && ` · ${pet.weight}kg`}
                      </p>
                    </div>
                    {selectedPet?.id === pet.id && generating && (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Advice Result */}
          {advice && (
            <div className="mt-6 p-5 bg-gray-50 rounded-xl border border-gray-200 animate-fade-in">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                喂养建议
              </h3>
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm">
                {advice}
              </div>
            </div>
          )}

          {/* Quick Tips */}
          {pets.length > 0 && !selectedPet && (
            <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <h4 className="font-medium text-amber-800 mb-2">💡 喂养小贴士</h4>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• 定时定量喂食，避免暴饮暴食</li>
                <li>• 保证充足的饮水</li>
                <li>• 根据年龄和体重调整食量</li>
                <li>• 避免喂食人类食物</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

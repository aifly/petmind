'use client';

import { useState, useEffect } from 'react';
import { Dog, Cat, Bird, Rabbit, Search, Trash2, ChevronDown, ChevronUp, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Pet {
  id: string;
  name: string;
  type: string;
  breed: string;
  birth_date: string;
  gender: string;
  weight: number;
  avatar: string | null;
  user_id: string;
  created_at: string;
  users?: { email: string };
}

interface PetStats {
  total: number;
  dogs: number;
  cats: number;
  others: number;
}

const typeIcons: Record<string, any> = {
  dog: Dog,
  cat: Cat,
  bird: Bird,
  rabbit: Rabbit,
};

const typeNames: Record<string, string> = {
  dog: '狗狗',
  cat: '猫咪',
  bird: '鸟类',
  rabbit: '兔子',
  hamster: '仓鼠',
  fish: '鱼类',
  other: '其他',
};

export default function PetsPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [filteredPets, setFilteredPets] = useState<Pet[]>([]);
  const [stats, setStats] = useState<PetStats>({ total: 0, dogs: 0, cats: 0, others: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPet, setExpandedPet] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchPets();
  }, []);

  useEffect(() => {
    // 搜索过滤
    if (!searchQuery.trim()) {
      setFilteredPets(pets);
      return;
    }
    const query = searchQuery.toLowerCase();
    const filtered = pets.filter(pet => 
      pet.name.toLowerCase().includes(query) ||
      pet.breed.toLowerCase().includes(query) ||
      pet.users?.email?.toLowerCase().includes(query)
    );
    setFilteredPets(filtered);
  }, [searchQuery, pets]);

  const fetchPets = async () => {
    setLoading(true);
    try {
      // 分别获取宠物列表和用户信息
      const [{ data: petsData, error: petsError }, { data: usersData, error: usersError }] = await Promise.all([
        supabase.from('pets').select('*').order('created_at', { ascending: false }),
        supabase.from('users').select('id, email')
      ]);

      if (petsError) throw petsError;

      // 构建用户邮箱映射
      const userEmailMap: Record<string, string> = {};
      usersData?.forEach((u: any) => {
        userEmailMap[u.id] = u.email;
      });

      // 合并数据
      const petsWithUsers = (petsData || []).map((pet: any) => ({
        ...pet,
        users: { email: userEmailMap[pet.user_id] || (pet.user_id?.startsWith('device_') ? '匿名用户' : pet.user_id) }
      }));

      setPets(petsWithUsers);
      setFilteredPets(petsWithUsers);

      // 计算统计
      const stats = {
        total: petsWithUsers.length,
        dogs: petsWithUsers.filter(p => p.type === 'dog').length,
        cats: petsWithUsers.filter(p => p.type === 'cat').length,
        others: petsWithUsers.filter(p => !['dog', 'cat'].includes(p.type)).length,
      };
      setStats(stats);
    } catch (error) {
      console.error('获取宠物列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return '未知';
    const birth = new Date(birthDate);
    const now = new Date();
    const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    if (months < 12) return `${months}个月`;
    const years = Math.floor(months / 12);
    return `${years}岁`;
  };

  const handleDelete = async (petId: string) => {
    try {
      const { error } = await supabase
        .from('pets')
        .delete()
        .eq('id', petId);

      if (error) throw error;

      setPets(pets.filter(p => p.id !== petId));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('删除宠物失败:', error);
      alert('删除失败，请重试');
    }
  };

  const getTypeIcon = (type: string) => {
    const Icon = typeIcons[type] || Dog;
    return <Icon size={20} />;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">宠物管理</h1>
        <p className="text-sm text-gray-500 mt-1">管理平台所有宠物信息</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <Dog size={24} className="text-gray-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">总宠物数</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <Dog size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.dogs}</p>
              <p className="text-sm text-gray-500">狗狗</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
              <Cat size={24} className="text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.cats}</p>
              <p className="text-sm text-gray-500">猫咪</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <Bird size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.others}</p>
              <p className="text-sm text-gray-500">其他</p>
            </div>
          </div>
        </div>
      </div>

      {/* 搜索栏 */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索宠物名称、品种或用户邮箱..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all"
          />
        </div>
      </div>

      {/* 宠物列表 */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-semibold text-gray-900">宠物列表</h2>
          <span className="text-sm text-gray-500">共 {filteredPets.length} 只</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">加载中...</div>
        ) : filteredPets.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Dog size={32} className="text-gray-400" />
            </div>
            <p className="text-gray-500">暂无宠物数据</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredPets.map((pet) => (
              <div key={pet.id} className="group">
                {/* 主行 */}
                <div 
                  className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setExpandedPet(expandedPet === pet.id ? null : pet.id)}
                >
                  {/* 展开图标 */}
                  <button className="text-gray-400 hover:text-gray-600">
                    {expandedPet === pet.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>

                  {/* 宠物头像/图标 */}
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    {pet.avatar ? (
                      <img src={pet.avatar} alt={pet.name} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <span className="text-gray-600">{getTypeIcon(pet.type)}</span>
                    )}
                  </div>

                  {/* 宠物信息 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{pet.name}</span>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {typeNames[pet.type] || pet.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {pet.breed} · {calculateAge(pet.birth_date)} · {pet.gender === 'male' ? '公' : '母'}
                    </p>
                  </div>

                  {/* 所属用户 */}
                  <div className="hidden md:block w-48 text-sm text-gray-500 truncate">
                    {pet.users?.email || '未知用户'}
                  </div>

                  {/* 注册时间 */}
                  <div className="hidden sm:block text-sm text-gray-400 w-28">
                    {new Date(pet.created_at).toLocaleDateString('zh-CN')}
                  </div>

                  {/* 删除按钮 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirm(pet.id);
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* 展开详情 */}
                {expandedPet === pet.id && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">体重</p>
                        <p className="font-medium text-gray-900">{pet.weight} kg</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">出生日期</p>
                        <p className="font-medium text-gray-900">{pet.birth_date || '未设置'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">用户ID</p>
                        <p className="font-medium text-gray-900 text-xs truncate">{pet.user_id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">宠物ID</p>
                        <p className="font-medium text-gray-900 text-xs truncate">{pet.id}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 删除确认弹窗 */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">确认删除</h3>
                <p className="text-sm text-gray-500">此操作不可撤销</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              确定要删除宠物 "{pets.find(p => p.id === deleteConfirm)?.name}" 吗？相关数据将全部删除。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

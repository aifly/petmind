'use client';

import { useState, useEffect } from 'react';
import { PawPrint, Plus, Calendar, Scale, Heart, Trash2, ChevronRight, Syringe, Edit2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

interface PetProfile {
  id: string;
  user_id: string;
  name: string;
  type: string;
  breed?: string;
  gender?: string;
  birth_date?: string;
  weight?: number;
  photo_url?: string;
  notes?: string;
  created_at: string;
}

interface VaccineRecord {
  id: string;
  pet_id: string;
  name: string;
  date: string;
  next_date?: string;
  hospital?: string;
  notes?: string;
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

const genderOptions = [
  { id: 'male', name: '公', emoji: '♂️' },
  { id: 'female', name: '母', emoji: '♀️' },
  { id: 'unknown', name: '未知', emoji: '?' },
];

interface PetProfileProps {
  onBack: () => void;
}

export default function PetProfile({ onBack }: PetProfileProps) {
  const [pets, setPets] = useState<PetProfile[]>([]);
  const [selectedPet, setSelectedPet] = useState<PetProfile | null>(null);
  const [vaccines, setVaccines] = useState<VaccineRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showVaccineModal, setShowVaccineModal] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [newPet, setNewPet] = useState({
    name: '',
    type: 'dog',
    breed: '',
    gender: 'unknown',
    birth_date: '',
    weight: '',
    notes: '',
  });

  const [editPet, setEditPet] = useState({
    id: '',
    name: '',
    type: 'dog',
    breed: '',
    gender: 'unknown',
    birth_date: '',
    weight: '',
    notes: '',
  });

  const [newVaccine, setNewVaccine] = useState({
    name: '',
    date: '',
    next_date: '',
    hospital: '',
    notes: '',
  });

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
      if (session?.user) {
        fetchPets(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchPets = async (userId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPets(data || []);
    } catch (error: any) {
      if (error?.code !== 'PGRST116') {
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchVaccines = async (petId: string) => {
    try {
      const { data, error } = await supabase
        .from('vaccines')
        .select('*')
        .eq('pet_id', petId)
        .order('date', { ascending: false });

      if (error) throw error;
      setVaccines(data || []);
    } catch (error) {
      console.error('Error fetching vaccines:', error);
    }
  };

  const addPet = async () => {
    if (!newPet.name.trim()) {
      toast.error('请输入宠物名字');
      return;
    }
    if (!user) {
      toast.error('请先登录');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('pets')
        .insert({
          user_id: user.id,
          name: newPet.name,
          type: newPet.type,
          breed: newPet.breed || null,
          gender: newPet.gender,
          birth_date: newPet.birth_date || null,
          weight: newPet.weight ? parseFloat(newPet.weight) : null,
          notes: newPet.notes || null,
        })
        .select()
        .single();

      if (error) throw error;
      setPets([data, ...pets]);
      setNewPet({ name: '', type: 'dog', breed: '', gender: 'unknown', birth_date: '', weight: '', notes: '' });
      setShowAddModal(false);
      toast.success('添加成功！');
    } catch (error: any) {
      toast.error(error.message || '添加失败，请重试');
    }
  };

  const updatePet = async () => {
    if (!editPet.name.trim()) {
      toast.error('请输入宠物名字');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('pets')
        .update({
          name: editPet.name,
          type: editPet.type,
          breed: editPet.breed || null,
          gender: editPet.gender,
          birth_date: editPet.birth_date || null,
          weight: editPet.weight ? parseFloat(editPet.weight) : null,
          notes: editPet.notes || null,
        })
        .eq('id', editPet.id)
        .select()
        .single();

      if (error) throw error;
      
      setPets(pets.map(p => p.id === editPet.id ? data : p));
      setSelectedPet(data);
      setShowEditModal(false);
      toast.success('更新成功！');
    } catch (error: any) {
      toast.error(error.message || '更新失败，请重试');
    }
  };

  const openEditModal = (pet: PetProfile) => {
    setEditPet({
      id: pet.id,
      name: pet.name,
      type: pet.type,
      breed: pet.breed || '',
      gender: pet.gender || 'unknown',
      birth_date: pet.birth_date || '',
      weight: pet.weight?.toString() || '',
      notes: pet.notes || '',
    });
    setShowEditModal(true);
  };

  const deletePet = async (id: string) => {
    if (!confirm('确定要删除这个宠物档案吗？')) return;

    try {
      const { error } = await supabase.from('pets').delete().eq('id', id);
      if (error) throw error;
      setPets(pets.filter(p => p.id !== id));
      if (selectedPet?.id === id) {
        setSelectedPet(null);
        setVaccines([]);
      }
      toast.success('删除成功');
    } catch (error: any) {
      toast.error(error.message || '删除失败，请重试');
    }
  };

  const addVaccine = async () => {
    if (!newVaccine.name.trim()) {
      toast.error('请输入疫苗名称');
      return;
    }
    if (!newVaccine.date) {
      toast.error('请选择接种日期');
      return;
    }
    if (!selectedPet) return;

    try {
      const { data, error } = await supabase
        .from('vaccines')
        .insert({
          pet_id: selectedPet.id,
          name: newVaccine.name,
          date: newVaccine.date,
          next_date: newVaccine.next_date || null,
          hospital: newVaccine.hospital || null,
          notes: newVaccine.notes || null,
        })
        .select()
        .single();

      if (error) throw error;
      setVaccines([data, ...vaccines]);
      setNewVaccine({ name: '', date: '', next_date: '', hospital: '', notes: '' });
      setShowVaccineModal(false);
      toast.success('添加成功！');
    } catch (error: any) {
      toast.error(error.message || '添加失败，请重试');
    }
  };

  const deleteVaccine = async (id: string) => {
    try {
      const { error } = await supabase.from('vaccines').delete().eq('id', id);
      if (error) throw error;
      setVaccines(vaccines.filter(v => v.id !== id));
      toast.success('删除成功');
    } catch (error: any) {
      toast.error(error.message || '删除失败，请重试');
    }
  };

  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return '未知';
    const birth = new Date(birthDate);
    const now = new Date();
    const years = now.getFullYear() - birth.getFullYear();
    const months = now.getMonth() - birth.getMonth();
    
    if (years > 0) {
      return `${years}岁${months > 0 ? months + '个月' : ''}`;
    }
    return `${Math.max(0, months + 12 * years)}个月`;
  };

  const getPetEmoji = (type: string) => {
    return petTypes.find(t => t.id === type)?.emoji || '🐾';
  };

  // 宠物详情页
  if (selectedPet) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gray-900 px-6 py-5">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setSelectedPet(null);
                  setVaccines([]);
                }}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="返回"
              >
                <ChevronRight className="w-5 h-5 text-gray-300 rotate-180" />
              </button>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-white">
                  {selectedPet.name} 的档案
                </h2>
              </div>
              <button
                onClick={() => openEditModal(selectedPet)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="编辑"
              >
                <Edit2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => deletePet(selectedPet.id)}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="删除"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Pet Info */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center text-4xl">
                {getPetEmoji(selectedPet.type)}
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900">{selectedPet.name}</h3>
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <PawPrint className="w-4 h-4" />
                    <span>{petTypes.find(t => t.id === selectedPet.type)?.name || '其他'}</span>
                    {selectedPet.breed && <span>· {selectedPet.breed}</span>}
                  </div>
                  {selectedPet.gender && (
                    <div className="flex items-center gap-2">
                      <span>{genderOptions.find(g => g.id === selectedPet.gender)?.emoji}</span>
                      <span>{genderOptions.find(g => g.id === selectedPet.gender)?.name}</span>
                    </div>
                  )}
                  {selectedPet.birth_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{calculateAge(selectedPet.birth_date)}</span>
                    </div>
                  )}
                  {selectedPet.weight && (
                    <div className="flex items-center gap-2">
                      <Scale className="w-4 h-4" />
                      <span>{selectedPet.weight} kg</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {selectedPet.notes && (
              <div className="mt-4 p-3 bg-gray-50 rounded-xl text-sm text-gray-600">
                <Heart className="w-4 h-4 inline mr-2" />
                {selectedPet.notes}
              </div>
            )}
          </div>

          {/* Vaccine Records */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Syringe className="w-5 h-5" />
                疫苗/驱虫记录
              </h3>
              <button
                onClick={() => setShowVaccineModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                添加记录
              </button>
            </div>

            {vaccines.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">暂无记录，点击上方按钮添加</p>
            ) : (
              <div className="space-y-2">
                {vaccines.map((vaccine) => (
                  <div key={vaccine.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{vaccine.name}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          接种日期：{vaccine.date}
                        </p>
                        {vaccine.next_date && (
                          <p className="text-sm text-orange-600 mt-1">
                            下次提醒：{vaccine.next_date}
                          </p>
                        )}
                        {vaccine.hospital && (
                          <p className="text-sm text-gray-500 mt-1">医院：{vaccine.hospital}</p>
                        )}
                      </div>
                      <button
                        onClick={() => deleteVaccine(vaccine.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add Vaccine Modal */}
        {showVaccineModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">添加疫苗/驱虫记录</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">名称</label>
                  <input
                    type="text"
                    value={newVaccine.name}
                    onChange={(e) => setNewVaccine({ ...newVaccine, name: e.target.value })}
                    placeholder="如：狂犬疫苗、体内外驱虫…"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-200 focus:outline-none text-gray-900"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">接种日期</label>
                    <input
                      type="date"
                      value={newVaccine.date}
                      onChange={(e) => setNewVaccine({ ...newVaccine, date: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-200 focus:outline-none text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">下次提醒</label>
                    <input
                      type="date"
                      value={newVaccine.next_date}
                      onChange={(e) => setNewVaccine({ ...newVaccine, next_date: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-200 focus:outline-none text-gray-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">医院（可选）</label>
                  <input
                    type="text"
                    value={newVaccine.hospital}
                    onChange={(e) => setNewVaccine({ ...newVaccine, hospital: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-200 focus:outline-none text-gray-900"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowVaccineModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  取消
                </button>
                <button
                  onClick={addVaccine}
                  className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
                >
                  添加
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Pet Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">编辑宠物信息</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">名字 *</label>
                  <input
                    type="text"
                    value={editPet.name}
                    onChange={(e) => setEditPet({ ...editPet, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-200 focus:outline-none text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">类型</label>
                  <div className="grid grid-cols-4 gap-2">
                    {petTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setEditPet({ ...editPet, type: type.id })}
                        className={`p-2 rounded-lg text-center transition-all ${
                          editPet.type === type.id
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <span className="text-xl block">{type.emoji}</span>
                        <span className="text-xs">{type.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">品种</label>
                  <input
                    type="text"
                    value={editPet.breed}
                    onChange={(e) => setEditPet({ ...editPet, breed: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-200 focus:outline-none text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">性别</label>
                  <div className="flex gap-2">
                    {genderOptions.map((g) => (
                      <button
                        key={g.id}
                        onClick={() => setEditPet({ ...editPet, gender: g.id })}
                        className={`flex-1 py-2 rounded-xl transition-all ${
                          editPet.gender === g.id
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {g.emoji} {g.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">出生日期</label>
                    <input
                      type="date"
                      value={editPet.birth_date}
                      onChange={(e) => setEditPet({ ...editPet, birth_date: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-200 focus:outline-none text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">体重</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editPet.weight}
                      onChange={(e) => setEditPet({ ...editPet, weight: e.target.value })}
                      placeholder="kg"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-200 focus:outline-none text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">备注</label>
                  <textarea
                    value={editPet.notes}
                    onChange={(e) => setEditPet({ ...editPet, notes: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-200 focus:outline-none text-gray-900 resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  取消
                </button>
                <button
                  onClick={updatePet}
                  className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 宠物列表页
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
              <ChevronRight className="w-5 h-5 text-gray-300 rotate-180" />
            </button>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Heart className="w-5 h-5" />
                宠物档案
              </h2>
              <p className="text-gray-400 text-sm">管理你的毛孩子信息</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="添加宠物"
            >
              <Plus className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Pet List */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12 text-gray-400">加载中…</div>
          ) : pets.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🐾</div>
              <p className="text-gray-500">还没有添加宠物</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 px-6 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors"
              >
                添加第一只宠物
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {pets.map((pet) => (
                <button
                  key={pet.id}
                  onClick={() => {
                    setSelectedPet(pet);
                    fetchVaccines(pet.id);
                  }}
                  className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all text-left flex items-center gap-4"
                >
                  <div className="w-14 h-14 bg-gray-200 rounded-xl flex items-center justify-center text-3xl">
                    {getPetEmoji(pet.type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{pet.name}</h3>
                    <p className="text-sm text-gray-500">
                      {petTypes.find(t => t.id === pet.type)?.name}
                      {pet.breed && ` · ${pet.breed}`}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Pet Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">添加宠物</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">名字 *</label>
                <input
                  type="text"
                  value={newPet.name}
                  onChange={(e) => setNewPet({ ...newPet, name: e.target.value })}
                  placeholder="给你的宠物起个名字"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-200 focus:outline-none text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">类型</label>
                <div className="grid grid-cols-4 gap-2">
                  {petTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setNewPet({ ...newPet, type: type.id })}
                      className={`p-2 rounded-lg text-center transition-all ${
                        newPet.type === type.id
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <span className="text-xl block">{type.emoji}</span>
                      <span className="text-xs">{type.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">品种</label>
                <input
                  type="text"
                  value={newPet.breed}
                  onChange={(e) => setNewPet({ ...newPet, breed: e.target.value })}
                  placeholder="如：金毛、英短…"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-200 focus:outline-none text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">性别</label>
                <div className="flex gap-2">
                  {genderOptions.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setNewPet({ ...newPet, gender: g.id })}
                      className={`flex-1 py-2 rounded-xl transition-all ${
                        newPet.gender === g.id
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {g.emoji} {g.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">出生日期</label>
                  <input
                    type="date"
                    value={newPet.birth_date}
                    onChange={(e) => setNewPet({ ...newPet, birth_date: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-200 focus:outline-none text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">体重</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newPet.weight}
                    onChange={(e) => setNewPet({ ...newPet, weight: e.target.value })}
                    placeholder="kg"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-200 focus:outline-none text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">备注</label>
                <textarea
                  value={newPet.notes}
                  onChange={(e) => setNewPet({ ...newPet, notes: e.target.value })}
                  placeholder="有什么特别的信息想记录下来？"
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-200 focus:outline-none text-gray-900 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                取消
              </button>
              <button
                onClick={addPet}
                className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

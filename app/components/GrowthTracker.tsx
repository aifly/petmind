'use client';

import { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Plus, Calendar, Scale, Ruler, Trash2, ChevronLeft, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

interface Pet {
  id: string;
  name: string;
  type: string;
  breed?: string;
  birth_date?: string;
}

interface GrowthRecord {
  id: string;
  pet_id: string;
  date: string;
  weight?: number;
  height?: number;
  notes?: string;
  created_at: string;
}

const petTypes = [
  { id: 'dog', name: '狗狗', emoji: '🐕' },
  { id: 'cat', name: '猫咪', emoji: '🐱' },
  { id: 'bird', name: '鸟类', emoji: '🐦' },
  { id: 'rabbit', name: '兔子', emoji: '🐰' },
  { id: 'other', name: '其他', emoji: '🐾' },
];

interface GrowthTrackerProps {
  onBack: () => void;
}

export default function GrowthTracker({ onBack }: GrowthTrackerProps) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [records, setRecords] = useState<GrowthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [advice, setAdvice] = useState('');
  const [user, setUser] = useState<any>(null);

  const [newRecord, setNewRecord] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: '',
    height: '',
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
      if (session?.user) fetchPets(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchPets = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('pets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      setPets(data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchRecords = async (petId: string) => {
    try {
      const { data } = await supabase
        .from('growth_records')
        .select('*')
        .eq('pet_id', petId)
        .order('date', { ascending: true });
      setRecords(data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const addRecord = async () => {
    if (!selectedPet) return;
    if (!newRecord.weight && !newRecord.height) {
      toast.error('请至少填写体重或身高');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('growth_records')
        .insert({
          pet_id: selectedPet.id,
          date: newRecord.date,
          weight: newRecord.weight ? parseFloat(newRecord.weight) : null,
          height: newRecord.height ? parseFloat(newRecord.height) : null,
          notes: newRecord.notes || null,
        })
        .select()
        .single();

      if (error) throw error;
      setRecords([...records, data].sort((a, b) => a.date.localeCompare(b.date)));
      setNewRecord({ date: new Date().toISOString().split('T')[0], weight: '', height: '', notes: '' });
      setShowAddModal(false);
      toast.success('记录添加成功！');
    } catch (error: any) {
      toast.error(error.message || '添加失败');
    }
  };

  const deleteRecord = async (id: string) => {
    if (!confirm('确定删除这条记录？')) return;

    try {
      const { error } = await supabase.from('growth_records').delete().eq('id', id);
      if (error) throw error;
      setRecords(records.filter(r => r.id !== id));
      toast.success('已删除');
    } catch (error: any) {
      toast.error('删除失败');
    }
  };

  const getAnalysis = async () => {
    if (!selectedPet || records.length < 2) {
      toast.error('至少需要2条记录才能分析');
      return;
    }

    setAnalyzing(true);
    setAdvice('');

    const age = selectedPet.birth_date 
      ? Math.floor((new Date().getTime() - new Date(selectedPet.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      : null;

    const prompt = `作为宠物营养师，请分析以下宠物的生长数据：

宠物名字：${selectedPet.name}
品种：${selectedPet.breed || '未知'}
年龄：${age !== null ? age + '岁' : '未知'}
宠物类型：${petTypes.find(t => t.id === selectedPet.type)?.name || '宠物'}

生长记录数据：
${records.map(r => `- 日期: ${r.date}, 体重: ${r.weight || '未记录'}kg, 身高: ${r.height || '未记录'}cm`).join('\n')}

请提供：
1. 生长趋势分析（体重/身高变化）
2. 是否在正常范围内
3. 建议（喂食、运动等方面）
4. 需要注意的预警信号

请用简洁的中文回答。`;

    try {
      const response = await fetch('/api/generate-names', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, type: 'feeding' }),
      });
      const data = await response.json();
      
      if (data.error) throw new Error(data.error);
      setAdvice(data.advice || data.names?.[0]?.meaning || '分析完成');
    } catch (error: any) {
      toast.error(error.message || '分析失败');
    } finally {
      setAnalyzing(false);
    }
  };

  const getPetEmoji = (type: string) => {
    return petTypes.find(t => t.id === type)?.emoji || '🐾';
  };

  const getChartData = () => {
    return records.map(r => ({
      date: r.date.slice(5),
      weight: r.weight || undefined,
      height: r.height || undefined,
    }));
  };

  const getLatestValues = () => {
    if (records.length === 0) return { weight: null, height: null };
    const latest = records[records.length - 1];
    const first = records[0];
    return {
      weight: latest.weight,
      height: latest.height,
      weightChange: latest.weight && first.weight ? (latest.weight - first.weight).toFixed(1) : null,
      heightChange: latest.height && first.height ? (latest.height - first.height).toFixed(1) : null,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-400">加载中…</div>
      </div>
    );
  }

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
                <TrendingUp className="w-5 h-5" />
                成长记录
              </h2>
              <p className="text-gray-400 text-sm">追踪宠物体重身高变化</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Select Pet */}
          {pets.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🐾</div>
              <p className="text-gray-500 mb-2">还没有添加宠物</p>
              <p className="text-gray-400 text-sm">请先在宠物档案中添加宠物</p>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">选择宠物</label>
                <div className="flex flex-wrap gap-2">
                  {pets.map((pet) => (
                    <button
                      key={pet.id}
                      onClick={() => {
                        setSelectedPet(pet);
                        fetchRecords(pet.id);
                        setAdvice('');
                      }}
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

              {/* Stats */}
              {selectedPet && records.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <Scale className="w-4 h-4" />
                      <span className="text-sm">当前体重</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {getLatestValues().weight} kg
                    </div>
                    {getLatestValues().weightChange && (
                      <div className={`text-sm ${parseFloat(getLatestValues().weightChange!) > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {parseFloat(getLatestValues().weightChange!) > 0 ? '↑' : '↓'} {Math.abs(parseFloat(getLatestValues().weightChange!))} kg
                      </div>
                    )}
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <Ruler className="w-4 h-4" />
                      <span className="text-sm">当前身高</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {getLatestValues().height || '--'} cm
                    </div>
                    {getLatestValues().heightChange && (
                      <div className={`text-sm ${parseFloat(getLatestValues().heightChange!) > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {parseFloat(getLatestValues().heightChange!) > 0 ? '↑' : '↓'} {Math.abs(parseFloat(getLatestValues().heightChange!))} cm
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Chart */}
              {selectedPet && records.length >= 2 && (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getChartData()}>
                      <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                      <YAxis stroke="#9ca3af" fontSize={12} />
                      <Tooltip />
                      {records.some(r => r.weight) && (
                        <Line type="monotone" dataKey="weight" stroke="#374151" strokeWidth={2} name="体重(kg)" />
                      )}
                      {records.some(r => r.height) && (
                        <Line type="monotone" dataKey="height" stroke="#f59e0b" strokeWidth={2} name="身高(cm)" />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* AI Analysis */}
              {selectedPet && records.length >= 2 && (
                <button
                  onClick={getAnalysis}
                  disabled={analyzing}
                  className="w-full py-3 bg-amber-500 text-white font-medium rounded-xl hover:bg-amber-600 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {analyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  {analyzing ? 'AI 分析中…' : 'AI 生长分析'}
                </button>
              )}

              {advice && (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    AI 建议
                  </h4>
                  <p className="text-amber-900 text-sm whitespace-pre-wrap">{advice}</p>
                </div>
              )}

              {/* Records List */}
              {selectedPet && (
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">记录列表</h3>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800"
                  >
                    <Plus className="w-4 h-4" />
                    添加记录
                  </button>
                </div>
              )}

              {selectedPet && records.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>暂无记录，点击上方添加</p>
                </div>
              )}

              {records.length > 0 && (
                <div className="space-y-2">
                  {[...records].reverse().map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{record.date}</span>
                        {record.weight && (
                          <span className="text-gray-600">体重: {record.weight}kg</span>
                        )}
                        {record.height && (
                          <span className="text-gray-600">身高: {record.height}cm</span>
                        )}
                      </div>
                      <button
                        onClick={() => deleteRecord(record.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">添加生长记录</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">日期</label>
                <input
                  type="date"
                  value={newRecord.date}
                  onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-200 focus:outline-none text-gray-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">体重 (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newRecord.weight}
                    onChange={(e) => setNewRecord({ ...newRecord, weight: e.target.value })}
                    placeholder="可选"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-200 focus:outline-none text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">身高 (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newRecord.height}
                    onChange={(e) => setNewRecord({ ...newRecord, height: e.target.value })}
                    placeholder="可选"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-200 focus:outline-none text-gray-900"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">备注</label>
                <textarea
                  value={newRecord.notes}
                  onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
                  rows={2}
                  placeholder="可选备注"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-200 focus:outline-none text-gray-900 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium"
              >
                取消
              </button>
              <button
                onClick={addRecord}
                className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 font-medium"
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

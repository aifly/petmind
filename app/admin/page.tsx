'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Users, PawPrint, TrendingUp, Calendar, Search, ChevronRight, LogOut, Download, Settings, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Stats {
  totalUsers: number;
  totalPets: number;
  totalVaccines: number;
  totalReminders: number;
}

interface User {
  id: string;
  email: string;
  created_at: string;
  petCount?: number;
}

interface PetTypeCount {
  type: string;
  count: number;
}

const ADMIN_EMAIL = 'admin@petmind.ai';

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalPets: 0, totalVaccines: 0, totalReminders: 0 });
  const [users, setUsers] = useState<User[]>([]);
  const [petTypes, setPetTypes] = useState<PetTypeCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showSecret, setShowSecret] = useState(false);
  const [secret, setSecret] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const pageSize = 10;

  // Check if already logged in as admin
  useEffect(() => {
    const adminKey = localStorage.getItem('petmind_admin_key');
    if (adminKey === 'petmind_admin_secret_2024') {
      setIsAuthorized(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthorized) {
      fetchStats();
      fetchUsers();
      fetchPetTypes();
    }
  }, [isAuthorized, currentPage, searchEmail]);

  const handleLogin = () => {
    if (secret === 'petmind_admin_secret_2024') {
      localStorage.setItem('petmind_admin_key', 'petmind_admin_secret_2024');
      setIsAuthorized(true);
    } else {
      alert('密钥错误');
    }
  };

  const fetchStats = async () => {
    try {
      const [{ count: userCount }, { count: petCount }, { count: vaccineCount }, { count: reminderCount }] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('pets').select('*', { count: 'exact', head: true }),
        supabase.from('vaccines').select('*', { count: 'exact', head: true }),
        supabase.from('reminders').select('*', { count: 'exact', head: true }),
      ]);

      setStats({
        totalUsers: userCount || 0,
        totalPets: petCount || 0,
        totalVaccines: vaccineCount || 0,
        totalReminders: reminderCount || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchEmail) {
        query = query.ilike('email', `%${searchEmail}%`);
      }

      const { count } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      setTotalPages(Math.ceil((count || 0) / pageSize));

      const { data: userData, error } = await query
        .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);

      if (error) throw error;

      const usersWithPets = await Promise.all(
        (userData || []).map(async (user) => {
          const { count } = await supabase
            .from('pets')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);
          return { ...user, petCount: count || 0 };
        })
      );

      setUsers(usersWithPets);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPetTypes = async () => {
    try {
      const { data } = await supabase.from('pets').select('type');

      const typeCount: Record<string, number> = {};
      (data || []).forEach((pet) => {
        typeCount[pet.type] = (typeCount[pet.type] || 0) + 1;
      });

      setPetTypes(Object.entries(typeCount).map(([type, count]) => ({ type, count })));
    } catch (error) {
      console.error('Error fetching pet types:', error);
    }
  };

  const getPetTypeName = (type: string) => {
    const names: Record<string, string> = {
      dog: '🐕 狗狗', cat: '🐱 猫咪', bird: '🐦 鸟类', rabbit: '🐰 兔子',
      hamster: '🐹 仓鼠', fish: '🐠 鱼类', other: '🐾 其他',
    };
    return names[type] || type;
  };

  const handleLogout = () => {
    localStorage.removeItem('petmind_admin_key');
    setIsAuthorized(false);
    setSecret('');
  };

  // Login screen
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 w-full max-w-md border border-gray-200 shadow-lg">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">PetMind Admin</h1>
            <p className="text-gray-500 mt-1">管理后台</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">访问密钥</label>
              <div className="relative">
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder="请输入访问密钥"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-200 focus:outline-none text-gray-900"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showSecret ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button
              onClick={handleLogin}
              className="w-full py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
            >
              进入后台
            </button>
          </div>
          <p className="text-center text-gray-400 text-sm mt-6">
            需要授权才能访问
          </p>
        </div>
      </div>
    );
  }

  const statCards = [
    { title: '总用户数', value: stats.totalUsers, icon: Users, color: 'bg-blue-500' },
    { title: '总宠物数', value: stats.totalPets, icon: PawPrint, color: 'bg-amber-500' },
    { title: '疫苗记录', value: stats.totalVaccines, icon: TrendingUp, color: 'bg-green-500' },
    { title: '提醒总数', value: stats.totalReminders, icon: Calendar, color: 'bg-purple-500' },
  ];

  const petTypeColors = ['bg-amber-500', 'bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-gray-500'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">PetMind Admin</h1>
              <p className="text-xs text-gray-500">管理后台</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            退出
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.title} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value.toLocaleString()}</p>
                <p className="text-sm text-gray-500">{stat.title}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User List */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  用户列表
                </h2>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索用户邮箱..."
                  value={searchEmail}
                  onChange={(e) => { setSearchEmail(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-200 focus:outline-none text-gray-900"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">用户</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">注册时间</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">宠物数</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr><td colSpan={3} className="px-6 py-12 text-center text-gray-400">加载中...</td></tr>
                  ) : users.length === 0 ? (
                    <tr><td colSpan={3} className="px-6 py-12 text-center text-gray-400">暂无数据</td></tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-600">{user.email.charAt(0).toUpperCase()}</span>
                            </div>
                            <span className="text-sm text-gray-900 truncate max-w-[200px]">{user.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(user.created_at).toLocaleDateString('zh-CN')}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            {user.petCount} 只
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-500">第 {currentPage} / {totalPages} 页</p>
                <div className="flex gap-2">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50">上一页</button>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50">下一页</button>
                </div>
              </div>
            )}
          </div>

          {/* Pet Statistics */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <PawPrint className="w-5 h-5" />
                宠物分布
              </h2>
            </div>
            <div className="p-6">
              {petTypes.length === 0 ? (
                <p className="text-center text-gray-400 py-8">暂无数据</p>
              ) : (
                <div className="space-y-4">
                  {petTypes.map((pet, index) => {
                    const percentage = stats.totalPets > 0 ? Math.round((pet.count / stats.totalPets) * 100) : 0;
                    return (
                      <div key={pet.type}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-700">{getPetTypeName(pet.type)}</span>
                          <span className="text-sm font-medium text-gray-900">{pet.count} 只</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full ${petTypeColors[index % petTypeColors.length]} rounded-full`} style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

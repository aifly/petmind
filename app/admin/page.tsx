'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Dog, FileText, Activity, TrendingUp, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const ADMIN_KEY = 'petmind_admin_secret_2024';

interface Stats {
  totalUsers: number;
  totalPets: number;
  totalArticles: number;
  recentUsers: any[];
}

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [error, setError] = useState('');
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalPets: 0,
    totalArticles: 0,
    recentUsers: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = sessionStorage.getItem('admin_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
      fetchStats();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchStats = async () => {
    try {
      // 获取用户数
      const { count: userCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // 获取宠物数
      const { count: petCount } = await supabase
        .from('pets')
        .select('*', { count: 'exact', head: true });

      // 获取文章数
      const { count: articleCount } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published');

      // 获取最近用户
      const { data: recentUsers } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        totalUsers: userCount || 0,
        totalPets: petCount || 0,
        totalArticles: articleCount || 0,
        recentUsers: recentUsers || [],
      });
    } catch (error) {
      console.error('获取统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminKey === ADMIN_KEY) {
      sessionStorage.setItem('admin_auth', 'true');
      setIsAuthenticated(true);
      fetchStats();
      setError('');
    } else {
      setError('密钥错误');
    }
  };

  // 登录页面
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">PetMind 管理后台</h1>
            <p className="text-sm text-gray-500 mt-1">请输入管理密钥继续</p>
          </div>

          <form onSubmit={handleLogin} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="mb-4">
              <input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="输入管理密钥"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all"
              />
              {error && (
                <p className="text-red-500 text-xs mt-2">{error}</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              进入后台
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-32"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-28 bg-gray-200 rounded-xl"></div>
            <div className="h-28 bg-gray-200 rounded-xl"></div>
            <div className="h-28 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">数据概览</h1>
        <p className="text-gray-500 mt-1">查看 PetMind 小程序运营数据</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">总用户数</p>
              <p className="text-4xl font-semibold text-gray-900 mt-2">{stats.totalUsers}</p>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Users className="text-blue-600" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">宠物总数</p>
              <p className="text-4xl font-semibold text-gray-900 mt-2">{stats.totalPets}</p>
            </div>
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
              <Dog className="text-amber-600" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">已发布文章</p>
              <p className="text-4xl font-semibold text-gray-900 mt-2">{stats.totalArticles}</p>
            </div>
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
              <FileText className="text-emerald-600" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* 最近用户 */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">最近注册用户</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {stats.recentUsers.length > 0 ? (
            stats.recentUsers.map((user) => {
              // 优先显示昵称，其次邮箱，最后显示 device_id 的一部分
              const displayName = user.nickname || user.email || `用户 ${user.device_id?.slice(-6) || '未知'}`;
              const displaySub = user.nickname ? (user.email || user.device_id) : (user.email ? user.device_id : '');
              const avatarChar = (user.nickname || user.email || 'U').charAt(0).toUpperCase();
              
              return (
                <div key={user.id} className="px-6 py-4 flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-600 font-medium text-sm">
                      {avatarChar}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{displayName}</p>
                    {displaySub && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{displaySub}</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {new Date(user.created_at).toLocaleDateString('zh-CN')}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="px-6 py-8 text-center text-gray-500 text-sm">
              暂无用户数据
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

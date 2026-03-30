'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, FileText, ArrowUpRight, ArrowDownRight, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Article {
  id: string;
  title: string;
  summary: string;
  category: string;
  status: 'published' | 'draft' | 'deleted';
  cover_url: string | null;
  published_at: string;
  created_at: string;
}

const categories = [
  { value: 'tip', label: '宠物贴士', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'news', label: '宠物新闻', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { value: 'reminder', label: '提醒', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'activity', label: '活动', color: 'bg-rose-50 text-rose-700 border-rose-200' },
];

const statusOptions = [
  { value: 'all', label: '全部状态' },
  { value: 'published', label: '已上架' },
  { value: 'draft', label: '已下架' },
];

export default function ArticlesPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('获取文章失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这篇文章吗？')) return;

    try {
      const { error } = await supabase
        .from('articles')
        .update({ status: 'deleted' })
        .eq('id', id);

      if (error) throw error;
      fetchArticles();
    } catch (error) {
      console.error('删除文章失败:', error);
      alert('删除失败');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    try {
      // 修复：下架时不更新 published_at，避免 null 问题
      const updateData: any = { status: newStatus };
      if (newStatus === 'published') {
        updateData.published_at = new Date().toISOString();
      }
      
      const { error } = await supabase
        .from('articles')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      fetchArticles();
    } catch (error: any) {
      console.error('更新状态失败:', error);
      alert('操作失败: ' + (error.message || '未知错误'));
    }
  };

  const filteredArticles = articles.filter(article => {
    if (article.status === 'deleted') return false;
    if (statusFilter !== 'all' && article.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && article.category !== categoryFilter) return false;
    if (searchQuery && !article.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: articles.filter(a => a.status !== 'deleted').length,
    published: articles.filter(a => a.status === 'published').length,
    draft: articles.filter(a => a.status === 'draft').length,
  };

  const getCategoryStyle = (category: string) => {
    return categories.find(c => c.value === category)?.color || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getCategoryLabel = (category: string) => {
    return categories.find(c => c.value === category)?.label || category;
  };

  const getCurrentStatusLabel = () => {
    return statusOptions.find(s => s.value === statusFilter)?.label || '全部状态';
  };

  const getCurrentCategoryLabel = () => {
    if (categoryFilter === 'all') return '全部分类';
    return categories.find(c => c.value === categoryFilter)?.label || '全部分类';
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-32"></div>
          <div className="h-32 bg-gray-200 rounded-xl"></div>
          <div className="h-96 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">文章管理</h1>
        <p className="text-gray-500 mt-1">管理小程序首页今日动态内容</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">全部文章</p>
              <p className="text-3xl font-semibold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <FileText className="text-gray-600" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">已上架</p>
              <p className="text-3xl font-semibold text-emerald-600 mt-1">{stats.published}</p>
            </div>
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
              <ArrowUpRight className="text-emerald-600" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">已下架</p>
              <p className="text-3xl font-semibold text-gray-400 mt-1">{stats.draft}</p>
            </div>
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <ArrowDownRight className="text-gray-500" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* 操作栏 */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          {/* 搜索框 - 白色背景 */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="搜索文章标题..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all"
            />
          </div>
          
          {/* 自定义下拉框 - 状态 */}
          <div className="relative">
            <button
              onClick={() => {
                setShowStatusDropdown(!showStatusDropdown);
                setShowCategoryDropdown(false);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all min-w-[120px]"
            >
              <span>{getCurrentStatusLabel()}</span>
              <ChevronDown size={16} className={`transition-transform ${showStatusDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showStatusDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setStatusFilter(option.value as any);
                      setShowStatusDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                      statusFilter === option.value ? 'text-gray-900 font-medium bg-gray-50' : 'text-gray-600'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 自定义下拉框 - 分类 */}
          <div className="relative">
            <button
              onClick={() => {
                setShowCategoryDropdown(!showCategoryDropdown);
                setShowStatusDropdown(false);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all min-w-[120px]"
            >
              <span>{getCurrentCategoryLabel()}</span>
              <ChevronDown size={16} className={`transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showCategoryDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1">
                <button
                  onClick={() => {
                    setCategoryFilter('all');
                    setShowCategoryDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                    categoryFilter === 'all' ? 'text-gray-900 font-medium bg-gray-50' : 'text-gray-600'
                  }`}
                >
                  全部分类
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => {
                      setCategoryFilter(cat.value);
                      setShowCategoryDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                      categoryFilter === cat.value ? 'text-gray-900 font-medium bg-gray-50' : 'text-gray-600'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/admin/articles/edit"
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors ml-auto"
          >
            <Plus size={16} />
            新建文章
          </Link>
        </div>
      </div>

      {/* 文章列表 */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">文章信息</th>
              <th className="text-left py-4 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">分类</th>
              <th className="text-left py-4 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
              <th className="text-left py-4 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">时间</th>
              <th className="text-right py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredArticles.map((article) => (
              <tr key={article.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {article.cover_url ? (
                        <img 
                          src={article.cover_url} 
                          alt={article.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FileText className="text-gray-300" size={20} />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium text-gray-900 truncate max-w-xs">{article.title}</h3>
                      <p className="text-sm text-gray-500 truncate max-w-xs mt-0.5">{article.summary}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${getCategoryStyle(article.category)}`}>
                    {getCategoryLabel(article.category)}
                  </span>
                </td>
                <td className="py-4 px-4">
                  {article.status === 'published' ? (
                    <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                      已上架
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                      已下架
                    </span>
                  )}
                </td>
                <td className="py-4 px-4 text-sm text-gray-500">
                  {new Date(article.created_at).toLocaleDateString('zh-CN')}
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleToggleStatus(article.id, article.status)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        article.status === 'published'
                          ? 'text-amber-600 hover:bg-amber-50'
                          : 'text-emerald-600 hover:bg-emerald-50'
                      }`}
                    >
                      {article.status === 'published' ? (
                        <><EyeOff size={14} /> 下架</>
                      ) : (
                        <><Eye size={14} /> 上架</>
                      )}
                    </button>
                    <Link
                      href={`/admin/articles/edit?id=${article.id}`}
                      className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit2 size={16} />
                    </Link>
                    <button
                      onClick={() => handleDelete(article.id)}
                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredArticles.length === 0 && (
          <div className="py-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="text-gray-400" size={28} />
            </div>
            <p className="text-gray-500">暂无文章</p>
            <Link
              href="/admin/articles/edit"
              className="inline-flex items-center gap-1 text-sm text-gray-900 font-medium mt-2 hover:underline"
            >
              创建第一篇文章 <Plus size={14} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

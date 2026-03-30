'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Image as ImageIcon, Eye, EyeOff, FileText, Sparkles, Bell, Gift } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const categories = [
  { value: 'tip', label: '宠物贴士', icon: Sparkles, color: 'bg-blue-50 text-blue-600 border-blue-200', desc: '养宠知识、技巧分享' },
  { value: 'news', label: '宠物新闻', icon: FileText, color: 'bg-purple-50 text-purple-600 border-purple-200', desc: '行业动态、新鲜事' },
  { value: 'reminder', label: '提醒', icon: Bell, color: 'bg-amber-50 text-amber-600 border-amber-200', desc: '重要事项、注意事项' },
  { value: 'activity', label: '活动', icon: Gift, color: 'bg-rose-50 text-rose-600 border-rose-200', desc: '促销活动、互动活动' },
];

function ArticleEditForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const articleId = searchParams.get('id');
  const isEditing = !!articleId;

  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    category: 'tip',
    status: 'draft' as 'published' | 'draft',
    cover_url: '',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditing) {
      fetchArticle();
    }
  }, [articleId]);

  const fetchArticle = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', articleId)
        .single();

      if (error) throw error;
      if (data) {
        setFormData({
          title: data.title,
          summary: data.summary,
          content: data.content,
          category: data.category,
          status: data.status,
          cover_url: data.cover_url || '',
        });
      }
    } catch (error) {
      console.error('获取文章失败:', error);
      alert('获取文章失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const articleData = {
        ...formData,
        published_at: formData.status === 'published' ? new Date().toISOString() : null,
      };

      if (isEditing) {
        const { error } = await supabase
          .from('articles')
          .update(articleData)
          .eq('id', articleId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('articles')
          .insert([articleData]);
        if (error) throw error;
      }

      router.push('/admin/articles');
    } catch (error) {
      console.error('保存文章失败:', error);
      alert('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const insertHtmlTag = (tag: string) => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.content;
    const before = text.substring(0, start);
    const after = text.substring(end);
    const selected = text.substring(start, end);

    let insertion = '';
    switch (tag) {
      case 'h2':
        insertion = `<h2>${selected || '标题'}</h2>`;
        break;
      case 'h3':
        insertion = `<h3>${selected || '小标题'}</h3>`;
        break;
      case 'p':
        insertion = `<p>${selected || '段落内容'}</p>`;
        break;
      case 'strong':
        insertion = `<strong>${selected || '加粗文字'}</strong>`;
        break;
      case 'br':
        insertion = '<br>';
        break;
    }

    const newContent = before + insertion + after;
    setFormData({ ...formData, content: newContent });

    setTimeout(() => {
      textarea.focus();
      const newCursor = start + insertion.length;
      textarea.setSelectionRange(newCursor, newCursor);
    }, 0);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="h-96 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl">
      {/* 页面标题 */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/articles"
          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {isEditing ? '编辑文章' : '新建文章'}
          </h1>
          <p className="text-gray-500 mt-1">
            {isEditing ? '修改文章内容和设置' : '创建一篇新文章'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本信息 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-6">基本信息</h2>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">文章标题</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="输入文章标题"
                required
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">摘要</label>
              <textarea
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                placeholder="输入文章摘要，显示在列表中"
                rows={2}
                required
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">分类</label>
              <div className="grid grid-cols-4 gap-3">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = formData.category === cat.value;
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat.value })}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        isSelected
                          ? 'border-gray-900 bg-gray-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${cat.color}`}>
                        <Icon size={16} />
                      </div>
                      <p className="font-medium text-sm text-gray-900">{cat.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{cat.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 封面图 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-6">封面图</h2>
          <div className="flex items-start gap-4">
            <div className="w-32 h-24 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border border-gray-200">
              {formData.cover_url ? (
                <img
                  src={formData.cover_url}
                  alt="封面"
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImageIcon className="text-gray-300" size={24} />
              )}
            </div>
            <div className="flex-1">
              <input
                type="url"
                value={formData.cover_url}
                onChange={(e) => setFormData({ ...formData, cover_url: e.target.value })}
                placeholder="输入图片 URL"
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all"
              />
              <p className="text-xs text-gray-500 mt-2">支持 JPG、PNG 格式，建议尺寸 800x600</p>
            </div>
          </div>
        </div>

        {/* 正文内容 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-6">正文内容</h2>
          
          {/* 工具栏 */}
          <div className="flex items-center gap-1 p-2 bg-gray-50 rounded-lg mb-3 border border-gray-200">
            <button
              type="button"
              onClick={() => insertHtmlTag('h2')}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-white hover:shadow-sm rounded transition-all"
            >
              H2
            </button>
            <button
              type="button"
              onClick={() => insertHtmlTag('h3')}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-white hover:shadow-sm rounded transition-all"
            >
              H3
            </button>
            <div className="w-px h-5 bg-gray-300 mx-1"></div>
            <button
              type="button"
              onClick={() => insertHtmlTag('p')}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-white hover:shadow-sm rounded transition-all"
            >
              段落
            </button>
            <button
              type="button"
              onClick={() => insertHtmlTag('strong')}
              className="px-3 py-1.5 text-sm font-bold text-gray-700 hover:bg-white hover:shadow-sm rounded transition-all"
            >
              B
            </button>
            <div className="w-px h-5 bg-gray-300 mx-1"></div>
            <button
              type="button"
              onClick={() => insertHtmlTag('br')}
              className="px-3 py-1.5 text-sm text-gray-700 hover:bg-white hover:shadow-sm rounded transition-all"
            >
              换行
            </button>
          </div>

          <textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="输入文章正文内容，支持 HTML 标签"
            rows={12}
            required
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all font-mono leading-relaxed"
          />
        </div>

        {/* 发布设置 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-6">发布设置</h2>
          
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, status: 'draft' })}
              className={`flex-1 p-4 rounded-xl border-2 text-left transition-all ${
                formData.status === 'draft'
                  ? 'border-gray-900 bg-gray-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  formData.status === 'draft' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  <EyeOff size={18} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">保存为草稿</p>
                  <p className="text-sm text-gray-500">文章不会在前台显示</p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, status: 'published' })}
              className={`flex-1 p-4 rounded-xl border-2 text-left transition-all ${
                formData.status === 'published'
                  ? 'border-emerald-500 bg-emerald-50/50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  formData.status === 'published' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  <Eye size={18} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">立即发布</p>
                  <p className="text-sm text-gray-500">文章将在前台显示</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            href="/admin/articles"
            className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            取消
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? '保存中...' : (isEditing ? '保存修改' : '创建文章')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function EditArticlePage() {
  return (
    <Suspense fallback={
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="h-96 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    }>
      <ArticleEditForm />
    </Suspense>
  );
}

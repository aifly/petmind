'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, FileText, Dog, LogOut, Menu, X, ChevronLeft } from 'lucide-react';

const menuItems = [
  { path: '/admin', label: '首页', icon: LayoutDashboard },
  { path: '/admin/pets', label: '宠物管理', icon: Dog },
  { path: '/admin/articles', label: '文章管理', icon: FileText },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const auth = sessionStorage.getItem('admin_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth');
    setIsAuthenticated(false);
    router.push('/admin');
  };

  // 登录页面不需要侧边栏
  if (pathname === '/admin' && !isAuthenticated && !isLoading) {
    return <>{children}</>;
  }

  // 未登录状态
  if (!isAuthenticated && !isLoading) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 侧边栏 */}
      <aside 
        className={`bg-white border-r border-gray-200 flex-shrink-0 transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-56'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center px-4 border-b border-gray-100">
            <Image src="/logo.svg" alt="PetMind" width={32} height={32} className="rounded-lg flex-shrink-0" />
            {!collapsed && (
              <div className="ml-3 overflow-hidden">
                <h1 className="font-semibold text-gray-900 text-sm">PetMind</h1>
                <p className="text-xs text-gray-500">管理后台</p>
              </div>
            )}
          </div>

          {/* 菜单 */}
          <nav className="flex-1 py-4 px-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center px-3 py-2.5 rounded-lg mb-1 transition-colors ${
                    isActive 
                      ? 'bg-gray-900 text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  {!collapsed && <span className="ml-3 text-sm font-medium">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* 底部操作 */}
          <div className="p-2 border-t border-gray-100">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="w-full flex items-center justify-center px-3 py-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              title={collapsed ? '展开菜单' : '收起菜单'}
            >
              {collapsed ? <ChevronLeft size={18} /> : <Menu size={18} />}
              {!collapsed && <span className="ml-2 text-sm">收起菜单</span>}
            </button>
            <button
              onClick={handleLogout}
              className={`w-full flex items-center px-3 py-2 mt-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors ${
                collapsed ? 'justify-center' : ''
              }`}
              title={collapsed ? '退出登录' : undefined}
            >
              <LogOut size={18} className="flex-shrink-0" />
              {!collapsed && <span className="ml-3 text-sm font-medium">退出登录</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

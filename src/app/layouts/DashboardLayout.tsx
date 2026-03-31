import { Outlet, useNavigate, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  LayoutDashboard,
  MapPin,
  Cpu,
  Bell,
  Calendar,
  FileText,
  Users,
  Bot,
  LogOut,
  Menu,
  X,
  Settings,
  History,
  UserCog,
  Sun,
  Moon,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import FloatingChatbot from '../components/FloatingChatbot';

const navigation = [
  { name: 'Tổng quan', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Khu vực', path: '/zones', icon: MapPin },
  { name: 'Báo cáo', path: '/reports', icon: FileText },
  { name: 'Lịch sử hoạt động', path: '/activity-history', icon: History },
  { name: 'Phân công khu vực', path: '/zone-assignment', icon: UserCog, adminOnly: true },
  { name: 'Quản lý người dùng', path: '/users', icon: Users, adminOnly: true },
  { name: 'Trợ lý AI', path: '/chatbot', icon: Bot },
];

export default function DashboardLayout() {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const filteredNav = navigation.filter(
    (item) => !item.adminOnly || user?.user_type === 'admin'
  );

  const NavContent = () => (
    <>
      <div className="flex items-center gap-3 px-6 py-5 border-b dark:border-gray-700">
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">SF</span>
        </div>
        <div>
          <h1 className="font-bold text-lg">Smart Farm</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Quản lý IoT</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {filteredNav.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t dark:border-gray-700">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full justify-start gap-3"
        >
          <LogOut className="w-5 h-5" />
          <span>Đăng xuất</span>
        </Button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700">
        <NavContent />
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 z-50 lg:hidden flex flex-col">
            <NavContent />
          </aside>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="font-semibold text-lg">
                {navigation.find((item) => item.path === location.pathname)?.name || 'Tổng quan'}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {new Date().toLocaleDateString('vi-VN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="gap-2"
              title="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>
            <div className="hidden sm:flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
              <span className="text-sm font-medium">{user?.user_name}</span>
              <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded">
                {user?.user_type === 'admin' ? 'Quản trị' : 'Vận hành'}
              </span>
            </div>
            <Avatar>
              <AvatarFallback className="bg-green-600 text-white">
                {user?.user_name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <Outlet />
        </main>

        {/* Floating Chatbot Button */}
        <FloatingChatbot />
      </div>
    </div>
  );
}
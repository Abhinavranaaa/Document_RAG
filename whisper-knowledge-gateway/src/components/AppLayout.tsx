
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '../context/auth-context';
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  LogOut,
  Menu,
  X
} from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Chat', href: '/chat', icon: MessageSquare },
    { name: 'Documents', href: '/documents', icon: FileText },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - desktop */}
      <div className="hidden md:flex w-64 flex-col bg-white border-r border-gray-200">
        <div className="flex items-center h-16 px-6 border-b border-gray-200">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
              <span className="text-white font-bold">DC</span>
            </div>
            <span className="text-xl font-bold">DeepChat</span>
          </Link>
        </div>

        <div className="flex-grow p-4">
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center p-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-gray-100 text-primary'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
                  }`}
                >
                  <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-primary' : 'text-gray-400'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0 mr-3">
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-gray-600">{user?.name?.[0] || 'U'}</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full flex items-center justify-center"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-10 flex items-center justify-between px-4">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="mr-2"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
              <span className="text-white font-bold">DC</span>
            </div>
            <span className="text-xl font-bold">DeepChat</span>
          </Link>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-20" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="fixed top-16 left-0 bottom-0 w-64 bg-white p-4 overflow-y-auto z-30" onClick={e => e.stopPropagation()}>
            <nav className="space-y-1 mb-6">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center p-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-gray-100 text-primary'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-primary' : 'text-gray-400'}`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 mr-3">
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-gray-600">{user?.name?.[0] || 'U'}</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full flex items-center justify-center"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;

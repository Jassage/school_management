import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../lib/store';
import { 
  Users, User, Sun, Moon, LogOut, LayoutDashboard, Settings, 
  Bell, Menu, ChevronLeft, ChevronRight, ChevronDown,
  GraduationCap, BookOpen, Book, Building, Calendar, FileText,
  CreditCard
} from 'lucide-react';
import SearchBar from '../components/SearchBar';
import NotificationsPanel from '../components/NotificationsPanel';

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, notifications, isDarkMode, toggleDarkMode, isSidebarOpen, toggleSidebar } = useAuthStore();
  const [isNotificationsPanelOpen, setIsNotificationsPanelOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    // Implement logout logic
    navigate('/login');
  };

  if (!profile) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-gray-800 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0 w-64' : 'translate-x-0 w-20'
        } border-r border-gray-200 dark:border-gray-700`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            {isSidebarOpen && (
              <span className="font-semibold text-lg">EduManager</span>
            )}
          </div>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {isSidebarOpen ? (
              <ChevronLeft size={20} />
            ) : (
              <ChevronRight size={20} />
            )}
          </button>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex flex-col h-[calc(100vh-4rem)]">
          <nav className="flex-1 p-4 space-y-2">
            <Link
              to="/dashboard"
              className={`flex items-center ${isSidebarOpen ? 'space-x-3' : 'justify-center'} p-3 rounded-lg ${
                isActive('/dashboard')
                  ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <LayoutDashboard size={20} />
              {isSidebarOpen && <span>Vue d'ensemble</span>}
            </Link>

            <Link
              to="/dashboard/students"
              className={`flex items-center ${isSidebarOpen ? 'space-x-3' : 'justify-center'} p-3 rounded-lg ${
                isActive('/dashboard/students')
                  ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <GraduationCap size={20} />
              {isSidebarOpen && <span>Étudiants</span>}
            </Link>

            <Link
              to="/dashboard/teachers"
              className={`flex items-center ${isSidebarOpen ? 'space-x-3' : 'justify-center'} p-3 rounded-lg ${
                isActive('/dashboard/teachers')
                  ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <BookOpen size={20} />
              {isSidebarOpen && <span>Professeurs</span>}
            </Link>

            <Link
              to="/dashboard/subjects"
              className={`flex items-center ${isSidebarOpen ? 'space-x-3' : 'justify-center'} p-3 rounded-lg ${
                isActive('/dashboard/subjects')
                  ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Book size={20} />
              {isSidebarOpen && <span>Matières</span>}
            </Link>

            <Link
              to="/dashboard/faculties"
              className={`flex items-center ${isSidebarOpen ? 'space-x-3' : 'justify-center'} p-3 rounded-lg ${
                isActive('/dashboard/faculties')
                  ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Building size={20} />
              {isSidebarOpen && <span>Facultés</span>}
            </Link>

            <Link
              to="/dashboard/schedule"
              className={`flex items-center ${isSidebarOpen ? 'space-x-3' : 'justify-center'} p-3 rounded-lg ${
                isActive('/dashboard/schedule')
                  ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Calendar size={20} />
              {isSidebarOpen && <span>Emploi du temps</span>}
            </Link>

            <Link
              to="/dashboard/grades"
              className={`flex items-center ${isSidebarOpen ? 'space-x-3' : 'justify-center'} p-3 rounded-lg ${
                isActive('/dashboard/grades')
                  ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <FileText size={20} />
              {isSidebarOpen && <span>Notes</span>}
            </Link>

            {profile.role === 'admin' && (
              <>
                <Link
                  to="/dashboard/payments"
                  className={`flex items-center ${isSidebarOpen ? 'space-x-3' : 'justify-center'} p-3 rounded-lg ${
                    isActive('/dashboard/payments')
                      ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <CreditCard size={20} />
                  {isSidebarOpen && <span>Paiements</span>}
                </Link>

                <Link
                  to="/dashboard/users"
                  className={`flex items-center ${isSidebarOpen ? 'space-x-3' : 'justify-center'} p-3 rounded-lg ${
                    isActive('/dashboard/users')
                      ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Users size={20} />
                  {isSidebarOpen && <span>Utilisateurs</span>}
                </Link>
              </>
            )}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400 font-medium text-lg">
                  {profile.full_name.charAt(0)}
                </span>
              </div>
              {isSidebarOpen && (
                <div className="flex-1">
                  <p className="font-medium truncate">{profile.full_name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                    {profile.role}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`${isSidebarOpen ? 'ml-64' : 'ml-20'} min-h-screen`}>
        {/* Header */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="h-full px-4 flex items-center justify-between">
            <SearchBar />

            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              <div className="relative">
                <button
                  onClick={() => setIsNotificationsPanelOpen(!isNotificationsPanelOpen)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 relative"
                >
                  <Bell size={20} />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full"></span>
                  )}
                </button>
                <NotificationsPanel
                  isOpen={isNotificationsPanelOpen}
                  onClose={() => setIsNotificationsPanelOpen(false)}
                />
              </div>

              <Link
                to="/dashboard/profile"
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <User size={20} />
              </Link>

              <Link
                to="/dashboard/settings"
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Settings size={20} />
              </Link>

              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
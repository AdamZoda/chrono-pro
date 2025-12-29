
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Video,
  StickyNote,
  LifeBuoy,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  ShieldAlert,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { notifications } = useAppContext();
  // Sidebar visibility state (works for both mobile and desktop)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showNotifs, setShowNotifs] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Planning', path: '/schedule', icon: Calendar },
    { label: 'Notes', path: '/notes', icon: StickyNote },
    { label: 'Conférences', path: '/conferences', icon: Video },
    { label: 'Support', path: '/support', icon: LifeBuoy },
    { label: 'Profil', path: '/profile', icon: Settings },
  ];

  if (user?.role === 'ADMIN') {
    navItems.push({ label: 'Admin Panel', path: '/admin', icon: ShieldAlert });
  }

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 
          transform transition-all duration-300 ease-in-out
          lg:relative lg:translate-x-0 
          ${isSidebarOpen ? 'w-64 translate-x-0 opacity-100' : 'w-0 -translate-x-full lg:w-0 lg:opacity-0 lg:overflow-hidden'}
        `}
      >
        <div className={`h-full flex flex-col p-6 min-w-[256px] ${!isSidebarOpen && 'lg:invisible'}`}>
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shrink-0">
              CN
            </div>
            <h1 className="text-xl font-bold text-slate-800 whitespace-nowrap">ChronoNexus</h1>
            <button className="lg:hidden ml-auto p-2 hover:bg-slate-100 rounded-lg" onClick={toggleSidebar}>
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors whitespace-nowrap ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
                  onClick={() => {
                    // Always close sidebar on mobile/tablet (< 1024px)
                    if (window.innerWidth < 1024) {
                      setIsSidebarOpen(false);
                    }
                  }}
                >
                  <Icon size={20} className="shrink-0" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-6 border-t border-slate-100">
            <button
              onClick={() => {
                // Close sidebar on mobile before logout
                if (window.innerWidth < 1024) {
                  setIsSidebarOpen(false);
                }
                logout();
                navigate('/login');
              }}
              className="flex items-center gap-3 px-4 py-3 w-full text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors whitespace-nowrap"
            >
              <LogOut size={20} className="shrink-0" />
              <span className="font-medium">Déconnexion</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden transition-all duration-300">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center gap-4 sticky top-0 z-40">
          <button
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
            onClick={toggleSidebar}
            title={isSidebarOpen ? "Cacher le menu" : "Afficher le menu"}
          >
            {isSidebarOpen ? <ChevronLeft size={24} /> : <Menu size={24} />}
          </button>

          <div className="flex items-center gap-4 ml-auto">
            <div className="relative">
              <button
                className="p-2 text-slate-500 hover:bg-slate-50 rounded-full relative"
                onClick={() => setShowNotifs(!showNotifs)}
              >
                <Bell size={20} />
                {notifications.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>}
              </button>

              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto">
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-semibold text-slate-800">Notifications</h3>
                    <button className="text-xs text-indigo-600 hover:underline">Tout marquer comme lu</button>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-sm">Aucune notification</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className="p-4 hover:bg-slate-50 transition-colors">
                          <p className="text-sm text-slate-700">{n.message}</p>
                          <span className="text-xs text-slate-400 mt-1 block">{n.time}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <Link to="/profile" className="flex items-center gap-3 pl-4 border-l border-slate-200 group">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-slate-500">{user?.role}</p>
              </div>
              <img src={user?.avatar} alt="Profile" className="w-10 h-10 rounded-full border-2 border-slate-100 object-cover" />
            </Link>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-full mx-auto h-full">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;

import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, PlusCircle, BarChart2, BookOpen, Settings } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/insights', icon: BarChart2, label: 'Insights' },
    { path: '/log', icon: PlusCircle, label: 'Log', highlight: true }, // Center action
    { path: '/journal', icon: BookOpen, label: 'Journal' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24 md:pb-0 md:pl-20 md:pt-0">
      
      {/* Desktop Sidebar (Hidden on mobile) */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-20 bg-white border-r border-slate-200 items-center py-8 z-50 shadow-sm">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center mb-8 shadow-indigo-200 shadow-lg">
          <span className="text-white font-bold text-xl">C</span>
        </div>
        <nav className="flex flex-col gap-6 w-full">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full py-3 transition-colors relative ${
                  isActive ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                }`
              }
            >
              <item.icon size={24} strokeWidth={2} />
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
              {location.pathname === item.path && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-600 rounded-r-full" />
              )}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto min-h-screen p-4 md:p-8 pt-6 md:pt-10">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 z-50 px-6 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex justify-between items-center">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            if (item.highlight) {
               return (
                <NavLink key={item.path} to={item.path} className="relative -top-6">
                   <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-indigo-200 transition-transform active:scale-95 ${isActive ? 'bg-indigo-700' : 'bg-indigo-600'}`}>
                      <PlusCircle size={28} className="text-white" />
                   </div>
                </NavLink>
               )
            }

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center w-12 transition-colors ${
                  isActive ? 'text-indigo-600' : 'text-slate-400'
                }`}
              >
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] mt-1 font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
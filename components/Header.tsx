import React, { useState } from 'react';
import { Hotel, LayoutDashboard, CalendarCheck, LogOut, User, AlertCircle, UserCheck, UserMinus, MessageSquare, Sparkles, FileText, BedDouble } from 'lucide-react';
import { Page } from '../types';

interface HeaderProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  user: { name: string; role: string };
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentPage, onNavigate, user, onLogout }) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const navItems: { key: Page; label: string; icon: React.FC<any> }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'bookings', label: 'Bookings', icon: CalendarCheck },
    { key: 'check-ins', label: 'Check In', icon: UserCheck },
    { key: 'check-outs', label: 'Check Out', icon: UserMinus },
    { key: 'housekeeping', label: 'Housekeeping', icon: Sparkles },
    { key: 'rooms', label: 'Rooms', icon: BedDouble },
    { key: 'invoices', label: 'Invoices', icon: FileText },
    { key: 'reviews', label: 'Reviews', icon: MessageSquare },
  ];

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    onLogout();
  };

  return (
    <>
      <header className="w-full py-4 border-b border-red-900/30 bg-gradient-to-b from-black to-transparent">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onNavigate('dashboard')}>
            <Hotel className="w-8 h-8 text-red-600 group-hover:text-red-500 transition-colors anim-glow" style={{ borderRadius: '50%' }} />
            <div>
              <h1 className="text-2xl md:text-3xl font-serif text-white tracking-wider">
                Hotel <span className="text-red-600">Sahil</span>
              </h1>
              <p className="text-stone-500 text-[10px] tracking-[0.3em] uppercase">Management System</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => onNavigate(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
                  currentPage === key
                    ? 'bg-red-900/30 text-red-400 border border-red-800/40'
                    : 'text-stone-400 hover:text-white hover:bg-stone-800'
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </nav>

          {/* User Info & Logout */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('profile' as Page)}
              className="hidden sm:flex items-center gap-2 text-sm group cursor-pointer rounded-lg px-2 py-1.5 -mx-2 hover:bg-stone-800/60 transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-red-900/30 border border-red-800/40 flex items-center justify-center group-hover:border-red-600/60 transition-colors">
                <User size={14} className="text-red-400" />
              </div>
              <div className="text-right">
                <p className="text-white text-sm font-medium leading-tight group-hover:text-red-400 transition-colors">{user.name}</p>
                <p className="text-stone-500 text-[10px] leading-tight">{user.role}</p>
              </div>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-stone-400 hover:text-red-400 hover:bg-stone-800 transition-all text-sm"
              title="Sign out"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-1 px-4 mt-3 overflow-x-auto">
          {navItems.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => onNavigate(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all ${
                currentPage === key
                  ? 'bg-red-900/30 text-red-400 border border-red-800/40'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800'
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowLogoutConfirm(false)} />
          <div className="relative bg-stone-900 border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl anim-scale-in">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-900/20 border border-red-800/30 mx-auto">
                <AlertCircle size={24} className="text-red-400" />
              </div>
              <div className="text-center">
                <h3 className="font-serif text-lg text-white">Sign Out?</h3>
                <p className="text-stone-400 text-sm mt-1">Are you sure you want to leave the system?</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-2.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-sm transition-all border border-stone-700"
                >
                  Stay
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 py-2.5 rounded-lg bg-red-700 hover:bg-red-600 text-white text-sm transition-all flex items-center justify-center gap-2"
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
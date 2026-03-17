import React, { useState, useMemo } from 'react';
import {
  UserCheck,
  ChevronLeft,
  Calendar,
  Clock,
  Users,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle,
  Hash,
  FileText,
  Search,
  X,
  Sparkles,
  ArrowRight,
  Sun,
  Sunrise,
  CalendarCheck,
} from 'lucide-react';
import { Booking, BookingStatus, Page } from '../types';
import { formatDate, todayStr, todayFormatted } from '../utils/helpers';
import Toast from './shared/Toast';

// Toast imported from shared/Toast

// --- Component ---

interface CheckInsProps {
  bookings: Booking[];
  onStatusChange: (id: string, status: BookingStatus) => void;
  onNavigate: (page: Page) => void;
}

const CheckIns: React.FC<CheckInsProps> = ({ bookings, onStatusChange, onNavigate }) => {
  const today = todayStr();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // All bookings eligible for check-in (confirmed or pending)
  const allArrivals = useMemo(() =>
    bookings.filter(b => b.status === 'confirmed' || b.status === 'pending'),
    [bookings]
  );

  const overdueArrivals = useMemo(() => allArrivals.filter(b => b.checkIn < today), [allArrivals, today]);
  const todayArrivals = useMemo(() => allArrivals.filter(b => b.checkIn === today), [allArrivals, today]);
  const upcomingArrivals = useMemo(() =>
    allArrivals.filter(b => b.checkIn > today).sort((a, b) => a.checkIn.localeCompare(b.checkIn)),
    [allArrivals, today]
  );

  // Currently in-house
  const inHouseGuests = useMemo(() =>
    bookings.filter(b => b.status === 'checked-in'),
    [bookings]
  );

  // Search filter
  const filterBySearch = (list: Booking[]) => {
    if (!searchQuery) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(b =>
      b.guest.toLowerCase().includes(q) ||
      b.id.toLowerCase().includes(q) ||
      b.room.includes(searchQuery) ||
      b.phone.includes(searchQuery)
    );
  };

  const handleCheckIn = (b: Booking) => {
    onStatusChange(b.id, 'checked-in');
    setToast({ message: `${b.guest} checked in to Room ${b.room}!`, type: 'success' });
  };

  const handleConfirm = (b: Booking) => {
    onStatusChange(b.id, 'confirmed');
    setToast({ message: `${b.id} confirmed for ${b.guest}`, type: 'info' });
  };

  // --- Arrival Card ---
  const renderArrivalCard = (b: Booking, isOverdue: boolean = false) => {
    const isPending = b.status === 'pending';
    const avatarClasses = isOverdue
      ? 'bg-red-900/30 text-red-400 border border-red-800/40'
      : isPending
        ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-800/40'
        : 'bg-emerald-900/30 text-emerald-400 border border-emerald-800/40';
    const badgeClasses = isOverdue
      ? 'bg-red-900/30 text-red-400 border-red-800/40'
      : isPending
        ? 'bg-yellow-900/30 text-yellow-400 border-yellow-800/40'
        : 'bg-emerald-900/30 text-emerald-400 border-emerald-800/40';
    const dotClass = isOverdue ? 'bg-red-400' : isPending ? 'bg-yellow-400' : 'bg-emerald-400';
    const badgeLabel = isOverdue ? 'Overdue' : isPending ? 'Pending' : 'Confirmed';
    const borderClass = isOverdue ? 'border-red-800/40' : isPending ? 'border-yellow-800/30' : 'border-emerald-800/30';

    return (
      <div key={b.id} className={`bg-stone-900/60 rounded-xl border p-5 transition-all hover:border-stone-500 hover-lift ${borderClass}`}>
        {/* Header Row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold uppercase ${avatarClasses}`}>
              {b.guest.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </div>
            <div>
              <h4 className="text-white font-medium">{b.guest}</h4>
              <p className="text-stone-500 text-xs flex items-center gap-1.5">
                <Hash size={10} /> {b.id}
              </p>
            </div>
          </div>
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${badgeClasses}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
            {badgeLabel}
          </span>
        </div>

        {/* Stay Details Grid */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="bg-stone-800/40 rounded-lg p-2.5 border border-stone-700/30">
            <p className="text-stone-500 text-[9px] uppercase tracking-wider">Room</p>
            <p className="text-white font-bold">{b.room}</p>
            <p className="text-stone-500 text-[10px]">{b.roomType}</p>
          </div>
          <div className="bg-stone-800/40 rounded-lg p-2.5 border border-stone-700/30">
            <p className="text-stone-500 text-[9px] uppercase tracking-wider">Check In</p>
            <p className="text-white font-medium text-sm">{formatDate(b.checkIn)}</p>
            <p className="text-stone-500 text-[10px]">{b.nights} nights</p>
          </div>
          <div className="bg-stone-800/40 rounded-lg p-2.5 border border-stone-700/30">
            <p className="text-stone-500 text-[9px] uppercase tracking-wider">Amount</p>
            <p className="text-amber-400 font-bold">{b.amount}</p>
            <p className="text-stone-500 text-[10px]">{b.guests} guest{b.guests > 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Contact */}
        <div className="flex items-center gap-4 text-stone-500 text-xs mb-4">
          <span className="flex items-center gap-1"><Phone size={11} /> {b.phone}</span>
          {b.email && <span className="flex items-center gap-1 truncate"><Mail size={11} /> {b.email}</span>}
        </div>

        {/* Special Requests */}
        {b.specialRequests && (
          <div className="bg-amber-900/10 rounded-lg px-3 py-2 border border-amber-800/20 mb-4">
            <p className="text-amber-400/80 text-xs flex items-center gap-1.5">
              <FileText size={11} /> {b.specialRequests}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {isPending && (
            <button
              onClick={() => handleConfirm(b)}
              className="flex-1 py-2.5 rounded-xl bg-emerald-900/20 hover:bg-emerald-900/40 text-emerald-400 flex items-center justify-center gap-2 text-sm transition-all border border-emerald-800/30 font-medium"
            >
              <CheckCircle size={15} /> Confirm
            </button>
          )}
          <button
            onClick={() => handleCheckIn(b)}
            className="flex-1 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-600 text-white flex items-center justify-center gap-2 text-sm transition-all font-medium"
          >
            <UserCheck size={15} /> Check In <ArrowRight size={14} />
          </button>
        </div>
      </div>
    );
  };

  // --- Section Renderer ---
  const renderSection = (
    title: string,
    items: Booking[],
    icon: React.ReactNode,
    emptyMsg: string,
    isOverdue: boolean = false
  ) => {
    const filteredItems = filterBySearch(items);
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-white font-medium text-sm">{title}</h3>
          <span className="text-stone-500 text-xs bg-stone-800 px-2 py-0.5 rounded-full">{items.length}</span>
        </div>
        {filteredItems.length === 0 ? (
          <div className="bg-stone-900/30 rounded-xl border border-stone-800/50 p-8 text-center">
            <Search size={28} className="mx-auto mb-2 text-stone-700" />
            <p className="text-stone-600 text-sm">{items.length === 0 ? emptyMsg : 'No matches for your search'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map(b => renderArrivalCard(b, isOverdue))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <button onClick={() => onNavigate('dashboard')} className="flex items-center gap-1 text-stone-500 hover:text-white transition-colors text-sm">
          <ChevronLeft size={16} /> Dashboard
        </button>
        <span className="text-stone-700">/</span>
        <span className="text-stone-300 text-sm">Check In</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-serif text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-900/30 rounded-xl flex items-center justify-center border border-blue-800/40">
              <UserCheck size={22} className="text-blue-400" />
            </div>
            Check-In Desk
          </h2>
          <p className="text-stone-500 text-sm mt-1 flex items-center gap-2">
            <Calendar size={14} /> {todayFormatted()}
          </p>
        </div>
        <button
          onClick={() => onNavigate('bookings')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-stone-300 hover:border-red-600 hover:text-white transition-all text-sm"
        >
          <CalendarCheck size={16} /> All Bookings
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl p-4 border bg-red-900/10 border-red-800/30 hover-lift">
          <div className="flex items-center justify-between mb-1">
            <AlertCircle size={16} className="text-red-400" />
            <span className="text-2xl font-bold text-white">{overdueArrivals.length}</span>
          </div>
          <p className="text-red-400/70 text-[10px] uppercase tracking-wider">Overdue</p>
        </div>
        <div className="rounded-xl p-4 border bg-blue-900/10 border-blue-800/30 hover-lift">
          <div className="flex items-center justify-between mb-1">
            <Sun size={16} className="text-blue-400" />
            <span className="text-2xl font-bold text-white">{todayArrivals.length}</span>
          </div>
          <p className="text-blue-400/70 text-[10px] uppercase tracking-wider">Today's Arrivals</p>
        </div>
        <div className="rounded-xl p-4 border bg-emerald-900/10 border-emerald-800/30 hover-lift">
          <div className="flex items-center justify-between mb-1">
            <Sunrise size={16} className="text-emerald-400" />
            <span className="text-2xl font-bold text-white">{upcomingArrivals.length}</span>
          </div>
          <p className="text-emerald-400/70 text-[10px] uppercase tracking-wider">Upcoming</p>
        </div>
        <div className="rounded-xl p-4 border bg-purple-900/10 border-purple-800/30 hover-lift">
          <div className="flex items-center justify-between mb-1">
            <Users size={16} className="text-purple-400" />
            <span className="text-2xl font-bold text-white">{inHouseGuests.length}</span>
          </div>
          <p className="text-purple-400/70 text-[10px] uppercase tracking-wider">In-House</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-stone-900/80 border border-stone-700 rounded-xl pl-12 pr-10 py-3 text-stone-200 placeholder-stone-600 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all text-sm"
          placeholder="Search arrivals by name, booking ID, room, or phone..."
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500 hover:text-white transition-colors">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Overdue Arrivals */}
      {overdueArrivals.length > 0 && renderSection(
        'Overdue Arrivals',
        overdueArrivals,
        <AlertCircle size={16} className="text-red-400" />,
        '',
        true
      )}

      {/* Today's Arrivals */}
      {renderSection(
        "Today's Arrivals",
        todayArrivals,
        <Sun size={16} className="text-blue-400" />,
        'No arrivals scheduled for today'
      )}

      {/* Upcoming Arrivals */}
      {renderSection(
        'Upcoming Arrivals',
        upcomingArrivals,
        <Sunrise size={16} className="text-emerald-400" />,
        'No upcoming arrivals'
      )}

      {/* In-House Guests */}
      {inHouseGuests.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-stone-500" />
            <h3 className="text-stone-400 font-medium text-sm">Currently In-House</h3>
            <span className="text-stone-600 text-xs bg-stone-800 px-2 py-0.5 rounded-full">{inHouseGuests.length}</span>
          </div>
          <div className="bg-stone-900/30 rounded-xl border border-stone-800/50 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-stone-600 text-[10px] uppercase tracking-wider border-b border-stone-800">
                  <th className="text-left py-3 px-4 font-medium">ID</th>
                  <th className="text-left py-3 px-4 font-medium">Guest</th>
                  <th className="text-left py-3 px-4 font-medium">Room</th>
                  <th className="text-left py-3 px-4 font-medium">Check Out</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/50">
                {inHouseGuests.map(b => (
                  <tr key={b.id} className="text-stone-400 hover:bg-stone-800/30 transition-colors">
                    <td className="py-3 px-4 text-red-400/60 font-mono text-xs">{b.id}</td>
                    <td className="py-3 px-4 text-stone-300">{b.guest}</td>
                    <td className="py-3 px-4">{b.room} · {b.roomType}</td>
                    <td className="py-3 px-4">{formatDate(b.checkOut)}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-blue-400 text-xs bg-blue-900/20 px-2 py-0.5 rounded-full border border-blue-800/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Checked In
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckIns;

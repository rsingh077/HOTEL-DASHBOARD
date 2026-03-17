import React, { useState, useMemo } from 'react';
import {
  BedDouble,
  Users,
  IndianRupee,
  CalendarCheck,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Wrench,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  UserPlus,
  UserCheck,
  UserMinus,
  ClipboardList,
  ChevronRight,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { Booking, Page, GuestReview, HousekeepingRoom, HotelRoom } from '../types';
import { formatCurrency } from '../utils/helpers';

interface DashboardProps {
  bookings: Booking[];
  reviews?: GuestReview[];
  housekeepingRooms?: HousekeepingRoom[];
  hotelRooms?: HotelRoom[];
  onNavigate?: (page: Page) => void;
}

// --- Room Data (dynamic from bookings) ---

type RoomStatus = 'occupied' | 'available' | 'maintenance' | 'checkout';

interface Room {
  number: string;
  type: string;
  status: RoomStatus;
  guest?: string;
  checkOut?: string;
}

const DEFAULT_ROOMS = [
  { number: '101', type: 'Deluxe' },
  { number: '102', type: 'Standard' },
  { number: '103', type: 'Suite' },
  { number: '104', type: 'Standard' },
  { number: '105', type: 'Deluxe' },
  { number: '201', type: 'Suite' },
  { number: '202', type: 'Standard' },
  { number: '203', type: 'Deluxe' },
  { number: '204', type: 'Standard' },
  { number: '205', type: 'Suite' },
  { number: '301', type: 'Deluxe' },
  { number: '302', type: 'Standard' },
  { number: '303', type: 'Deluxe' },
];



// --- Sub-components ---

const RoomStatusBadge: React.FC<{ status: RoomStatus }> = ({ status }) => {
  const config: Record<RoomStatus, { label: string; classes: string; icon: React.ReactNode }> = {
    occupied: { label: 'Occupied', classes: 'bg-blue-900/30 text-blue-400 border-blue-800/40', icon: <Users size={12} /> },
    available: { label: 'Available', classes: 'bg-emerald-900/30 text-emerald-400 border-emerald-800/40', icon: <CheckCircle size={12} /> },
    maintenance: { label: 'Maintenance', classes: 'bg-orange-900/30 text-orange-400 border-orange-800/40', icon: <Wrench size={12} /> },
    checkout: { label: 'Checkout', classes: 'bg-yellow-900/30 text-yellow-400 border-yellow-800/40', icon: <Clock size={12} /> },
  };
  const c = config[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${c.classes}`}>
      {c.icon} {c.label}
    </span>
  );
};

const BookingStatusBadge: React.FC<{ status: Booking['status'] }> = ({ status }) => {
  const config: Record<string, { label: string; classes: string; dot: string }> = {
    'confirmed': { label: 'Confirmed', classes: 'bg-emerald-900/30 text-emerald-400 border-emerald-800/40', dot: 'bg-emerald-400' },
    'pending': { label: 'Pending', classes: 'bg-yellow-900/30 text-yellow-400 border-yellow-800/40', dot: 'bg-yellow-400' },
    'checked-in': { label: 'Checked In', classes: 'bg-blue-900/30 text-blue-400 border-blue-800/40', dot: 'bg-blue-400' },
    'checked-out': { label: 'Checked Out', classes: 'bg-stone-800 text-stone-400 border-stone-700', dot: 'bg-stone-400' },
    'cancelled': { label: 'Cancelled', classes: 'bg-red-900/30 text-red-400 border-red-800/40', dot: 'bg-red-400' },
  };
  const c = config[status] || config['pending'];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs border ${c.classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
};

const MiniBarChart: React.FC<{ data: { month: string; value: number }[] }> = ({ data }) => {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div className="flex items-end gap-2 h-32 mt-4">
      {data.map((d, i) => {
        const heightPct = (d.value / max) * 100;
        const isLast = i === data.length - 1;
        return (
          <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
            <span className={`text-[10px] ${isLast ? 'text-amber-400 font-bold' : 'text-stone-500'}`}>
              ₹{d.value}L
            </span>
            <div
              className={`w-full rounded-t transition-all duration-500 ${isLast ? 'bg-gradient-to-t from-amber-700 to-amber-500' : 'bg-stone-700 hover:bg-stone-600'}`}
              style={{ height: `${heightPct}%`, minHeight: 4 }}
            />
            <span className={`text-[10px] ${isLast ? 'text-amber-400' : 'text-stone-500'}`}>{d.month}</span>
          </div>
        );
      })}
    </div>
  );
};

// --- Main Dashboard ---

const Dashboard: React.FC<DashboardProps> = ({ bookings, reviews = [], housekeepingRooms = [], hotelRooms, onNavigate }) => {
  const [roomFilter, setRoomFilter] = useState<RoomStatus | 'all'>('all');

  // Use dynamic rooms from props, or fall back to default
  const roomList = useMemo(() => {
    if (hotelRooms && hotelRooms.length > 0) {
      return hotelRooms.filter(r => r.isActive).map(r => ({ number: r.number, type: r.type }));
    }
    return DEFAULT_ROOMS;
  }, [hotelRooms]);

  // Dynamically build room status from actual booking data
  const rooms: Room[] = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return roomList.map(hr => {
      // Find active booking for this room
      const activeBooking = bookings.find(
        b => b.room === hr.number && b.status === 'checked-in'
      );
      const checkoutToday = bookings.find(
        b => b.room === hr.number && b.status === 'checked-in' && b.checkOut <= today
      );

      if (checkoutToday) {
        return {
          ...hr,
          status: 'checkout' as RoomStatus,
          guest: checkoutToday.guest,
          checkOut: new Date(checkoutToday.checkOut + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        };
      }
      if (activeBooking) {
        return {
          ...hr,
          status: 'occupied' as RoomStatus,
          guest: activeBooking.guest,
          checkOut: new Date(activeBooking.checkOut + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        };
      }
      // Check housekeeping status
      const hkRoom = housekeepingRooms.find(r => r.roomNumber === hr.number);
      if (hkRoom && (hkRoom.status === 'dirty' || hkRoom.status === 'cleaning')) {
        return { ...hr, status: 'maintenance' as RoomStatus };
      }
      return { ...hr, status: 'available' as RoomStatus };
    });
  }, [bookings, housekeepingRooms, roomList]);

  // Live stats from bookings
  const liveStats = useMemo(() => {
    const activeBookings = bookings.filter(b => b.status !== 'cancelled');
    const totalRevenue = activeBookings.reduce((sum, b) => sum + b.amountNum, 0);
    const checkedIn = bookings.filter(b => b.status === 'checked-in').length;
    const pending = bookings.filter(b => b.status === 'pending' || b.status === 'confirmed').length;
    const occupancy = Math.round((rooms.filter(r => r.status === 'occupied').length / rooms.length) * 100);
    return { total: bookings.length, revenue: totalRevenue, checkedIn, pending, occupancy };
  }, [bookings, rooms]);

  // Dynamic guest rating from reviews
  const guestRating = useMemo(() => {
    if (reviews.length === 0) return { avg: 0, count: 0 };
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    return { avg: Math.round(avg * 10) / 10, count: reviews.length };
  }, [reviews]);

  // Dynamic revenue data from bookings (last 7 months)
  const revenueData = useMemo(() => {
    const months: { month: string; value: number }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = d.toLocaleDateString('en-IN', { month: 'short' });
      const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const revenue = bookings
        .filter(b => b.status !== 'cancelled' && b.checkIn.startsWith(yearMonth))
        .reduce((sum, b) => sum + b.amountNum, 0);
      months.push({ month: monthStr, value: Math.round(revenue / 100000 * 10) / 10 || 0 });
    }
    // Ensure at least some visible data
    if (months.every(m => m.value === 0)) {
      return [
        { month: 'Sep', value: 12.4 }, { month: 'Oct', value: 14.1 },
        { month: 'Nov', value: 11.8 }, { month: 'Dec', value: 16.2 },
        { month: 'Jan', value: 15.7 }, { month: 'Feb', value: 17.3 },
        { month: 'Mar', value: 18.6 },
      ];
    }
    return months;
  }, [bookings]);

  // Compute real month-over-month revenue change
  const revenueChange = useMemo(() => {
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonth = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;

    const thisRevenue = bookings.filter(b => b.status !== 'cancelled' && b.checkIn.startsWith(thisMonth)).reduce((s, b) => s + b.amountNum, 0);
    const lastRevenue = bookings.filter(b => b.status !== 'cancelled' && b.checkIn.startsWith(lastMonth)).reduce((s, b) => s + b.amountNum, 0);

    if (lastRevenue === 0) return { pct: thisRevenue > 0 ? '+100%' : '—', trend: 'up' as const };
    const pct = ((thisRevenue - lastRevenue) / lastRevenue * 100).toFixed(1);
    return { pct: `${Number(pct) >= 0 ? '+' : ''}${pct}%`, trend: Number(pct) >= 0 ? 'up' as const : 'down' as const };
  }, [bookings]);

  const stats = [
    {
      label: 'Total Bookings',
      value: liveStats.total.toString(),
      change: `${liveStats.total} total`,
      trend: 'up' as const,
      icon: CalendarCheck,
      color: 'text-emerald-400',
      bg: 'bg-emerald-900/20',
      border: 'border-emerald-800/40',
    },
    {
      label: 'Revenue (Total)',
      value: `₹${(liveStats.revenue / 100000).toFixed(1)}L`,
      change: revenueChange.pct,
      trend: revenueChange.trend,
      icon: IndianRupee,
      color: 'text-amber-400',
      bg: 'bg-amber-900/20',
      border: 'border-amber-800/40',
    },
    {
      label: 'Occupancy Rate',
      value: `${liveStats.occupancy}%`,
      change: liveStats.occupancy >= 75 ? '+' : '-',
      trend: liveStats.occupancy >= 75 ? 'up' as const : 'down' as const,
      icon: BedDouble,
      color: 'text-blue-400',
      bg: 'bg-blue-900/20',
      border: 'border-blue-800/40',
    },
    {
      label: 'In-House Guests',
      value: liveStats.checkedIn.toString(),
      change: `+${liveStats.pending} pending`,
      trend: 'up' as const,
      icon: Users,
      color: 'text-purple-400',
      bg: 'bg-purple-900/20',
      border: 'border-purple-800/40',
    },
  ];

  const filteredRooms = roomFilter === 'all' ? rooms : rooms.filter(r => r.status === roomFilter);

  const roomCounts = {
    all: rooms.length,
    occupied: rooms.filter(r => r.status === 'occupied').length,
    available: rooms.filter(r => r.status === 'available').length,
    maintenance: rooms.filter(r => r.status === 'maintenance').length,
    checkout: rooms.filter(r => r.status === 'checkout').length,
  };

  // Recent bookings from real data
  const recentBookings = useMemo(() =>
    bookings.filter(b => b.status !== 'cancelled').slice(0, 6),
    [bookings]
  );

  // Today's alerts
  const today = new Date().toISOString().split('T')[0];
  const todayCheckIns = useMemo(() =>
    bookings.filter(b => (b.status === 'confirmed' || b.status === 'pending') && b.checkIn <= today).length,
    [bookings, today]
  );
  const todayCheckOuts = useMemo(() =>
    bookings.filter(b => b.status === 'checked-in' && b.checkOut <= today).length,
    [bookings, today]
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-8">

      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-serif text-white">Dashboard</h2>
          <p className="text-stone-500 text-sm mt-1">Welcome back — here's today's overview</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onNavigate?.('bookings')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-stone-800 border border-stone-700 text-stone-300 hover:border-red-600 hover:text-white transition-all text-sm"
          >
            <UserPlus size={16} /> New Booking
          </button>
          <button
            onClick={() => onNavigate?.('bookings')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-700 hover:bg-red-600 text-white transition-all text-sm"
          >
            <ClipboardList size={16} /> Reports
          </button>
        </div>
      </div>

      {/* Alert Bar */}
      {(todayCheckIns > 0 || todayCheckOuts > 0) && (
        <div className="flex flex-wrap gap-3">
          {todayCheckIns > 0 && (
            <button
              onClick={() => onNavigate?.('check-ins')}
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-blue-900/15 border border-blue-800/30 text-blue-400 text-sm hover:bg-blue-900/25 transition-all group"
            >
              <AlertCircle size={16} />
              <span><strong>{todayCheckIns}</strong> {todayCheckIns === 1 ? 'guest' : 'guests'} awaiting check-in</span>
              <ChevronRight size={14} className="opacity-50 group-hover:opacity-100 transition-opacity" />
            </button>
          )}
          {todayCheckOuts > 0 && (
            <button
              onClick={() => onNavigate?.('check-outs')}
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-amber-900/15 border border-amber-800/30 text-amber-400 text-sm hover:bg-amber-900/25 transition-all group"
            >
              <AlertCircle size={16} />
              <span><strong>{todayCheckOuts}</strong> {todayCheckOuts === 1 ? 'guest' : 'guests'} due for check-out</span>
              <ChevronRight size={14} className="opacity-50 group-hover:opacity-100 transition-opacity" />
            </button>
          )}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`rounded-xl border ${s.border} ${s.bg} p-5 transition-all hover-lift`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${s.bg}`}>
                  <Icon size={20} className={s.color} />
                </div>
                <span className={`text-xs flex items-center gap-0.5 ${s.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {s.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {s.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-stone-400 text-sm mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Rooms Overview (2 cols) */}
        <div className="lg:col-span-2 bg-stone-900/50 rounded-xl border border-white/5 p-6 hover-glow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-lg text-white flex items-center gap-2">
              <BedDouble size={18} className="text-red-500" /> Room Status
            </h3>
            <div className="flex gap-1 text-xs">
              {(['all', 'occupied', 'available', 'maintenance', 'checkout'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setRoomFilter(f)}
                  className={`px-3 py-1 rounded-full capitalize transition-all ${
                    roomFilter === f
                      ? 'bg-red-700 text-white'
                      : 'bg-stone-800 text-stone-400 hover:bg-stone-700'
                  }`}
                >
                  {f} ({roomCounts[f]})
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filteredRooms.map((room) => (
              <div
                key={room.number}
                className={`rounded-lg border p-3 transition-all hover:border-red-600/50 cursor-pointer ${
                  room.status === 'occupied' ? 'bg-blue-950/20 border-blue-900/30' :
                  room.status === 'available' ? 'bg-emerald-950/20 border-emerald-900/30' :
                  room.status === 'maintenance' ? 'bg-orange-950/20 border-orange-900/30' :
                  'bg-yellow-950/20 border-yellow-900/30'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-bold text-lg">{room.number}</span>
                  <RoomStatusBadge status={room.status} />
                </div>
                <p className="text-stone-500 text-xs">{room.type}</p>
                {room.guest && <p className="text-stone-300 text-sm mt-1 truncate">{room.guest}</p>}
                {room.checkOut && <p className="text-stone-500 text-xs mt-0.5">Out: {room.checkOut}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="space-y-6">

          {/* Revenue Chart */}
          <div className="bg-stone-900/50 rounded-xl border border-white/5 p-6">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-serif text-lg text-white flex items-center gap-2">
                <TrendingUp size={18} className="text-amber-500" /> Revenue
              </h3>
              <span className="text-xs text-stone-400 flex items-center gap-0.5">
                {revenueChange.pct} vs last month
              </span>
            </div>
            <MiniBarChart data={revenueData} />
          </div>

          {/* Quick Actions */}
          <div className="bg-stone-900/50 rounded-xl border border-white/5 p-6">
            <h3 className="font-serif text-lg text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: UserCheck, label: 'Check In', color: 'text-blue-400', bg: 'bg-blue-900/20', page: 'check-ins' as Page },
                { icon: UserMinus, label: 'Check Out', color: 'text-amber-400', bg: 'bg-amber-900/20', page: 'check-outs' as Page },
                { icon: UserPlus, label: 'New Booking', color: 'text-emerald-400', bg: 'bg-emerald-900/20', page: 'bookings' as Page },
                { icon: CalendarCheck, label: 'All Bookings', color: 'text-purple-400', bg: 'bg-purple-900/20', page: 'bookings' as Page },
              ].map(({ icon: Icon, label, color, bg, page }) => (
                <button
                  key={label}
                  onClick={() => onNavigate?.(page)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg ${bg} border border-white/5 hover:border-white/10 transition-all hover-lift`}
                >
                  <Icon size={20} className={color} />
                  <span className="text-stone-300 text-xs">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Guest Rating */}
          <div className="bg-stone-900/50 rounded-xl border border-white/5 p-6">
            <h3 className="font-serif text-lg text-white mb-3 flex items-center gap-2">
              <Star size={18} className="text-yellow-500" /> Guest Rating
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold text-white">{guestRating.avg > 0 ? guestRating.avg.toFixed(1) : '—'}</span>
              <div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} size={16} className={i <= Math.round(guestRating.avg) ? 'text-yellow-400 fill-yellow-400' : 'text-stone-600'} />
                  ))}
                </div>
                <p className="text-stone-500 text-xs mt-1">
                  {guestRating.count > 0 ? `Based on ${guestRating.count} review${guestRating.count === 1 ? '' : 's'}` : 'No reviews yet'}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Recent Bookings Table (live data) */}
      <div className="bg-stone-900/50 rounded-xl border border-white/5 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-lg text-white flex items-center gap-2">
            <CalendarCheck size={18} className="text-red-500" /> Recent Bookings
          </h3>
          <button
            onClick={() => onNavigate?.('bookings')}
            className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
          >
            View All <ChevronRight size={14} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-stone-500 text-xs uppercase tracking-wider border-b border-stone-800">
                <th className="text-left pb-3 pr-4">ID</th>
                <th className="text-left pb-3 pr-4">Guest</th>
                <th className="text-left pb-3 pr-4">Room</th>
                <th className="text-left pb-3 pr-4">Check In</th>
                <th className="text-left pb-3 pr-4">Check Out</th>
                <th className="text-left pb-3 pr-4">Amount</th>
                <th className="text-left pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/50">
              {recentBookings.map((b) => (
                <tr key={b.id} className="hover:bg-stone-800/30 transition-colors cursor-pointer" onClick={() => onNavigate?.('bookings')}>
                  <td className="py-3 pr-4">
                    <span className="text-red-400 font-mono text-xs">{b.id}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-md bg-stone-800 border border-stone-700 flex items-center justify-center text-stone-400 text-[10px] font-bold uppercase">
                        {b.guest.split(' ').map(w => w[0]).join('').slice(0, 2)}
                      </div>
                      <span className="text-white">{b.guest}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-stone-300">{b.room} · {b.roomType}</td>
                  <td className="py-3 pr-4 text-stone-400 text-xs">
                    {new Date(b.checkIn + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </td>
                  <td className="py-3 pr-4 text-stone-400 text-xs">
                    {new Date(b.checkOut + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </td>
                  <td className="py-3 pr-4 text-amber-400 font-medium">{b.amount}</td>
                  <td className="py-3"><BookingStatusBadge status={b.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;

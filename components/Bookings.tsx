import React, { useState, useMemo } from 'react';
import {
  CalendarCheck,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  X,
  User,
  BedDouble,
  Phone,
  Mail,
  IndianRupee,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Users,
  FileText,
  RotateCcw,
  Hash,
  Sparkles,
} from 'lucide-react';
import { Booking, BookingStatus, Page, HotelRoom } from '../types';
import { ROOM_RATES, calcNights, formatCurrency, formatDate, todayStr } from '../utils/helpers';
import Toast from './shared/Toast';

// --- Sub-components ---

const StatusBadge: React.FC<{ status: BookingStatus; size?: 'sm' | 'md' }> = ({ status, size = 'sm' }) => {
  const config: Record<BookingStatus, { label: string; classes: string; dot: string }> = {
    'confirmed': { label: 'Confirmed', classes: 'bg-emerald-900/30 text-emerald-400 border-emerald-800/40', dot: 'bg-emerald-400' },
    'pending': { label: 'Pending', classes: 'bg-yellow-900/30 text-yellow-400 border-yellow-800/40', dot: 'bg-yellow-400' },
    'checked-in': { label: 'Checked In', classes: 'bg-blue-900/30 text-blue-400 border-blue-800/40', dot: 'bg-blue-400' },
    'checked-out': { label: 'Checked Out', classes: 'bg-stone-800 text-stone-400 border-stone-700', dot: 'bg-stone-400' },
    'cancelled': { label: 'Cancelled', classes: 'bg-red-900/30 text-red-400 border-red-800/40', dot: 'bg-red-400' },
  };
  const c = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${c.classes} ${size === 'md' ? 'px-3 py-1 text-sm' : 'px-2.5 py-0.5 text-xs'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
};

// Toast imported from shared/Toast

// --- Booking Detail Modal ---

interface DetailModalProps {
  booking: Booking;
  onClose: () => void;
  onStatusChange: (id: string, status: BookingStatus) => void;
  onDelete: (id: string) => void;
}

const BookingDetailModal: React.FC<DetailModalProps> = ({ booking, onClose, onStatusChange, onDelete }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-stone-900 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl anim-scale-in">
        <div className={`h-1 rounded-t-2xl ${
          booking.status === 'checked-in' ? 'bg-blue-500' :
          booking.status === 'confirmed' ? 'bg-emerald-500' :
          booking.status === 'pending' ? 'bg-yellow-500' :
          booking.status === 'cancelled' ? 'bg-red-500' : 'bg-stone-600'
        }`} />

        <div className="flex items-center justify-between p-6 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h3 className="font-serif text-xl text-white">{booking.guest}</h3>
              <StatusBadge status={booking.status} size="md" />
            </div>
            <p className="text-red-400 font-mono text-sm flex items-center gap-1.5">
              <Hash size={12} /> {booking.id}
            </p>
          </div>
          <button onClick={onClose} className="text-stone-500 hover:text-white transition-colors p-2 hover:bg-stone-800 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 pb-4 space-y-5">
          <div className="flex gap-3">
            <div className="flex-1 bg-stone-800/60 rounded-xl p-3 border border-stone-700/50 flex items-center gap-2.5">
              <div className="w-8 h-8 bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Mail size={14} className="text-blue-400" />
              </div>
              <div>
                <p className="text-stone-500 text-[10px] uppercase tracking-wider">Email</p>
                <p className="text-stone-200 text-sm">{booking.email || '—'}</p>
              </div>
            </div>
            <div className="flex-1 bg-stone-800/60 rounded-xl p-3 border border-stone-700/50 flex items-center gap-2.5">
              <div className="w-8 h-8 bg-emerald-900/30 rounded-lg flex items-center justify-center">
                <Phone size={14} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-stone-500 text-[10px] uppercase tracking-wider">Phone</p>
                <p className="text-stone-200 text-sm">{booking.phone}</p>
              </div>
            </div>
          </div>

          <div className="bg-stone-800/40 rounded-xl border border-stone-700/30 overflow-hidden">
            <div className="grid grid-cols-3 divide-x divide-stone-700/40">
              <div className="p-3.5 text-center">
                <p className="text-stone-500 text-[10px] uppercase tracking-wider mb-1">Room</p>
                <p className="text-white font-bold text-lg">{booking.room}</p>
                <p className="text-stone-400 text-xs">{booking.roomType}</p>
              </div>
              <div className="p-3.5 text-center">
                <p className="text-stone-500 text-[10px] uppercase tracking-wider mb-1">Duration</p>
                <p className="text-white font-bold text-lg">{booking.nights}</p>
                <p className="text-stone-400 text-xs">{booking.nights === 1 ? 'night' : 'nights'}</p>
              </div>
              <div className="p-3.5 text-center">
                <p className="text-stone-500 text-[10px] uppercase tracking-wider mb-1">Guests</p>
                <p className="text-white font-bold text-lg">{booking.guests}</p>
                <p className="text-stone-400 text-xs">{booking.guests === 1 ? 'person' : 'people'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 divide-x divide-stone-700/40 border-t border-stone-700/40">
              <div className="p-3.5 flex items-center gap-2.5">
                <div className="w-8 h-8 bg-emerald-900/20 rounded-lg flex items-center justify-center">
                  <Calendar size={14} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-stone-500 text-[10px] uppercase tracking-wider">Check In</p>
                  <p className="text-white text-sm font-medium">{formatDate(booking.checkIn)}</p>
                </div>
              </div>
              <div className="p-3.5 flex items-center gap-2.5">
                <div className="w-8 h-8 bg-red-900/20 rounded-lg flex items-center justify-center">
                  <Calendar size={14} className="text-red-400" />
                </div>
                <div>
                  <p className="text-stone-500 text-[10px] uppercase tracking-wider">Check Out</p>
                  <p className="text-white text-sm font-medium">{formatDate(booking.checkOut)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-900/20 to-amber-800/10 rounded-xl p-4 border border-amber-800/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-amber-900/30 rounded-xl flex items-center justify-center">
                <IndianRupee size={18} className="text-amber-400" />
              </div>
              <div>
                <p className="text-stone-400 text-xs">Total Amount</p>
                <p className="text-amber-400 font-bold text-xl">{booking.amount}</p>
              </div>
            </div>
            <p className="text-stone-500 text-xs">
              {formatCurrency(ROOM_RATES[booking.roomType] || 0)}/night × {booking.nights}
            </p>
          </div>

          {booking.specialRequests && (
            <div className="bg-stone-800/40 rounded-xl p-4 border border-stone-700/30">
              <p className="text-stone-500 text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileText size={12} /> Special Requests
              </p>
              <p className="text-stone-300 text-sm leading-relaxed">{booking.specialRequests}</p>
            </div>
          )}

          <p className="flex items-center gap-1.5 text-stone-600 text-xs">
            <Clock size={12} /> Created {formatDate(booking.createdAt)}
          </p>
        </div>

        <div className="flex gap-2.5 p-6 pt-4 border-t border-stone-800">
          {booking.status === 'pending' && (
            <button onClick={() => { onStatusChange(booking.id, 'confirmed'); onClose(); }}
              className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white flex items-center justify-center gap-2 text-sm transition-all font-medium">
              <CheckCircle size={16} /> Confirm
            </button>
          )}
          {booking.status === 'confirmed' && (
            <button onClick={() => { onStatusChange(booking.id, 'checked-in'); onClose(); }}
              className="flex-1 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-600 text-white flex items-center justify-center gap-2 text-sm transition-all font-medium">
              <CheckCircle size={16} /> Check In
            </button>
          )}
          {booking.status === 'checked-in' && (
            <button onClick={() => { onStatusChange(booking.id, 'checked-out'); onClose(); }}
              className="flex-1 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-600 text-white flex items-center justify-center gap-2 text-sm transition-all font-medium">
              <CheckCircle size={16} /> Check Out
            </button>
          )}
          {(booking.status === 'pending' || booking.status === 'confirmed') && !showDeleteConfirm && (
            <button onClick={() => { onStatusChange(booking.id, 'cancelled'); onClose(); }}
              className="py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center gap-2 text-sm transition-all border border-stone-700">
              <X size={16} /> Cancel
            </button>
          )}
          {!showDeleteConfirm ? (
            <button onClick={() => setShowDeleteConfirm(true)}
              className="py-2.5 px-3.5 rounded-xl bg-red-900/20 hover:bg-red-900/40 text-red-400 flex items-center justify-center text-sm transition-all border border-red-800/30" title="Delete">
              <Trash2 size={16} />
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-red-900/20 rounded-xl px-3 border border-red-800/30">
              <span className="text-red-400 text-xs">Delete?</span>
              <button onClick={() => { onDelete(booking.id); onClose(); }} className="text-red-400 hover:text-red-300 text-xs font-bold py-1 px-2">Yes</button>
              <button onClick={() => setShowDeleteConfirm(false)} className="text-stone-400 hover:text-white text-xs py-1 px-2">No</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- New Booking Modal ---

interface NewBookingModalProps {
  onClose: () => void;
  onAdd: (booking: Booking) => void;
  nextId: number;
  hotelRooms: HotelRoom[];
  bookings: Booking[];
}

const NewBookingModal: React.FC<NewBookingModalProps> = ({ onClose, onAdd, nextId, hotelRooms, bookings }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    guest: '', email: '', phone: '', room: '', roomType: 'Standard',
    checkIn: '', checkOut: '', guests: 1, specialRequests: '',
    paymentStatus: 'pending' as BookingStatus,
  });

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  // Filter rooms by selected type, show only active rooms of that type
  const availableRooms = useMemo(() => {
    const activeRooms = hotelRooms.filter(r => r.isActive && r.type === formData.roomType);
    // Mark rooms that are currently occupied (checked-in)
    return activeRooms.map(r => {
      const isOccupied = bookings.some(b => b.room === r.number && b.status === 'checked-in');
      return { ...r, isOccupied };
    }).sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }));
  }, [hotelRooms, bookings, formData.roomType]);

  const nights = calcNights(formData.checkIn, formData.checkOut);
  const rate = ROOM_RATES[formData.roomType] || 0;
  const totalAmount = nights * rate;

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!formData.guest.trim()) e.guest = 'Name is required';
    if (!formData.phone.trim()) e.phone = 'Phone is required';
    if (!formData.room.trim()) e.room = 'Room number is required';
    if (!formData.checkIn) e.checkIn = 'Required';
    if (!formData.checkOut) e.checkOut = 'Required';
    if (formData.checkIn && formData.checkOut && nights <= 0) e.checkOut = 'Must be after check-in';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const newBooking: Booking = {
      id: `BK-${nextId.toString().padStart(4, '0')}`,
      guest: formData.guest.trim(), email: formData.email.trim(), phone: formData.phone.trim(),
      room: formData.room.trim(), roomType: formData.roomType,
      checkIn: formData.checkIn, checkOut: formData.checkOut, nights,
      amount: formatCurrency(totalAmount), amountNum: totalAmount,
      status: formData.paymentStatus, guests: formData.guests,
      specialRequests: formData.specialRequests.trim() || undefined,
      createdAt: todayStr(),
    };
    onAdd(newBooking);
    setIsSubmitting(false);
    onClose();
  };

  const handleClearForm = () => {
    setFormData({ guest: '', email: '', phone: '', room: '', roomType: 'Standard', checkIn: '', checkOut: '', guests: 1, specialRequests: '', paymentStatus: 'pending' });
    setErrors({});
  };

  const inputClass = (field: string) =>
    `w-full bg-stone-800/80 border rounded-xl px-4 py-2.5 text-stone-200 placeholder-stone-600 focus:ring-1 outline-none transition-all text-sm ${
      errors[field] ? 'border-red-600 focus:border-red-600 focus:ring-red-600' : 'border-stone-700 focus:border-red-600 focus:ring-red-600'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-stone-900 border border-white/10 rounded-2xl w-full max-w-xl shadow-2xl max-h-[92vh] overflow-y-auto anim-scale-in">
        <div className="flex items-center justify-between p-6 border-b border-stone-800 sticky top-0 bg-stone-900 z-10 rounded-t-2xl">
          <div>
            <h3 className="font-serif text-xl text-white flex items-center gap-2">
              <Plus size={20} className="text-red-500" /> New Booking
            </h3>
            <p className="text-stone-500 text-sm mt-0.5">ID: <span className="font-mono text-red-400">BK-{nextId.toString().padStart(4, '0')}</span></p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleClearForm} className="p-2 rounded-lg text-stone-500 hover:text-white hover:bg-stone-800 transition-all" title="Clear form"><RotateCcw size={16} /></button>
            <button onClick={onClose} className="p-2 rounded-lg text-stone-500 hover:text-white hover:bg-stone-800 transition-all"><X size={20} /></button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Guest Info */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-stone-500 flex items-center gap-2 font-semibold"><User size={14} /> Guest Information</h4>
            <div className="space-y-1">
              <label className="text-xs text-stone-400">Full Name <span className="text-red-500">*</span></label>
              <input type="text" value={formData.guest} onChange={(e) => handleChange('guest', e.target.value)} className={inputClass('guest')} placeholder="e.g. Rajesh Kumar" />
              {errors.guest && <p className="text-red-400 text-xs">{errors.guest}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-stone-400">Email</label>
                <input type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} className={inputClass('email')} placeholder="email@example.com" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-stone-400">Phone <span className="text-red-500">*</span></label>
                <input type="tel" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} className={inputClass('phone')} placeholder="+91 XXXXX XXXXX" />
                {errors.phone && <p className="text-red-400 text-xs">{errors.phone}</p>}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-stone-400">Number of Guests</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <button key={n} type="button" onClick={() => handleChange('guests', n)}
                    className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${formData.guests === n ? 'bg-red-700 text-white border border-red-600' : 'bg-stone-800 text-stone-400 border border-stone-700 hover:border-stone-500'}`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-stone-800" />

          {/* Room Details */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-stone-500 flex items-center gap-2 font-semibold"><BedDouble size={14} /> Room Details</h4>
            {/* Room Type Selection */}
            <div className="space-y-1">
              <label className="text-xs text-stone-400">Room Type</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['Standard', 'Deluxe', 'Suite'] as const).map(t => (
                  <button key={t} type="button" onClick={() => { handleChange('roomType', t); handleChange('room', ''); }}
                    className={`py-2 rounded-lg text-xs font-medium transition-all ${formData.roomType === t ? 'bg-red-700 text-white border border-red-600' : 'bg-stone-800 text-stone-400 border border-stone-700 hover:border-stone-500'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-stone-800/40 rounded-xl px-4 py-2.5 border border-stone-700/30 flex items-center justify-between">
              <span className="text-stone-400 text-xs">Rate for {formData.roomType}</span>
              <span className="text-amber-400 font-medium text-sm">{formatCurrency(rate)} / night</span>
            </div>
            {/* Room Number Selection - filtered by type */}
            <div className="space-y-1">
              <label className="text-xs text-stone-400">Select Room <span className="text-red-500">*</span></label>
              {availableRooms.length === 0 ? (
                <div className="bg-stone-800/60 rounded-xl px-4 py-3 border border-stone-700/30 text-center">
                  <p className="text-stone-500 text-sm">No {formData.roomType} rooms available</p>
                  <p className="text-stone-600 text-xs mt-0.5">Add rooms from the Rooms management page</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {availableRooms.map(r => (
                    <button
                      key={r.number}
                      type="button"
                      onClick={() => !r.isOccupied && handleChange('room', r.number)}
                      disabled={r.isOccupied}
                      className={`relative py-2.5 rounded-xl text-sm font-medium transition-all ${
                        formData.room === r.number
                          ? 'bg-red-700 text-white border border-red-600 ring-1 ring-red-500'
                          : r.isOccupied
                            ? 'bg-stone-800/40 text-stone-600 border border-stone-800 cursor-not-allowed'
                            : 'bg-stone-800 text-stone-300 border border-stone-700 hover:border-red-700/50 hover:text-white'
                      }`}
                      title={r.isOccupied ? `Room ${r.number} is occupied` : `Select Room ${r.number}`}
                    >
                      {r.number}
                      {r.isOccupied && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border border-stone-900" title="Occupied" />
                      )}
                    </button>
                  ))}
                </div>
              )}
              {errors.room && <p className="text-red-400 text-xs">{errors.room}</p>}
              {availableRooms.length > 0 && (
                <p className="text-stone-600 text-[11px] flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-blue-500 rounded-full inline-block" /> = Occupied
                </p>
              )}
            </div>
          </div>

          <div className="border-t border-stone-800" />

          {/* Stay Dates */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-stone-500 flex items-center gap-2 font-semibold"><Calendar size={14} /> Stay Dates</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-stone-400">Check In <span className="text-red-500">*</span></label>
                <input type="date" value={formData.checkIn} onChange={(e) => handleChange('checkIn', e.target.value)} className={inputClass('checkIn')} />
                {errors.checkIn && <p className="text-red-400 text-xs">{errors.checkIn}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-xs text-stone-400">Check Out <span className="text-red-500">*</span></label>
                <input type="date" value={formData.checkOut} min={formData.checkIn || undefined} onChange={(e) => handleChange('checkOut', e.target.value)} className={inputClass('checkOut')} />
                {errors.checkOut && <p className="text-red-400 text-xs">{errors.checkOut}</p>}
              </div>
            </div>
            {nights > 0 && (
              <div className="bg-gradient-to-r from-amber-900/20 to-amber-800/10 rounded-xl p-4 border border-amber-800/30 flex items-center justify-between">
                <div>
                  <p className="text-stone-400 text-xs">{nights} {nights === 1 ? 'night' : 'nights'} × {formatCurrency(rate)}</p>
                  <p className="text-amber-400 font-bold text-xl mt-0.5">{formatCurrency(totalAmount)}</p>
                </div>
                <div className="w-12 h-12 bg-amber-900/30 rounded-xl flex items-center justify-center">
                  <IndianRupee size={22} className="text-amber-400" />
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-stone-800" />

          {/* Additional */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-stone-500 flex items-center gap-2 font-semibold"><FileText size={14} /> Additional Details</h4>
            <div className="space-y-1">
              <label className="text-xs text-stone-400">Initial Status</label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { val: 'pending' as BookingStatus, label: 'Pending', bg: 'bg-yellow-900/30', text: 'text-yellow-400', border: 'border-yellow-700/50', dot: 'bg-yellow-400' },
                  { val: 'confirmed' as BookingStatus, label: 'Confirmed', bg: 'bg-emerald-900/30', text: 'text-emerald-400', border: 'border-emerald-700/50', dot: 'bg-emerald-400' },
                  { val: 'checked-in' as BookingStatus, label: 'Checked In', bg: 'bg-blue-900/30', text: 'text-blue-400', border: 'border-blue-700/50', dot: 'bg-blue-400' },
                ]).map(s => (
                  <button key={s.val} type="button" onClick={() => handleChange('paymentStatus', s.val)}
                    className={`py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                      formData.paymentStatus === s.val ? `${s.bg} ${s.text} border ${s.border}` : 'bg-stone-800 text-stone-400 border border-stone-700 hover:border-stone-500'
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${formData.paymentStatus === s.val ? s.dot : 'bg-stone-600'}`} />
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-stone-400">Special Requests</label>
              <textarea value={formData.specialRequests} onChange={(e) => handleChange('specialRequests', e.target.value)}
                className="w-full bg-stone-800/80 border border-stone-700 rounded-xl px-4 py-2.5 text-stone-200 placeholder-stone-600 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all text-sm resize-none h-20"
                placeholder="Extra pillows, late checkout, dietary requirements..." />
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-3 border-t border-stone-800">
            <button type="submit" disabled={isSubmitting}
              className={`flex-1 py-3.5 rounded-xl font-serif text-base tracking-wide flex items-center justify-center gap-2.5 transition-all ${
                isSubmitting ? 'bg-stone-800 text-stone-400 cursor-wait' : 'bg-gradient-to-r from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 text-white shadow-lg shadow-red-900/20 hover:-translate-y-0.5'
              }`}>
              {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Creating Booking...</> : <><Plus size={18} /> Create Booking {totalAmount > 0 && `· ${formatCurrency(totalAmount)}`}</>}
            </button>
            <button type="button" onClick={onClose} className="px-6 py-3.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-sm transition-all border border-stone-700">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Main Bookings Page ---

const ITEMS_PER_PAGE = 10;

interface BookingsProps {
  bookings: Booking[];
  hotelRooms?: HotelRoom[];
  onAddBooking: (booking: Booking) => void;
  onStatusChange: (id: string, status: BookingStatus) => void;
  onDeleteBooking: (id: string) => void;
  onNavigate?: (page: Page) => void;
}

const Bookings: React.FC<BookingsProps> = ({ bookings, hotelRooms = [], onAddBooking, onStatusChange, onDeleteBooking, onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showNewBooking, setShowNewBooking] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const nextIdNum = useMemo(() => {
    const maxNum = bookings.reduce((max, b) => {
      const num = parseInt(b.id.replace('BK-', ''));
      return num > max ? num : max;
    }, 0);
    return maxNum + 1;
  }, [bookings]);

  const handleAddBooking = (booking: Booking) => {
    onAddBooking(booking);
    setToast({ message: `Booking ${booking.id} for ${booking.guest} created!`, type: 'success' });
    setStatusFilter('all');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleStatusChange = (id: string, newStatus: BookingStatus) => {
    onStatusChange(id, newStatus);
    const labels: Record<BookingStatus, string> = {
      'confirmed': 'Confirmed', 'checked-in': 'Checked in', 'checked-out': 'Checked out',
      'pending': 'Set to pending', 'cancelled': 'Cancelled',
    };
    setToast({ message: `${id} — ${labels[newStatus]}`, type: newStatus === 'cancelled' ? 'error' : 'success' });
  };

  const handleDelete = (id: string) => {
    onDeleteBooking(id);
    setToast({ message: `Booking ${id} deleted permanently.`, type: 'error' });
  };

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = q === '' || b.guest.toLowerCase().includes(q) || b.id.toLowerCase().includes(q) || b.room.includes(searchQuery) || b.email.toLowerCase().includes(q) || b.phone.includes(searchQuery);
      const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchQuery, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const statusCounts = useMemo(() => ({
    all: bookings.length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    pending: bookings.filter(b => b.status === 'pending').length,
    'checked-in': bookings.filter(b => b.status === 'checked-in').length,
    'checked-out': bookings.filter(b => b.status === 'checked-out').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  }), [bookings]);

  const totalRevenue = useMemo(() =>
    bookings.filter(b => b.status !== 'cancelled').reduce((sum, b) => sum + b.amountNum, 0),
    [bookings]
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-2">
        <button onClick={() => onNavigate?.('dashboard')} className="flex items-center gap-1 text-stone-500 hover:text-white transition-colors text-sm">
          <ChevronLeft size={16} /> Dashboard
        </button>
        <span className="text-stone-700">/</span>
        <span className="text-stone-300 text-sm">Bookings</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-serif text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-red-900/30 rounded-xl flex items-center justify-center border border-red-800/40">
              <CalendarCheck size={22} className="text-red-500" />
            </div>
            Bookings
          </h2>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-stone-500 text-sm">{bookings.length} total</p>
            <span className="text-stone-700">·</span>
            <p className="text-sm">Revenue: <span className="text-amber-400 font-medium">{formatCurrency(totalRevenue)}</span></p>
          </div>
        </div>
        <button onClick={() => setShowNewBooking(true)}
          className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 text-white shadow-lg shadow-red-900/20 transition-all text-sm font-medium hover:-translate-y-0.5">
          <Plus size={18} /> New Booking
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {([
          { key: 'all' as const, label: 'Total', icon: CalendarCheck, ac: 'bg-stone-800/60 border-stone-600', at: 'text-white', al: 'text-stone-300' },
          { key: 'checked-in' as const, label: 'Checked In', icon: Users, ac: 'bg-blue-900/20 border-blue-700/50', at: 'text-blue-400', al: 'text-blue-400' },
          { key: 'confirmed' as const, label: 'Confirmed', icon: CheckCircle, ac: 'bg-emerald-900/20 border-emerald-700/50', at: 'text-emerald-400', al: 'text-emerald-400' },
          { key: 'pending' as const, label: 'Pending', icon: Clock, ac: 'bg-yellow-900/20 border-yellow-700/50', at: 'text-yellow-400', al: 'text-yellow-400' },
          { key: 'checked-out' as const, label: 'Checked Out', icon: BedDouble, ac: 'bg-stone-800/60 border-stone-600', at: 'text-stone-300', al: 'text-stone-400' },
          { key: 'cancelled' as const, label: 'Cancelled', icon: X, ac: 'bg-red-900/20 border-red-700/50', at: 'text-red-400', al: 'text-red-400' },
        ]).map(({ key, label, icon: Icon, ac, at, al }) => (
          <button key={key} onClick={() => { setStatusFilter(key); setCurrentPage(1); }}
            className={`rounded-xl p-3 border transition-all text-left ${statusFilter === key ? ac : 'bg-stone-900/50 border-stone-800/50 hover:border-stone-600'}`}>
            <div className="flex items-center justify-between mb-1">
              <Icon size={14} className={statusFilter === key ? at : 'text-stone-500'} />
              <span className={`text-xl font-bold ${statusFilter === key ? 'text-white' : 'text-stone-300'}`}>{statusCounts[key]}</span>
            </div>
            <p className={`text-[10px] uppercase tracking-wider ${statusFilter === key ? al : 'text-stone-500'}`}>{label}</p>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500" />
        <input type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          className="w-full bg-stone-900/80 border border-stone-700 rounded-xl pl-12 pr-4 py-3 text-stone-200 placeholder-stone-600 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all text-sm"
          placeholder="Search by guest name, booking ID, room, email, or phone..." />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500 hover:text-white transition-colors"><X size={16} /></button>
        )}
      </div>

      {/* Table */}
      <div className="bg-stone-900/50 rounded-2xl border border-white/5 overflow-hidden hover-glow">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-stone-500 text-[11px] uppercase tracking-wider border-b border-stone-800 bg-stone-900/80">
                <th className="text-left py-4 px-5 font-medium">Booking</th>
                <th className="text-left py-4 px-5 font-medium">Guest</th>
                <th className="text-left py-4 px-5 font-medium">Room</th>
                <th className="text-left py-4 px-5 font-medium">Check In</th>
                <th className="text-left py-4 px-5 font-medium">Check Out</th>
                <th className="text-left py-4 px-5 font-medium">Amount</th>
                <th className="text-left py-4 px-5 font-medium">Status</th>
                <th className="text-center py-4 px-5 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/50">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <Search size={36} className="mx-auto mb-3 text-stone-700" />
                    <p className="text-stone-500 font-medium">No bookings found</p>
                    <p className="text-stone-600 text-xs mt-1">Try adjusting your search or filter</p>
                  </td>
                </tr>
              ) : paginated.map((b) => (
                <tr key={b.id} className="hover:bg-stone-800/30 transition-colors cursor-pointer group" onClick={() => setSelectedBooking(b)}>
                  <td className="py-4 px-5">
                    <span className="text-red-400 font-mono font-medium text-xs bg-red-900/10 px-2 py-1 rounded-md border border-red-900/20">{b.id}</span>
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-stone-800 border border-stone-700 flex items-center justify-center text-stone-400 text-xs font-bold uppercase">
                        {b.guest.split(' ').map(w => w[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-white font-medium">{b.guest}</p>
                        <p className="text-stone-500 text-xs">{b.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold">{b.room}</span>
                      <span className="text-stone-500 text-xs bg-stone-800 px-1.5 py-0.5 rounded">{b.roomType}</span>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-stone-300 text-xs">{formatDate(b.checkIn)}</td>
                  <td className="py-4 px-5 text-stone-300 text-xs">{formatDate(b.checkOut)}</td>
                  <td className="py-4 px-5">
                    <span className="text-amber-400 font-medium">{b.amount}</span>
                    <span className="text-stone-600 text-xs ml-1">({b.nights}n)</span>
                  </td>
                  <td className="py-4 px-5"><StatusBadge status={b.status} /></td>
                  <td className="py-4 px-5">
                    <div className="flex items-center justify-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); setSelectedBooking(b); }} className="p-1.5 rounded-lg hover:bg-stone-700 text-stone-400 hover:text-white transition-all" title="View"><Eye size={15} /></button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(b.id); }} className="p-1.5 rounded-lg hover:bg-red-900/30 text-stone-400 hover:text-red-400 transition-all" title="Delete"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filtered.length > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-stone-800">
            <p className="text-stone-500 text-sm">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"><ChevronLeft size={18} /></button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button key={page} onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 rounded-lg text-sm transition-all ${currentPage === page ? 'bg-red-700 text-white font-medium' : 'text-stone-400 hover:bg-stone-800 hover:text-white'}`}>{page}</button>
              ))}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"><ChevronRight size={18} /></button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedBooking && (
        <BookingDetailModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} onStatusChange={handleStatusChange} onDelete={handleDelete} />
      )}
      {showNewBooking && (
        <NewBookingModal onClose={() => setShowNewBooking(false)} onAdd={handleAddBooking} nextId={nextIdNum} hotelRooms={hotelRooms} bookings={bookings} />
      )}
    </div>
  );
};

export default Bookings;

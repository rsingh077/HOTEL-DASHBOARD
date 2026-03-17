import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  ChevronLeft,
  Search,
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  Loader2,
  BedDouble,
  Wrench,
  Eye,
  UserCheck,
  AlertTriangle,
  ClipboardCheck,
  Filter,
} from 'lucide-react';
import { Page, HousekeepingRoom, HousekeepingStatus } from '../types';
import Toast, { ToastData } from './shared/Toast';

interface HousekeepingProps {
  rooms: HousekeepingRoom[];
  onUpdateRoom: (roomNumber: string, updates: Partial<HousekeepingRoom>) => void;
  onNavigate: (page: Page) => void;
}

const STATUS_CONFIG: Record<HousekeepingStatus, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  dirty: { label: 'Dirty', color: 'text-red-400', bg: 'bg-red-900/20', border: 'border-red-800/40', icon: <AlertTriangle size={14} /> },
  cleaning: { label: 'Cleaning', color: 'text-amber-400', bg: 'bg-amber-900/20', border: 'border-amber-800/40', icon: <Loader2 size={14} className="animate-spin" /> },
  clean: { label: 'Clean', color: 'text-emerald-400', bg: 'bg-emerald-900/20', border: 'border-emerald-800/40', icon: <CheckCircle size={14} /> },
  inspected: { label: 'Inspected', color: 'text-blue-400', bg: 'bg-blue-900/20', border: 'border-blue-800/40', icon: <ClipboardCheck size={14} /> },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  low: { label: 'Low', color: 'text-stone-400', bg: 'bg-stone-800' },
  normal: { label: 'Normal', color: 'text-blue-400', bg: 'bg-blue-900/20' },
  high: { label: 'High', color: 'text-amber-400', bg: 'bg-amber-900/20' },
  urgent: { label: 'Urgent', color: 'text-red-400', bg: 'bg-red-900/20' },
};

const STAFF_MEMBERS = ['Ravi', 'Priya', 'Amit', 'Sunita', 'Deepa'];

const Housekeeping: React.FC<HousekeepingProps> = ({ rooms, onUpdateRoom, onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<HousekeepingStatus | 'all'>('all');
  const [toast, setToast] = useState<ToastData | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<HousekeepingRoom | null>(null);
  const [assignModalRoom, setAssignModalRoom] = useState<string | null>(null);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [notes, setNotes] = useState('');

  const statusCounts = useMemo(() => ({
    all: rooms.length,
    dirty: rooms.filter(r => r.status === 'dirty').length,
    cleaning: rooms.filter(r => r.status === 'cleaning').length,
    clean: rooms.filter(r => r.status === 'clean').length,
    inspected: rooms.filter(r => r.status === 'inspected').length,
  }), [rooms]);

  const filtered = useMemo(() => {
    return rooms.filter(r => {
      const matchesSearch = searchQuery === '' ||
        r.roomNumber.includes(searchQuery) ||
        r.roomType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.assignedTo?.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [rooms, searchQuery, statusFilter]);

  const handleStatusChange = (roomNumber: string, newStatus: HousekeepingStatus) => {
    const updates: Partial<HousekeepingRoom> = { status: newStatus };
    if (newStatus === 'clean' || newStatus === 'inspected') {
      updates.lastCleaned = new Date().toISOString().split('T')[0];
    }
    onUpdateRoom(roomNumber, updates);

    const labels: Record<HousekeepingStatus, string> = {
      dirty: 'marked as dirty',
      cleaning: 'cleaning started',
      clean: 'marked as clean',
      inspected: 'inspection complete',
    };
    setToast({ message: `Room ${roomNumber} — ${labels[newStatus]}`, type: 'success' });
  };

  const handleAssign = (roomNumber: string) => {
    if (!selectedStaff) return;
    onUpdateRoom(roomNumber, {
      assignedTo: selectedStaff,
      status: 'cleaning',
      notes: notes || undefined,
    });
    setToast({ message: `Room ${roomNumber} assigned to ${selectedStaff}`, type: 'info' });
    setAssignModalRoom(null);
    setSelectedStaff('');
    setNotes('');
  };

  const handlePriorityChange = (roomNumber: string, priority: HousekeepingRoom['priority']) => {
    onUpdateRoom(roomNumber, { priority });
    setToast({ message: `Room ${roomNumber} priority set to ${priority}`, type: 'info' });
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
        <span className="text-stone-300 text-sm">Housekeeping</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-serif text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-900/30 rounded-xl flex items-center justify-center border border-emerald-800/40">
              <Sparkles size={22} className="text-emerald-400" />
            </div>
            Housekeeping
          </h2>
          <p className="text-stone-500 text-sm mt-1">Manage room cleaning status and assignments</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {([
          { key: 'all' as const, label: 'Total Rooms', icon: BedDouble, color: 'text-white', bg: 'bg-stone-800/60 border-stone-600' },
          { key: 'dirty' as const, label: 'Dirty', icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-900/20 border-red-700/50' },
          { key: 'cleaning' as const, label: 'Cleaning', icon: Loader2, color: 'text-amber-400', bg: 'bg-amber-900/20 border-amber-700/50' },
          { key: 'clean' as const, label: 'Clean', icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-900/20 border-emerald-700/50' },
          { key: 'inspected' as const, label: 'Inspected', icon: ClipboardCheck, color: 'text-blue-400', bg: 'bg-blue-900/20 border-blue-700/50' },
        ]).map(({ key, label, icon: Icon, color, bg }) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`rounded-xl p-3 border transition-all text-left ${statusFilter === key ? bg : 'bg-stone-900/50 border-stone-800/50 hover:border-stone-600'}`}
          >
            <div className="flex items-center justify-between mb-1">
              <Icon size={14} className={statusFilter === key ? color : 'text-stone-500'} />
              <span className={`text-xl font-bold ${statusFilter === key ? 'text-white' : 'text-stone-300'}`}>{statusCounts[key]}</span>
            </div>
            <p className={`text-[10px] uppercase tracking-wider ${statusFilter === key ? color : 'text-stone-500'}`}>{label}</p>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-stone-900/80 border border-stone-700 rounded-xl pl-12 pr-10 py-3 text-stone-200 placeholder-stone-600 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all text-sm"
          placeholder="Search by room number, type, or assigned staff..."
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500 hover:text-white transition-colors">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Room Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(room => {
          const sc = STATUS_CONFIG[room.status];
          const pc = PRIORITY_CONFIG[room.priority];
          return (
            <div
              key={room.roomNumber}
              className={`bg-stone-900/60 rounded-xl border p-5 transition-all hover:border-stone-500 hover-lift ${sc.border}`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-xl">{room.roomNumber}</span>
                    <span className="text-stone-500 text-xs bg-stone-800 px-1.5 py-0.5 rounded">{room.roomType}</span>
                  </div>
                  {room.assignedTo && (
                    <p className="text-stone-400 text-xs flex items-center gap-1 mt-1">
                      <UserCheck size={11} /> {room.assignedTo}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${sc.bg} ${sc.color} ${sc.border}`}>
                    {sc.icon} {sc.label}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded ${pc.bg} ${pc.color}`}>
                    {pc.label} Priority
                  </span>
                </div>
              </div>

              {/* Last cleaned */}
              {room.lastCleaned && (
                <p className="text-stone-600 text-xs flex items-center gap-1 mb-2">
                  <Clock size={11} /> Last cleaned: {new Date(room.lastCleaned + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </p>
              )}

              {/* Notes */}
              {room.notes && (
                <div className="bg-stone-800/40 rounded-lg px-3 py-2 border border-stone-700/30 mb-3">
                  <p className="text-stone-400 text-xs">{room.notes}</p>
                </div>
              )}

              {/* Priority Selector */}
              <div className="flex gap-1 mb-3">
                {(['low', 'normal', 'high', 'urgent'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => handlePriorityChange(room.roomNumber, p)}
                    className={`flex-1 py-1 rounded text-[10px] capitalize transition-all ${
                      room.priority === p
                        ? `${PRIORITY_CONFIG[p].bg} ${PRIORITY_CONFIG[p].color} border border-stone-600`
                        : 'bg-stone-800 text-stone-600 hover:text-stone-400'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {room.status === 'dirty' && (
                  <>
                    <button
                      onClick={() => { setAssignModalRoom(room.roomNumber); setSelectedStaff(''); setNotes(''); }}
                      className="flex-1 py-2 rounded-lg bg-amber-900/20 hover:bg-amber-900/40 text-amber-400 flex items-center justify-center gap-1.5 text-xs transition-all border border-amber-800/30"
                    >
                      <Users size={13} /> Assign
                    </button>
                    <button
                      onClick={() => handleStatusChange(room.roomNumber, 'cleaning')}
                      className="flex-1 py-2 rounded-lg bg-blue-700 hover:bg-blue-600 text-white flex items-center justify-center gap-1.5 text-xs transition-all"
                    >
                      Start Cleaning
                    </button>
                  </>
                )}
                {room.status === 'cleaning' && (
                  <button
                    onClick={() => handleStatusChange(room.roomNumber, 'clean')}
                    className="flex-1 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white flex items-center justify-center gap-1.5 text-xs transition-all"
                  >
                    <CheckCircle size={13} /> Mark Clean
                  </button>
                )}
                {room.status === 'clean' && (
                  <button
                    onClick={() => handleStatusChange(room.roomNumber, 'inspected')}
                    className="flex-1 py-2 rounded-lg bg-blue-700 hover:bg-blue-600 text-white flex items-center justify-center gap-1.5 text-xs transition-all"
                  >
                    <ClipboardCheck size={13} /> Inspect & Approve
                  </button>
                )}
                {room.status === 'inspected' && (
                  <button
                    onClick={() => handleStatusChange(room.roomNumber, 'dirty')}
                    className="flex-1 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center gap-1.5 text-xs transition-all border border-stone-700"
                  >
                    <AlertTriangle size={13} /> Mark Dirty
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="bg-stone-900/30 rounded-xl border border-stone-800/50 p-12 text-center">
          <Sparkles size={36} className="text-stone-700 mx-auto mb-3" />
          <p className="text-stone-500">No rooms match your search</p>
        </div>
      )}

      {/* Assign Staff Modal */}
      {assignModalRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setAssignModalRoom(null)} />
          <div className="relative bg-stone-900 border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl anim-scale-in">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg text-white">Assign Room {assignModalRoom}</h3>
                <button onClick={() => setAssignModalRoom(null)} className="text-stone-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-stone-400 uppercase tracking-wider">Staff Member</label>
                <div className="grid grid-cols-2 gap-2">
                  {STAFF_MEMBERS.map(staff => (
                    <button
                      key={staff}
                      onClick={() => setSelectedStaff(staff)}
                      className={`py-2 rounded-lg text-sm transition-all ${
                        selectedStaff === staff
                          ? 'bg-emerald-700 text-white border border-emerald-600'
                          : 'bg-stone-800 text-stone-400 border border-stone-700 hover:border-stone-500'
                      }`}
                    >
                      {staff}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-stone-400 uppercase tracking-wider">Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-stone-800/80 border border-stone-700 rounded-xl px-4 py-2.5 text-stone-200 placeholder-stone-600 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-all text-sm resize-none h-20"
                  placeholder="e.g. Deep clean required, check minibar..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setAssignModalRoom(null)}
                  className="flex-1 py-2.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-sm transition-all border border-stone-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAssign(assignModalRoom)}
                  disabled={!selectedStaff}
                  className={`flex-1 py-2.5 rounded-lg text-sm transition-all flex items-center justify-center gap-2 ${
                    selectedStaff
                      ? 'bg-emerald-700 hover:bg-emerald-600 text-white'
                      : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                  }`}
                >
                  <UserCheck size={14} /> Assign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Housekeeping;

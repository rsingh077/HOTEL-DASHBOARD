import React, { useState, useMemo } from 'react';
import {
  BedDouble,
  Plus,
  Trash2,
  Search,
  X,
  AlertCircle,
  Building2,
  DoorOpen,
  Crown,
  Star,
  Filter,
  Hash,
  Layers,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { HotelRoom, RoomType, Page, Booking, HousekeepingRoom } from '../types';
import { ROOM_RATES, formatCurrency } from '../utils/helpers';
import Toast from './shared/Toast';

interface RoomsProps {
  rooms: HotelRoom[];
  bookings: Booking[];
  housekeepingRooms: HousekeepingRoom[];
  onAddRoom: (room: HotelRoom) => void;
  onRemoveRoom: (roomNumber: string) => void;
  onNavigate?: (page: Page) => void;
}

const ROOM_TYPES: RoomType[] = ['Standard', 'Deluxe', 'Suite'];

const ROOM_TYPE_CONFIG: Record<RoomType, { icon: React.ReactNode; color: string; bg: string; border: string }> = {
  Standard: {
    icon: <DoorOpen size={16} />,
    color: 'text-stone-400',
    bg: 'bg-stone-800/50',
    border: 'border-stone-700/50',
  },
  Deluxe: {
    icon: <Star size={16} />,
    color: 'text-amber-400',
    bg: 'bg-amber-900/20',
    border: 'border-amber-800/30',
  },
  Suite: {
    icon: <Crown size={16} />,
    color: 'text-purple-400',
    bg: 'bg-purple-900/20',
    border: 'border-purple-800/30',
  },
};

const Rooms: React.FC<RoomsProps> = ({ rooms, bookings, housekeepingRooms, onAddRoom, onRemoveRoom, onNavigate }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<RoomType | 'all'>('all');
  const [filterFloor, setFilterFloor] = useState<number | 0>(0);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Add Room form state
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newRoomType, setNewRoomType] = useState<RoomType>('Standard');
  const [newRoomFloor, setNewRoomFloor] = useState<number>(1);

  // Computed data
  const activeRooms = rooms.filter(r => r.isActive);

  const floors = useMemo(() => {
    const floorSet = new Set(activeRooms.map(r => r.floor));
    return Array.from(floorSet).sort((a, b) => a - b);
  }, [activeRooms]);

  const filteredRooms = useMemo(() => {
    return activeRooms
      .filter(r => {
        if (searchQuery && !r.number.includes(searchQuery) && !r.type.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        if (filterType !== 'all' && r.type !== filterType) return false;
        if (filterFloor !== 0 && r.floor !== filterFloor) return false;
        return true;
      })
      .sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }));
  }, [activeRooms, searchQuery, filterType, filterFloor]);

  const stats = useMemo(() => {
    const total = activeRooms.length;
    const byType = ROOM_TYPES.map(t => ({ type: t, count: activeRooms.filter(r => r.type === t).length }));
    const occupiedCount = activeRooms.filter(r => bookings.some(b => b.room === r.number && b.status === 'checked-in')).length;
    const totalRevenuePotential = activeRooms.reduce((sum, r) => sum + (ROOM_RATES[r.type] || 0), 0);
    return { total, byType, occupiedCount, availableCount: total - occupiedCount, totalRevenuePotential };
  }, [activeRooms, bookings]);

  // Check if a room is currently occupied
  const isRoomOccupied = (roomNumber: string): boolean => {
    return bookings.some(b => b.room === roomNumber && b.status === 'checked-in');
  };

  // Get room's current guest
  const getRoomGuest = (roomNumber: string): string | undefined => {
    const booking = bookings.find(b => b.room === roomNumber && b.status === 'checked-in');
    return booking?.guest;
  };

  // Get housekeeping status
  const getHousekeepingStatus = (roomNumber: string): string | undefined => {
    const hk = housekeepingRooms.find(r => r.roomNumber === roomNumber);
    return hk?.status;
  };

  const handleAddRoom = () => {
    const trimmed = newRoomNumber.trim();
    if (!trimmed) {
      setToast({ message: 'Please enter a room number', type: 'error' });
      return;
    }
    if (rooms.some(r => r.number === trimmed)) {
      setToast({ message: `Room ${trimmed} already exists`, type: 'error' });
      return;
    }
    if (!/^\d{2,4}$/.test(trimmed)) {
      setToast({ message: 'Room number must be 2-4 digits', type: 'error' });
      return;
    }

    const newRoom: HotelRoom = {
      number: trimmed,
      type: newRoomType,
      floor: newRoomFloor,
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
    };

    onAddRoom(newRoom);
    setShowAddModal(false);
    setNewRoomNumber('');
    setNewRoomType('Standard');
    setNewRoomFloor(1);
    setToast({ message: `Room ${trimmed} (${newRoomType}) added successfully!`, type: 'success' });
  };

  const handleDeleteRoom = (roomNumber: string) => {
    if (isRoomOccupied(roomNumber)) {
      setToast({ message: `Cannot remove Room ${roomNumber} — guest is currently checked in`, type: 'error' });
      setShowDeleteConfirm(null);
      return;
    }
    onRemoveRoom(roomNumber);
    setShowDeleteConfirm(null);
    setToast({ message: `Room ${roomNumber} has been removed`, type: 'info' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif text-white flex items-center gap-3">
            <Building2 className="text-red-500" size={32} />
            Room Management
          </h2>
          <p className="text-stone-400 mt-1">Add, manage, and organize your hotel rooms</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-700 hover:bg-red-600 text-white transition-all text-sm font-medium hover-lift"
        >
          <Plus size={18} />
          Add New Room
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-stone-900/80 border border-white/5 rounded-xl p-4 hover-lift">
          <div className="flex items-center gap-2 text-stone-400 text-xs uppercase tracking-wider mb-2">
            <BedDouble size={14} /> Total Rooms
          </div>
          <p className="text-2xl font-serif text-white">{stats.total}</p>
        </div>
        {stats.byType.map(({ type, count }) => {
          const cfg = ROOM_TYPE_CONFIG[type as RoomType];
          return (
            <div key={type} className={`${cfg.bg} border ${cfg.border} rounded-xl p-4 hover-lift`}>
              <div className={`flex items-center gap-2 text-xs uppercase tracking-wider mb-2 ${cfg.color}`}>
                {cfg.icon} {type}
              </div>
              <p className="text-2xl font-serif text-white">{count}</p>
              <p className="text-stone-500 text-xs mt-1">{formatCurrency(ROOM_RATES[type]!)}/night</p>
            </div>
          );
        })}
        <div className="bg-emerald-900/20 border border-emerald-800/30 rounded-xl p-4 hover-lift">
          <div className="flex items-center gap-2 text-emerald-400 text-xs uppercase tracking-wider mb-2">
            <CheckCircle size={14} /> Available
          </div>
          <p className="text-2xl font-serif text-white">{stats.availableCount}</p>
          <p className="text-stone-500 text-xs mt-1">{stats.occupiedCount} occupied</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
          <input
            type="text"
            placeholder="Search by room number or type..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-stone-900/80 border border-white/10 rounded-xl text-stone-200 text-sm placeholder-stone-500"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Filter size={16} className="text-stone-500" />
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value as RoomType | 'all')}
            className="bg-stone-900/80 border border-white/10 rounded-lg px-3 py-2 text-sm text-stone-200"
          >
            <option value="all">All Types</option>
            {ROOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select
            value={filterFloor}
            onChange={e => setFilterFloor(Number(e.target.value))}
            className="bg-stone-900/80 border border-white/10 rounded-lg px-3 py-2 text-sm text-stone-200"
          >
            <option value={0}>All Floors</option>
            {floors.map(f => <option key={f} value={f}>Floor {f}</option>)}
          </select>
        </div>
      </div>

      {/* Room Grid - grouped by floor */}
      {filteredRooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-stone-500">
          <BedDouble size={48} className="mb-4 opacity-40" />
          <p className="text-lg">No rooms found</p>
          <p className="text-sm mt-1">
            {searchQuery || filterType !== 'all' || filterFloor !== 0
              ? 'Try adjusting your filters'
              : 'Add your first room to get started'}
          </p>
        </div>
      ) : (
        (() => {
          // Group by floor
          const grouped = filteredRooms.reduce<Record<number, typeof filteredRooms>>((acc, room) => {
            if (!acc[room.floor]) acc[room.floor] = [];
            acc[room.floor].push(room);
            return acc;
          }, {});

          return Object.entries(grouped)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([floor, floorRooms]) => (
              <div key={floor} className="space-y-3">
                <div className="flex items-center gap-2">
                  <Layers size={16} className="text-red-500" />
                  <h3 className="font-serif text-white text-lg">Floor {floor}</h3>
                  <span className="text-stone-500 text-sm">({floorRooms.length} rooms)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {floorRooms.map(room => {
                    const cfg = ROOM_TYPE_CONFIG[room.type as RoomType];
                    const occupied = isRoomOccupied(room.number);
                    const guest = getRoomGuest(room.number);
                    const hkStatus = getHousekeepingStatus(room.number);

                    return (
                      <div
                        key={room.number}
                        className={`relative group bg-stone-900/80 border rounded-xl p-5 transition-all hover-lift ${
                          occupied ? 'border-blue-800/40' : 'border-white/5 hover:border-white/10'
                        }`}
                      >
                        {/* Room Number & Type */}
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <Hash size={14} className="text-stone-500" />
                              <span className="text-xl font-serif text-white">{room.number}</span>
                            </div>
                            <span className={`inline-flex items-center gap-1.5 text-xs mt-1 ${cfg.color}`}>
                              {cfg.icon} {room.type}
                            </span>
                          </div>
                          <span className="text-stone-500 text-xs">{formatCurrency(ROOM_RATES[room.type]!)}/n</span>
                        </div>

                        {/* Status */}
                        <div className="space-y-2 mb-4">
                          {occupied ? (
                            <div className="flex items-center gap-2 text-xs">
                              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                              <span className="text-blue-400">Occupied</span>
                              {guest && <span className="text-stone-500 truncate">— {guest}</span>}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-xs">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              <span className="text-emerald-400">Available</span>
                            </div>
                          )}
                          {hkStatus && (
                            <div className="flex items-center gap-2 text-xs text-stone-500">
                              <span className={`w-2 h-2 rounded-full ${
                                hkStatus === 'clean' || hkStatus === 'inspected' ? 'bg-emerald-500' :
                                hkStatus === 'cleaning' ? 'bg-amber-500 animate-pulse' : 'bg-red-500'
                              }`} />
                              HK: {hkStatus.charAt(0).toUpperCase() + hkStatus.slice(1)}
                            </div>
                          )}
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={() => setShowDeleteConfirm(room.number)}
                          className={`absolute top-3 right-3 p-1.5 rounded-lg transition-all ${
                            occupied
                              ? 'text-stone-600 cursor-not-allowed'
                              : 'text-stone-600 hover:text-red-400 hover:bg-red-900/20 opacity-0 group-hover:opacity-100'
                          }`}
                          disabled={occupied}
                          title={occupied ? 'Cannot remove occupied room' : 'Remove room'}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ));
        })()
      )}

      {/* Add Room Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-stone-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl anim-scale-in">
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl text-white flex items-center gap-2">
                  <Plus size={20} className="text-red-500" />
                  Add New Room
                </h3>
                <button onClick={() => setShowAddModal(false)} className="text-stone-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Room Number */}
              <div>
                <label className="block text-stone-400 text-sm mb-1.5">Room Number</label>
                <input
                  type="text"
                  value={newRoomNumber}
                  onChange={e => setNewRoomNumber(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="e.g. 401"
                  className="w-full px-4 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white text-sm placeholder-stone-500"
                  autoFocus
                />
              </div>

              {/* Room Type */}
              <div>
                <label className="block text-stone-400 text-sm mb-1.5">Room Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {ROOM_TYPES.map(type => {
                    const cfg = ROOM_TYPE_CONFIG[type];
                    const selected = newRoomType === type;
                    return (
                      <button
                        key={type}
                        onClick={() => setNewRoomType(type)}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all text-sm ${
                          selected
                            ? `${cfg.bg} ${cfg.border} ${cfg.color} ring-1 ring-current`
                            : 'bg-stone-800 border-stone-700 text-stone-400 hover:border-stone-600'
                        }`}
                      >
                        {cfg.icon}
                        <span>{type}</span>
                        <span className="text-[10px] text-stone-500">{formatCurrency(ROOM_RATES[type]!)}/n</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Floor */}
              <div>
                <label className="block text-stone-400 text-sm mb-1.5">Floor</label>
                <select
                  value={newRoomFloor}
                  onChange={e => setNewRoomFloor(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-white text-sm"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(f => (
                    <option key={f} value={f}>Floor {f}</option>
                  ))}
                </select>
              </div>

              {/* Preview */}
              <div className="bg-stone-800/50 border border-stone-700/50 rounded-xl p-4">
                <p className="text-stone-500 text-xs uppercase tracking-wider mb-2">Preview</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${ROOM_TYPE_CONFIG[newRoomType].bg} ${ROOM_TYPE_CONFIG[newRoomType].border} border flex items-center justify-center ${ROOM_TYPE_CONFIG[newRoomType].color}`}>
                      {ROOM_TYPE_CONFIG[newRoomType].icon}
                    </div>
                    <div>
                      <p className="text-white font-medium">{newRoomNumber || '---'}</p>
                      <p className="text-stone-400 text-xs">{newRoomType} · Floor {newRoomFloor}</p>
                    </div>
                  </div>
                  <p className="text-stone-400 text-sm">{formatCurrency(ROOM_RATES[newRoomType]!)}/night</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-sm transition-all border border-stone-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddRoom}
                  className="flex-1 py-2.5 rounded-xl bg-red-700 hover:bg-red-600 text-white text-sm transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> Add Room
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(null)} />
          <div className="relative bg-stone-900 border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl anim-scale-in">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-900/20 border border-red-800/30 mx-auto">
                <AlertCircle size={24} className="text-red-400" />
              </div>
              <div className="text-center">
                <h3 className="font-serif text-lg text-white">Remove Room {showDeleteConfirm}?</h3>
                <p className="text-stone-400 text-sm mt-1">
                  {isRoomOccupied(showDeleteConfirm)
                    ? 'This room is currently occupied and cannot be removed.'
                    : 'This will remove the room from the system. This action cannot be undone.'}
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-sm transition-all border border-stone-700"
                >
                  Cancel
                </button>
                {!isRoomOccupied(showDeleteConfirm) && (
                  <button
                    onClick={() => handleDeleteRoom(showDeleteConfirm)}
                    className="flex-1 py-2.5 rounded-xl bg-red-700 hover:bg-red-600 text-white text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Rooms;

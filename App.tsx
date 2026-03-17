import React, { useState, useEffect, useCallback } from 'react';
import Login from './components/Login';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Bookings from './components/Bookings';
import CheckIns from './components/CheckIns';
import CheckOuts from './components/CheckOuts';
import Profile from './components/Profile';
import Reviews from './components/Reviews';
import Housekeeping from './components/Housekeeping';
import Invoices from './components/Invoices';
import Rooms from './components/Rooms';
import Footer from './components/Footer';
import { Booking, BookingStatus, Page, GuestReview, ReviewReply, HousekeepingRoom, HotelRoom } from './types';
import { saveToStorage, loadFromStorage } from './utils/helpers';

// --- Shared Initial Bookings ---

const initialBookings: Booking[] = [];

// --- Initial Reviews ---

const initialReviews: GuestReview[] = [];

// --- App ---

// --- Initial Housekeeping Data ---

const initialHousekeeping: HousekeepingRoom[] = [
  { roomNumber: '101', roomType: 'Deluxe', status: 'inspected', priority: 'normal' },
  { roomNumber: '102', roomType: 'Standard', status: 'inspected', priority: 'normal' },
  { roomNumber: '103', roomType: 'Suite', status: 'inspected', priority: 'normal' },
  { roomNumber: '104', roomType: 'Standard', status: 'inspected', priority: 'normal' },
  { roomNumber: '105', roomType: 'Deluxe', status: 'inspected', priority: 'normal' },
  { roomNumber: '201', roomType: 'Suite', status: 'inspected', priority: 'normal' },
  { roomNumber: '202', roomType: 'Standard', status: 'inspected', priority: 'normal' },
  { roomNumber: '203', roomType: 'Deluxe', status: 'inspected', priority: 'normal' },
  { roomNumber: '204', roomType: 'Standard', status: 'inspected', priority: 'normal' },
  { roomNumber: '205', roomType: 'Suite', status: 'inspected', priority: 'normal' },
  { roomNumber: '301', roomType: 'Deluxe', status: 'inspected', priority: 'normal' },
  { roomNumber: '302', roomType: 'Standard', status: 'inspected', priority: 'normal' },
  { roomNumber: '303', roomType: 'Deluxe', status: 'inspected', priority: 'normal' },
];

// --- Initial Rooms ---

const initialRooms: HotelRoom[] = [
  { number: '101', type: 'Deluxe', floor: 1, isActive: true, createdAt: '2025-01-01' },
  { number: '102', type: 'Standard', floor: 1, isActive: true, createdAt: '2025-01-01' },
  { number: '103', type: 'Suite', floor: 1, isActive: true, createdAt: '2025-01-01' },
  { number: '104', type: 'Standard', floor: 1, isActive: true, createdAt: '2025-01-01' },
  { number: '105', type: 'Deluxe', floor: 1, isActive: true, createdAt: '2025-01-01' },
  { number: '201', type: 'Suite', floor: 2, isActive: true, createdAt: '2025-01-01' },
  { number: '202', type: 'Standard', floor: 2, isActive: true, createdAt: '2025-01-01' },
  { number: '203', type: 'Deluxe', floor: 2, isActive: true, createdAt: '2025-01-01' },
  { number: '204', type: 'Standard', floor: 2, isActive: true, createdAt: '2025-01-01' },
  { number: '205', type: 'Suite', floor: 2, isActive: true, createdAt: '2025-01-01' },
  { number: '301', type: 'Deluxe', floor: 3, isActive: true, createdAt: '2025-01-01' },
  { number: '302', type: 'Standard', floor: 3, isActive: true, createdAt: '2025-01-01' },
  { number: '303', type: 'Deluxe', floor: 3, isActive: true, createdAt: '2025-01-01' },
];

interface User {
  name: string;
  role: string;
  email: string;
}

function App() {
  // Load persisted data or fall back to initial data
  const [user, setUser] = useState<User | null>(() => loadFromStorage<User>('user'));
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [bookings, setBookings] = useState<Booking[]>(() => loadFromStorage<Booking[]>('bookings') || initialBookings);
  const [reviews, setReviews] = useState<GuestReview[]>(() => loadFromStorage<GuestReview[]>('reviews') || initialReviews);
  const [housekeepingRooms, setHousekeepingRooms] = useState<HousekeepingRoom[]>(() => loadFromStorage<HousekeepingRoom[]>('housekeeping') || initialHousekeeping);
  const [hotelRooms, setHotelRooms] = useState<HotelRoom[]>(() => loadFromStorage<HotelRoom[]>('rooms') || initialRooms);

  // Persist data to localStorage whenever it changes
  useEffect(() => { saveToStorage('bookings', bookings); }, [bookings]);
  useEffect(() => { saveToStorage('reviews', reviews); }, [reviews]);
  useEffect(() => { saveToStorage('housekeeping', housekeepingRooms); }, [housekeepingRooms]);
  useEffect(() => { saveToStorage('rooms', hotelRooms); }, [hotelRooms]);
  useEffect(() => { if (user) saveToStorage('user', user); }, [user]);

  if (!user) {
    return <Login onLogin={(u) => { setUser(u); saveToStorage('user', u); }} />;
  }

  const addBooking = (booking: Booking) => {
    setBookings(prev => [booking, ...prev]);
  };

  const updateBookingStatus = (id: string, status: BookingStatus) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  };

  const updateBooking = (id: string, updates: Partial<Booking>) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const deleteBooking = (id: string) => {
    setBookings(prev => prev.filter(b => b.id !== id));
  };

  const replyToReview = (reviewId: string, reply: ReviewReply) => {
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, reply } : r));
  };

  const updateHousekeepingRoom = (roomNumber: string, updates: Partial<HousekeepingRoom>) => {
    setHousekeepingRooms(prev => prev.map(r => r.roomNumber === roomNumber ? { ...r, ...updates } : r));
  };

  const addRoom = (room: HotelRoom) => {
    setHotelRooms(prev => [...prev, room]);
    // Also add a housekeeping entry for the new room
    setHousekeepingRooms(prev => [
      ...prev,
      { roomNumber: room.number, roomType: room.type, status: 'dirty', priority: 'normal' },
    ]);
  };

  const removeRoom = (roomNumber: string) => {
    setHotelRooms(prev => prev.filter(r => r.number !== roomNumber));
    // Also remove from housekeeping
    setHousekeepingRooms(prev => prev.filter(r => r.roomNumber !== roomNumber));
  };

  const handleLogout = () => {
    setUser(null);
    try { localStorage.removeItem('hotel_sahil_user'); } catch (e) {}
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard bookings={bookings} reviews={reviews} housekeepingRooms={housekeepingRooms} hotelRooms={hotelRooms} onNavigate={setCurrentPage} />;
      case 'bookings':
        return (
          <Bookings
            bookings={bookings}
            hotelRooms={hotelRooms}
            onAddBooking={addBooking}
            onStatusChange={updateBookingStatus}
            onDeleteBooking={deleteBooking}
            onNavigate={setCurrentPage}
          />
        );
      case 'check-ins':
        return (
          <CheckIns
            bookings={bookings}
            onStatusChange={updateBookingStatus}
            onNavigate={setCurrentPage}
          />
        );
      case 'check-outs':
        return (
          <CheckOuts
            bookings={bookings}
            onStatusChange={updateBookingStatus}
            onNavigate={setCurrentPage}
          />
        );
      case 'reviews':
        return (
          <Reviews
            reviews={reviews}
            onReplyReview={replyToReview}
            onNavigate={setCurrentPage}
            userName={user.name}
          />
        );
      case 'housekeeping':
        return (
          <Housekeeping
            rooms={housekeepingRooms}
            onUpdateRoom={updateHousekeepingRoom}
            onNavigate={setCurrentPage}
          />
        );
      case 'invoices':
        return (
          <Invoices
            bookings={bookings}
            onUpdateBooking={updateBooking}
            onNavigate={setCurrentPage}
          />
        );
      case 'rooms':
        return (
          <Rooms
            rooms={hotelRooms}
            bookings={bookings}
            housekeepingRooms={housekeepingRooms}
            onAddRoom={addRoom}
            onRemoveRoom={removeRoom}
            onNavigate={setCurrentPage}
          />
        );
      case 'profile':
        return (
          <Profile
            user={user}
            onUpdateUser={(updated) => setUser(updated)}
            onNavigate={setCurrentPage}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-stone-200 selection:bg-red-900 selection:text-white">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[120px]" />
      </div>
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header currentPage={currentPage} onNavigate={setCurrentPage} user={user} onLogout={handleLogout} />
        <main className="flex-grow">
          {renderPage()}
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default App;

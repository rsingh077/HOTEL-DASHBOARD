export type BookingStatus = 'confirmed' | 'pending' | 'checked-in' | 'checked-out' | 'cancelled';

export type PaymentMethod = 'cash' | 'upi' | 'card' | 'bank-transfer';
export type PaymentStatus = 'paid' | 'partial' | 'unpaid';

export interface Booking {
  id: string;
  guest: string;
  email: string;
  phone: string;
  room: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  amount: string;
  amountNum: number;
  status: BookingStatus;
  guests: number;
  specialRequests?: string;
  createdAt: string;
  // Payment tracking
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  paidAmount?: number;
  // Guest ID proof
  idProofType?: string;
  idProofNumber?: string;
}

export type Page = 'dashboard' | 'bookings' | 'check-ins' | 'check-outs' | 'reviews' | 'profile' | 'housekeeping' | 'invoices' | 'rooms';

// Room Management
export type RoomType = 'Standard' | 'Deluxe' | 'Suite';

export interface HotelRoom {
  number: string;
  type: RoomType;
  floor: number;
  isActive: boolean;
  createdAt: string;
}

export interface ReviewReply {
  id: string;
  text: string;
  repliedAt: string;
  repliedBy: string;
}

export interface GuestReview {
  id: string;
  guest: string;
  room: string;
  roomType: string;
  rating: number;
  title: string;
  comment: string;
  category: 'service' | 'cleanliness' | 'food' | 'amenities' | 'overall';
  stayDate: string;
  createdAt: string;
  reply?: ReviewReply;
}

// Housekeeping
export type HousekeepingStatus = 'dirty' | 'cleaning' | 'clean' | 'inspected';

export interface HousekeepingRoom {
  roomNumber: string;
  roomType: string;
  status: HousekeepingStatus;
  assignedTo?: string;
  lastCleaned?: string;
  notes?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

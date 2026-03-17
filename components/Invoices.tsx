import React, { useState, useMemo } from 'react';
import {
  FileText,
  ChevronLeft,
  Search,
  X,
  Download,
  Printer,
  CheckCircle,
  Clock,
  IndianRupee,
  Calendar,
  Filter,
  Eye,
  CreditCard,
  Banknote,
  Smartphone,
  Building2,
  AlertCircle,
} from 'lucide-react';
import { Booking, BookingStatus, Page, PaymentMethod, PaymentStatus } from '../types';
import Toast, { ToastData } from './shared/Toast';
import { formatDate, formatCurrency, printInvoice, exportToCSV, ROOM_RATES } from '../utils/helpers';

interface InvoicesProps {
  bookings: Booking[];
  onUpdateBooking: (id: string, updates: Partial<Booking>) => void;
  onNavigate: (page: Page) => void;
}

const PAYMENT_METHOD_CONFIG: Record<PaymentMethod, { label: string; icon: React.ReactNode; color: string }> = {
  cash: { label: 'Cash', icon: <Banknote size={14} />, color: 'text-emerald-400' },
  upi: { label: 'UPI', icon: <Smartphone size={14} />, color: 'text-purple-400' },
  card: { label: 'Card', icon: <CreditCard size={14} />, color: 'text-blue-400' },
  'bank-transfer': { label: 'Bank Transfer', icon: <Building2 size={14} />, color: 'text-amber-400' },
};

const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, { label: string; color: string; bg: string; border: string }> = {
  paid: { label: 'Paid', color: 'text-emerald-400', bg: 'bg-emerald-900/20', border: 'border-emerald-800/30' },
  partial: { label: 'Partial', color: 'text-amber-400', bg: 'bg-amber-900/20', border: 'border-amber-800/30' },
  unpaid: { label: 'Unpaid', color: 'text-red-400', bg: 'bg-red-900/20', border: 'border-red-800/30' },
};

const Invoices: React.FC<InvoicesProps> = ({ bookings, onUpdateBooking, onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | 'all'>('all');
  const [toast, setToast] = useState<ToastData | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [paymentModal, setPaymentModal] = useState<Booking | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [paymentAmount, setPaymentAmount] = useState('');

  // Only show bookings that are checked-in or checked-out (billable)
  const billableBookings = useMemo(() =>
    bookings.filter(b => b.status === 'checked-in' || b.status === 'checked-out'),
    [bookings]
  );

  const filtered = useMemo(() => {
    return billableBookings.filter(b => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = q === '' ||
        b.guest.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q) ||
        b.room.includes(searchQuery);
      const matchesPayment = paymentFilter === 'all' ||
        (b.paymentStatus || 'unpaid') === paymentFilter;
      return matchesSearch && matchesPayment;
    });
  }, [billableBookings, searchQuery, paymentFilter]);

  const stats = useMemo(() => {
    const total = billableBookings.reduce((sum, b) => sum + b.amountNum, 0);
    const paid = billableBookings.filter(b => b.paymentStatus === 'paid').reduce((sum, b) => sum + b.amountNum, 0);
    const partial = billableBookings.filter(b => b.paymentStatus === 'partial').reduce((sum, b) => sum + (b.paidAmount || 0), 0);
    const pending = total - paid - partial;
    return { total, paid: paid + partial, pending, count: billableBookings.length };
  }, [billableBookings]);

  const handlePrintInvoice = (booking: Booking) => {
    printInvoice({
      ...booking,
      paymentMethod: booking.paymentMethod || 'cash',
      paymentStatus: booking.paymentStatus || 'unpaid',
    });
    setToast({ message: `Invoice for ${booking.guest} opened in new window`, type: 'success' });
  };

  const handleRecordPayment = () => {
    if (!paymentModal) return;
    const amount = parseFloat(paymentAmount) || 0;
    if (amount <= 0) {
      setToast({ message: 'Please enter a valid amount', type: 'error' });
      return;
    }

    const currentPaid = paymentModal.paidAmount || 0;
    const newPaid = currentPaid + amount;
    const isFullyPaid = newPaid >= paymentModal.amountNum;

    onUpdateBooking(paymentModal.id, {
      paymentMethod: paymentMethod,
      paymentStatus: isFullyPaid ? 'paid' : 'partial',
      paidAmount: Math.min(newPaid, paymentModal.amountNum),
    });

    setToast({
      message: isFullyPaid
        ? `Payment of ${formatCurrency(amount)} recorded. ${paymentModal.guest}'s bill is fully paid!`
        : `Partial payment of ${formatCurrency(amount)} recorded for ${paymentModal.guest}`,
      type: 'success',
    });
    setPaymentModal(null);
    setPaymentAmount('');
  };

  const handleExportCSV = () => {
    const data = filtered.map(b => ({
      'Invoice No': `INV-${b.id.replace('BK-', '')}`,
      'Booking ID': b.id,
      'Guest': b.guest,
      'Email': b.email,
      'Phone': b.phone,
      'Room': b.room,
      'Room Type': b.roomType,
      'Check In': b.checkIn,
      'Check Out': b.checkOut,
      'Nights': b.nights,
      'Amount': b.amountNum,
      'GST (12%)': Math.round(b.amountNum * 0.12),
      'Total': b.amountNum + Math.round(b.amountNum * 0.12),
      'Payment Status': b.paymentStatus || 'unpaid',
      'Payment Method': b.paymentMethod || '-',
      'Paid Amount': b.paidAmount || 0,
    }));
    exportToCSV(data, 'hotel_sahil_invoices');
    setToast({ message: `Exported ${data.length} invoices to CSV`, type: 'success' });
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
        <span className="text-stone-300 text-sm">Invoices & Billing</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-serif text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-900/30 rounded-xl flex items-center justify-center border border-amber-800/40">
              <FileText size={22} className="text-amber-400" />
            </div>
            Invoices & Billing
          </h2>
          <p className="text-stone-500 text-sm mt-1">Generate invoices, track payments, and manage billing</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-stone-300 hover:border-emerald-600 hover:text-white transition-all text-sm"
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl p-4 border bg-amber-900/10 border-amber-800/30 hover-lift">
          <div className="flex items-center justify-between mb-1">
            <IndianRupee size={16} className="text-amber-400" />
            <span className="text-xl font-bold text-white">{formatCurrency(stats.total)}</span>
          </div>
          <p className="text-amber-400/70 text-[10px] uppercase tracking-wider">Total Billing</p>
        </div>
        <div className="rounded-xl p-4 border bg-emerald-900/10 border-emerald-800/30 hover-lift">
          <div className="flex items-center justify-between mb-1">
            <CheckCircle size={16} className="text-emerald-400" />
            <span className="text-xl font-bold text-white">{formatCurrency(stats.paid)}</span>
          </div>
          <p className="text-emerald-400/70 text-[10px] uppercase tracking-wider">Collected</p>
        </div>
        <div className="rounded-xl p-4 border bg-red-900/10 border-red-800/30 hover-lift">
          <div className="flex items-center justify-between mb-1">
            <AlertCircle size={16} className="text-red-400" />
            <span className="text-xl font-bold text-white">{formatCurrency(stats.pending)}</span>
          </div>
          <p className="text-red-400/70 text-[10px] uppercase tracking-wider">Pending</p>
        </div>
        <div className="rounded-xl p-4 border bg-blue-900/10 border-blue-800/30 hover-lift">
          <div className="flex items-center justify-between mb-1">
            <FileText size={16} className="text-blue-400" />
            <span className="text-xl font-bold text-white">{stats.count}</span>
          </div>
          <p className="text-blue-400/70 text-[10px] uppercase tracking-wider">Invoices</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-stone-900/80 border border-stone-700 rounded-xl pl-12 pr-10 py-3 text-stone-200 placeholder-stone-600 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all text-sm"
            placeholder="Search by guest name, booking ID, or room..."
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500 hover:text-white transition-colors">
              <X size={16} />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {(['all', 'unpaid', 'partial', 'paid'] as const).map(f => (
            <button
              key={f}
              onClick={() => setPaymentFilter(f)}
              className={`px-4 py-2.5 rounded-xl text-sm capitalize transition-all ${
                paymentFilter === f
                  ? 'bg-amber-700 text-white'
                  : 'bg-stone-800 text-stone-400 border border-stone-700 hover:border-stone-500'
              }`}
            >
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-stone-900/50 rounded-2xl border border-white/5 overflow-hidden hover-glow">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-stone-500 text-[11px] uppercase tracking-wider border-b border-stone-800 bg-stone-900/80">
                <th className="text-left py-4 px-5 font-medium">Invoice</th>
                <th className="text-left py-4 px-5 font-medium">Guest</th>
                <th className="text-left py-4 px-5 font-medium">Room</th>
                <th className="text-left py-4 px-5 font-medium">Stay</th>
                <th className="text-left py-4 px-5 font-medium">Amount</th>
                <th className="text-left py-4 px-5 font-medium">Payment</th>
                <th className="text-center py-4 px-5 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <FileText size={36} className="mx-auto mb-3 text-stone-700" />
                    <p className="text-stone-500 font-medium">No invoices found</p>
                    <p className="text-stone-600 text-xs mt-1">Invoices are generated for checked-in and checked-out bookings</p>
                  </td>
                </tr>
              ) : filtered.map(b => {
                const ps = PAYMENT_STATUS_CONFIG[b.paymentStatus || 'unpaid'];
                const gst = Math.round(b.amountNum * 0.12);
                const total = b.amountNum + gst;
                return (
                  <tr key={b.id} className="hover:bg-stone-800/30 transition-colors group">
                    <td className="py-4 px-5">
                      <span className="text-amber-400 font-mono font-medium text-xs bg-amber-900/10 px-2 py-1 rounded-md border border-amber-900/20">
                        INV-{b.id.replace('BK-', '')}
                      </span>
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
                      <span className="text-white font-bold">{b.room}</span>
                      <span className="text-stone-500 text-xs ml-1.5">{b.roomType}</span>
                    </td>
                    <td className="py-4 px-5 text-stone-400 text-xs">
                      {formatDate(b.checkIn)} → {formatDate(b.checkOut)}
                      <br />
                      <span className="text-stone-600">{b.nights} nights</span>
                    </td>
                    <td className="py-4 px-5">
                      <p className="text-amber-400 font-bold">{formatCurrency(total)}</p>
                      <p className="text-stone-600 text-[10px]">
                        Room: {formatCurrency(b.amountNum)} + GST: {formatCurrency(gst)}
                      </p>
                    </td>
                    <td className="py-4 px-5">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${ps.bg} ${ps.color} ${ps.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${ps.color.replace('text-', 'bg-')}`} />
                        {ps.label}
                      </span>
                      {b.paymentMethod && (
                        <p className="text-stone-600 text-[10px] mt-1 flex items-center gap-1">
                          {PAYMENT_METHOD_CONFIG[b.paymentMethod].icon}
                          {PAYMENT_METHOD_CONFIG[b.paymentMethod].label}
                        </p>
                      )}
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center justify-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handlePrintInvoice(b)}
                          className="p-1.5 rounded-lg hover:bg-stone-700 text-stone-400 hover:text-amber-400 transition-all"
                          title="Print Invoice"
                        >
                          <Printer size={15} />
                        </button>
                        {(b.paymentStatus !== 'paid') && (
                          <button
                            onClick={() => { setPaymentModal(b); setPaymentAmount(String(b.amountNum - (b.paidAmount || 0))); }}
                            className="p-1.5 rounded-lg hover:bg-emerald-900/30 text-stone-400 hover:text-emerald-400 transition-all"
                            title="Record Payment"
                          >
                            <IndianRupee size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      {paymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setPaymentModal(null)} />
          <div className="relative bg-stone-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl anim-scale-in">
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg text-white">Record Payment</h3>
                  <p className="text-stone-500 text-sm">{paymentModal.guest} — {paymentModal.id}</p>
                </div>
                <button onClick={() => setPaymentModal(null)} className="text-stone-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="bg-stone-800/40 rounded-xl p-4 border border-stone-700/30">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-stone-400">Room Charges</span>
                  <span className="text-white">{formatCurrency(paymentModal.amountNum)}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-stone-400">GST (12%)</span>
                  <span className="text-white">{formatCurrency(Math.round(paymentModal.amountNum * 0.12))}</span>
                </div>
                <div className="border-t border-stone-700 pt-2 mt-2 flex justify-between text-sm">
                  <span className="text-stone-300 font-medium">Total</span>
                  <span className="text-amber-400 font-bold">{formatCurrency(paymentModal.amountNum + Math.round(paymentModal.amountNum * 0.12))}</span>
                </div>
                {(paymentModal.paidAmount || 0) > 0 && (
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-emerald-400/70">Already Paid</span>
                    <span className="text-emerald-400">{formatCurrency(paymentModal.paidAmount || 0)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-red-400/70">Balance Due</span>
                  <span className="text-red-400 font-bold">{formatCurrency(paymentModal.amountNum - (paymentModal.paidAmount || 0))}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-stone-400 uppercase tracking-wider">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(PAYMENT_METHOD_CONFIG) as PaymentMethod[]).map(m => {
                    const mc = PAYMENT_METHOD_CONFIG[m];
                    return (
                      <button
                        key={m}
                        onClick={() => setPaymentMethod(m)}
                        className={`flex items-center gap-2 py-2.5 px-3 rounded-lg text-sm transition-all ${
                          paymentMethod === m
                            ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-700/50'
                            : 'bg-stone-800 text-stone-400 border border-stone-700 hover:border-stone-500'
                        }`}
                      >
                        {mc.icon} {mc.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-stone-400 uppercase tracking-wider">Amount (₹)</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full bg-stone-800/80 border border-stone-700 rounded-xl px-4 py-3 text-stone-200 placeholder-stone-600 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-all text-sm"
                  placeholder="Enter amount"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setPaymentModal(null)}
                  className="flex-1 py-2.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-sm transition-all border border-stone-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRecordPayment}
                  className="flex-1 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-sm transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle size={14} /> Record Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;

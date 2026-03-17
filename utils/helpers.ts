import { BookingStatus } from '../types';

// --- Date Helpers ---

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export function todayFormatted(): string {
  return new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

// --- Currency ---

export function formatCurrency(n: number): string {
  return '₹' + n.toLocaleString('en-IN');
}

// --- Room Rates ---

export const ROOM_RATES: Record<string, number> = {
  Standard: 2600,
  Deluxe: 3700,
  Suite: 7700,
};

// --- Calculations ---

export function calcNights(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const d1 = new Date(checkIn);
  const d2 = new Date(checkOut);
  const diff = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
}

// --- Status Labels ---

export const STATUS_LABELS: Record<BookingStatus, string> = {
  'confirmed': 'Confirmed',
  'pending': 'Pending',
  'checked-in': 'Checked In',
  'checked-out': 'Checked Out',
  'cancelled': 'Cancelled',
};

// --- Local Storage ---

const STORAGE_KEYS = {
  bookings: 'hotels_dashboard_bookings',
  reviews: 'hotels_dashboard_reviews',
  housekeeping: 'hotels_dashboard_housekeeping',
  user: 'hotels_dashboard_user',
  rooms: 'hotels_dashboard_rooms',
  profile: 'hotels_dashboard_profile',
};

export function saveToStorage<T>(key: keyof typeof STORAGE_KEYS, data: T): void {
  try {
    localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save to localStorage:', e);
  }
}

export function loadFromStorage<T>(key: keyof typeof STORAGE_KEYS): T | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS[key]);
    if (stored) return JSON.parse(stored) as T;
  } catch (e) {
    console.warn('Failed to load from localStorage:', e);
  }
  return null;
}

export function clearStorage(): void {
  Object.values(STORAGE_KEYS).forEach(key => {
    try { localStorage.removeItem(key); } catch (e) {}
  });
}

// --- CSV Export ---

export function exportToCSV(data: Record<string, any>[], filename: string): void {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(h => {
        const val = row[h]?.toString() || '';
        // Wrap in quotes if contains comma, newline, or quotes
        if (val.includes(',') || val.includes('\n') || val.includes('"')) {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      }).join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${todayStr()}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

// --- Invoice Generation ---

export function generateInvoiceHTML(booking: {
  id: string;
  guest: string;
  email: string;
  phone: string;
  room: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  amountNum: number;
  guests: number;
  specialRequests?: string;
  paymentMethod?: string;
  paymentStatus?: string;
}): string {
  const rate = ROOM_RATES[booking.roomType] || 0;
  const roomCharges = rate * booking.nights;
  const gst = Math.round(roomCharges * 0.12); // 12% GST
  const total = roomCharges + gst;
  const invoiceDate = formatDate(todayStr());
  const invoiceNo = `INV-${booking.id.replace('BK-', '')}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice ${invoiceNo} - Hotels Dashboard</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; background: #fff; padding: 40px; }
    .invoice { max-width: 800px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 3px solid #991b1b; }
    .hotel-name { font-size: 28px; font-weight: 700; color: #991b1b; font-family: serif; }
    .hotel-sub { font-size: 11px; color: #666; letter-spacing: 2px; text-transform: uppercase; }
    .invoice-title { text-align: right; }
    .invoice-title h2 { font-size: 24px; color: #333; }
    .invoice-title p { font-size: 12px; color: #666; margin-top: 4px; }
    .details-row { display: flex; justify-content: space-between; margin-bottom: 30px; }
    .detail-box { flex: 1; }
    .detail-box h4 { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #999; margin-bottom: 8px; }
    .detail-box p { font-size: 13px; color: #333; line-height: 1.6; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    th { background: #f8f8f8; text-align: left; padding: 12px 16px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #666; border-bottom: 2px solid #eee; }
    td { padding: 12px 16px; font-size: 13px; border-bottom: 1px solid #f0f0f0; color: #333; }
    .text-right { text-align: right; }
    .total-row td { font-weight: 700; font-size: 16px; border-top: 2px solid #991b1b; border-bottom: none; color: #991b1b; }
    .footer { text-align: center; margin-top: 50px; padding-top: 20px; border-top: 1px solid #eee; }
    .footer p { font-size: 11px; color: #999; }
    .payment-info { background: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 20px; }
    .payment-info p { font-size: 12px; color: #555; }
    .stamp { display: inline-block; border: 2px solid #16a34a; color: #16a34a; padding: 4px 16px; border-radius: 4px; font-size: 12px; font-weight: 700; transform: rotate(-5deg); margin-top: 10px; }
    @media print { body { padding: 20px; } .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="invoice">
    <div class="header">
      <div>
        <div class="hotel-name">Hotels Dashboard</div>
        <div class="hotel-sub">Premium Hospitality</div>
        <p style="font-size: 12px; color: #666; margin-top: 8px;">
          Srinagar, Jammu & Kashmir<br>
          India - 190001<br>
          GSTIN: 01AABCH1234A1ZN<br>
          Phone: +91 7006906709
        </p>
      </div>
      <div class="invoice-title">
        <h2>INVOICE</h2>
        <p><strong>Invoice No:</strong> ${invoiceNo}</p>
        <p><strong>Date:</strong> ${invoiceDate}</p>
        <p><strong>Booking ID:</strong> ${booking.id}</p>
      </div>
    </div>

    <div class="details-row">
      <div class="detail-box">
        <h4>Guest Details</h4>
        <p>
          <strong>${booking.guest}</strong><br>
          ${booking.email}<br>
          ${booking.phone}<br>
          Guests: ${booking.guests}
        </p>
      </div>
      <div class="detail-box">
        <h4>Stay Details</h4>
        <p>
          Room: <strong>${booking.room}</strong> (${booking.roomType})<br>
          Check-in: ${formatDate(booking.checkIn)}<br>
          Check-out: ${formatDate(booking.checkOut)}<br>
          Duration: ${booking.nights} night${booking.nights > 1 ? 's' : ''}
        </p>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th>Rate/Night</th>
          <th>Nights</th>
          <th class="text-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${booking.roomType} Room (${booking.room})</td>
          <td>₹${rate.toLocaleString('en-IN')}</td>
          <td>${booking.nights}</td>
          <td class="text-right">₹${roomCharges.toLocaleString('en-IN')}</td>
        </tr>
        <tr>
          <td>GST @ 12%</td>
          <td>—</td>
          <td>—</td>
          <td class="text-right">₹${gst.toLocaleString('en-IN')}</td>
        </tr>
        <tr class="total-row">
          <td colspan="3">TOTAL</td>
          <td class="text-right">₹${total.toLocaleString('en-IN')}</td>
        </tr>
      </tbody>
    </table>

    <div class="payment-info">
      <p><strong>Payment Method:</strong> ${booking.paymentMethod || 'Cash'}</p>
      <p><strong>Payment Status:</strong> ${booking.paymentStatus === 'paid' ? 'PAID' : 'PENDING'}</p>
      ${booking.paymentStatus === 'paid' ? '<span class="stamp">PAID</span>' : ''}
    </div>

    ${booking.specialRequests ? `
    <div style="margin-bottom: 20px;">
      <h4 style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #999; margin-bottom: 8px;">Special Requests</h4>
      <p style="font-size: 12px; color: #555;">${booking.specialRequests}</p>
    </div>
    ` : ''}

    <div class="footer">
      <p>Thank you for choosing Hotels Dashboard!</p>
      <p style="margin-top: 4px;">This is a computer-generated invoice.</p>
    </div>
  </div>
  <div class="no-print" style="text-align: center; margin-top: 30px;">
    <button onclick="window.print()" style="padding: 10px 30px; background: #991b1b; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px;">Print Invoice</button>
  </div>
</body>
</html>`;
}

export function printInvoice(booking: Parameters<typeof generateInvoiceHTML>[0]): void {
  const html = generateInvoiceHTML(booking);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  }
}

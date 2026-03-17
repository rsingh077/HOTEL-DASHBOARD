import React, { useState } from 'react';
import {
  Star,
  MessageSquare,
  Send,
  ChevronLeft,
  Search,
  Filter,
  ThumbsUp,
  ThumbsDown,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  Sparkles,
  User,
  BedDouble,
  Reply,
  StarHalf,
  Loader2,
} from 'lucide-react';
import { Page, GuestReview, ReviewReply } from '../types';
import { formatDate } from '../utils/helpers';
import Toast from './shared/Toast';

interface ReviewsProps {
  reviews: GuestReview[];
  onReplyReview: (reviewId: string, reply: ReviewReply) => void;
  onNavigate?: (page: Page) => void;
  userName: string;
}

// Toast and formatDate imported from shared modules

// --- Star Rating Display ---
const StarRating: React.FC<{ rating: number; size?: number }> = ({ rating, size = 16 }) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={size}
          className={`transition-colors ${i <= rating ? 'text-amber-400 fill-amber-400' : i - 0.5 <= rating ? 'text-amber-400 fill-amber-400/50' : 'text-stone-700'}`}
        />
      ))}
    </div>
  );
};

// --- Category Badge ---
const CategoryBadge: React.FC<{ category: GuestReview['category'] }> = ({ category }) => {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    service: { bg: 'bg-blue-900/20 border-blue-800/30', text: 'text-blue-400', label: 'Service' },
    cleanliness: { bg: 'bg-emerald-900/20 border-emerald-800/30', text: 'text-emerald-400', label: 'Cleanliness' },
    food: { bg: 'bg-amber-900/20 border-amber-800/30', text: 'text-amber-400', label: 'Food & Dining' },
    amenities: { bg: 'bg-purple-900/20 border-purple-800/30', text: 'text-purple-400', label: 'Amenities' },
    overall: { bg: 'bg-red-900/20 border-red-800/30', text: 'text-red-400', label: 'Overall' },
  };
  const c = config[category];
  return (
    <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-md sm:rounded-lg text-[10px] sm:text-xs border ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
};

// --- Main Component ---
const Reviews: React.FC<ReviewsProps> = ({ reviews, onReplyReview, onNavigate, userName }) => {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterRating, setFilterRating] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [expandedReview, setExpandedReview] = useState<string | null>(null);

  // Filter logic
  const filtered = reviews.filter(r => {
    const matchesSearch = search === '' ||
      r.guest.toLowerCase().includes(search.toLowerCase()) ||
      r.comment.toLowerCase().includes(search.toLowerCase()) ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.room.includes(search);
    const matchesCategory = filterCategory === 'all' || r.category === filterCategory;
    const matchesRating = filterRating === 'all' || r.rating === Number(filterRating);
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'replied' && r.reply) ||
      (filterStatus === 'pending' && !r.reply);
    return matchesSearch && matchesCategory && matchesRating && matchesStatus;
  });

  // Stats
  const totalReviews = reviews.length;
  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : 0;
  const repliedCount = reviews.filter(r => r.reply).length;
  const pendingCount = reviews.filter(r => !r.reply).length;
  const positiveCount = reviews.filter(r => r.rating >= 4).length;

  const handleSendReply = async (reviewId: string) => {
    if (!replyText.trim()) return;
    setIsSending(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const reply: ReviewReply = {
      id: `RPL-${Date.now()}`,
      text: replyText.trim(),
      repliedAt: new Date().toISOString().split('T')[0],
      repliedBy: userName,
    };
    onReplyReview(reviewId, reply);
    setReplyText('');
    setReplyingTo(null);
    setIsSending(false);
    setToast({ message: 'Reply sent successfully!', type: 'success' });
  };

  const ratingLabel = (r: number) => {
    if (r >= 5) return 'Excellent';
    if (r >= 4) return 'Very Good';
    if (r >= 3) return 'Average';
    if (r >= 2) return 'Poor';
    return 'Terrible';
  };

  const ratingColor = (r: number) => {
    if (r >= 4) return 'text-emerald-400';
    if (r >= 3) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <button onClick={() => onNavigate?.('dashboard')} className="flex items-center gap-1 text-stone-500 hover:text-white active:scale-95 transition-all text-sm group">
          <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" /> Dashboard
        </button>
        <span className="text-stone-700">/</span>
        <span className="text-stone-300 text-sm">Guest Reviews</span>
      </div>

      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif text-white flex items-center gap-2">
            <MessageSquare size={22} className="text-red-500 sm:w-6 sm:h-6" />
            Guest Reviews & Ratings
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">Manage feedback, ratings, and reply to your guests</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
        {[
          { label: 'Total Reviews', value: totalReviews, icon: MessageSquare, color: 'text-blue-400', bg: 'bg-blue-900/20 border-blue-800/30' },
          { label: 'Avg. Rating', value: avgRating.toFixed(1), icon: Star, color: 'text-amber-400', bg: 'bg-amber-900/20 border-amber-800/30', extra: <StarRating rating={Math.round(avgRating)} size={12} /> },
          { label: 'Replied', value: repliedCount, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-900/20 border-emerald-800/30' },
          { label: 'Pending Reply', value: pendingCount, icon: Clock, color: 'text-red-400', bg: 'bg-red-900/20 border-red-800/30' },
        ].map(({ label, value, icon: Icon, color, bg, extra }, i) => (
          <div key={label} className={`reviews-card bg-stone-900/50 rounded-xl sm:rounded-2xl border border-white/5 p-3 sm:p-4 hover:border-stone-700/50 transition-all`} style={{ animationDelay: `${i * 0.06}s` }}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center border ${bg}`}>
                <Icon size={14} className={`${color} sm:w-4 sm:h-4`} />
              </div>
              <span className="text-stone-500 text-[10px] sm:text-xs">{label}</span>
            </div>
            <p className={`text-lg sm:text-2xl font-bold ${color}`}>{value}</p>
            {extra && <div className="mt-1">{extra}</div>}
          </div>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-stone-900/50 rounded-xl sm:rounded-2xl border border-white/5 p-3 sm:p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by guest name, comment, or room..."
              className="w-full bg-stone-800/80 border border-stone-700 rounded-lg sm:rounded-xl pl-10 pr-4 py-2.5 text-sm text-stone-200 placeholder-stone-600 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors">
                <X size={14} />
              </button>
            )}
          </div>
          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg sm:rounded-xl text-sm transition-all active:scale-95 border ${
              showFilters ? 'bg-red-900/20 text-red-400 border-red-800/40' : 'bg-stone-800 text-stone-400 border-stone-700 hover:border-stone-500'
            }`}
          >
            <Filter size={16} />
            <span className="hidden sm:inline">Filters</span>
            {(filterCategory !== 'all' || filterRating !== 'all' || filterStatus !== 'all') && (
              <span className="w-2 h-2 rounded-full bg-red-500" />
            )}
          </button>
        </div>

        {/* Filter pills */}
        {showFilters && (
          <div className="flex flex-wrap gap-2 sm:gap-3 pt-2 border-t border-stone-800" style={{ animation: 'reviewsFadeUp 0.25s ease-out both' }}>
            <div className="space-y-1 w-full sm:w-auto">
              <label className="text-[10px] text-stone-500 uppercase tracking-wider">Category</label>
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="w-full sm:w-auto bg-stone-800 border border-stone-700 rounded-lg px-3 py-1.5 text-sm text-stone-300 outline-none focus:border-red-600"
              >
                <option value="all">All Categories</option>
                <option value="overall">Overall</option>
                <option value="service">Service</option>
                <option value="cleanliness">Cleanliness</option>
                <option value="food">Food & Dining</option>
                <option value="amenities">Amenities</option>
              </select>
            </div>
            <div className="space-y-1 w-full sm:w-auto">
              <label className="text-[10px] text-stone-500 uppercase tracking-wider">Rating</label>
              <select
                value={filterRating}
                onChange={e => setFilterRating(e.target.value)}
                className="w-full sm:w-auto bg-stone-800 border border-stone-700 rounded-lg px-3 py-1.5 text-sm text-stone-300 outline-none focus:border-red-600"
              >
                <option value="all">All Ratings</option>
                {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>)}
              </select>
            </div>
            <div className="space-y-1 w-full sm:w-auto">
              <label className="text-[10px] text-stone-500 uppercase tracking-wider">Status</label>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="w-full sm:w-auto bg-stone-800 border border-stone-700 rounded-lg px-3 py-1.5 text-sm text-stone-300 outline-none focus:border-red-600"
              >
                <option value="all">All Status</option>
                <option value="replied">Replied</option>
                <option value="pending">Pending Reply</option>
              </select>
            </div>
            {(filterCategory !== 'all' || filterRating !== 'all' || filterStatus !== 'all') && (
              <button
                onClick={() => { setFilterCategory('all'); setFilterRating('all'); setFilterStatus('all'); }}
                className="self-end px-3 py-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-stone-500 text-xs sm:text-sm">
          Showing <span className="text-stone-300 font-medium">{filtered.length}</span> of {totalReviews} reviews
        </p>
        <div className="flex items-center gap-1.5 text-xs text-stone-500">
          <ThumbsUp size={12} className="text-emerald-400" />
          <span>{positiveCount} positive</span>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-3 sm:space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-stone-900/50 rounded-2xl border border-white/5 p-8 sm:p-12 text-center" style={{ animation: 'reviewsFadeUp 0.4s ease-out both' }}>
            <MessageSquare size={40} className="text-stone-700 mx-auto mb-3" />
            <h3 className="text-stone-400 font-serif text-lg">No reviews found</h3>
            <p className="text-stone-600 text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          filtered.map((review, index) => {
            const isExpanded = expandedReview === review.id;
            const isReplying = replyingTo === review.id;

            return (
              <div
                key={review.id}
                className="reviews-card bg-stone-900/50 rounded-xl sm:rounded-2xl border border-white/5 overflow-hidden hover:border-stone-700/50 transition-all group"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Review Header */}
                <div className="p-3 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                    {/* Guest Avatar */}
                    <div className="flex items-center sm:items-start gap-3 sm:block">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-red-700 to-red-900 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm sm:text-base font-serif font-bold">
                          {review.guest.split(' ').map(w => w[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      {/* Mobile: name + date inline */}
                      <div className="sm:hidden flex-1 min-w-0">
                        <h3 className="text-stone-200 font-medium text-sm truncate">{review.guest}</h3>
                        <div className="flex items-center gap-2 text-[10px] text-stone-500 mt-0.5">
                          <BedDouble size={10} /> Room {review.room} · {review.roomType}
                        </div>
                      </div>
                      {/* Mobile: rating */}
                      <div className="sm:hidden flex flex-col items-end">
                        <StarRating rating={review.rating} size={14} />
                        <span className={`text-[10px] font-medium mt-0.5 ${ratingColor(review.rating)}`}>{ratingLabel(review.rating)}</span>
                      </div>
                    </div>

                    {/* Review body */}
                    <div className="flex-1 min-w-0">
                      {/* Desktop header */}
                      <div className="hidden sm:flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-stone-200 font-medium truncate">{review.guest}</h3>
                            <CategoryBadge category={review.category} />
                            {review.reply ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-900/20 text-emerald-400 text-[10px] border border-emerald-800/30">
                                <CheckCircle size={10} /> Replied
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-900/20 text-amber-400 text-[10px] border border-amber-800/30">
                                <Clock size={10} /> Pending
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-stone-500 mt-1">
                            <span className="flex items-center gap-1"><BedDouble size={12} /> Room {review.room} · {review.roomType}</span>
                            <span className="flex items-center gap-1"><Clock size={12} /> Stayed {formatDate(review.stayDate)}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end flex-shrink-0">
                          <StarRating rating={review.rating} size={16} />
                          <span className={`text-xs font-medium mt-1 ${ratingColor(review.rating)}`}>{ratingLabel(review.rating)}</span>
                        </div>
                      </div>

                      {/* Mobile category + status */}
                      <div className="flex sm:hidden items-center gap-2 flex-wrap mb-2">
                        <CategoryBadge category={review.category} />
                        {review.reply ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-900/20 text-emerald-400 text-[10px] border border-emerald-800/30">
                            <CheckCircle size={10} /> Replied
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-900/20 text-amber-400 text-[10px] border border-amber-800/30">
                            <Clock size={10} /> Pending
                          </span>
                        )}
                      </div>

                      {/* Review title & comment */}
                      <h4 className="text-stone-200 font-medium text-sm sm:text-base mt-2 sm:mt-3">"{review.title}"</h4>
                      <p className={`text-stone-400 text-xs sm:text-sm mt-1.5 leading-relaxed ${!isExpanded && review.comment.length > 150 ? 'line-clamp-2' : ''}`}>
                        {review.comment}
                      </p>
                      {review.comment.length > 150 && (
                        <button
                          onClick={() => setExpandedReview(isExpanded ? null : review.id)}
                          className="text-red-400 hover:text-red-300 text-xs mt-1 transition-colors"
                        >
                          {isExpanded ? 'Show less' : 'Read more'}
                        </button>
                      )}

                      {/* Date */}
                      <p className="text-stone-600 text-[10px] sm:text-xs mt-2 flex items-center gap-1">
                        <Clock size={10} /> Reviewed on {formatDate(review.createdAt)}
                      </p>

                      {/* Existing Reply */}
                      {review.reply && (
                        <div className="mt-3 sm:mt-4 bg-stone-800/50 rounded-lg sm:rounded-xl border border-stone-700/30 p-3 sm:p-4" style={{ animation: 'reviewsFadeUp 0.3s ease-out both' }}>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded-md bg-red-900/30 flex items-center justify-center border border-red-800/30">
                              <Reply size={12} className="text-red-400" />
                            </div>
                            <span className="text-stone-300 text-xs font-medium">Hotel Sahil replied</span>
                            <span className="text-stone-600 text-[10px]">· {formatDate(review.reply.repliedAt)}</span>
                          </div>
                          <p className="text-stone-400 text-xs sm:text-sm leading-relaxed">{review.reply.text}</p>
                          <p className="text-stone-600 text-[10px] mt-2">— {review.reply.repliedBy}</p>
                        </div>
                      )}

                      {/* Reply Button / Form */}
                      {!review.reply && !isReplying && (
                        <button
                          onClick={() => { setReplyingTo(review.id); setReplyText(''); }}
                          className="mt-3 flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-red-900/20 text-red-400 text-xs sm:text-sm border border-red-800/30 hover:bg-red-900/30 hover:border-red-700/40 active:scale-95 transition-all"
                        >
                          <Reply size={14} /> Reply to Guest
                        </button>
                      )}

                      {isReplying && (
                        <div className="mt-3 sm:mt-4 space-y-3" style={{ animation: 'reviewsFadeUp 0.3s ease-out both' }}>
                          <div className="relative">
                            <textarea
                              value={replyText}
                              onChange={e => setReplyText(e.target.value)}
                              rows={3}
                              className="w-full bg-stone-800/80 border border-stone-700 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-stone-200 placeholder-stone-600 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all resize-none"
                              placeholder={`Write your reply to ${review.guest}...`}
                              autoFocus
                            />
                            <p className={`text-right text-[10px] mt-1 transition-colors ${replyText.length > 450 ? 'text-amber-400' : 'text-stone-600'}`}>
                              {replyText.length}/500
                            </p>
                          </div>
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={() => { setReplyingTo(null); setReplyText(''); }}
                              className="px-3 sm:px-4 py-2 rounded-lg bg-stone-800 text-stone-400 text-xs sm:text-sm border border-stone-700 hover:border-stone-500 active:scale-95 transition-all"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSendReply(review.id)}
                              disabled={!replyText.trim() || isSending}
                              className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-medium active:scale-95 transition-all ${
                                replyText.trim() && !isSending
                                  ? 'bg-gradient-to-r from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 text-white shadow-lg shadow-red-900/30'
                                  : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                              }`}
                            >
                              {isSending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                              {isSending ? 'Sending...' : 'Send Reply'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Reviews;

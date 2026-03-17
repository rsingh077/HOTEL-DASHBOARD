import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Shield,
  Camera,
  ChevronLeft,
  Save,
  Eye,
  EyeOff,
  Lock,
  Bell,
  BellOff,
  CheckCircle,
  AlertCircle,
  X,
  KeyRound,
  Clock,
  Building2,
  BadgeCheck,
  Loader2,
} from 'lucide-react';
import { Page } from '../types';
import { saveToStorage, loadFromStorage } from '../utils/helpers';
import Toast from './shared/Toast';

interface ProfileProps {
  user: { name: string; role: string; email: string };
  onUpdateUser: (user: { name: string; role: string; email: string }) => void;
  onNavigate?: (page: Page) => void;
}

// Profile extended data persisted separately
interface ProfileData {
  phone: string;
  department: string;
  bio: string;
  avatarUrl: string | null;
  emailNotif: boolean;
  bookingAlerts: boolean;
  checkInAlerts: boolean;
  revenueReports: boolean;
}

const DEFAULT_PROFILE: ProfileData = {
  phone: '+91 98765 43210',
  department: 'Operations',
  bio: 'Experienced hospitality professional managing day-to-day hotel operations, guest relations, and staff coordination.',
  avatarUrl: null,
  emailNotif: true,
  bookingAlerts: true,
  checkInAlerts: true,
  revenueReports: false,
};

// Animations are in index.html CSS

// --- Toggle Switch ---

const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void }> = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 focus:ring-offset-stone-900 ${checked ? 'bg-red-600 shadow-lg shadow-red-900/40' : 'bg-stone-700 hover:bg-stone-600'}`}
  >
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-all duration-300 ease-in-out ${checked ? 'translate-x-6 scale-110' : 'translate-x-1 scale-100'}`} />
  </button>
);

// --- Main Profile Component ---

const Profile: React.FC<ProfileProps> = ({ user, onUpdateUser, onNavigate }) => {
  // Load persisted profile data
  const savedProfile = loadFromStorage<ProfileData>('profile') || DEFAULT_PROFILE;

  // Personal info
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(savedProfile.phone);
  const [department, setDepartment] = useState(savedProfile.department);
  const [bio, setBio] = useState(savedProfile.bio);


  // Password
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  // Notifications
  const [emailNotif, setEmailNotif] = useState(savedProfile.emailNotif);
  const [bookingAlerts, setBookingAlerts] = useState(savedProfile.bookingAlerts);
  const [checkInAlerts, setCheckInAlerts] = useState(savedProfile.checkInAlerts);
  const [revenueReports, setRevenueReports] = useState(savedProfile.revenueReports);

  // Avatar
  const [avatarUrl, setAvatarUrl] = useState<string | null>(savedProfile.avatarUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Saving state
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const markChanged = () => setHasChanges(true);

  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setToast({ message: 'Image must be under 5MB', type: 'error' });
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarUrl(reader.result as string);
        markChanged();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    // Validate password if user is changing it
    if (showPasswordSection && (currentPassword || newPassword || confirmPassword)) {
      const errors: string[] = [];
      if (!currentPassword) errors.push('Current password is required');
      if (newPassword.length < 6) errors.push('New password must be at least 6 characters');
      if (newPassword !== confirmPassword) errors.push('Passwords do not match');
      if (errors.length > 0) {
        setPasswordErrors(errors);
        setToast({ message: 'Please fix password errors', type: 'error' });
        return;
      }
    }

    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    onUpdateUser({ name: name.trim(), role: user.role, email: email.trim() });

    // Persist extended profile data
    const profileData: ProfileData = {
      phone,
      department,
      bio,
      avatarUrl,
      emailNotif,
      bookingAlerts,
      checkInAlerts,
      revenueReports,
    };
    saveToStorage('profile', profileData);

    // Reset password fields
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordErrors([]);
    setShowPasswordSection(false);
    setHasChanges(false);
    setIsSaving(false);
    setToast({ message: 'Profile updated successfully!', type: 'success' });
  };

  const passwordStrength = (pw: string): { label: string; color: string; width: string } => {
    if (pw.length === 0) return { label: '', color: '', width: '0%' };
    if (pw.length < 4) return { label: 'Weak', color: 'bg-red-500', width: '25%' };
    if (pw.length < 6) return { label: 'Fair', color: 'bg-yellow-500', width: '50%' };
    if (pw.length < 8) return { label: 'Good', color: 'bg-blue-500', width: '75%' };
    return { label: 'Strong', color: 'bg-emerald-500', width: '100%' };
  };

  const pwStrength = passwordStrength(newPassword);

  const inputClass = 'w-full bg-stone-800/80 border border-stone-700 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-stone-200 placeholder-stone-600 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all text-sm profile-input-focus';

  // Mounted state for staggered entrance
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Breadcrumb */}
      <div className="flex items-center gap-2" style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.3s ease 0.1s' }}>
        <button onClick={() => onNavigate?.('dashboard')} className="flex items-center gap-1 text-stone-500 hover:text-white active:scale-95 transition-all text-sm group">
          <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" /> Dashboard
        </button>
        <span className="text-stone-700">/</span>
        <span className="text-stone-300 text-sm">Profile</span>
      </div>

      {/* Profile Hero */}
      <div className="relative bg-gradient-to-br from-stone-900 via-stone-900 to-red-950/30 rounded-xl sm:rounded-2xl border border-white/5 overflow-hidden profile-hero profile-hover-glow">
        {/* Banner gradient */}
        <div className="h-20 sm:h-28 md:h-32 bg-gradient-to-r from-red-900/40 via-red-800/20 to-purple-900/30 relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2080%2080%22%20width%3D%2280%22%20height%3D%2280%22%3E%3Cpath%20d%3D%22M0%200h80v80H0z%22%20fill%3D%22none%22%2F%3E%3Cpath%20d%3D%22M0%2080V0l40%2040L80%200v80H0z%22%20fill%3D%22rgba(255%2C255%2C255%2C0.02)%22%2F%3E%3C%2Fsvg%3E')] opacity-50" />
        </div>

        <div className="px-4 sm:px-6 md:px-8 pb-5 sm:pb-6 md:pb-8 -mt-10 sm:-mt-14 md:-mt-16 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6">
            {/* Avatar */}
            <div className="relative group flex-shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-xl sm:rounded-2xl border-[3px] sm:border-4 border-stone-900 overflow-hidden shadow-2xl bg-stone-800 transition-transform duration-300 group-hover:scale-105">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-red-700 to-red-900 flex items-center justify-center">
                    <span className="text-white text-xl sm:text-2xl md:text-3xl font-serif font-bold">{initials}</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-xl sm:rounded-2xl bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer active:scale-95"
              >
                <Camera size={20} className="text-white sm:w-6 sm:h-6" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-emerald-600 rounded-lg border-2 border-stone-900 flex items-center justify-center">
                <BadgeCheck size={12} className="text-white sm:w-3.5 sm:h-3.5" />
              </div>
            </div>

            {/* Name & role */}
            <div className="flex-1 pb-0 sm:pb-1 text-center sm:text-left min-w-0">
              <h2 className="text-xl sm:text-2xl font-serif text-white truncate">{name || 'Unnamed'}</h2>
              <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3 mt-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-red-900/30 text-red-400 text-[10px] sm:text-xs border border-red-800/40">
                  <Shield size={10} className="sm:w-3 sm:h-3" /> {user.role}
                </span>
                <span className="text-stone-500 text-xs sm:text-sm flex items-center gap-1 sm:gap-1.5">
                  <Building2 size={12} className="sm:w-3.5 sm:h-3.5" /> {department}
                </span>
              </div>
            </div>

            {/* Save button (hero) - hidden on mobile, shown in bottom bar instead */}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`hidden sm:flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium text-sm transition-all duration-300 active:scale-95 flex-shrink-0 ${
                isSaving
                  ? 'bg-stone-800 text-stone-400 cursor-wait'
                  : hasChanges
                    ? 'bg-gradient-to-r from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 text-white shadow-lg shadow-red-900/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-red-900/40'
                    : 'bg-stone-800 text-stone-400 border border-stone-700 hover:border-stone-600 hover:text-stone-300'
              }`}
            >
              {isSaving ? (
                <><Loader2 size={16} className="animate-spin" /> Saving...</>
              ) : (
                <><Save size={16} /> {hasChanges ? 'Save Changes' : 'Save Profile'}</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">

        {/* Left Column - Personal Info (2 cols) */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">

          {/* Personal Information */}
          <div className="profile-card profile-hover-lift bg-stone-900/50 rounded-xl sm:rounded-2xl border border-white/5 p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5 profile-hover-glow">
            <div className="flex items-center gap-3 mb-1 sm:mb-2">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-900/20 rounded-lg sm:rounded-xl flex items-center justify-center border border-blue-800/30">
                <User size={16} className="text-blue-400 sm:w-[18px] sm:h-[18px]" />
              </div>
              <div>
                <h3 className="font-serif text-base sm:text-lg text-white">Personal Information</h3>
                <p className="text-stone-500 text-[10px] sm:text-xs">Update your personal details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] sm:text-xs text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                  <User size={10} className="sm:w-3 sm:h-3" /> Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); markChanged(); }}
                  className={inputClass}
                  placeholder="Your full name"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] sm:text-xs text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail size={10} className="sm:w-3 sm:h-3" /> Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); markChanged(); }}
                  className={inputClass}
                  placeholder="your@email.com"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] sm:text-xs text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Phone size={10} className="sm:w-3 sm:h-3" /> Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); markChanged(); }}
                  className={inputClass}
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] sm:text-xs text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 size={10} className="sm:w-3 sm:h-3" /> Department
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => { setDepartment(e.target.value); markChanged(); }}
                  className={inputClass}
                  placeholder="Department"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] sm:text-xs text-stone-400 uppercase tracking-wider">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => { setBio(e.target.value); markChanged(); }}
                rows={3}
                className={`${inputClass} resize-none`}
                placeholder="Tell us about yourself..."
                maxLength={200}
              />
              <div className="flex justify-end">
                <p className={`text-[10px] sm:text-xs transition-colors ${bio.length > 180 ? 'text-amber-400' : bio.length >= 200 ? 'text-red-400' : 'text-stone-600'}`}>{bio.length}/200</p>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="profile-card profile-hover-lift bg-stone-900/50 rounded-xl sm:rounded-2xl border border-white/5 p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5 profile-hover-glow">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-amber-900/20 rounded-lg sm:rounded-xl flex items-center justify-center border border-amber-800/30">
                  <KeyRound size={16} className="text-amber-400 sm:w-[18px] sm:h-[18px]" />
                </div>
                <div>
                  <h3 className="font-serif text-base sm:text-lg text-white">Security</h3>
                  <p className="text-stone-500 text-[10px] sm:text-xs">Manage your password</p>
                </div>
              </div>
              <button
                onClick={() => setShowPasswordSection(!showPasswordSection)}
                className={`text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all duration-300 active:scale-95 ${
                  showPasswordSection
                    ? 'bg-stone-800 text-stone-300 border border-stone-700 hover:border-stone-500'
                    : 'bg-amber-900/20 text-amber-400 border border-amber-800/30 hover:bg-amber-900/30 hover:border-amber-700/40'
                }`}
              >
                {showPasswordSection ? 'Cancel' : 'Change Password'}
              </button>
            </div>

            {!showPasswordSection && (
              <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-stone-800/40 rounded-xl border border-stone-700/30 transition-all hover:bg-stone-800/60 hover:border-stone-600/40">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-900/20 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <Lock size={16} className="text-emerald-400 sm:w-[18px] sm:h-[18px]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-stone-300 text-sm font-medium">Password</p>
                  <p className="text-stone-500 text-[10px] sm:text-xs truncate">Last changed 30 days ago · ••••••••</p>
                </div>
                <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
              </div>
            )}

            {showPasswordSection && (
              <div className="space-y-3 sm:space-y-4" style={{ animation: 'profileFadeUp 0.3s ease-out both' }}>
                {passwordErrors.length > 0 && (
                  <div className="bg-red-900/20 border border-red-800/40 rounded-xl p-2.5 sm:p-3 space-y-1 profile-shake">
                    {passwordErrors.map((err, i) => (
                      <p key={i} className="text-red-400 text-[10px] sm:text-xs flex items-center gap-1.5">
                        <AlertCircle size={12} /> {err}
                      </p>
                    ))}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] sm:text-xs text-stone-400 uppercase tracking-wider">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPw ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => { setCurrentPassword(e.target.value); setPasswordErrors([]); markChanged(); }}
                      className={inputClass}
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPw(!showCurrentPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors p-1"
                    >
                      {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] sm:text-xs text-stone-400 uppercase tracking-wider">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPw ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => { setNewPassword(e.target.value); setPasswordErrors([]); markChanged(); }}
                      className={inputClass}
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors p-1"
                    >
                      {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {newPassword && (
                    <div className="space-y-1.5 mt-2">
                      <div className="h-1.5 bg-stone-800 rounded-full overflow-hidden">
                        <div className={`h-full ${pwStrength.color} rounded-full transition-all duration-500 ease-out`} style={{ width: pwStrength.width }} />
                      </div>
                      <p className="text-[10px] sm:text-xs text-stone-500">Strength: <span className={pwStrength.color.replace('bg-', 'text-')}>{pwStrength.label}</span></p>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] sm:text-xs text-stone-400 uppercase tracking-wider">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setPasswordErrors([]); markChanged(); }}
                    className={inputClass}
                    placeholder="Re-enter new password"
                  />
                  {confirmPassword && newPassword && (
                    <p className={`text-[10px] sm:text-xs flex items-center gap-1 transition-colors ${confirmPassword === newPassword ? 'text-emerald-400' : 'text-red-400'}`}>
                      {confirmPassword === newPassword ? <><CheckCircle size={12} /> Passwords match</> : <><AlertCircle size={12} /> Passwords don't match</>}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-4 sm:space-y-6">

          {/* Role & Access */}
          <div className="profile-card profile-hover-lift bg-stone-900/50 rounded-xl sm:rounded-2xl border border-white/5 p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4 profile-hover-glow">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-purple-900/20 rounded-lg sm:rounded-xl flex items-center justify-center border border-purple-800/30">
                <Shield size={16} className="text-purple-400 sm:w-[18px] sm:h-[18px]" />
              </div>
              <h3 className="font-serif text-base sm:text-lg text-white">Role & Access</h3>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-between p-2.5 sm:p-3 bg-stone-800/40 rounded-lg sm:rounded-xl border border-stone-700/30 transition-all hover:bg-stone-800/60 hover:border-stone-600/40">
                <div className="min-w-0">
                  <p className="text-stone-300 text-xs sm:text-sm font-medium">Role</p>
                  <p className="text-stone-500 text-[10px] sm:text-xs truncate">{user.role}</p>
                </div>
                <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-red-900/20 text-red-400 rounded-md sm:rounded-lg text-[10px] sm:text-xs border border-red-800/30 flex-shrink-0 ml-2">{user.role}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 sm:p-3 bg-stone-800/40 rounded-lg sm:rounded-xl border border-stone-700/30 transition-all hover:bg-stone-800/60 hover:border-stone-600/40">
                <div className="min-w-0">
                  <p className="text-stone-300 text-xs sm:text-sm font-medium">Access Level</p>
                  <p className="text-stone-500 text-[10px] sm:text-xs">System permissions</p>
                </div>
                <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-emerald-900/20 text-emerald-400 rounded-md sm:rounded-lg text-[10px] sm:text-xs border border-emerald-800/30 flex-shrink-0 ml-2">
                  {user.role === 'Administrator' ? 'Full Access' : user.role === 'Manager' ? 'Advanced' : 'Standard'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 sm:p-3 bg-stone-800/40 rounded-lg sm:rounded-xl border border-stone-700/30 transition-all hover:bg-stone-800/60 hover:border-stone-600/40">
                <div className="min-w-0">
                  <p className="text-stone-300 text-xs sm:text-sm font-medium">Status</p>
                  <p className="text-stone-500 text-[10px] sm:text-xs">Account status</p>
                </div>
                <span className="flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-emerald-900/20 text-emerald-400 rounded-md sm:rounded-lg text-[10px] sm:text-xs border border-emerald-800/30 flex-shrink-0 ml-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="profile-card profile-hover-lift bg-stone-900/50 rounded-xl sm:rounded-2xl border border-white/5 p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4 profile-hover-glow">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-emerald-900/20 rounded-lg sm:rounded-xl flex items-center justify-center border border-emerald-800/30">
                <Bell size={16} className="text-emerald-400 sm:w-[18px] sm:h-[18px]" />
              </div>
              <h3 className="font-serif text-base sm:text-lg text-white">Notifications</h3>
            </div>

            <div className="space-y-2 sm:space-y-3">
              {[
                { label: 'Email Notifications', desc: 'Receive updates via email', checked: emailNotif, onChange: (v: boolean) => { setEmailNotif(v); markChanged(); }, icon: Mail },
                { label: 'Booking Alerts', desc: 'New and updated bookings', checked: bookingAlerts, onChange: (v: boolean) => { setBookingAlerts(v); markChanged(); }, icon: Bell },
                { label: 'Check-In Alerts', desc: 'Guest arrival reminders', checked: checkInAlerts, onChange: (v: boolean) => { setCheckInAlerts(v); markChanged(); }, icon: User },
                { label: 'Revenue Reports', desc: 'Weekly revenue summaries', checked: revenueReports, onChange: (v: boolean) => { setRevenueReports(v); markChanged(); }, icon: BellOff },
              ].map(({ label, desc, checked, onChange, icon: Icon }) => (
                <div key={label} className="flex items-center justify-between p-2.5 sm:p-3 bg-stone-800/30 rounded-lg sm:rounded-xl border border-stone-700/20 transition-all hover:bg-stone-800/50 hover:border-stone-600/30 group">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <Icon size={14} className={`flex-shrink-0 transition-colors duration-300 ${checked ? 'text-emerald-400' : 'text-stone-600 group-hover:text-stone-500'}`} />
                    <div className="min-w-0">
                      <p className="text-stone-300 text-xs sm:text-sm truncate">{label}</p>
                      <p className="text-stone-600 text-[9px] sm:text-[10px] truncate">{desc}</p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-2">
                    <Toggle checked={checked} onChange={onChange} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Session Info */}
          <div className="profile-card profile-hover-lift bg-stone-900/50 rounded-xl sm:rounded-2xl border border-white/5 p-4 sm:p-5 md:p-6 space-y-2 sm:space-y-3 profile-hover-glow">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-stone-800 rounded-lg sm:rounded-xl flex items-center justify-center border border-stone-700">
                <Clock size={16} className="text-stone-400 sm:w-[18px] sm:h-[18px]" />
              </div>
              <h3 className="font-serif text-base sm:text-lg text-white">Session</h3>
            </div>

            <div className="space-y-2 sm:space-y-2.5">
              {[
                { label: 'Last Login', value: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }), mono: false },
                { label: 'Platform', value: typeof window !== 'undefined' && (window as any).electronAPI?.isElectron ? 'Desktop App · Windows' : 'Web Browser', mono: false },
              ].map(({ label, value, mono }) => (
                <div key={label} className="flex justify-between text-xs sm:text-sm items-center">
                  <span className="text-stone-500">{label}</span>
                  <span className={`text-stone-300 ${mono ? 'font-mono text-[10px] sm:text-xs' : ''}`}>{value}</span>
                </div>
              ))}
              <div className="flex justify-between text-xs sm:text-sm items-center">
                <span className="text-stone-500">Session</span>
                <span className="text-emerald-400 text-[10px] sm:text-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom save bar (sticky, always visible on mobile when changes exist) */}
      {hasChanges && (
        <div className="sticky bottom-3 sm:bottom-4 z-30 profile-save-bar">
          <div className="bg-stone-900/95 backdrop-blur-md border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-pulse flex-shrink-0" />
              <p className="text-stone-300 text-xs sm:text-sm">You have unsaved changes</p>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={() => {
                  const resetProfile = loadFromStorage<ProfileData>('profile') || DEFAULT_PROFILE;
                  setName(user.name);
                  setEmail(user.email);
                  setPhone(resetProfile.phone);
                  setDepartment(resetProfile.department);
                  setBio(resetProfile.bio);
                  setAvatarUrl(resetProfile.avatarUrl);
                  setEmailNotif(resetProfile.emailNotif);
                  setBookingAlerts(resetProfile.bookingAlerts);
                  setCheckInAlerts(resetProfile.checkInAlerts);
                  setRevenueReports(resetProfile.revenueReports);
                  setHasChanges(false);
                  setShowPasswordSection(false);
                  setPasswordErrors([]);
                }}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg bg-stone-800 text-stone-300 text-xs sm:text-sm border border-stone-700 hover:border-stone-500 active:scale-95 transition-all text-center"
              >
                Discard
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-lg bg-gradient-to-r from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 text-white text-xs sm:text-sm font-medium shadow-lg shadow-red-900/30 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;

import React from 'react';
import { Hotel, Phone, Mail, MapPin, Star } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full mt-16 border-t border-red-900/20 bg-gradient-to-b from-transparent via-stone-950/50 to-stone-950/80">
      {/* Decorative divider */}
      <div className="flex items-center justify-center -mt-px">
        <div className="w-24 h-px bg-gradient-to-r from-transparent via-red-700/50 to-transparent" />
        <Star size={10} className="text-red-700/50 mx-3" />
        <div className="w-24 h-px bg-gradient-to-r from-transparent via-red-700/50 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <div className="flex items-center gap-2.5">
              <Hotel size={22} className="text-red-600" />
              <span className="font-serif text-xl text-white tracking-wider">
                Hotel <span className="text-red-500">Sahil</span>
              </span>
            </div>
            <p className="text-stone-500 text-sm leading-relaxed text-center md:text-left max-w-xs">
              Premium hospitality management — crafted for elegance, built for efficiency.
            </p>
          </div>

          {/* Contact */}
          <div className="flex flex-col items-center gap-2.5">
            <p className="text-[10px] uppercase tracking-[0.25em] text-stone-600 mb-1">Contact</p>
            <div className="flex items-center gap-2 text-stone-400 text-sm">
              <Phone size={13} className="text-red-700/70" />
              <span>+91 7006906709</span>
            </div>
            <div className="flex items-center gap-2 text-stone-400 text-sm">
              <Mail size={13} className="text-red-700/70" />
              <span>info@hotelsahil.com</span>
            </div>
            <div className="flex items-center gap-2 text-stone-400 text-sm">
              <MapPin size={13} className="text-red-700/70" />
              <span>J&K, Srinagar</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-center md:items-end gap-2.5">
            <p className="text-[10px] uppercase tracking-[0.25em] text-stone-600 mb-1">System</p>
            <p className="text-stone-500 text-sm">Version 2.0</p>
            <p className="text-stone-500 text-sm">React 19 · Vite 6</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-500/80 text-xs">All systems operational</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-5 border-t border-stone-800/50 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-stone-600 text-xs">
            © 2026 eXon Solution Pvt. Ltd —
          </p>
          <p className="text-stone-700 text-[10px] tracking-wider uppercase">
            Premium Hospitality Management
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
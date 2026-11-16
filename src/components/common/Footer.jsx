import React from 'react';
import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-lavender/20 py-6 mt-8 bg-white/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <span>Made with</span>
            <Heart size={14} className="text-flamingo fill-flamingo" />
            <span>by WAVE</span>
          </div>
          <div className="flex items-center space-x-4 mt-2 sm:mt-0">
            <span>© 2026 Interview Partner</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span>v1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
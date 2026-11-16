import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Menu, X, User, LogOut, Settings, LayoutDashboard, BarChart3, Home, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-lavender/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Goes to Dashboard if logged in, else Landing */}
          <Link to={user ? "/dashboard" : "/"} className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-denim to-mauve flex items-center justify-center">
              <span className="text-white font-bold text-sm">W</span>
            </div>
            <span className="text-xl font-bold gradient-text">WAVE</span>
            <span className="text-sm text-gray-400 font-medium hidden sm:inline">Interview Partner</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                <Link to="/dashboard" className="nav-link">Dashboard</Link>
                <Link to="/analytics" className="nav-link">Analytics</Link>
                <Link to="/interview-setup" className="nav-link">Interview</Link>
                {(user.role === 'ROLE_ADMIN' || user.role === 'ADMIN') && (
                  <Link to="/admin/users" className="nav-link flex items-center text-mauve font-semibold hover:text-mauve/80">
                    <Shield size={16} className="mr-1 text-mauve" /> Admin
                  </Link>
                )}
                <div className="relative group">
                  <button className="flex items-center space-x-2 nav-link">
                    <div className="w-8 h-8 rounded-full bg-soft-sky/30 flex items-center justify-center text-denim">
                      <User size={16} />
                    </div>
                    <span>{user.firstName}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-card border border-lavender/20 overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link to="/profile" className="flex items-center space-x-2 px-4 py-3 hover:bg-soft-sky/20 transition-colors">
                      <User size={16} className="text-denim" />
                      <span>Profile</span>
                    </Link>
                    <Link to="/settings" className="flex items-center space-x-2 px-4 py-3 hover:bg-soft-sky/20 transition-colors">
                      <Settings size={16} className="text-denim" />
                      <span>Settings</span>
                    </Link>
                    <button onClick={handleLogout} className="flex items-center space-x-2 px-4 py-3 hover:bg-flamingo/20 transition-colors w-full border-t border-lavender/10">
                      <LogOut size={16} className="text-flamingo" />
                      <span className="text-flamingo">Logout</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/register" className="btn-primary">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-lavender/20"
          >
            <div className="px-4 py-4 space-y-2">
              {user ? (
                <>
                  <Link to="/dashboard" className="block px-4 py-3 rounded-xl hover:bg-soft-sky/20 transition-colors">Dashboard</Link>
                  <Link to="/analytics" className="block px-4 py-3 rounded-xl hover:bg-soft-sky/20 transition-colors">Analytics</Link>
                  <Link to="/interview-setup" className="block px-4 py-3 rounded-xl hover:bg-soft-sky/20 transition-colors">Interview</Link>
                  {(user.role === 'ROLE_ADMIN' || user.role === 'ADMIN') && (
                    <Link to="/admin/users" className="block px-4 py-3 rounded-xl hover:bg-mauve/10 text-mauve font-semibold transition-colors flex items-center">
                      <Shield size={16} className="mr-2 text-mauve" /> Admin Console
                    </Link>
                  )}
                  <Link to="/profile" className="block px-4 py-3 rounded-xl hover:bg-soft-sky/20 transition-colors">Profile</Link>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-xl hover:bg-flamingo/20 transition-colors text-flamingo">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block px-4 py-3 rounded-xl hover:bg-soft-sky/20 transition-colors">Login</Link>
                  <Link to="/register" className="block px-4 py-3 rounded-xl bg-denim text-white hover:bg-denim/80 transition-colors">Get Started</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
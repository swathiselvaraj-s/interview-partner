import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { userAPI } from '../api/user';
import { 
  Bell, 
  Mail, 
  Globe, 
  Save, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldAlert, 
  AlertTriangle, 
  X, 
  Check, 
  KeyRound,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Preferences State
  const [prefLoading, setPrefLoading] = useState(false);
  const [settings, setSettings] = useState({
    notificationsEnabled: user?.notificationsEnabled ?? true,
    emailUpdatesEnabled: user?.emailUpdatesEnabled ?? true,
    timezone: user?.timezone || 'UTC',
    availability: user?.availability || 'FULL_TIME',
  });

  // Password Change State (Task 1)
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Account Deactivation State (Task 2)
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  // Handle Preferences Save
  const handlePreferencesSubmit = async (e) => {
    e.preventDefault();
    setPrefLoading(true);
    try {
      await userAPI.updatePreferences(settings);
      toast.success('Settings updated successfully!');
    } catch (error) {
      console.error('Settings update error:', error);
      toast.error('Failed to update settings');
    } finally {
      setPrefLoading(false);
    }
  };

  // Handle Password Change (Task 1)
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword) {
      toast.error('Current password is required');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirm password do not match');
      return;
    }

    setPasswordLoading(true);
    try {
      await userAPI.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      toast.success('Password changed successfully! 🔒');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Password change error:', error);
      const msg = error.response?.data?.message || 'Failed to update password. Current password may be incorrect.';
      toast.error(msg);
    } finally {
      setPasswordLoading(false);
    }
  };

  // Handle Account Deactivation (Task 2)
  const handleConfirmDeactivate = async () => {
    setDeactivating(true);
    try {
      await userAPI.deleteAccount();
      toast.success('Your account has been deactivated.');
      setShowDeactivateModal(false);
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Account deactivation error:', error);
      const msg = error.response?.data?.message || 'Failed to deactivate account. Please try again.';
      toast.error(msg);
      setDeactivating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Account Settings</h1>
        <p className="text-gray-500 mt-1">Manage your preferences, security, and account status</p>
      </div>

      {/* SECTION 1: Notifications & Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6 sm:p-8"
      >
        <h2 className="text-lg font-bold mb-4 flex items-center space-x-2">
          <Bell size={20} className="text-denim" />
          <span>Preferences & Notifications</span>
        </h2>

        <form onSubmit={handlePreferencesSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-soft-sky/10 rounded-xl">
              <div className="flex items-center space-x-3">
                <Bell size={20} className="text-denim" />
                <div>
                  <p className="font-medium text-sm">Push Notifications</p>
                  <p className="text-xs text-gray-500">Get notified about interview reminders</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notificationsEnabled}
                  onChange={(e) => setSettings({ ...settings, notificationsEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-denim/20 rounded-full peer peer-checked:after:translate-x-2.5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-denim"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-soft-sky/10 rounded-xl">
              <div className="flex items-center space-x-3">
                <Mail size={20} className="text-denim" />
                <div>
                  <p className="font-medium text-sm">Email Updates</p>
                  <p className="text-xs text-gray-500">Receive weekly performance summaries</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailUpdatesEnabled}
                  onChange={(e) => setSettings({ ...settings, emailUpdatesEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-denim/20 rounded-full peer peer-checked:after:translate-x-2.5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-denim"></div>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
              <select
                value={settings.timezone}
                onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                className="input-field"
              >
                <option value="UTC">UTC (Universal)</option>
                <option value="EST">EST (Eastern)</option>
                <option value="PST">PST (Pacific)</option>
                <option value="IST">IST (India)</option>
                <option value="CET">CET (Central Europe)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Availability</label>
              <select
                value={settings.availability}
                onChange={(e) => setSettings({ ...settings, availability: e.target.value })}
                className="input-field"
              >
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CASUAL">Casual / Exploring</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button 
              type="submit" 
              className="btn-primary inline-flex items-center text-sm"
              disabled={prefLoading}
            >
              <Save size={16} className="mr-2" />
              {prefLoading ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </form>
      </motion.div>

      {/* SECTION 2: Security & Password Change (Task 1) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-6 sm:p-8"
      >
        <div className="flex items-center space-x-2 mb-4">
          <KeyRound size={20} className="text-mauve" />
          <h2 className="text-lg font-bold">Security & Password</h2>
        </div>
        <p className="text-xs text-gray-500 mb-6">
          Update your account password. Choose a strong password with at least 6 characters.
        </p>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="input-field pr-10"
                placeholder="Enter current password"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* New & Confirm Password Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="input-field pr-10"
                  placeholder="Min 6 characters"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="input-field pr-10"
                  placeholder="Re-enter new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button 
              type="submit" 
              className="btn-primary inline-flex items-center text-sm"
              disabled={passwordLoading}
            >
              <Lock size={16} className="mr-2" />
              {passwordLoading ? 'Updating Password...' : 'Update Password'}
            </button>
          </div>
        </form>
      </motion.div>

      {/* SECTION 3: Danger Zone & Deactivate Account (Task 2) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card p-6 sm:p-8 border border-flamingo/30 bg-flamingo/5"
      >
        <div className="flex items-center space-x-2 text-flamingo mb-2">
          <AlertTriangle size={20} />
          <h2 className="text-lg font-bold">Danger Zone</h2>
        </div>
        <p className="text-xs text-gray-600 mb-6">
          Deactivating your account will immediately disable your profile, revoke your session, and prevent future sign-ins.
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl bg-white border border-flamingo/20">
          <div>
            <p className="font-semibold text-sm text-gray-900">Deactivate this account</p>
            <p className="text-xs text-gray-500">You will be logged out and cannot sign in until reactivated by an admin.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowDeactivateModal(true)}
            className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-flamingo text-white hover:bg-flamingo/90 transition-colors text-xs font-semibold inline-flex items-center shadow-sm"
          >
            <Trash2 size={14} className="mr-1.5" />
            Deactivate Account
          </button>
        </div>
      </motion.div>

      {/* Custom Tailwind Deactivation Confirmation Modal */}
      <AnimatePresence>
        {showDeactivateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-lavender/30 space-y-4"
            >
              <div className="flex items-center space-x-3 text-flamingo">
                <div className="w-10 h-10 rounded-full bg-flamingo/10 flex items-center justify-center flex-shrink-0">
                  <ShieldAlert size={22} className="text-flamingo" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Confirm Deactivation</h3>
                  <p className="text-xs text-gray-500">This action takes effect immediately</p>
                </div>
              </div>

              <p className="text-sm text-gray-600 bg-flamingo/5 p-3.5 rounded-xl border border-flamingo/20">
                Are you sure you want to deactivate your account? You will be signed out right away, and your active access will be suspended.
              </p>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowDeactivateModal(false)}
                  className="px-4 py-2 rounded-xl border border-lavender/40 text-sm font-medium text-gray-700 hover:bg-soft-sky/10 transition-colors"
                  disabled={deactivating}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeactivate}
                  className="px-4 py-2 rounded-xl bg-flamingo text-white text-sm font-semibold hover:bg-flamingo/90 transition-colors inline-flex items-center"
                  disabled={deactivating}
                >
                  {deactivating ? 'Deactivating...' : 'Yes, Deactivate'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SettingsPage;

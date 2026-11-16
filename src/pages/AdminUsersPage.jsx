import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Users, Shield, CheckCircle, XCircle, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';
import { userAPI } from '../api/user';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await userAPI.getAllUsers(page, 50);
      const data = Array.isArray(response.data) 
        ? response.data 
        : (response.data?.content || []);
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      const errMsg = err.response?.data?.message || 'Failed to load users list';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
    const email = (user.email || '').toLowerCase();
    const query = searchTerm.toLowerCase();
    return fullName.includes(query) || email.includes(query);
  });

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-denim to-mauve flex items-center justify-center text-white">
              <Shield size={20} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">Admin User Management</h1>
          </div>
          <p className="text-gray-500">View and inspect registered candidate accounts</p>
        </div>

        <button
          onClick={fetchUsers}
          className="btn-outline flex items-center self-start sm:self-auto space-x-2 text-sm py-2 px-4"
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </motion.div>

      {/* Search and Filters Card */}
      <div className="card p-4 sm:p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Filter by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-lavender/40 rounded-xl bg-white text-sm outline-none focus:border-denim hover:border-soft-sky transition-colors"
          />
        </div>
      </div>

      {/* Main Content State Handling */}
      {loading ? (
        <div className="card p-12 flex flex-col items-center justify-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-500 font-medium">Loading user directory...</p>
        </div>
      ) : error ? (
        <div className="card p-8 text-center border border-flamingo/20">
          <AlertCircle className="mx-auto text-flamingo mb-3" size={40} />
          <h3 className="text-lg font-semibold text-gray-800 mb-1">Failed to Load Users</h3>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <button onClick={fetchUsers} className="btn-primary text-sm py-2 px-4">
            Try Again
          </button>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="card p-12 text-center">
          <Users className="mx-auto text-gray-300 mb-3" size={48} />
          <h3 className="text-lg font-semibold text-gray-700 mb-1">No users found</h3>
          <p className="text-sm text-gray-500">
            {searchTerm ? `No users matched "${searchTerm}"` : 'No registered users available yet.'}
          </p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card overflow-hidden shadow-card"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-lavender/30 bg-soft-sky/10 text-xs uppercase tracking-wider text-gray-500">
                  <th className="py-3.5 px-6 font-semibold">User</th>
                  <th className="py-3.5 px-6 font-semibold">Role</th>
                  <th className="py-3.5 px-6 font-semibold">Status</th>
                  <th className="py-3.5 px-6 font-semibold">Joined Date</th>
                  <th className="py-3.5 px-6 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-lavender/20 text-sm">
                {filteredUsers.map((u) => {
                  const isAdmin = u.role === 'ROLE_ADMIN' || u.role === 'ADMIN';
                  return (
                    <tr key={u.id} className="hover:bg-soft-sky/5 transition-colors">
                      {/* Name & Email */}
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-denim/20 to-mauve/20 text-denim flex items-center justify-center font-bold text-sm">
                            {(u.firstName?.[0] || 'U').toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {u.firstName || u.lastName ? `${u.firstName || ''} ${u.lastName || ''}`.trim() : 'Unnamed User'}
                            </div>
                            <div className="text-xs text-gray-500">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          isAdmin 
                            ? 'bg-mauve/20 text-mauve border border-mauve/30' 
                            : 'bg-soft-sky/30 text-denim border border-soft-sky/50'
                        }`}>
                          {isAdmin ? 'ADMIN' : 'USER'}
                        </span>
                      </td>

                      {/* Active Status */}
                      <td className="py-4 px-6">
                        {u.active !== false ? (
                          <span className="inline-flex items-center text-xs text-green-600 font-medium">
                            <CheckCircle size={14} className="mr-1.5" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-xs text-gray-400 font-medium">
                            <XCircle size={14} className="mr-1.5" /> Inactive
                          </span>
                        )}
                      </td>

                      {/* Created Date */}
                      <td className="py-4 px-6 text-gray-600">
                        {formatDate(u.createdAt)}
                      </td>

                      {/* Action */}
                      <td className="py-4 px-6 text-right">
                        <Link
                          to={`/admin/users/${u.id}`}
                          className="inline-flex items-center text-xs font-semibold text-denim hover:text-denim/80 hover:underline"
                        >
                          View Details <ChevronRight size={14} className="ml-1" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AdminUsersPage;

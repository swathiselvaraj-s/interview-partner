import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, User, Mail, Shield, Calendar, Briefcase, Award, 
  Clock, CheckCircle, XCircle, AlertCircle, ExternalLink, RefreshCw 
} from 'lucide-react';
import { userAPI } from '../api/user';
import { interviewAPI } from '../api/interview';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminUserDetailPage = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      loadUserData();
    }
  }, [id]);

  const loadUserData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [userRes, historyRes] = await Promise.all([
        userAPI.getUserById(id),
        interviewAPI.getUserHistoryForAdmin(id, 0, 20).catch((err) => {
          console.warn('Failed to load session history for user:', err);
          return { data: { content: [] } };
        }),
      ]);

      setProfile(userRes.data);
      const sessionList = historyRes.data?.content || (Array.isArray(historyRes.data) ? historyRes.data : []);
      setSessions(sessionList);
    } catch (err) {
      console.error('Failed to load user details:', err);
      const msg = err.response?.data?.message || 'Failed to load user profile';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

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

  const getStatusBadge = (status) => {
    const s = (status || '').toUpperCase();
    if (s === 'COMPLETED') {
      return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">COMPLETED</span>;
    }
    if (s === 'IN_PROGRESS') {
      return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">IN PROGRESS</span>;
    }
    if (s === 'ABANDONED') {
      return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">ABANDONED</span>;
    }
    return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-soft-sky/30 text-denim">{status || 'UNKNOWN'}</span>;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center justify-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-500 font-medium">Loading user dossier...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="card p-8 text-center border border-flamingo/20">
          <AlertCircle className="mx-auto text-flamingo mb-3" size={44} />
          <h2 className="text-xl font-bold text-gray-800 mb-2">User Not Found or Inaccessible</h2>
          <p className="text-gray-500 mb-6">{error || 'Could not retrieve user data.'}</p>
          <div className="flex justify-center space-x-4">
            <Link to="/admin/users" className="btn-outline flex items-center space-x-2">
              <ArrowLeft size={16} /> <span>Back to Users</span>
            </Link>
            <button onClick={loadUserData} className="btn-primary flex items-center space-x-2">
              <RefreshCw size={16} /> <span>Retry</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isAdmin = profile.role === 'ROLE_ADMIN' || profile.role === 'ADMIN';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <div className="mb-6">
        <Link 
          to="/admin/users" 
          className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-denim transition-colors"
        >
          <ArrowLeft size={16} className="mr-1.5" /> Back to User Directory
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: User Profile Summary Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 h-fit space-y-6"
        >
          {/* Avatar and Name */}
          <div className="flex items-center space-x-4 pb-6 border-b border-lavender/30">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-denim to-mauve text-white flex items-center justify-center font-bold text-2xl shadow-md">
              {(profile.firstName?.[0] || 'U').toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {profile.firstName || profile.lastName ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim() : 'Unnamed User'}
              </h2>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  isAdmin 
                    ? 'bg-mauve/20 text-mauve border border-mauve/30' 
                    : 'bg-soft-sky/30 text-denim border border-soft-sky/50'
                }`}>
                  {isAdmin ? 'ADMIN' : 'USER'}
                </span>
                {profile.active !== false ? (
                  <span className="inline-flex items-center text-xs text-green-600 font-medium">
                    <CheckCircle size={12} className="mr-1" /> Active
                  </span>
                ) : (
                  <span className="inline-flex items-center text-xs text-gray-400 font-medium">
                    <XCircle size={12} className="mr-1" /> Inactive
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* User Attributes */}
          <div className="space-y-4 text-sm">
            <div className="flex items-start space-x-3 text-gray-700">
              <Mail size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="overflow-hidden">
                <p className="text-xs text-gray-400 font-medium">Email Address</p>
                <p className="font-medium truncate">{profile.email}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 text-gray-700">
              <Calendar size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400 font-medium">Member Since</p>
                <p className="font-medium">{formatDate(profile.createdAt)}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 text-gray-700">
              <Briefcase size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400 font-medium">Target Role</p>
                <p className="font-medium">{profile.preferredRole || 'Not specified'}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 text-gray-700">
              <Award size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400 font-medium">Experience & Difficulty</p>
                <p className="font-medium">
                  {profile.experienceYears != null ? `${profile.experienceYears} yrs` : 'N/A'} • {profile.preferredDifficulty || 'INTERMEDIATE'}
                </p>
              </div>
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="pt-4 border-t border-lavender/30">
              <p className="text-xs text-gray-400 font-medium mb-1">Biography</p>
              <p className="text-sm text-gray-600 italic bg-soft-sky/10 p-3 rounded-xl">
                "{profile.bio}"
              </p>
            </div>
          )}
        </motion.div>

        {/* Right Column: Interview Session History */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 space-y-6"
        >
          <div className="card p-6 shadow-card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Candidate Interview Sessions</h3>
                <p className="text-xs text-gray-500">History of technical interview practices</p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-soft-sky/20 text-denim">
                {sessions.length} {sessions.length === 1 ? 'Session' : 'Sessions'}
              </span>
            </div>

            {sessions.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <Clock className="mx-auto mb-2 text-gray-300" size={36} />
                <p className="text-sm font-medium">No interview sessions found for this user.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-lavender/30 text-xs uppercase tracking-wider text-gray-500">
                      <th className="py-3 px-4 font-semibold">Date</th>
                      <th className="py-3 px-4 font-semibold">Role & Mode</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold">Score</th>
                      <th className="py-3 px-4 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-lavender/20 text-sm">
                    {sessions.map((sess) => (
                      <tr key={sess.id || sess.sessionId} className="hover:bg-soft-sky/5 transition-colors">
                        <td className="py-3.5 px-4 font-medium text-gray-700">
                          {formatDate(sess.createdAt)}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-gray-800">{sess.targetRole || sess.role || 'General'}</div>
                          <div className="text-xs text-gray-400 capitalize">{sess.interviewMode || 'Standard'} Mode</div>
                        </td>
                        <td className="py-3.5 px-4">
                          {getStatusBadge(sess.status)}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-denim">
                          {sess.overallScore != null ? `${Math.round(sess.overallScore)}%` : '—'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            to={`/results/${sess.sessionId || sess.id}`}
                            className="inline-flex items-center text-xs font-semibold text-denim hover:text-denim/80 hover:underline"
                          >
                            Results <ExternalLink size={12} className="ml-1" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminUserDetailPage;

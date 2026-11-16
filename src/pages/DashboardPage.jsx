import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Award, TrendingUp, Clock, ChevronRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { interviewAPI } from '../api/interview';
import { analyticsAPI } from '../api/analytics';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch analytics
      const analyticsRes = await analyticsAPI.getDashboard();
      const statsData = analyticsRes.data;
      
      const improvementRate = statsData?.progressData?.improvementOverTime || 0;
      const dayStreak = statsData?.overallStats?.dayStreak || 0;

      setStats({
        totalInterviews: statsData?.overallStats?.totalInterviews || 0,
        averageScore: Math.round(statsData?.overallStats?.averageScore || 0),
        improvement: Math.round(improvementRate),
        streak: dayStreak,
      });

      // Fetch session history
      const historyRes = await interviewAPI.getSessionHistory(0, 5);
      setRecentSessions(historyRes.data?.content || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-denim border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome back, {user?.firstName || 'User'} 👋</h1>
        <p className="text-gray-600 mt-1">Ready to practice with WAVE today?</p>
      </div>

      {/* Stats Cards - Real Data Only */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Activity, label: 'Total Interviews', value: stats?.totalInterviews || 0, color: 'denim' },
          { icon: Award, label: 'Average Score', value: stats?.averageScore ? `${stats.averageScore}%` : '—', color: 'mauve' },
          { icon: TrendingUp, label: 'Improvement', value: stats?.improvement !== undefined && stats?.improvement !== 0 ? (stats.improvement > 0 ? `+${stats.improvement}%` : `${stats.improvement}%`) : '—', color: 'soft-sky' },
          { icon: Clock, label: 'Day Streak', value: stats?.streak ? `${stats.streak} day${stats.streak > 1 ? 's' : ''}` : '—', color: 'flamingo' },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card p-4 sm:p-6 text-center"
          >
            <div className={`w-10 h-10 rounded-xl bg-${stat.color}/20 flex items-center justify-center mx-auto mb-2`}>
              <stat.icon size={20} className={`text-${stat.color}`} />
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card p-6 bg-gradient-to-br from-denim/5 to-soft-sky/5 border-denim/20">
          <h3 className="font-semibold mb-2">Start Interview</h3>
          <p className="text-sm text-gray-600 mb-4">Practice with WAVE</p>
          <Link to="/interview-setup" className="btn-primary inline-flex items-center text-sm">
            Start Interview <ChevronRight size={16} className="ml-1" />
          </Link>
        </div>
        <div className="card p-6 bg-gradient-to-br from-mauve/5 to-flamingo/5 border-mauve/20">
          <h3 className="font-semibold mb-2">View Analytics</h3>
          <p className="text-sm text-gray-600 mb-4">Track your progress and growth</p>
          <Link to="/analytics" className="btn-secondary inline-flex items-center text-sm">
            View Dashboard <ChevronRight size={16} className="ml-1" />
          </Link>
        </div>
      </div>

      {/* Recent Sessions */}
      <h2 className="text-xl font-semibold mb-4">Recent Sessions</h2>
      {recentSessions.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-gray-500">No interview sessions yet.</p>
          <Link to="/interview-setup" className="btn-primary inline-block mt-4">Start Interview</Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-soft-sky/10">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Role</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Score</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-lavender/10">
                {recentSessions.map((session) => (
                  <tr key={session.id} className="hover:bg-soft-sky/5 transition-colors">
                    <td className="px-6 py-4 text-sm">{session.role}</td>
                    <td className="px-6 py-4 text-sm font-medium">
                      {session.score ? `${Math.round(session.score)}%` : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {session.createdAt ? new Date(session.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        session.status === 'COMPLETED' ? 'bg-soft-sky/30 text-denim' : 
                        session.status === 'IN_PROGRESS' ? 'bg-flamingo/30 text-flamingo' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {session.status || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Link to={`/results/${session.sessionId}`} className="text-denim hover:text-denim/70 font-medium">
                        View Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;

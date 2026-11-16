import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Award, 
  Brain, 
  Clock,
  Activity,
  Target,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { analyticsAPI } from '../api/analytics';
import toast from 'react-hot-toast';

const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [weakTopics, setWeakTopics] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [trends, setTrends] = useState(null);

  useEffect(() => {
    fetchAllAnalytics();
  }, []);

  const fetchAllAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch dashboard data
      const dashboardRes = await analyticsAPI.getDashboard();
      setDashboardData(dashboardRes.data);

      // Fetch weak topics
      const weakRes = await analyticsAPI.getWeakTopics();
      setWeakTopics(weakRes.data);

      // Fetch recommendations
      const recRes = await analyticsAPI.getRecommendations();
      setRecommendations(recRes.data);

      // Fetch trends
      const trendRes = await analyticsAPI.getTrends(30);
      setTrends(trendRes.data);

    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-denim mx-auto mb-4" />
          <p className="text-gray-500">Loading your analytics...</p>
        </div>
      </div>
    );
  }

  // Extract real data
  const overallStats = dashboardData?.overallStats || {};
  const categoryStats = dashboardData?.categoryStats || [];
  const strengths = dashboardData?.strengths || [];
  const weaknesses = dashboardData?.weaknesses || [];
  const strongestCategory = dashboardData?.strongestCategory || 'N/A';
  const weakestCategory = dashboardData?.weakestCategory || 'N/A';
  const consistencyScore = dashboardData?.consistencyScore || 0;
  const progressData = dashboardData?.progressData || {};

  // Calculate improvement from trends
  const trendsList = progressData?.trends || [];
  const improvementOverTime = progressData?.improvementOverTime || 0;
  const improvementRate = progressData?.improvementRate || '0%';

  // Get recent interview count
  const totalInterviews = overallStats?.totalInterviews || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Track your interview performance and progress over time
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Based on {totalInterviews} interview{totalInterviews !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Stats Cards - Dynamic */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { 
              icon: Award, 
              label: 'Average Score', 
              value: overallStats?.averageScore ? `${Math.round(overallStats.averageScore)}%` : '—',
              color: 'denim'
            },
            { 
              icon: TrendingUp, 
              label: 'Improvement', 
              value: totalInterviews > 1 ? (parseFloat(improvementRate) !== 0 ? improvementRate : '—') : '—',
              color: 'soft-sky'
            },
            { 
              icon: Target, 
              label: 'Best Category', 
              value: strongestCategory !== 'N/A' ? strongestCategory : '—',
              color: 'mauve'
            },
            { 
              icon: Activity, 
              label: 'Consistency', 
              value: consistencyScore > 0 ? `${Math.round(consistencyScore)}%` : '—',
              color: 'flamingo'
            },
            { 
              icon: Clock, 
              label: 'Avg. Duration', 
              value: overallStats?.averageInterviewDuration ? `${Math.round(overallStats.averageInterviewDuration)} min` : '—',
              color: 'soft-sky'
            },
            { 
              icon: Clock, 
              label: 'Time / Question', 
              value: overallStats?.averageTimePerQuestion ? `${Math.round(overallStats.averageTimePerQuestion)}s` : '—',
              color: 'denim'
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl bg-${stat.color}/20 flex items-center justify-center text-${stat.color}`}>
                  <stat.icon size={20} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Category Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Category Scores */}
          <div className="card p-6">
            <h3 className="font-semibold mb-4">Category Performance</h3>
            {categoryStats.length === 0 ? (
              <p className="text-gray-500 text-sm">Complete interviews to see category performance</p>
            ) : (
              <div className="space-y-3">
                {categoryStats.map((cat, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{cat.category}</span>
                      <span className="font-medium">{Math.round(cat.score)}%</span>
                    </div>
                    <div className="w-full h-2 bg-soft-sky/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-denim to-mauve rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min(cat.score, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                      <span>{cat.questionsAttempted} questions</span>
                      <span>{Math.round(cat.accuracy)}% accuracy</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Strengths & Weaknesses */}
          <div className="card p-6">
            <h3 className="font-semibold mb-4">Strengths & Weaknesses</h3>
            
            {/* Strengths */}
            <div className="mb-4">
              <p className="text-sm font-medium text-green-600 mb-2">💪 Strengths</p>
              {strengths.length === 0 ? (
                <p className="text-sm text-gray-500">Complete more interviews to identify strengths</p>
              ) : (
                <ul className="space-y-1.5">
                  {strengths.map((item, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-2" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Weaknesses */}
            <div>
              <p className="text-sm font-medium text-orange-600 mb-2">📌 Areas for Improvement</p>
              {weaknesses.length === 0 ? (
                <p className="text-sm text-gray-500">Complete more interviews to identify weaknesses</p>
              ) : (
                <ul className="space-y-1.5">
                  {weaknesses.map((item, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mr-2" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="card p-6 mb-8">
          <h3 className="font-semibold mb-4">🎯 Personalized Recommendations</h3>
          {recommendations?.suggestions?.length > 0 ? (
            <ul className="space-y-2">
              {recommendations.suggestions.map((rec, index) => (
                <li key={index} className="flex items-start space-x-3 text-sm text-gray-700">
                  <span className="text-denim mt-0.5">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">Complete interviews to get personalized recommendations</p>
          )}
        </div>

        {/* Weak Topics Detail */}
        {weakTopics && Object.keys(weakTopics).length > 0 && (
          <div className="card p-6 mb-8">
            <h3 className="font-semibold mb-4">🔴 Weak Topics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(weakTopics).map(([topic, score]) => (
                <div key={topic} className="p-4 bg-flamingo/10 rounded-xl">
                  <p className="font-medium text-sm">{topic}</p>
                  <p className="text-2xl font-bold text-flamingo">{Math.round(score)}%</p>
                  <p className="text-xs text-gray-500">Needs improvement</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progress Trend */}
        <div className="card p-6">
          <h3 className="font-semibold mb-4">📈 Progress Over Time</h3>
          {trendsList.length === 0 ? (
            <p className="text-gray-500 text-sm">Complete interviews to see your progress trend</p>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500">
                  {trendsList.length} data points over {trendsList.length} days
                </p>
                <p className="text-sm font-medium text-denim">
                  Improvement: {improvementRate}
                </p>
              </div>
              
              {/* Simple bar chart for trends */}
              <div className="space-y-2">
                {trendsList.slice(-10).map((trend, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="text-xs text-gray-400 w-10">
                      {trend.date?.slice(5) || ''}
                    </span>
                    <div className="flex-1 h-4 bg-soft-sky/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-denim to-mauve rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min(trend.score || 0, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium w-12 text-right">
                      {Math.round(trend.score || 0)}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* No Data Message */}
        {totalInterviews === 0 && (
          <div className="text-center py-12 mt-8">
            <div className="w-20 h-20 rounded-full bg-lavender/20 flex items-center justify-center mx-auto mb-4">
              <BarChart3 size={32} className="text-denim" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Data Yet</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Complete your first interview to start tracking your performance and see insights here.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AnalyticsPage;
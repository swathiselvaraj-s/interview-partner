import { useState, useEffect } from 'react';
import { analyticsAPI } from '../api/analytics';
import toast from 'react-hot-toast';

export const useAnalytics = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [trends, setTrends] = useState(null);
  const [weakTopics, setWeakTopics] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const response = await analyticsAPI.getDashboard();
      setDashboardData(response.data);
    } catch (error) {
      toast.error('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const fetchTrends = async (days = 30) => {
    try {
      const response = await analyticsAPI.getTrends(days);
      setTrends(response.data);
    } catch (error) {
      console.error('Failed to fetch trends:', error);
    }
  };

  const fetchWeakTopics = async () => {
    try {
      const response = await analyticsAPI.getWeakTopics();
      setWeakTopics(response.data);
    } catch (error) {
      console.error('Failed to fetch weak topics:', error);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await analyticsAPI.getRecommendations();
      setRecommendations(response.data);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchTrends();
    fetchWeakTopics();
    fetchRecommendations();
  }, []);

  return {
    dashboardData,
    trends,
    weakTopics,
    recommendations,
    loading,
    fetchDashboard,
    fetchTrends,
    fetchWeakTopics,
    fetchRecommendations,
  };
};
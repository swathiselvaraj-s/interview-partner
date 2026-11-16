import React from 'react';
import { Activity, Award, TrendingUp, Clock } from 'lucide-react';

const DashboardStats = ({ stats }) => {
  const statItems = [
    { icon: Activity, label: 'Total Interviews', value: stats?.totalInterviews || 0, color: 'denim' },
    { icon: Award, label: 'Average Score', value: stats?.averageScore || '0%', color: 'mauve' },
    { icon: TrendingUp, label: 'Improvement', value: stats?.improvement || '0%', color: 'soft-sky' },
    { icon: Clock, label: 'Day Streak', value: stats?.streak || '0 days', color: 'flamingo' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {statItems.map((stat, index) => (
        <div key={index} className="card p-4 sm:p-6 text-center">
          <div className={`w-10 h-10 rounded-xl bg-${stat.color}/20 flex items-center justify-center mx-auto mb-2`}>
            <stat.icon size={20} className={`text-${stat.color}`} />
          </div>
          <p className="text-2xl font-bold">{stat.value}</p>
          <p className="text-sm text-gray-500">{stat.label}</p>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
import React from 'react';
import { Link } from 'react-router-dom';

const RecentSessions = ({ sessions = [] }) => {
  if (sessions.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="text-gray-500">No interview sessions yet.</p>
        <Link to="/interview" className="btn-primary inline-block mt-4">Start Your First Interview</Link>
      </div>
    );
  }

  return (
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
            {sessions.map((session) => (
              <tr key={session.id} className="hover:bg-soft-sky/5 transition-colors">
                <td className="px-6 py-4 text-sm">{session.role}</td>
                <td className="px-6 py-4 text-sm font-medium">
                  {session.score ? `${session.score}%` : '—'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{session.date}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    session.status === 'completed' ? 'bg-soft-sky/30 text-denim' : 'bg-flamingo/30 text-flamingo'
                  }`}>
                    {session.status === 'completed' ? 'Completed' : 'In Progress'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <Link to={`/results/${session.id}`} className="text-denim hover:text-denim/70 font-medium">
                    View Details →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentSessions;
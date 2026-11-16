import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Award, TrendingUp, Brain, Clock, Download, Loader2 } from 'lucide-react';
import { interviewAPI } from '../api/interview';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const ResultsPage = () => {
  const { sessionId } = useParams();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await interviewAPI.getSessionDetails(sessionId);
        setResults(response.data);
      } catch (error) {
        toast.error('Failed to load results');
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchResults();
    }
  }, [sessionId]);

  const getDuration = (started, completed) => {
    if (!started || !completed) return '—';
    const diffMs = new Date(completed) - new Date(started);
    const diffMins = Math.round(diffMs / 60000);
    return `${diffMins} min`;
  };

  const downloadPDF = async () => {
    setGeneratingPDF(true);
    const element = document.getElementById('evaluation-report-card');
    if (!element) {
      toast.error('Could not find report card element');
      setGeneratingPDF(false);
      return;
    }

    try {
      // Temporarily hide action buttons during capture
      const actionsDiv = element.querySelector('.action-buttons-container');
      if (actionsDiv) actionsDiv.style.display = 'none';

      const canvas = await html2canvas(element, {
        scale: 2, // higher resolution
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      if (actionsDiv) actionsDiv.style.display = 'flex'; // restore buttons

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 20;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`interview-report-${results.role}-${sessionId.slice(0, 8)}.pdf`);
      toast.success('Report downloaded as PDF successfully!');
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      toast.error('Failed to generate PDF report');
    } finally {
      setGeneratingPDF(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-denim border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No results found</p>
        <Link to="/dashboard" className="btn-primary inline-block mt-4">Go to Dashboard</Link>
      </div>
    );
  }

  // Parse feedbackSummary JSON if present
  let feedbackText = results.feedbackSummary;
  let strengths = [];
  let weaknesses = [];
  let suggestions = [];

  if (results.feedbackSummary && results.feedbackSummary.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(results.feedbackSummary);
      feedbackText = parsed.feedbackSummary || '';
      strengths = parsed.strengths || [];
      weaknesses = parsed.weaknesses || [];
      suggestions = parsed.suggestions || [];
    } catch (e) {
      console.error('Failed to parse feedback JSON:', e);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/dashboard" className="inline-flex items-center text-denim hover:text-denim/70 mb-6">
        <ArrowLeft size={18} className="mr-2" />
        Back to Dashboard
      </Link>

      <motion.div
        id="evaluation-report-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-8 bg-white"
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Interview Evaluation Report</h1>
            <p className="text-gray-500 mt-1">Session: {results.sessionId?.slice(0, 8) || 'N/A'}</p>
          </div>
          <div className="px-4 py-2 bg-soft-sky/20 rounded-xl text-denim font-semibold uppercase tracking-wider text-xs">
            {results.mode || 'Chat'} Mode
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Award, label: 'Overall Score', value: `${Math.round(results.overallScore || 0)}%` },
            { icon: Brain, label: 'Correct Answers', value: `${results.correctAnswers || 0}/${results.totalQuestions || 0}` },
            { icon: Clock, label: 'Session Duration', value: getDuration(results.startedAt, results.completedAt) },
            { icon: TrendingUp, label: 'Status', value: results.status || 'Completed' },
          ].map((stat, index) => (
            <div key={index} className="text-center p-4 bg-soft-sky/10 rounded-xl border border-soft-sky/20">
              <stat.icon size={20} className="mx-auto text-denim mb-2" />
              <p className="text-xs text-gray-500 uppercase tracking-wider">{stat.label}</p>
              <p className="text-xl font-bold text-gray-800 mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Detailed Scores Section */}
        {(results.communicationScore || results.clarityScore || results.correctnessScore) && (
          <div className="mb-8 p-6 bg-soft-sky/5 border border-soft-sky/10 rounded-2xl">
            <h3 className="font-semibold text-lg text-gray-800 mb-4">Performance Metrics</h3>
            <div className="space-y-4">
              {[
                { label: 'Technical Correctness', value: results.correctnessScore },
                { label: 'Communication & Delivery', value: results.communicationScore },
                { label: 'Clarity & Structure', value: results.clarityScore }
              ].map((metric, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-1 font-medium text-gray-700">
                    <span>{metric.label}</span>
                    <span>{Math.round(metric.value || 0)}%</span>
                  </div>
                  <div className="w-full h-2 bg-soft-sky/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-denim to-mauve rounded-full"
                      style={{ width: `${metric.value || 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feedback Summary Text */}
        {feedbackText && (
          <div className="mb-8 p-6 bg-soft-sky/10 rounded-2xl border border-soft-sky/10">
            <h3 className="font-semibold text-lg text-gray-800 mb-3">AI Interview Feedback</h3>
            <div className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed prose max-w-none">
              {feedbackText}
            </div>
          </div>
        )}

        {/* Strengths & Weaknesses (AI evaluated) */}
        {strengths.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="p-6 bg-soft-sky/20 border border-denim/20 rounded-2xl">
              <h4 className="font-semibold text-denim mb-3 flex items-center">
                <span className="mr-2">💪</span> Strengths
              </h4>
              <ul className="list-disc pl-5 space-y-2 text-gray-700 text-sm leading-relaxed">
                {strengths.map((s, idx) => <li key={idx}>{s}</li>)}
              </ul>
            </div>
            <div className="p-6 bg-flamingo/20 border border-mauve/20 rounded-2xl">
              <h4 className="font-semibold text-mauve mb-3 flex items-center">
                <span className="mr-2">📌</span> Areas for Improvement
              </h4>
              <ul className="list-disc pl-5 space-y-2 text-gray-700 text-sm leading-relaxed">
                {weaknesses.map((w, idx) => <li key={idx}>{w}</li>)}
              </ul>
            </div>
          </div>
        )}

        {/* Suggestions (AI Recommendations) */}
        {suggestions.length > 0 && (
          <div className="mb-8 p-6 bg-lavender/20 border border-lavender/40 rounded-2xl">
            <h4 className="font-semibold text-purple-900 mb-3 flex items-center">
              <span className="mr-2">🎯</span> Actionable Recommendations
            </h4>
            <ul className="list-disc pl-5 space-y-2 text-gray-700 text-sm leading-relaxed">
              {suggestions.map((s, idx) => <li key={idx}>{s}</li>)}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-4 action-buttons-container mt-8 pt-6 border-t border-lavender/20">
          <Link to="/interview-setup" className="btn-primary">Practice Again</Link>
          <Link to="/analytics" className="btn-secondary">View Analytics</Link>
          <button 
            onClick={downloadPDF} 
            disabled={generatingPDF} 
            className="btn-secondary flex items-center cursor-pointer disabled:opacity-50"
          >
            {generatingPDF ? (
              <>
                <Loader2 size={16} className="animate-spin mr-2" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download size={16} className="mr-2" />
                Download PDF Report
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ResultsPage;
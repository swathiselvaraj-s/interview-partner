import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Send, Loader2, RefreshCw, Home } from 'lucide-react';
import toast from 'react-hot-toast';

// ============ STATIC DATA ============
const QUESTION_BANKS = {
  JAVA: [
    "What is the difference between an abstract class and an interface in Java?",
    "How does garbage collection work in Java?",
    "Explain the Singleton design pattern.",
    "What are Java Streams and how do you use them?",
    "What is the Java memory model?"
  ],
  FRONTEND: [
    "Explain the React component lifecycle.",
    "What is the difference between props and state in React?",
    "How does the Virtual DOM work?",
    "What are React Hooks and why were they introduced?",
    "Explain Higher-Order Components in React."
  ],
  BACKEND: [
    "What is the CAP theorem?",
    "Explain the difference between REST and GraphQL.",
    "What is database indexing and when should you use it?",
    "Explain microservices vs monolithic architecture.",
    "What are the ACID properties in databases?"
  ],
  DSA: [
    "Explain time and space complexity with examples.",
    "What is the difference between a HashMap and a TreeMap?",
    "Explain dynamic programming with an example.",
    "What is the difference between BFS and DFS traversal?",
    "How does binary search work?"
  ]
};

const FEEDBACKS = {
  excellent: [
    "🌟 Excellent answer! You clearly have deep knowledge in this area.",
    "💪 Perfect response! Expert-level understanding demonstrated.",
    "⭐ Outstanding! Your explanation was both accurate and well-structured."
  ],
  good: [
    "👍 Good answer! You've shown solid understanding.",
    "📚 Nice job! Your explanation was clear and concise.",
    "💪 Well done! You're on the right track."
  ],
  moderate: [
    "🤔 Not bad! You've touched on some key points.",
    "🔍 That's a good start! Try to include more details.",
    "💡 Fair answer! Let's think about this from another angle."
  ],
  poor: [
    "🔄 Let's work on this area more. Review the fundamentals.",
    "🎓 This is a tough topic! Focus on the key concepts first.",
    "📝 Good try! Let's break this down into smaller parts."
  ]
};

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const getFeedback = (answer, question) => {
  const keywords = ['explain', 'what', 'how', 'difference', 'example', 'define', 'describe'];
  const wordCount = answer.split(' ').length;
  
  if (wordCount > 30) return getRandom(FEEDBACKS.excellent);
  if (wordCount > 15) return getRandom(FEEDBACKS.good);
  if (wordCount > 8) return getRandom(FEEDBACKS.moderate);
  return getRandom(FEEDBACKS.poor);
};

const getFollowUp = (index, total) => {
  if (index < total - 1) {
    const msgs = [
      "Let's move to the next question.",
      "Great! Here's the next one.",
      "Nice job! Continuing with the next question.",
      "Good! Let's keep going."
    ];
    return getRandom(msgs);
  }
  return null;
};

// ============ COMPONENT ============
const SmartInterviewPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') || 'JAVA';
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const messagesEndRef = useRef(null);

  const questions = QUESTION_BANKS[role] || QUESTION_BANKS.JAVA;
  const totalQuestions = questions.length;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Start interview
  const startInterview = () => {
    const greeting = `👋 Hello! I'm WAVE. Let's start your ${role} interview with ${totalQuestions} questions.`;
    const firstQ = `❓ Question 1/${totalQuestions}: ${questions[0]}`;
    
    setMessages([
      { role: 'assistant', content: greeting },
      { role: 'assistant', content: firstQ }
    ]);
    setCurrentIndex(0);
    setIsComplete(false);
    setScore(0);
    setAnsweredCount(0);
  };

  // Handle answer submission
  const handleSend = async () => {
    if (!input.trim() || isLoading || isComplete) return;

    const userAnswer = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userAnswer }]);
    setInput('');
    setIsLoading(true);

    // Simulate thinking
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Get feedback
    const feedback = getFeedback(userAnswer, questions[currentIndex]);
    const nextIndex = currentIndex + 1;
    setAnsweredCount(prev => prev + 1);
    
    // Calculate simple score based on word count
    const wordScore = Math.min(userAnswer.split(' ').length / 30 * 100, 100);
    setScore(prev => prev + wordScore);

    // Add feedback
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: `💡 ${feedback}`,
      isFeedback: true
    }]);

    // Check if complete
    if (nextIndex >= totalQuestions) {
      setIsComplete(true);
      const avgScore = Math.round(score / totalQuestions);
      const completionMsg = `🎉 Interview Complete!\n\n📊 Average Score: ${avgScore}%\n💬 You answered ${totalQuestions} questions.\n\n${avgScore > 70 ? '🌟 Excellent work! Keep it up!' : '📚 Good effort! Review the topics and try again.'}`;
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: completionMsg,
        isComplete: true
      }]);
      toast.success('🎉 Interview completed!');
      setIsLoading(false);
      return;
    }

    // Ask next question with follow-up
    const followUp = getFollowUp(nextIndex, totalQuestions);
    const nextQ = `❓ Question ${nextIndex + 1}/${totalQuestions}: ${questions[nextIndex]}`;
    
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: followUp ? `${followUp}\n\n${nextQ}` : nextQ 
      }]);
      setCurrentIndex(nextIndex);
      setIsLoading(false);
    }, 500);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const reset = () => {
    setMessages([]);
    setCurrentIndex(0);
    setIsComplete(false);
    setScore(0);
    setAnsweredCount(0);
    startInterview();
  };

  // Start on mount
  useEffect(() => {
    startInterview();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="font-semibold text-xl">🎯 {role} Interview</h2>
            <p className="text-sm text-gray-500">
              {isComplete ? '✅ Complete!' : `Question ${currentIndex + 1}/${totalQuestions}`}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {!isComplete && (
              <span className="text-sm text-gray-500">
                Score: {Math.round(score / Math.max(answeredCount, 1)) || 0}%
              </span>
            )}
            <span className="text-sm text-gray-500">WAVE</span>
            <div className={`w-2 h-2 rounded-full ${isComplete ? 'bg-green-400' : 'bg-green-400 animate-pulse'}`} />
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full h-2 bg-soft-sky/20 rounded-full mt-3 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-denim to-mauve rounded-full transition-all duration-500"
            style={{ width: `${isComplete ? 100 : (currentIndex / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Messages */}
      <div className="card p-6 min-h-[400px] max-h-[500px] overflow-y-auto mb-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`max-w-[85%] rounded-xl px-4 py-3 ${
              msg.role === 'user' 
                ? 'bg-denim text-white' 
                : msg.isFeedback 
                  ? 'bg-soft-sky/30 text-gray-700 border-l-4 border-denim'
                  : msg.isComplete
                    ? 'bg-lavender/20 text-gray-700 border-2 border-lavender'
                    : 'bg-soft-sky/20 text-gray-700'
            }`}>
              {msg.role === 'assistant' && (
                <div className="text-xs text-gray-500 mb-1 font-medium">WAVE</div>
              )}
              <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-soft-sky/20 rounded-xl px-4 py-3">
              <Loader2 size={20} className="animate-spin text-denim" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="card p-4">
        {isComplete ? (
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button onClick={reset} className="btn-primary inline-flex items-center px-6 py-3">
              <RefreshCw size={18} className="mr-2" />
              Try Again
            </button>
            <button onClick={() => navigate('/')} className="btn-secondary inline-flex items-center px-6 py-3">
              <Home size={18} className="mr-2" />
              Home
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-end space-x-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKey}
                placeholder="Type your answer..."
                className="flex-1 input-field resize-none min-h-[50px] max-h-[120px] text-sm"
                rows={1}
                disabled={isLoading}
              />
              <button 
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="btn-primary h-[50px] px-6 disabled:opacity-50"
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
            <div className="mt-2 text-xs text-gray-400 flex justify-between">
              <span>Press Enter to send</span>
              <span className="text-denim font-medium">🎯 Smart Interview</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartInterviewPage;
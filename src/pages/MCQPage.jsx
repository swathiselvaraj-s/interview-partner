import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Loader2
} from 'lucide-react';
import { useInterview } from '../hooks/useInterview';
import toast from 'react-hot-toast';

const MCQPage = () => {
  const { startInterview, submitAnswer, sessionId } = useInterview();
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [timerInterval, setTimerInterval] = useState(null);

  // Quiz Settings
  const [settings, setSettings] = useState({
    numberOfQuestions: 10,
    difficulty: 'INTERMEDIATE',
    role: 'JAVA',
    topics: ['java-core', 'spring']
  });

  const handleStartQuiz = async () => {
    setLoading(true);
    const result = await startInterview({
      mode: 'MCQ',
      role: settings.role,
      difficulty: settings.difficulty,
      numberOfQuestions: settings.numberOfQuestions,
      topics: settings.topics
    });
    setLoading(false);
    
    if (result.success && result.data?.questions) {
      setQuestions(result.data.questions.map(q => ({
        ...q,
        selected: null,
        isCorrect: null
      })));
      setTotalTime(settings.numberOfQuestions * 60); // 1 minute per question
      setTimeLeft(settings.numberOfQuestions * 60);
      setQuizStarted(true);
      startTimer(settings.numberOfQuestions * 60);
    }
  };

  const startTimer = (duration) => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    setTimerInterval(interval);
  };

  const handleSelectOption = (optionIndex) => {
    if (answered) return;
    setSelectedOption(optionIndex);
  };

  const handleNextQuestion = () => {
    if (selectedOption === null) {
      toast.warning('Please select an answer');
      return;
    }

    // Check answer
    const currentQuestion = questions[currentIndex];
    const isCorrect = selectedOption === currentQuestion.correctOptionIndex;
    
    // Update question
    const updatedQuestions = [...questions];
    updatedQuestions[currentIndex] = {
      ...currentQuestion,
      selected: selectedOption,
      isCorrect: isCorrect
    };
    setQuestions(updatedQuestions);
    
    if (isCorrect) setScore(prev => prev + 1);
    setAnswered(true);
  };

  const handleSubmitQuiz = () => {
    clearInterval(timerInterval);
    setShowResults(true);
    // Auto-submit all unanswered questions
    const updatedQuestions = questions.map(q => {
      if (q.selected === undefined || q.selected === null) {
        return { ...q, selected: -1, isCorrect: false };
      }
      return q;
    });
    setQuestions(updatedQuestions);
    
    // Send results to backend
    const correctCount = updatedQuestions.filter(q => q.isCorrect).length;
    toast.success(`Quiz completed! Score: ${correctCount}/${questions.length}`);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getOptionLabel = (index) => String.fromCharCode(65 + index);

  if (!quizStarted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-denim/20 flex items-center justify-center mx-auto mb-4">
              <Brain size={32} className="text-denim" />
            </div>
            <h1 className="text-2xl font-bold">MCQ Quiz</h1>
            <p className="text-gray-500 mt-2">Test your knowledge with multiple choice questions</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
              <select
                value={settings.role}
                onChange={(e) => setSettings({ ...settings, role: e.target.value })}
                className="input-field"
              >
                <option value="JAVA">Java</option>
                <option value="FRONTEND">Frontend</option>
                <option value="BACKEND">Backend</option>
                <option value="DSA">DSA</option>
                <option value="GENERAL">General</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Number of Questions</label>
              <select
                value={settings.numberOfQuestions}
                onChange={(e) => setSettings({ ...settings, numberOfQuestions: parseInt(e.target.value) })}
                className="input-field"
              >
                <option value="5">5 Questions (5 min)</option>
                <option value="10">10 Questions (10 min)</option>
                <option value="15">15 Questions (15 min)</option>
                <option value="20">20 Questions (20 min)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Difficulty</label>
              <select
                value={settings.difficulty}
                onChange={(e) => setSettings({ ...settings, difficulty: e.target.value })}
                className="input-field"
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>

            <button
              onClick={handleStartQuiz}
              disabled={loading}
              className="w-full btn-primary py-3.5 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Start Quiz'}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (showResults) {
    const correctCount = questions.filter(q => q.isCorrect).length;
    const percentage = Math.round((correctCount / questions.length) * 100);
    
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card p-8"
        >
          <div className="text-center mb-8">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
              percentage >= 70 ? 'bg-green-100' : percentage >= 40 ? 'bg-yellow-100' : 'bg-red-100'
            }`}>
              {percentage >= 70 ? <CheckCircle size={40} className="text-green-600" /> :
               percentage >= 40 ? <AlertCircle size={40} className="text-yellow-600" /> :
               <XCircle size={40} className="text-red-600" />}
            </div>
            <h2 className="text-2xl font-bold">Quiz Complete!</h2>
            <p className="text-3xl font-bold mt-2">{percentage}%</p>
            <p className="text-gray-500">{correctCount} out of {questions.length} correct</p>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {questions.map((q, index) => (
              <div key={index} className={`p-3 rounded-xl border-2 ${
                q.isCorrect ? 'border-green-400 bg-green-50' : 
                q.selected !== -1 ? 'border-red-400 bg-red-50' : 
                'border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Q{index + 1}</span>
                  <span className={`text-sm ${q.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    {q.isCorrect ? '✓ Correct' : '✗ Wrong'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              setShowResults(false);
              setQuizStarted(false);
              setQuestions([]);
              setScore(0);
              setCurrentIndex(0);
            }}
            className="w-full btn-primary mt-6 py-3"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-500">
            Question {currentIndex + 1}/{questions.length}
          </span>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Clock size={16} />
            <span className={timeLeft < 60 ? 'text-red-500 font-medium' : ''}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
        <div className="text-sm text-denim font-medium">
          Score: {score}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-soft-sky/20 rounded-full mb-6 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-denim to-mauve rounded-full transition-all duration-500"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="card p-6 mb-6">
        <p className="text-lg font-medium">{currentQuestion?.questionText}</p>
        {currentQuestion?.context && (
          <p className="text-sm text-gray-500 mt-2">{currentQuestion.context}</p>
        )}
      </div>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {currentQuestion?.options?.map((option, index) => (
          <button
            key={index}
            onClick={() => handleSelectOption(index)}
            disabled={answered}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 ${
              selectedOption === index 
                ? 'border-denim bg-denim/10' 
                : 'border-lavender/30 hover:border-soft-sky hover:bg-soft-sky/5'
            } ${answered ? 'cursor-default opacity-70' : 'cursor-pointer'}`}
          >
            <div className="flex items-center space-x-3">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                selectedOption === index ? 'bg-denim text-white' : 'bg-soft-sky/20 text-gray-600'
              }`}>
                {getOptionLabel(index)}
              </span>
              <span>{option}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => {
            if (currentIndex > 0) {
              setCurrentIndex(prev => prev - 1);
              setAnswered(false);
              setSelectedOption(questions[currentIndex - 1]?.selected || null);
            }
          }}
          className="btn-outline px-6 py-2"
        >
          <ChevronLeft size={18} className="mr-1" />
          Previous
        </button>

        {currentIndex === questions.length - 1 ? (
          <button
            onClick={handleSubmitQuiz}
            className="btn-primary px-6 py-2"
          >
            Submit Quiz
          </button>
        ) : (
          <button
            onClick={handleNextQuestion}
            className="btn-primary px-6 py-2"
          >
            Next
            <ChevronRight size={18} className="ml-1" />
          </button>
        )}
      </div>
    </div>
  );
};

export default MCQPage;
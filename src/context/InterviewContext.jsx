import React, { createContext, useState, useContext } from 'react';
import { interviewAPI } from '../api/interview';
import toast from 'react-hot-toast';

export const InterviewContext = createContext();

export const InterviewProvider = ({ children }) => {
  const [sessionId, setSessionId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionData, setSessionData] = useState(null);

  const startInterview = async (data) => {
    setIsLoading(true);
    try {
      const response = await interviewAPI.startInterview(data);
      setSessionId(response.data.sessionId);
      setSessionData(response.data);
      
      // Get first question
      if (response.data.questions && response.data.questions.length > 0) {
        setCurrentQuestion(response.data.questions[0]);
        setMessages([{ role: 'assistant', content: response.data.questions[0].questionText }]);
      }
      
      toast.success('Interview started!');
      return { success: true, data: response.data };
    } catch (error) {
      toast.error('Failed to start interview');
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const getNextQuestion = async () => {
    if (!sessionId) {
      toast.error('No active session');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await interviewAPI.getNextQuestion(sessionId);
      setCurrentQuestion(response.data);
      setMessages(prev => [...prev, { role: 'assistant', content: response.data.questionText }]);
      return { success: true, data: response.data };
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error('All questions answered. End the interview.');
      } else {
        toast.error('Failed to get next question');
      }
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const submitAnswer = async (answerText, selectedOptionIndex, timeSpentSeconds) => {
    if (!sessionId || !currentQuestion) {
      toast.error('No active session or question');
      return;
    }

    setIsLoading(true);
    try {
      const data = {
        answerText,
        selectedOptionIndex,
        timeSpentSeconds: timeSpentSeconds || 0,
      };
      
      const response = await interviewAPI.submitAnswer(sessionId, data);
      
      // Update current question with answer
      const updatedQuestion = response.data;
      setCurrentQuestion(updatedQuestion);
      
      // Add user message
      setMessages(prev => [...prev, { role: 'user', content: answerText }]);
      
      toast.success('Answer submitted!');
      return { success: true, data: response.data };
    } catch (error) {
      toast.error('Failed to submit answer');
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const endInterview = async (abandon = false) => {
    if (!sessionId) {
      toast.error('No active session');
      return;
    }

    setIsLoading(true);
    try {
      const response = await interviewAPI.endInterview(sessionId, { abandon });
      setSessionData(response.data);
      toast.success(abandon ? 'Interview abandoned' : 'Interview completed!');
      return { success: true, data: response.data };
    } catch (error) {
      toast.error('Failed to end interview');
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const getSessionStatus = async () => {
    if (!sessionId) return;
    try {
      const response = await interviewAPI.getSessionStatus(sessionId);
      return response.data;
    } catch (error) {
      console.error('Failed to get session status:', error);
      return null;
    }
  };

  const resetInterview = () => {
    setSessionId(null);
    setCurrentQuestion(null);
    setMessages([]);
    setSessionData(null);
  };

  return (
    <InterviewContext.Provider value={{
      sessionId,
      currentQuestion,
      messages,
      isLoading,
      sessionData,
      startInterview,
      getNextQuestion,
      submitAnswer,
      endInterview,
      getSessionStatus,
      resetInterview,
    }}>
      {children}
    </InterviewContext.Provider>
  );
};

export const useInterview = () => {
  const context = useContext(InterviewContext);
  if (!context) {
    throw new Error('useInterview must be used within InterviewProvider');
  }
  return context;
};
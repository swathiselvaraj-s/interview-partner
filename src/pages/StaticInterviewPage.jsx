// src/services/staticInterviewService.js

const QUESTION_BANKS = {
  JAVA: [
    "What is the difference between an abstract class and an interface in Java?",
    "How does garbage collection work in Java?",
    "Explain the Singleton design pattern and its use cases.",
    "What are Java Streams and how do they differ from collections?",
    "Explain the Java memory model and its components."
  ],
  FRONTEND: [
    "Explain the React component lifecycle and its phases.",
    "What is the difference between props and state in React?",
    "How does the Virtual DOM work and why is it useful?",
    "What are React Hooks and why were they introduced?",
    "Explain Higher-Order Components in React."
  ],
  BACKEND: [
    "What is the CAP theorem and its implications?",
    "Explain the difference between REST and GraphQL APIs.",
    "What is database indexing and when should you use it?",
    "Explain microservices vs monolithic architecture.",
    "What are the ACID properties in database transactions?"
  ],
  DSA: [
    "Explain time and space complexity with examples.",
    "What is the difference between a HashMap and a TreeMap?",
    "Explain dynamic programming with an example problem.",
    "What is the difference between BFS and DFS traversal?",
    "How does binary search work and what are its applications?"
  ]
};

const FEEDBACKS = {
  excellent: [
    "🌟 Excellent answer! Deep understanding demonstrated.",
    "💪 Perfect! Expert-level knowledge shown.",
    "⭐ Outstanding! Very well explained."
  ],
  good: [
    "👍 Good answer! Solid understanding.",
    "📚 Nice job! Clear and concise explanation.",
    "💪 Well done! You're on the right track."
  ],
  moderate: [
    "🤔 Good effort! Try to add more details next time.",
    "📖 Decent answer. Consider exploring this topic more.",
    "💡 Fair answer! Let's think deeper about this."
  ],
  poor: [
    "🔄 Keep practicing! Review the fundamentals.",
    "📝 This is challenging! Focus on key concepts.",
    "🎓 It's okay! Take time to understand this topic better."
  ]
};

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const staticInterviewService = {
  getQuestions: (role) => {
    return QUESTION_BANKS[role] || QUESTION_BANKS.JAVA;
  },
  
  getFeedback: (answer) => {
    const wordCount = answer.split(' ').length;
    let quality;
    if (wordCount > 25) quality = 'excellent';
    else if (wordCount > 15) quality = 'good';
    else if (wordCount > 8) quality = 'moderate';
    else quality = 'poor';
    
    return getRandom(FEEDBACKS[quality]);
  },
  
  getGreeting: (userName, role) => {
    return `👋 Hello ${userName || 'there'}! I'm WAVE. Let's start your ${role} interview with 5 questions. Take your time and answer thoughtfully. Good luck! 🎯`;
  },
  
  getQuestion: (role, index) => {
    const questions = staticInterviewService.getQuestions(role);
    if (index < questions.length) {
      return {
        question: questions[index],
        current: index + 1,
        total: questions.length,
        isComplete: false
      };
    }
    return {
      isComplete: true,
      total: questions.length
    };
  },
  
  getClosing: (role) => {
    return `🎉 Interview Complete! Great job on the ${role} interview. You've answered all 5 questions. Keep practicing and you'll ace the real interview! 🌟`;
  }
};
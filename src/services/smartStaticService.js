// src/services/smartStaticService.js

// ======================== QUESTION BANKS ========================
const questionBanks = {
  JAVA: {
    role: "Java Developer",
    questions: [
      {
        id: 1,
        question: "Can you explain the difference between an abstract class and an interface in Java?",
        keywords: ["abstract", "interface", "extends", "implements", "methods"],
        hints: ["Think about multiple inheritance", "Consider default methods"]
      },
      {
        id: 2,
        question: "How does garbage collection work in Java?",
        keywords: ["garbage", "collector", "memory", "heap", "GC", "reference"],
        hints: ["Think about unreachable objects", "Mark and sweep algorithm"]
      },
      {
        id: 3,
        question: "What is the Singleton design pattern and how do you implement it?",
        keywords: ["singleton", "instance", "static", "private", "constructor"],
        hints: ["Only one instance", "Thread safety considerations"]
      },
      {
        id: 4,
        question: "Explain Java Streams and how they differ from collections.",
        keywords: ["stream", "functional", "lazy", "aggregate", "operations", "parallel"],
        hints: ["Think about data processing", "Functional programming style"]
      },
      {
        id: 5,
        question: "What is the Java memory model and why is it important?",
        keywords: ["memory", "model", "heap", "stack", "multithreading", "volatile"],
        hints: ["How data is shared between threads", "Visibility and ordering"]
      }
    ],
    closingMessage: "Excellent work on the Java interview! Your understanding of core concepts is impressive. Keep building more projects to solidify these concepts! 🌟"
  },
  
  FRONTEND: {
    role: "Frontend Developer",
    questions: [
      {
        id: 1,
        question: "Explain the React component lifecycle and its phases.",
        keywords: ["lifecycle", "mounting", "updating", "unmounting", "render", "effect"],
        hints: ["Think about when components are created", "Side effects"]
      },
      {
        id: 2,
        question: "What's the difference between props and state in React?",
        keywords: ["props", "state", "immutable", "mutability", "parent", "child"],
        hints: ["Data flow direction", "Mutability"]
      },
      {
        id: 3,
        question: "How does the Virtual DOM work and why is it useful?",
        keywords: ["virtual", "DOM", "diffing", "reconciliation", "performance", "real"],
        hints: ["Think about performance optimization", "Batch updates"]
      },
      {
        id: 4,
        question: "Explain React Hooks and why they were introduced.",
        keywords: ["hooks", "state", "effect", "functional", "lifecycle", "components"],
        hints: ["Class components vs functional", "State and side effects"]
      },
      {
        id: 5,
        question: "What are Higher-Order Components (HOCs) and when to use them?",
        keywords: ["HOC", "higher", "order", "component", "wrapper", "reuse"],
        hints: ["Think about component composition", "Code reuse"]
      }
    ],
    closingMessage: "Great job on the Frontend interview! You have a solid grasp of React concepts. Keep practicing with real projects to sharpen your skills! 🚀"
  },
  
  BACKEND: {
    role: "Backend Developer",
    questions: [
      {
        id: 1,
        question: "Explain the CAP theorem and its implications for distributed systems.",
        keywords: ["CAP", "consistency", "availability", "partition", "tolerance", "tradeoff"],
        hints: ["Think about distributed databases", "Network failures"]
      },
      {
        id: 2,
        question: "What's the difference between REST and GraphQL APIs?",
        keywords: ["REST", "GraphQL", "API", "endpoint", "query", "overfetching"],
        hints: ["Think about data fetching", "Client flexibility"]
      },
      {
        id: 3,
        question: "Explain database indexing and when to use it.",
        keywords: ["index", "database", "performance", "search", "B-tree", "optimization"],
        hints: ["Think about read vs write performance", "Storage overhead"]
      },
      {
        id: 4,
        question: "What are microservices and how do they differ from monolithic architecture?",
        keywords: ["microservices", "monolithic", "distributed", "deploy", "scale", "independent"],
        hints: ["Think about deployment", "Team organization"]
      },
      {
        id: 5,
        question: "Explain the ACID properties in database transactions.",
        keywords: ["ACID", "atomicity", "consistency", "isolation", "durability", "transaction"],
        hints: ["Think about data integrity", "Transaction boundaries"]
      }
    ],
    closingMessage: "Excellent Backend interview! Your understanding of system design is strong. Keep exploring distributed systems and cloud technologies! ☁️"
  },
  
  DSA: {
    role: "Data Structures & Algorithms",
    questions: [
      {
        id: 1,
        question: "Explain time and space complexity with a real-world example.",
        keywords: ["complexity", "time", "space", "Big O", "efficiency", "scalability"],
        hints: ["Think about algorithm performance", "Worst case scenarios"]
      },
      {
        id: 2,
        question: "What's the difference between a HashMap and a TreeMap?",
        keywords: ["HashMap", "TreeMap", "implementation", "ordered", "performance", "comparator"],
        hints: ["Think about ordering", "Underlying data structure"]
      },
      {
        id: 3,
        question: "Explain dynamic programming with an example problem.",
        keywords: ["dynamic", "programming", "memoization", "subproblems", "optimal", "recursion"],
        hints: ["Think about overlapping subproblems", "Fibonacci or Knapsack"]
      },
      {
        id: 4,
        question: "What's the difference between BFS and DFS traversal?",
        keywords: ["BFS", "DFS", "traversal", "queue", "stack", "graph", "tree"],
        hints: ["Think about search strategy", "Memory usage"]
      },
      {
        id: 5,
        question: "Explain binary search and its applications.",
        keywords: ["binary", "search", "divide", "conquer", "sorted", "logarithmic"],
        hints: ["Think about searching algorithms", "Applications beyond arrays"]
      }
    ],
    closingMessage: "Fantastic work on the DSA interview! Your problem-solving skills are impressive. Keep practicing LeetCode problems to stay sharp! 💪"
  },
  
  GENERAL: {
    role: "General Interview",
    questions: [
      {
        id: 1,
        question: "Tell me about yourself and your experience.",
        keywords: ["experience", "background", "projects", "skills", "journey", "achievements"],
        hints: ["Keep it professional", "Highlight achievements"]
      },
      {
        id: 2,
        question: "Describe a challenging problem you solved recently.",
        keywords: ["problem", "solution", "challenge", "approach", "outcome", "learned"],
        hints: ["Use STAR method", "Focus on learning"]
      },
      {
        id: 3,
        question: "How do you handle conflict in a team environment?",
        keywords: ["conflict", "team", "resolution", "communication", "collaboration", "solution"],
        hints: ["Think about examples", "Focus on resolution"]
      },
      {
        id: 4,
        question: "Where do you see yourself in 5 years?",
        keywords: ["future", "career", "growth", "goals", "ambition", "development"],
        hints: ["Be realistic", "Show ambition"]
      },
      {
        id: 5,
        question: "Why do you want to work with us?",
        keywords: ["company", "culture", "mission", "values", "opportunity", "growth"],
        hints: ["Research the company", "Be specific"]
      }
    ],
    closingMessage: "Great job on the General interview! Your communication skills are excellent. Keep building your professional presence! 🌟"
  }
};

// ======================== FEEDBACK GENERATOR ========================
const feedbackBank = {
  excellent: [
    "That's an excellent answer! You clearly have deep knowledge in this area. 🌟",
    "Perfect response! You've demonstrated expert-level understanding. 💪",
    "Outstanding! Your explanation was both accurate and well-structured. ⭐",
    "Brilliant answer! You've covered all the key points effectively. 🎯"
  ],
  good: [
    "Good answer! You've shown solid understanding. Try to add more specifics next time. 👍",
    "Nice job! Your explanation was clear. Consider adding a practical example. 📚",
    "Well done! You're on the right track. Let's build on this. 🌱",
    "Great effort! You've got the core concepts right. Keep going! 💪"
  ],
  moderate: [
    "Not bad! You've touched on some key points. Let's explore this deeper. 🤔",
    "That's a good start! Try to include more details in your explanation. 🔍",
    "Fair answer! Let's think about this from another angle. 💡",
    "Okay! Consider reviewing the fundamentals and try again. 📖"
  ],
  needsImprovement: [
    "Let's work on this area more. Try to think about the bigger picture. 🔄",
    "This is a tough topic! Remember to focus on the key concepts first. 🎓",
    "Good try! Let's break this down into smaller parts. 📝",
    "It's okay to struggle! Take your time and review the basics. 💯"
  ]
};

// ======================== UTILITY FUNCTIONS ========================
const getRandom = (array) => array[Math.floor(Math.random() * array.length)];

const getFeedbackQuality = (answer, question) => {
  const keywords = question.keywords || [];
  const lowerAnswer = answer.toLowerCase();
  
  let matchCount = 0;
  for (const keyword of keywords) {
    if (lowerAnswer.includes(keyword.toLowerCase())) {
      matchCount++;
    }
  }
  
  const ratio = matchCount / keywords.length;
  
  if (ratio >= 0.7) return 'excellent';
  if (ratio >= 0.5) return 'good';
  if (ratio >= 0.3) return 'moderate';
  return 'needsImprovement';
};

const getFollowUpMessage = (quality, answer) => {
  const followUps = {
    excellent: [
      "Let's move to the next question.",
      "I'm impressed! You're ready for the next one.",
      "Great understanding! Here's the next question."
    ],
    good: [
      "Let's continue with the next question.",
      "Good, let's build on that with the next question.",
      "Nice job! Now let's try the next one."
    ],
    moderate: [
      "Let's keep going. The next question might help clarify things.",
      "It's okay! Let's continue to the next question.",
      "Don't worry! The next question is on a different topic."
    ],
    needsImprovement: [
      "Let's try a different topic now.",
      "It's okay! Let's move on and come back to this later.",
      "Let's switch gears. Here's a different question."
    ]
  };
  
  return getRandom(followUps[quality] || followUps.good);
};

// ======================== MAIN SERVICE ========================
export const smartStaticService = {
  getRoleQuestions: (role) => {
    return questionBanks[role] || questionBanks.GENERAL;
  },
  
  getQuestion: (role, index) => {
    const bank = smartStaticService.getRoleQuestions(role);
    if (index < bank.questions.length) {
      const q = bank.questions[index];
      return {
        question: q.question,
        keywords: q.keywords,
        hints: q.hints,
        current: index + 1,
        total: bank.questions.length,
        isComplete: false,
        role: bank.role
      };
    }
    return {
      question: null,
      isComplete: true,
      role: bank.role,
      closingMessage: bank.closingMessage
    };
  },
  
  evaluateAnswer: (answer, question) => {
    const quality = getFeedbackQuality(answer, question);
    const feedback = getRandom(feedbackBank[quality]);
    const followUp = getFollowUpMessage(quality, answer);
    
    return {
      quality: quality,
      feedback: feedback,
      followUp: followUp,
      score: quality === 'excellent' ? 90 : 
             quality === 'good' ? 70 : 
             quality === 'moderate' ? 50 : 30
    };
  },
  
  getInitialMessage: (role, userName) => {
    const bank = smartStaticService.getRoleQuestions(role);
    return `Hello ${userName || 'there'}! 👋 I'm WAVE, your AI interview coach. Let's start your ${bank.role} interview. I'll ask you 5 questions and provide feedback on each. Take your time and answer thoughtfully. Ready? Let's begin!`;
  },
  
  getQuestionDisplay: (questionData) => {
    return `❓ Question ${questionData.current}/${questionData.total}: ${questionData.question}`;
  }
};
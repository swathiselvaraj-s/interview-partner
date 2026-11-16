import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Code, 
  MessageSquare, 
  Mic, 
  ChevronRight, 
  ChevronLeft,
  Check,
  BookOpen,
  Sparkles,
  Loader2,
  X
} from 'lucide-react';
import { useInterview } from '../hooks/useInterview';
import { interviewAPI } from '../api/interview';
import toast from 'react-hot-toast';

const InterviewSetupPage = () => {
  const navigate = useNavigate();
  const { startInterview } = useInterview();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  // Step State
  const [selectedInterviewType, setSelectedInterviewType] = useState('TECHNICAL');
  const [communicationPreference, setCommunicationPreference] = useState('TEXT');
  
  const [selectedRole, setSelectedRole] = useState('JAVA');
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('algorithms');
  const [selectedDifficulty, setSelectedDifficulty] = useState('INTERMEDIATE');
  const [selectedTimeLimit, setSelectedTimeLimit] = useState(30);

  const roles = {
    JAVA: {
      label: 'Java Developer',
      icon: <Brain size={24} />,
      color: 'denim',
      description: 'Core Java, Spring Boot, Microservices',
      topics: [
        { id: 'java-core', label: 'Java Core', description: 'OOP, Collections, Multithreading' },
        { id: 'spring', label: 'Spring Framework', description: 'Spring Boot, Spring MVC, Spring Data' },
        { id: 'microservices', label: 'Microservices', description: 'Architecture, REST, Cloud' },
        { id: 'jpa', label: 'JPA/Hibernate', description: 'ORM, Relationships, Queries' },
        { id: 'java-8', label: 'Java 8+ Features', description: 'Streams, Lambda, Optional' },
        { id: 'design-patterns', label: 'Design Patterns', description: 'Singleton, Factory, Observer' },
      ]
    },
    FRONTEND: {
      label: 'Frontend Developer',
      icon: <Code size={24} />,
      color: 'mauve',
      description: 'React, JavaScript, CSS, UI/UX',
      topics: [
        { id: 'react', label: 'React.js', description: 'Components, Hooks, State Management' },
        { id: 'javascript', label: 'JavaScript', description: 'ES6+, Async, DOM Manipulation' },
        { id: 'css', label: 'CSS/Tailwind', description: 'Flexbox, Grid, Responsive Design' },
        { id: 'typescript', label: 'TypeScript', description: 'Types, Generics, Interfaces' },
        { id: 'performance', label: 'Web Performance', description: 'Optimization, Lazy Loading' },
        { id: 'testing', label: 'Testing', description: 'Jest, React Testing Library' },
      ]
    },
    BACKEND: {
      label: 'Backend Developer',
      icon: <Brain size={24} />,
      color: 'soft-sky',
      description: 'APIs, Databases, Architecture',
      topics: [
        { id: 'api-design', label: 'API Design', description: 'REST, GraphQL, gRPC' },
        { id: 'databases', label: 'Databases', description: 'SQL, NoSQL, Indexing' },
        { id: 'security', label: 'Security', description: 'JWT, OAuth, Encryption' },
        { id: 'caching', label: 'Caching', description: 'Redis, CDN, Strategies' },
        { id: 'scalability', label: 'Scalability', description: 'Load Balancing, Sharding' },
        { id: 'devops', label: 'DevOps', description: 'Docker, CI/CD, Monitoring' },
      ]
    },
    DSA: {
      label: 'Data Structures & Algorithms',
      icon: <Sparkles size={24} />,
      color: 'flamingo',
      description: 'Problem Solving, Complexity, Logic',
      topics: [
        { id: 'arrays', label: 'Arrays & Strings', description: 'Two Pointers, Sliding Window' },
        { id: 'linked-lists', label: 'Linked Lists', description: 'Singly, Doubly, Circular' },
        { id: 'trees', label: 'Trees & Graphs', description: 'BST, DFS, BFS, Traversals' },
        { id: 'dp', label: 'Dynamic Programming', description: 'Memoization, Tabulation' },
        { id: 'sorting', label: 'Sorting Algorithms', description: 'Quick, Merge, Heap Sort' },
        { id: 'searching', label: 'Searching', description: 'Binary Search, Hashing' },
      ]
    },
    GENERAL: {
      label: 'General Interview',
      icon: <BookOpen size={24} />,
      color: 'lavender',
      description: 'Behavioral, Problem Solving, Communication',
      topics: [
        { id: 'behavioral', label: 'Behavioral Questions', description: 'STAR Method, Leadership' },
        { id: 'communication', label: 'Communication Skills', description: 'Clarity, Presentation' },
        { id: 'problem-solving', label: 'Problem Solving', description: 'Analytical Thinking' },
        { id: 'system-design', label: 'System Design', description: 'High Level Design' },
        { id: 'leadership', label: 'Leadership', description: 'Team Management, Mentoring' },
        { id: 'cultural-fit', label: 'Cultural Fit', description: 'Values, Team Dynamics' },
      ]
    }
  };

  const codingCategories = [
    { id: 'algorithms', label: 'Algorithms', description: 'Sorting, searching, dynamic programming, and complexity analyses' },
    { id: 'data-structures', label: 'Data Structures', description: 'Trees, graphs, linked lists, heaps, and arrays' },
    { id: 'databases', label: 'Database & SQL', description: 'SQL queries, indexing, joins, schemas, and design constraints' },
    { id: 'general', label: 'General Coding', description: 'Basic programming syntax, logical constructs, and string formats' },
  ];

  const interviewModes = [
    { value: 'TECHNICAL', icon: MessageSquare, label: 'Technical Interview', description: 'Adaptive technical discussion' },
    { value: 'MCQ', icon: Brain, label: 'MCQ Interview', description: 'Multiple choice questions' },
    { value: 'CODING', icon: Code, label: 'Coding Interview', description: 'Write and evaluate code' },
  ];

  const communicationOptions = [
    { value: 'TEXT', icon: MessageSquare, label: 'Text Chat' },
    { value: 'VOICE', icon: Mic, label: 'Voice Speaking' },
  ];

  const difficulties = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
  const timeLimits = [15, 30, 45, 60];

  const getSteps = () => {
    if (selectedInterviewType === 'TECHNICAL') {
      return [
        { label: 'Mode', key: 'mode' },
        { label: 'Pref', key: 'pref' },
        { label: 'Role', key: 'role' },
        { label: 'Difficulty', key: 'diff' },
        { label: 'Timer', key: 'timer' }
      ];
    } else if (selectedInterviewType === 'MCQ') {
      return [
        { label: 'Mode', key: 'mode' },
        { label: 'Role', key: 'role' },
        { label: 'Topics', key: 'topics' },
        { label: 'Difficulty', key: 'diff' },
        { label: 'Timer', key: 'timer' }
      ];
    } else { // CODING
      return [
        { label: 'Mode', key: 'mode' },
        { label: 'Category', key: 'category' },
        { label: 'Difficulty', key: 'diff' },
        { label: 'Timer', key: 'timer' }
      ];
    }
  };

  const steps = getSteps();
  const totalSteps = steps.length;
  const currentRole = roles[selectedRole];
  const selectedTopicsData = currentRole?.topics?.filter(t => selectedTopics.includes(t.id)) || [];

  const handleTopicToggle = (topicId) => {
    setSelectedTopics(prev => 
      prev.includes(topicId) 
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const resolveInterviewMode = () => {
    if (selectedInterviewType === 'TECHNICAL') {
      return communicationPreference === 'VOICE' ? 'VOICE' : 'CHAT';
    }
    return selectedInterviewType;
  };

  const handleStart = async () => {
    if (selectedInterviewType === 'MCQ' && selectedTopics.length === 0) {
      toast.error('Please select at least one topic to focus on');
      return;
    }

    setLoading(true);
    const resolvedMode = resolveInterviewMode();
    
    // Map request inputs
    const startPayload = {
      mode: resolvedMode,
      role: selectedInterviewType === 'CODING' ? 'DSA' : selectedRole,
      difficulty: selectedDifficulty,
      timeLimit: selectedTimeLimit,
      topics: selectedInterviewType === 'CODING' 
        ? [selectedCategory] 
        : (selectedInterviewType === 'TECHNICAL' ? [] : selectedTopics)
    };

    const result = await startInterview(startPayload);
    setLoading(false);
    
    if (result.success) {
      navigate(`/interview?mode=${resolvedMode}&role=${startPayload.role}&difficulty=${selectedDifficulty}&sessionId=${result.data.sessionId}&timeLimit=${selectedTimeLimit}`);
    }
  };

  const nextStep = () => {
    if (step < totalSteps) {
      // Logic validations before steps change
      if (selectedInterviewType === 'MCQ' && step === 3 && selectedTopics.length === 0) {
        toast.error('Please select at least one topic');
        return;
      }
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-10 overflow-x-auto py-2">
        {steps.map((s, idx) => (
          <div key={s.key} className="flex items-center">
            <div className="flex flex-col items-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                  idx + 1 <= step ? 'bg-denim text-white' : 'bg-gray-200 text-gray-400'
                }`}
              >
                {idx + 1}
              </div>
              <span className="text-[10px] text-gray-500 mt-1 font-medium hidden sm:inline">{s.label}</span>
            </div>
            {idx < totalSteps - 1 && (
              <div className={`w-12 sm:w-16 h-0.5 mx-1 mb-0 sm:mb-4 transition-all duration-300 ${
                idx + 1 < step ? 'bg-denim' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      <motion.div
        key={`${selectedInterviewType}-${step}`}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        {/* Step: Select Interview Type */}
        {step === 1 && (
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Select Interview Type</h1>
            <p className="text-gray-500 mt-2">Choose how you want to practice with WAVE</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              {interviewModes.map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => {
                    setSelectedInterviewType(mode.value);
                  }}
                  className={`card p-6 text-left transition-all duration-300 ${
                    selectedInterviewType === mode.value 
                      ? 'border-2 border-denim shadow-hover' 
                      : 'hover:shadow-hover'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-denim/20 flex items-center justify-center text-denim mb-3">
                    <mode.icon size={24} />
                  </div>
                  <h3 className="font-semibold">{mode.label}</h3>
                  <p className="text-sm text-gray-500 mt-1">{mode.description}</p>
                  {selectedInterviewType === mode.value && (
                    <div className="mt-2 text-xs text-denim font-medium">✓ Selected</div>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={nextStep}
              className="btn-primary inline-flex items-center mt-8 px-8 py-3"
            >
              Next
              <ChevronRight size={18} className="ml-2" />
            </button>
          </div>
        )}

        {/* Step: Communication Mode (Technical Step 2) */}
        {selectedInterviewType === 'TECHNICAL' && step === 2 && (
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Communication Preference</h1>
            <p className="text-gray-500 mt-2">Choose your preferred interaction method</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 max-w-lg mx-auto">
              {communicationOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setCommunicationPreference(option.value)}
                  className={`card p-6 text-left transition-all duration-300 ${
                    communicationPreference === option.value
                      ? 'border-2 border-denim shadow-hover'
                      : 'hover:shadow-hover'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-denim/20 flex items-center justify-center text-denim mb-3">
                    <option.icon size={24} />
                  </div>
                  <h3 className="font-semibold">{option.label}</h3>
                  {communicationPreference === option.value && (
                    <div className="mt-2 text-xs text-denim font-medium">✓ Selected</div>
                  )}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between mt-8 max-w-lg mx-auto">
              <button onClick={prevStep} className="btn-outline px-6 py-2 flex items-center">
                <ChevronLeft size={16} className="mr-1" /> Back
              </button>
              <button onClick={nextStep} className="btn-primary inline-flex items-center px-8 py-3">
                Next <ChevronRight size={18} className="ml-2" />
              </button>
            </div>
          </div>
        )}

        {/* Step: Role Selection (Technical Step 3 / MCQ Step 2) */}
        {((selectedInterviewType === 'TECHNICAL' && step === 3) || 
          (selectedInterviewType === 'MCQ' && step === 2)) && (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold">Select Target Role</h1>
              <p className="text-gray-500 mt-2">Specify the specialization for the interview</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {Object.keys(roles).map((key) => {
                const roleObj = roles[key];
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectedRole(key);
                      setSelectedTopics([]); // reset topics on role change
                    }}
                    className={`flex items-start space-x-4 p-5 rounded-xl border-2 transition-all duration-300 text-left ${
                      selectedRole === key 
                        ? `border-${roleObj.color} bg-${roleObj.color}/5 shadow-hover` 
                        : 'border-lavender/20 hover:border-soft-sky bg-white'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${roleObj.color}/20 text-${roleObj.color}`}>
                      {roleObj.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold">{roleObj.label}</h4>
                      <p className="text-xs text-gray-500 mt-1">{roleObj.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between mt-8">
              <button onClick={prevStep} className="btn-outline px-6 py-2 flex items-center">
                <ChevronLeft size={16} className="mr-1" /> Back
              </button>
              <button onClick={nextStep} className="btn-primary inline-flex items-center px-8 py-3">
                Next <ChevronRight size={18} className="ml-2" />
              </button>
            </div>
          </div>
        )}

        {/* Step: Coding Category Selection (Coding Step 2) */}
        {selectedInterviewType === 'CODING' && step === 2 && (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold">Choose Coding Category</h1>
              <p className="text-gray-500 mt-2">Pick a category to focus your coding problem on</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {codingCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-start space-x-4 p-5 rounded-xl border-2 transition-all duration-300 text-left bg-white ${
                    selectedCategory === cat.id
                      ? 'border-denim bg-denim/5 shadow-hover'
                      : 'border-lavender/20 hover:border-soft-sky'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    selectedCategory === cat.id ? 'bg-denim/20 text-denim' : 'bg-gray-100 text-gray-500'
                  }`}>
                    <Code size={22} />
                  </div>
                  <div>
                    <h4 className="font-semibold">{cat.label}</h4>
                    <p className="text-xs text-gray-500 mt-1">{cat.description}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between mt-8">
              <button onClick={prevStep} className="btn-outline px-6 py-2 flex items-center">
                <ChevronLeft size={16} className="mr-1" /> Back
              </button>
              <button onClick={nextStep} className="btn-primary inline-flex items-center px-8 py-3">
                Next <ChevronRight size={18} className="ml-2" />
              </button>
            </div>
          </div>
        )}

        {/* Step: Topic Selection (MCQ Step 3) */}
        {selectedInterviewType === 'MCQ' && step === 3 && (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold">Select MCQ Topics</h1>
              <p className="text-gray-500 mt-2">
                {currentRole?.label} — Choose topics to focus MCQ questions on
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Selected: {selectedTopics.length} of {currentRole?.topics?.length || 0}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentRole?.topics?.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => handleTopicToggle(topic.id)}
                  className={`flex items-start space-x-3 p-4 rounded-xl border-2 transition-all duration-300 text-left bg-white ${
                    selectedTopics.includes(topic.id)
                      ? `border-denim bg-denim/10`
                      : 'border-lavender/20 hover:border-soft-sky'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    selectedTopics.includes(topic.id)
                      ? `bg-denim border-denim`
                      : 'border-gray-300'
                  }`}>
                    {selectedTopics.includes(topic.id) && (
                      <Check size={14} className="text-white" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{topic.label}</p>
                    <p className="text-xs text-gray-500">{topic.description}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between mt-8">
              <button onClick={prevStep} className="btn-outline px-6 py-2 flex items-center">
                <ChevronLeft size={16} className="mr-1" /> Back
              </button>
              <button
                onClick={nextStep}
                disabled={selectedTopics.length === 0}
                className="btn-primary inline-flex items-center px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next <ChevronRight size={18} className="ml-2" />
              </button>
            </div>
          </div>
        )}

        {/* Step: Difficulty Selection */}
        {((selectedInterviewType === 'TECHNICAL' && step === 4) ||
          (selectedInterviewType === 'MCQ' && step === 4) ||
          (selectedInterviewType === 'CODING' && step === 3)) && (
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Select Difficulty</h1>
            <p className="text-gray-500 mt-2">Adjust the difficulty level of questions</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 max-w-xl mx-auto">
              {difficulties.map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`card p-6 text-center transition-all duration-300 ${
                    selectedDifficulty === diff 
                      ? 'border-2 border-denim shadow-hover' 
                      : 'hover:shadow-hover'
                  }`}
                >
                  <h4 className="font-semibold">{diff}</h4>
                  {selectedDifficulty === diff && (
                    <div className="mt-2 text-xs text-denim font-medium">✓ Selected</div>
                  )}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between mt-8 max-w-xl mx-auto">
              <button onClick={prevStep} className="btn-outline px-6 py-2 flex items-center">
                <ChevronLeft size={16} className="mr-1" /> Back
              </button>
              <button onClick={nextStep} className="btn-primary inline-flex items-center px-8 py-3">
                Next <ChevronRight size={18} className="ml-2" />
              </button>
            </div>
          </div>
        )}

        {/* Step: Timer & Final Configuration */}
        {((selectedInterviewType === 'TECHNICAL' && step === 5) ||
          (selectedInterviewType === 'MCQ' && step === 5) ||
          (selectedInterviewType === 'CODING' && step === 4)) && (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold">Configure Interview Timer</h1>
              <p className="text-gray-500 mt-2">Set how long the interview session should last</p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 mt-6">
              {timeLimits.map((minutes) => (
                <button
                  key={minutes}
                  onClick={() => setSelectedTimeLimit(minutes)}
                  className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    selectedTimeLimit === minutes
                      ? 'bg-denim text-white shadow-lg'
                      : 'bg-soft-sky/10 text-gray-600 hover:bg-soft-sky/20'
                  }`}
                >
                  {minutes} minutes
                </button>
              ))}
            </div>

            {/* Config Summary Card */}
            <div className="mt-8 p-6 bg-soft-sky/10 rounded-xl max-w-md mx-auto border border-soft-sky/20">
              <h4 className="font-semibold text-sm mb-3">Interview Summary</h4>
              <ul className="text-xs text-gray-600 space-y-2">
                <li><span className="font-medium">Type:</span> {selectedInterviewType}</li>
                {selectedInterviewType === 'TECHNICAL' && (
                  <>
                    <li><span className="font-medium">Communication Preference:</span> {communicationPreference}</li>
                    <li><span className="font-medium">Target Role:</span> {currentRole?.label}</li>
                  </>
                )}
                {selectedInterviewType === 'MCQ' && (
                  <>
                    <li><span className="font-medium">Target Role:</span> {currentRole?.label}</li>
                    <li><span className="font-medium">Topics:</span> {selectedTopicsData.map(t => t.label).join(', ')}</li>
                  </>
                )}
                {selectedInterviewType === 'CODING' && (
                  <li><span className="font-medium">Coding Category:</span> {selectedCategory.toUpperCase()}</li>
                )}
                <li><span className="font-medium">Difficulty Level:</span> {selectedDifficulty}</li>
                <li><span className="font-medium">Time Limit:</span> {selectedTimeLimit} minutes</li>
              </ul>
            </div>

            <div className="flex items-center justify-between mt-8 max-w-md mx-auto">
              <button onClick={prevStep} className="btn-outline px-6 py-2 flex items-center">
                <ChevronLeft size={16} className="mr-1" /> Back
              </button>
              <button
                onClick={handleStart}
                disabled={loading}
                className="btn-primary inline-flex items-center px-8 py-3 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin mr-2" />
                    Starting...
                  </>
                ) : (
                  <>
                    Start Interview
                    <ChevronRight size={18} className="ml-2" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default InterviewSetupPage;

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, Send, Mic, MicOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { interviewAPI } from '../api/interview';
import { useInterview } from '../hooks/useInterview';
import CodingInterface from '../components/interview/CodingInterface';

const loadMediaPipeScripts = () => {
  return new Promise((resolve, reject) => {
    if (window.FaceMesh) {
      resolve();
      return;
    }
    const script1 = document.createElement('script');
    script1.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js';
    script1.async = true;
    const script2 = document.createElement('script');
    script2.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js';
    script2.async = true;
    script1.onload = () => {
      document.head.appendChild(script2);
    };
    script2.onload = () => {
      resolve();
    };
    script1.onerror = reject;
    script2.onerror = reject;
    document.head.appendChild(script1);
  });
};

const InterviewPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'CHAT';
  const role = searchParams.get('role') || 'JAVA';
  const querySessionId = searchParams.get('sessionId');
  const queryTimeLimit = Number(searchParams.get('timeLimit')) || 30;
  const {
    sessionId: contextSessionId,
    currentQuestion: contextQuestion,
    sessionData,
    resetInterview,
  } = useInterview();

  const activeSessionId = contextSessionId || querySessionId;
  const [selectedOption, setSelectedOption] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(contextQuestion);
  const [session, setSession] = useState(sessionData);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(queryTimeLimit * 60);
  const messagesEndRef = useRef(null);
  const finishingRef = useRef(false);

  // Telemetry and Voice States
  const [isRecording, setIsRecording] = useState(false);
  const [voicePlaybackActive, setVoicePlaybackActive] = useState(false);
  const [recognitionActive, setRecognitionActive] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');

  // Audio / Webcam Refs
  const webcamVideoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);

  // Analytics Accums
  const startTimeRef = useRef(Date.now());
  const aiSpeechFinishedTimeRef = useRef(Date.now());
  const recordingStartTimeRef = useRef(null);
  const totalSpeechDurationRef = useRef(0);
  const totalResponseLatencyRef = useRef(0);
  const totalFillerCountRef = useRef(0);
  const totalWordCountRef = useRef(0);
  const speechTurnsRef = useRef(0);

  const lookingAwayTimerRef = useRef(0);
  const warningsCountRef = useRef(0);
  const timeLookingAwayRef = useRef(0);

  const totalQuestions = useMemo(() => session?.totalQuestions || 5, [session]);
  const timerLabel = useMemo(() => {
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }, [remainingSeconds]);

  const appendQuestion = useCallback((question, questionNumber = 1) => {
    if (!question) return;
    let content = `Question ${questionNumber}/${totalQuestions}: ${question.questionText}`;
    if (question.options && question.options.length > 0) {
      content += '\n\n' + question.options.map((opt, i) => `${String.fromCharCode(65 + i)}) ${opt}`).join('\n');
    }
    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content,
      },
    ]);
  }, [totalQuestions]);

  const finishInterview = useCallback(async (reason = 'completed', telemetry = {}) => {
    if (!activeSessionId || finishingRef.current) return;

    finishingRef.current = true;
    setIsLoading(true);

    try {
      await interviewAPI.endInterview(activeSessionId, {
        abandon: false,
        ...telemetry
      });
      setIsComplete(true);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: reason === 'expired'
            ? 'Time is up. I have finished the interview and saved your results.'
            : 'Interview complete. I have saved your results for analytics.',
          isComplete: true,
        },
      ]);
      toast.success(reason === 'expired' ? 'Interview ended: time expired' : 'Interview completed!');
    } catch (error) {
      finishingRef.current = false;
      toast.error('Failed to finish interview');
    } finally {
      setIsLoading(false);
    }
  }, [activeSessionId]);

  // AI Voice Output (TTS)
  const speakText = async (text) => {
    const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    const voiceId = import.meta.env.VITE_ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';
    
    setVoicePlaybackActive(true);
    
    if (apiKey) {
      try {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': apiKey,
          },
          body: JSON.stringify({
            text: text,
            model_id: 'eleven_monolingual_v1',
            voice_settings: { stability: 0.5, similarity_boost: 0.75 }
          })
        });
        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          audio.onended = () => {
            URL.revokeObjectURL(url);
            setVoicePlaybackActive(false);
            aiSpeechFinishedTimeRef.current = Date.now();
          };
          audio.onerror = () => {
            URL.revokeObjectURL(url);
            speakWebSpeechFallback(text);
          };
          await audio.play();
          return;
        }
      } catch (err) {
        console.warn("ElevenLabs TTS failed, falling back:", err);
      }
    }
    
    speakWebSpeechFallback(text);
  };

  const speakWebSpeechFallback = (text) => {
    if (!window.speechSynthesis) {
      setVoicePlaybackActive(false);
      aiSpeechFinishedTimeRef.current = Date.now();
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.onend = () => {
      setVoicePlaybackActive(false);
      aiSpeechFinishedTimeRef.current = Date.now();
    };
    utterance.onerror = () => {
      setVoicePlaybackActive(false);
      aiSpeechFinishedTimeRef.current = Date.now();
    };
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) || 
                    voices.find(v => v.lang.startsWith('en'));
    if (preferred) utterance.voice = preferred;
    window.speechSynthesis.speak(utterance);
  };

  // User Voice Input (STT)
  const startVoiceRecording = async () => {
    if (voicePlaybackActive) return;
    
    if (aiSpeechFinishedTimeRef.current) {
      const latency = (Date.now() - aiSpeechFinishedTimeRef.current) / 1000;
      totalResponseLatencyRef.current += latency;
      speechTurnsRef.current += 1;
      aiSpeechFinishedTimeRef.current = null;
    }
    
    setVoiceTranscript('');
    audioChunksRef.current = [];
    recordingStartTimeRef.current = Date.now();

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.onresult = (event) => {
        let finalTrans = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTrans += event.results[i][0].transcript;
          }
        }
        if (finalTrans) {
          setVoiceTranscript(prev => prev + ' ' + finalTrans);
        }
      };
      recognitionRef.current.start();
      setRecognitionActive(true);
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        await transcribeWithWhisper(audioBlob);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.warn("Microphone access failed:", err);
      toast.error("Microphone access denied or failed.");
      setIsRecording(false);
      setRecognitionActive(false);
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    }
  };

  const stopVoiceRecording = () => {
    setIsRecording(false);
    setRecognitionActive(false);
    
    if (recordingStartTimeRef.current) {
      const duration = (Date.now() - recordingStartTimeRef.current) / 1000;
      totalSpeechDurationRef.current += duration;
      recordingStartTimeRef.current = null;
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const transcribeWithWhisper = async (audioBlob) => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    let finalTrans = voiceTranscript.trim();
    
    setIsLoading(true);
    
    if (apiKey) {
      try {
        const formData = new FormData();
        formData.append('file', audioBlob, 'recording.webm');
        formData.append('model', 'whisper-1');
        
        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
          body: formData
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.text) {
            finalTrans = data.text.trim();
          }
        }
      } catch (err) {
        console.warn("Whisper transcription failed, using fallback transcript:", err);
      }
    }
    
    if (finalTrans) {
      const textMetrics = analyzeTextMetrics(finalTrans);
      totalFillerCountRef.current += textMetrics.fillerCount;
      totalWordCountRef.current += textMetrics.wordCount;
      
      await submitVoiceAnswer(finalTrans);
    } else {
      toast.error("No speech detected. Please try again.");
      setIsLoading(false);
    }
  };

  const analyzeTextMetrics = (text) => {
    const fillers = ["um", "uh", "like", "you know", "so", "actually", "basically"];
    const words = text.toLowerCase().split(/\s+/).filter(Boolean);
    let fillerCount = 0;
    words.forEach(w => {
      const cleanWord = w.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
      if (fillers.includes(cleanWord)) {
        fillerCount++;
      }
    });
    return {
      wordCount: words.length,
      fillerCount
    };
  };

  const submitVoiceAnswer = async (answerText) => {
    setMessages((prev) => [...prev, { role: 'user', content: answerText }]);
    
    try {
      const answeredResponse = await interviewAPI.submitAnswer(activeSessionId, {
        answerText: answerText,
        timeSpentSeconds: 0,
      });

      const feedback = answeredResponse.data.answers?.[0]?.aiFeedback;
      if (feedback) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: feedback,
            isFeedback: true,
          },
        ]);
      }

      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);

      if (nextIndex >= totalQuestions) {
        const totalDurationMins = totalSpeechDurationRef.current / 60;
        const speakingPace = totalDurationMins > 0 ? (totalWordCountRef.current / totalDurationMins) : 130;
        const avgLatency = speechTurnsRef.current > 0 ? (totalResponseLatencyRef.current / speechTurnsRef.current) : 2.5;
        const totalSessionDuration = (Date.now() - startTimeRef.current) / 1000;
        const eyeScore = Math.max(0, 100 - (timeLookingAwayRef.current / (totalSessionDuration || 1)) * 100);

        const telemetry = {
          eyeContactScore: parseFloat(eyeScore.toFixed(1)),
          eyeContactWarnings: warningsCountRef.current,
          timeLookingAwaySeconds: timeLookingAwayRef.current,
          speakingPaceWpm: parseFloat(speakingPace.toFixed(1)),
          totalSpeechDurationSeconds: parseFloat(totalSpeechDurationRef.current.toFixed(1)),
          averageResponseLatencySeconds: parseFloat(avgLatency.toFixed(1)),
          fillerWordCount: totalFillerCountRef.current
        };

        await finishInterview('completed', telemetry);
        return;
      }

      const nextQuestionResponse = await interviewAPI.getNextQuestion(activeSessionId);
      setCurrentQuestion(nextQuestionResponse.data);
      appendQuestion(nextQuestionResponse.data, nextIndex + 1);
      
      setTimeout(() => speakText(nextQuestionResponse.data.questionText), 800);
    } catch (error) {
      toast.error('Failed to submit answer');
    } finally {
      setIsLoading(false);
      setVoiceTranscript('');
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!activeSessionId) {
      toast.error('No active interview session found');
      navigate('/interview-setup');
      return;
    }

    let isMounted = true;

    const hydrateSession = async () => {
      setIsLoading(true);
      try {
        const nextSession = sessionData || (await interviewAPI.getSessionDetails(activeSessionId)).data;
        if (!isMounted) return;

        const pendingQuestion = nextSession.questions?.find((question) => !question.answers?.length)
          || nextSession.questions?.[nextSession.questions.length - 1];

        setSession(nextSession);
        setCurrentQuestion(pendingQuestion);
        setCurrentIndex(nextSession.answeredQuestions || 0);
        setRemainingSeconds((nextSession.timeLimit || queryTimeLimit) * 60);
        setMessages([
          {
            role: 'assistant',
            content: `Welcome to your ${role} interview. I will ask adaptive questions based on your answers.`,
          },
        ]);
        appendQuestion(pendingQuestion, (nextSession.answeredQuestions || 0) + 1);
        if (nextSession.mode === 'VOICE') {
          setTimeout(() => speakText(pendingQuestion.questionText), 1500);
        }
      } catch (error) {
        toast.error('Failed to load interview session');
        navigate('/interview-setup');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    hydrateSession();

    return () => {
      isMounted = false;
    };
  }, [activeSessionId, appendQuestion, navigate, queryTimeLimit, role, sessionData]);

  useEffect(() => {
    if (isComplete) return undefined;

    const timer = window.setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          
          const totalSessionDuration = (Date.now() - startTimeRef.current) / 1000;
          const eyeScore = Math.max(0, 100 - (timeLookingAwayRef.current / (totalSessionDuration || 1)) * 100);
          const totalDurationMins = totalSpeechDurationRef.current / 60;
          const speakingPace = totalDurationMins > 0 ? (totalWordCountRef.current / totalDurationMins) : 130;
          const avgLatency = speechTurnsRef.current > 0 ? (totalResponseLatencyRef.current / speechTurnsRef.current) : 2.5;

          const telemetry = {
            eyeContactScore: parseFloat(eyeScore.toFixed(1)),
            eyeContactWarnings: warningsCountRef.current,
            timeLookingAwaySeconds: timeLookingAwayRef.current,
            speakingPaceWpm: parseFloat(speakingPace.toFixed(1)),
            totalSpeechDurationSeconds: parseFloat(totalSpeechDurationRef.current.toFixed(1)),
            averageResponseLatencySeconds: parseFloat(avgLatency.toFixed(1)),
            fillerWordCount: totalFillerCountRef.current
          };
          
          finishInterview('expired', telemetry);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [finishInterview, isComplete]);

  useEffect(() => {
    if (mode !== 'VOICE') return;

    let localStream = null;
    let faceMesh = null;
    let isActive = true;

    const startWebcamAndEyeTracking = async () => {
      try {
        localStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, facingMode: 'user' },
          audio: false
        });
        if (webcamVideoRef.current && isActive) {
          webcamVideoRef.current.srcObject = localStream;
        }

        // Dynamically load MediaPipe Face Mesh scripts
        await loadMediaPipeScripts();
        if (!isActive) return;

        faceMesh = new window.FaceMesh({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
        });

        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        faceMesh.onResults((results) => {
          if (!isActive) return;
          
          let hasFace = false;
          let isLookingAway = false;

          if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            hasFace = true;
            const landmarks = results.multiFaceLandmarks[0];
            const leftCheek = landmarks[234];
            const rightCheek = landmarks[454];
            const noseTip = landmarks[4];

            if (leftCheek && rightCheek && noseTip) {
              const distLeft = Math.abs(noseTip.x - leftCheek.x);
              const distRight = Math.abs(rightCheek.x - noseTip.x);
              const ratio = distLeft / (distRight || 0.001);
              if (ratio < 0.65 || ratio > 1.55) {
                isLookingAway = true;
              }
            }
          }

          if (!hasFace || isLookingAway) {
            lookingAwayTimerRef.current += 1;
            timeLookingAwayRef.current += 1;
            if (lookingAwayTimerRef.current === 5) {
              warningsCountRef.current += 1;
              toast.error("Please maintain eye contact.", { id: 'eye-contact-warn' });
            }
          } else {
            lookingAwayTimerRef.current = 0;
          }
        });

        const checkFrame = async () => {
          if (!isActive) return;
          if (webcamVideoRef.current && localStream && webcamVideoRef.current.readyState === 4) {
            try {
              await faceMesh.send({ image: webcamVideoRef.current });
            } catch (e) {
              // Ignore face mesh transient errors
            }
          }
          if (isActive) {
            requestAnimationFrame(checkFrame);
          }
        };

        requestAnimationFrame(checkFrame);

      } catch (err) {
        console.warn("Camera or MediaPipe Face Mesh initialization failed:", err);
      }
    };

    startWebcamAndEyeTracking();

    return () => {
      isActive = false;
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (faceMesh) {
        faceMesh.close();
      }
    };
  }, [mode]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || isComplete || !activeSessionId || !currentQuestion) return;

    const userAnswer = input.trim();
    setMessages((prev) => [...prev, { role: 'user', content: userAnswer }]);
    setInput('');
    setIsLoading(true);

    try {
      const answeredResponse = await interviewAPI.submitAnswer(activeSessionId, {
        answerText: userAnswer,
        timeSpentSeconds: 0,
      });

      const feedback = answeredResponse.data.answers?.[0]?.aiFeedback;
      if (feedback) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: feedback,
            isFeedback: true,
          },
        ]);
      }

      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);

      if (nextIndex >= totalQuestions) {
        await finishInterview('completed');
        return;
      }

      const nextQuestionResponse = await interviewAPI.getNextQuestion(activeSessionId);
      setCurrentQuestion(nextQuestionResponse.data);
      appendQuestion(nextQuestionResponse.data, nextIndex + 1);
    } catch (error) {
      toast.error('Failed to submit answer');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMcqSend = async () => {
    if (selectedOption === null || isLoading || isComplete || !activeSessionId || !currentQuestion) return;

    const optionText = currentQuestion.options?.[selectedOption] || `Option ${String.fromCharCode(65 + selectedOption)}`;
    const userAnswerDisplay = `Option ${String.fromCharCode(65 + selectedOption)}: ${optionText}`;
    setMessages((prev) => [...prev, { role: 'user', content: userAnswerDisplay }]);
    setIsLoading(true);

    try {
      const answeredResponse = await interviewAPI.submitAnswer(activeSessionId, {
        selectedOptionIndex: selectedOption,
        answerText: optionText,
        timeSpentSeconds: 0,
      });

      const feedback = answeredResponse.data.answers?.[0]?.aiFeedback;
      if (feedback) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: feedback,
            isFeedback: true,
          },
        ]);
      }

      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setSelectedOption(null);

      if (nextIndex >= totalQuestions) {
        await finishInterview('completed');
        return;
      }

      const nextQuestionResponse = await interviewAPI.getNextQuestion(activeSessionId);
      setCurrentQuestion(nextQuestionResponse.data);
      appendQuestion(nextQuestionResponse.data, nextIndex + 1);
    } catch (error) {
      toast.error('Failed to submit answer');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodingRun = async ({ question }) => {
    const publicTests = question?.publicTests || [];
    if (!publicTests.length) {
      return {
        message: 'No public tests were provided for this problem yet. Judge0 execution will use generated tests in the next module.',
      };
    }

    return {
      output: publicTests.map((test, index) => (
        `Public Test ${index + 1}\nInput:\n${test.stdin || ''}\nExpected Output:\n${test.expectedOutput || ''}`
      )).join('\n\n'),
    };
  };

  const handleCodingSubmit = async ({ code, language }) => {
    if (isLoading || isComplete || !activeSessionId || !currentQuestion) return;

    setIsLoading(true);

    try {
      const answeredResponse = await interviewAPI.submitAnswer(activeSessionId, {
        answerText: code,
        codeContent: code,
        codeLanguage: language,
        timeSpentSeconds: 0,
      });

      const feedback = answeredResponse.data.answers?.[0]?.aiFeedback;
      if (feedback) {
        toast.success('Code submitted');
      }

      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);

      if (nextIndex >= totalQuestions) {
        await finishInterview('completed');
        return;
      }

      const nextQuestionResponse = await interviewAPI.getNextQuestion(activeSessionId);
      setCurrentQuestion(nextQuestionResponse.data);
    } catch (error) {
      toast.error('Failed to submit code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKey = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleManualFinish = async () => {
    const totalSessionDuration = (Date.now() - startTimeRef.current) / 1000;
    const eyeScore = Math.max(0, 100 - (timeLookingAwayRef.current / (totalSessionDuration || 1)) * 100);
    const totalDurationMins = totalSpeechDurationRef.current / 60;
    const speakingPace = totalDurationMins > 0 ? (totalWordCountRef.current / totalDurationMins) : 130;
    const avgLatency = speechTurnsRef.current > 0 ? (totalResponseLatencyRef.current / speechTurnsRef.current) : 2.5;

    const telemetry = {
      eyeContactScore: parseFloat(eyeScore.toFixed(1)),
      eyeContactWarnings: warningsCountRef.current,
      timeLookingAwaySeconds: timeLookingAwayRef.current,
      speakingPaceWpm: parseFloat(speakingPace.toFixed(1)),
      totalSpeechDurationSeconds: parseFloat(totalSpeechDurationRef.current.toFixed(1)),
      averageResponseLatencySeconds: parseFloat(avgLatency.toFixed(1)),
      fillerWordCount: totalFillerCountRef.current
    };

    await finishInterview('completed', telemetry);
  };

  const handleStartOver = () => {
    resetInterview();
    navigate('/interview-setup');
  };

  const progress = totalQuestions > 0
    ? Math.min(100, (currentIndex / totalQuestions) * 100)
    : 0;

  return (
    <div className={`${mode === 'CODING' ? 'max-w-7xl' : 'max-w-4xl'} mx-auto px-4 py-8`}>
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold">{mode} Interview</h2>
            <p className="text-sm text-gray-500">
              {isComplete ? 'Complete' : `Question ${Math.min(currentIndex + 1, totalQuestions)}/${totalQuestions}`}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-xs text-gray-500">Timer</div>
              <div className="text-sm font-semibold text-denim">{timerLabel}</div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">WAVE</span>
              <div className={`w-2 h-2 rounded-full ${isComplete ? 'bg-green-400' : 'bg-green-400 animate-pulse'}`} />
            </div>
          </div>
        </div>

        <div className="w-full h-2 bg-soft-sky/20 rounded-full mt-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-denim to-mauve rounded-full transition-all duration-500"
            style={{ width: `${isComplete ? 100 : progress}%` }}
          />
        </div>
      </div>

      {/* Webcam Preview for Voice Mode */}
      {mode === 'VOICE' && (
        <div className="mb-4 flex justify-center">
          <div className="relative w-48 h-36 bg-gray-100 rounded-xl overflow-hidden border-2 border-denim/30 shadow-card">
            <video
              ref={webcamVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            {lookingAwayTimerRef.current >= 5 && (
              <div className="absolute inset-0 bg-red-500/35 flex items-center justify-center text-center p-2">
                <span className="bg-red-600 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded shadow-lg animate-pulse">
                  Please maintain eye contact
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {mode === 'CODING' ? (
        <CodingInterface
          question={currentQuestion}
          disabled={isLoading}
          isComplete={isComplete}
          onRun={handleCodingRun}
          onSubmit={handleCodingSubmit}
          onManualFinish={handleManualFinish}
        />
      ) : (
        <>
          <div className="card p-6 min-h-[400px] max-h-[500px] overflow-y-auto mb-4">
            {messages.map((msg, index) => (
              <div key={`${msg.role}-${index}`} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
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

          <div className="card p-4">
            {isComplete ? (
          <div className="flex justify-center gap-3">
            <button onClick={() => navigate(`/results/${activeSessionId}`)} className="btn-primary px-6 py-3">
              View Results
            </button>
            <button onClick={handleStartOver} className="btn-outline px-6 py-3">
              Start Over
            </button>
          </div>
            ) : mode === 'MCQ' ? (
          <div>
            <div className="text-xs font-medium text-gray-500 mb-2">Select your answer:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
              {(currentQuestion?.options || ['Option A', 'Option B', 'Option C', 'Option D']).map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedOption(idx)}
                  disabled={isLoading}
                  className={`flex items-center space-x-3 p-3 rounded-xl border-2 text-left text-sm transition-all duration-200 ${
                    selectedOption === idx
                      ? 'border-denim bg-denim/10 font-semibold text-denim'
                      : 'border-gray-200 hover:border-soft-sky bg-white text-gray-700'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    selectedOption === idx ? 'bg-denim text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="flex-1">{opt}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <button
                onClick={handleManualFinish}
                disabled={isLoading}
                className="text-xs text-denim font-medium disabled:opacity-50"
              >
                Finish Interview
              </button>
              <button
                onClick={handleMcqSend}
                disabled={isLoading || selectedOption === null}
                className="btn-primary px-6 py-2 text-sm disabled:opacity-50"
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Submit Answer'}
              </button>
            </div>
          </div>
            ) : mode === 'VOICE' ? (
          <div>
            <div className="flex flex-col items-center justify-center p-4">
              <button
                onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                disabled={isLoading || voicePlaybackActive}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isRecording
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                    : voicePlaybackActive
                      ? 'bg-gray-300 cursor-not-allowed text-gray-400'
                      : 'bg-denim hover:bg-denim/80 hover:shadow-lg'
                } text-white`}
              >
                {isRecording ? <MicOff size={24} /> : <Mic size={24} />}
              </button>
              <div className="mt-3 text-center">
                {isRecording ? (
                  <p className="text-sm text-red-500 font-medium animate-pulse">Listening... Click stop when done</p>
                ) : voicePlaybackActive ? (
                  <p className="text-sm text-gray-500 font-medium">Assistant is speaking... Please wait</p>
                ) : (
                  <p className="text-sm text-gray-500 font-medium">Click the microphone to speak your answer</p>
                )}
                {voiceTranscript && (
                  <div className="mt-3 p-3 bg-soft-sky/10 border border-soft-sky/20 rounded-xl max-w-lg text-left text-xs text-gray-600">
                    <span className="font-semibold text-[10px] text-gray-500 block mb-1">Live Transcript:</span>
                    {voiceTranscript}
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-3 mt-2">
              <button
                onClick={handleManualFinish}
                disabled={isLoading}
                className="text-xs text-denim font-medium disabled:opacity-50"
              >
                Finish Interview
              </button>
              <span className="text-[10px] text-gray-400">Voice Mode Enabled</span>
            </div>
          </div>
            ) : (
          <div>
            <div className="flex items-end space-x-2">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKey}
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
              <button
                onClick={handleManualFinish}
                disabled={isLoading}
                className="text-denim font-medium disabled:opacity-50"
              >
                Finish Interview
              </button>
            </div>
          </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default InterviewPage;

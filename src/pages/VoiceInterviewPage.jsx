import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  MicOff, 
  Send, 
  Loader2, 
  Volume2, 
  VolumeX,
  Camera,
  CameraOff,
  CheckCircle,
  AlertCircle,
  Play,
  Square
} from 'lucide-react';
import { useInterview } from '../hooks/useInterview';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const VoiceInterviewPage = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { startInterview, submitAnswer, sessionId } = useInterview();
  
  // State
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  
  // Refs
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const speechSynthesisRef = useRef(null);

  // Start Interview
  useEffect(() => {
    if (!interviewStarted) {
      startInterview({
        mode: 'VOICE',
        role: 'JAVA',
        difficulty: 'INTERMEDIATE',
        numberOfQuestions: 5
      });
      setInterviewStarted(true);
    }
  }, []);

  // Add greeting message
  useEffect(() => {
    if (sessionId && messages.length === 0) {
      const greeting = `Hello ${user?.firstName || 'there'}! 👋 I'm WAVE. This is a Voice Interview. I'll speak the questions, and you can respond by speaking. Click the microphone to record your answer. Let's begin! 🎙️`;
      setMessages([{ role: 'assistant', content: greeting }]);
      // Speak the greeting
      speakText(greeting);
    }
  }, [sessionId]);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          }
        }
        if (finalTranscript) {
          setTranscript(prev => prev + ' ' + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          toast.error('Microphone access denied. Please allow microphone permissions.');
        }
        stopRecording();
      };
    } else {
      toast.error('Speech recognition is not supported in this browser. Please use Chrome.');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Speak Text using Speech Synthesis
  const speakText = (text) => {
    if (!window.speechSynthesis) {
      toast.error('Text-to-speech is not supported in this browser.');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    // Try to find a good voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) || 
                          voices.find(v => v.lang.startsWith('en')) || 
                          null;
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Camera Controls
  const toggleCamera = async () => {
    try {
      if (cameraOn) {
        const stream = videoRef.current?.srcObject;
        stream?.getTracks().forEach(track => track.stop());
        setCameraOn(false);
      } else {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user', width: 320, height: 240 },
          audio: false 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraOn(true);
        }
      }
    } catch (error) {
      toast.error('Camera access denied. Please allow camera permissions.');
    }
  };

  // Recording Controls
  const startRecording = () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition is not available. Please use Chrome.');
      return;
    }

    setTranscript('');
    audioChunksRef.current = [];
    setIsRecording(true);
    setRecordingTime(0);

    // Start timer
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);

    // Start speech recognition
    try {
      recognitionRef.current.start();
      toast.success('Recording started... Speak your answer');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording. Please try again.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    clearInterval(timerRef.current);
    
    // Stop speech recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    }

    // If there's transcript, submit the answer
    if (transcript.trim()) {
      handleSubmitAnswer(transcript.trim());
    } else {
      toast.warning('No speech detected. Please try again.');
    }
  };

  // Submit Answer
  const handleSubmitAnswer = async (answerText) => {
    if (!answerText.trim()) return;

    const userMessage = { 
      role: 'user', 
      content: answerText,
      isVoice: true,
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await submitAnswer(answerText);
      if (response?.data?.questionText) {
        const assistantMessage = { 
          role: 'assistant', 
          content: response.data.questionText,
          isVoice: true
        };
        setMessages(prev => [...prev, assistantMessage]);
        // Speak the next question
        setTimeout(() => speakText(response.data.questionText), 500);
      }
    } catch (error) {
      toast.error('Failed to submit answer');
    } finally {
      setIsLoading(false);
      setTranscript('');
    }
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-flamingo/20 flex items-center justify-center text-flamingo">
              <Mic size={20} />
            </div>
            <div>
              <h2 className="font-semibold">Voice Interview</h2>
              <p className="text-sm text-gray-500">Session: {sessionId?.slice(0, 8) || 'Starting...'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {/* Camera Toggle */}
            <button
              onClick={toggleCamera}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                cameraOn ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {cameraOn ? <Camera size={14} /> : <CameraOff size={14} />}
              <span>{cameraOn ? 'On' : 'Off'}</span>
            </button>
            <span className="text-sm text-gray-500">WAVE</span>
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Camera Preview */}
      {cameraOn && (
        <div className="mb-4 flex justify-center">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full max-w-xs rounded-xl object-cover border-2 border-flamingo/30 shadow-card"
          />
        </div>
      )}

      {/* Recording Status */}
      {isRecording && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center space-x-4 p-4 bg-flamingo/10 rounded-xl mb-4 border-2 border-flamingo/30"
        >
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <span className="font-medium text-red-500">Recording</span>
          </div>
          <span className="text-sm text-gray-500">{formatTime(recordingTime)}</span>
          <button
            onClick={stopRecording}
            className="btn-secondary text-sm px-4 py-1.5"
          >
            <Square size={14} className="mr-1" />
            Stop
          </button>
        </motion.div>
      )}

      {/* Chat Messages */}
      <div className="card p-6 min-h-[400px] max-h-[500px] overflow-y-auto mb-4">
        <AnimatePresence>
          {messages.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex flex-col items-center justify-center text-gray-400"
            >
              <div className="w-16 h-16 rounded-full bg-flamingo/20 flex items-center justify-center mb-4">
                <Mic size={32} className="text-flamingo" />
              </div>
              <p className="text-lg">Starting your voice interview with WAVE...</p>
            </motion.div>
          ) : (
            messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
              >
                <div className={`max-w-[80%] rounded-xl px-4 py-3 ${
                  msg.role === 'user' 
                    ? 'bg-flamingo text-white' 
                    : 'bg-soft-sky/20 text-gray-700'
                }`}>
                  {msg.role === 'assistant' && (
                    <div className="flex items-center space-x-2 text-xs text-gray-500 mb-1">
                      <span className="font-medium">WAVE</span>
                      {!isSpeaking && (
                        <button 
                          onClick={() => speakText(msg.content)}
                          className="text-denim hover:text-denim/70 transition-colors"
                        >
                          <Volume2 size={12} />
                        </button>
                      )}
                      {isSpeaking && <VolumeX size={12} className="text-gray-400" />}
                    </div>
                  )}
                  {msg.role === 'user' && (
                    <div className="flex items-center space-x-2 text-xs text-flamingo/70 mb-1">
                      <Mic size={12} />
                      <span>You said</span>
                      <span className="text-[10px] opacity-50">{msg.timestamp}</span>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-soft-sky/20 rounded-xl px-4 py-3">
              <Loader2 size={20} className="animate-spin text-denim" />
            </div>
          </div>
        )}
      </div>

      {/* Transcript Display - Shows what user said */}
      {transcript && !isRecording && (
        <div className="card p-4 mb-4 bg-soft-sky/10 border-soft-sky/30">
          <p className="text-sm font-medium text-gray-500 mb-1">Your Answer:</p>
          <p className="text-gray-700">{transcript}</p>
        </div>
      )}

      {/* Recording Button */}
      <div className="card p-6">
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {/* Record Button */}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isLoading}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
              isRecording 
                ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                : 'bg-flamingo hover:bg-flamingo/80 hover:shadow-lg hover:shadow-flamingo/30'
            } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isRecording ? <Square size={24} /> : <Mic size={24} />}
          </button>

          {/* Status Text */}
          <div className="text-center">
            {isRecording ? (
              <p className="text-sm text-red-500 font-medium">Recording... Click stop when done</p>
            ) : (
              <p className="text-sm text-gray-500">
                {transcript ? 'Click record to speak again' : 'Click the microphone to speak your answer'}
              </p>
            )}
          </div>
        </div>

        {/* Controls Info */}
        <div className="mt-4 text-xs text-gray-400 flex justify-between border-t border-lavender/10 pt-4">
          <span>🎙️ Click record, speak clearly, then stop</span>
          <span className="text-flamingo">Voice Interview Mode</span>
        </div>
      </div>
    </div>
  );
};

export default VoiceInterviewPage;
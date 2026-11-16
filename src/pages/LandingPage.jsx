import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Brain, Zap, Shield, ChevronRight, Mic, Code, BarChart3 } from 'lucide-react';

const LandingPage = () => {
  const features = [
    { icon: Brain, title: 'AI-Powered Interviews', description: 'WAVE conducts intelligent interviews that adapt to your responses in real-time.' },
    { icon: Sparkles, title: 'Multi-Mode Support', description: 'Chat, MCQ, Coding, and Voice modes to simulate real interview scenarios.' },
    { icon: Zap, title: 'Instant Feedback', description: 'Get detailed feedback on your answers, communication, and technical accuracy.' },
    { icon: BarChart3, title: 'Performance Analytics', description: 'Track your progress, identify weak areas, and improve over time.' },
    { icon: Shield, title: 'Safe Space Practice', description: 'Practice without judgment in a private, supportive environment.' },
    { icon: Mic, title: 'Voice Interview Ready', description: 'Practice speaking answers naturally with voice-enabled interviews.' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-lavender/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-lavender/20 text-denim text-sm font-medium mb-6">
              <Sparkles size={16} />
              <span>AI-Powered Interview Preparation</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              Your Personal AI Interview Coach
              <br />
              <span className="gradient-text">WAVE</span>
            </h1>
            <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
              Practice interviews with an intelligent AI that adapts to your responses, 
              provides detailed feedback, and helps you land your dream job.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/register" className="btn-primary inline-flex items-center justify-center text-lg px-8 py-4">
                Start Free Practice
                <ChevronRight size={20} className="ml-2" />
              </Link>
              <Link to="/login" className="btn-outline inline-flex items-center justify-center text-lg px-8 py-4">
                Sign In
              </Link>
            </div>
          </motion.div>

          {/* WAVE Avatar */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-16 flex justify-center"
          >
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-denim via-soft-sky to-mauve flex items-center justify-center shadow-xl overflow-hidden p-2">
    <img
      src="/wave round logo.png"   
            alt="WAVE Logo"
      className="w-full h-full object-contain"
    />
  </div>

              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-mauve flex items-center justify-center shadow-lg">
                <Sparkles size={16} className="text-white" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">Why Practice with WAVE?</h2>
            <p className="mt-4 text-gray-600">Everything you need to ace your next interview</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card p-8 hover:shadow-hover transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-soft-sky/30 flex items-center justify-center text-denim mb-4">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="card p-12 bg-gradient-to-br from-lavender/5 via-soft-sky/5 to-transparent">
            <h2 className="text-3xl font-bold mb-4">Ready to Ace Your Interview?</h2>
            <p className="text-gray-600 mb-8">Join thousands of professionals who trust WAVE for their interview preparation</p>
            <Link to="/register" className="btn-primary inline-flex items-center justify-center text-lg px-10 py-4">
              Get Started Free
              <ChevronRight size={20} className="ml-2" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
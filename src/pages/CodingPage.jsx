import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Code, Play, Loader2, CheckCircle, XCircle } from 'lucide-react';

const CodingPage = () => {
  const [code, setCode] = useState('// Write your code here');
  const [language, setLanguage] = useState('java');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);

  const languages = [
    { value: 'java', label: 'Java' },
    { value: 'python', label: 'Python' }
  ];

  const runCode = async () => {
    setLoading(true);
    setOutput('');
    setIsCorrect(null);
    
    try {
      const response = await fetch('/api/coding/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language })
      });
      const data = await response.json();
      setOutput(data.output || data.error || 'No output');
      setIsCorrect(data.status === 'Accepted');
    } catch (error) {
      setOutput('Error: ' + error.message);
      setIsCorrect(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-soft-sky/20 flex items-center justify-center text-soft-sky">
            <Code size={20} />
          </div>
          <div>
            <h2 className="font-semibold">Coding Interview</h2>
            <p className="text-sm text-gray-500">Write and test your code</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="input-field py-2 px-4 w-32"
          >
            {languages.map(l => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
          <button
            onClick={runCode}
            disabled={loading}
            className="btn-primary inline-flex items-center"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />}
            <span className="ml-2">{loading ? 'Running...' : 'Run'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Code Editor */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Code Editor</span>
            <span className="text-xs text-gray-400">{language.toUpperCase()}</span>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-[400px] p-4 bg-gray-900 text-gray-100 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-denim resize-none"
            spellCheck="false"
          />
        </div>

        {/* Output */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Output</span>
            {isCorrect !== null && (
              <span className={`text-sm font-medium ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                {isCorrect ? <CheckCircle size={16} className="inline mr-1" /> : <XCircle size={16} className="inline mr-1" />}
                {isCorrect ? 'Accepted' : 'Failed'}
              </span>
            )}
          </div>
          <div className="w-full h-[400px] p-4 bg-gray-50 rounded-xl font-mono text-sm overflow-auto whitespace-pre-wrap">
            {output || 'Run your code to see output...'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodingPage;
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle, Clipboard, Copy, Loader2, Play, RotateCcw, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const LANGUAGES = [
  { value: 'java', label: 'Java' },
  { value: 'python', label: 'Python' },
  { value: 'cpp', label: 'C++' },
  { value: 'javascript', label: 'JavaScript' },
];

const DEFAULT_STARTERS = {
  java: 'import java.util.*;\n\nclass Solution {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}',
  python: 'def solve():\n    # Write your code here\n    pass\n\nif __name__ == "__main__":\n    solve()',
  cpp: '#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}',
  javascript: 'function solve() {\n  // Write your code here\n}\n\nsolve();',
};

const KEYWORDS = {
  java: /\b(public|private|protected|class|static|void|int|long|double|float|boolean|char|String|new|return|if|else|for|while|do|switch|case|break|continue|try|catch|finally|import|package|extends|implements|null|true|false)\b/g,
  python: /\b(def|class|return|if|elif|else|for|while|in|import|from|as|try|except|finally|with|lambda|None|True|False|pass|break|continue|and|or|not)\b/g,
  cpp: /\b(include|using|namespace|std|int|long|double|float|bool|char|string|vector|map|unordered_map|set|return|if|else|for|while|do|switch|case|break|continue|class|public|private|protected|void|auto|true|false|nullptr)\b/g,
  javascript: /\b(function|const|let|var|return|if|else|for|while|do|switch|case|break|continue|class|new|try|catch|finally|import|export|from|null|undefined|true|false|async|await)\b/g,
};

const getStarterCode = (question, language) => {
  if (question?.language === language && question?.starterCode) {
    return question.starterCode;
  }
  return DEFAULT_STARTERS[language] || DEFAULT_STARTERS.java;
};

const splitTokens = (line, language) => {
  const pattern = /("(?:\\.|[^"])*"|'(?:\\.|[^'])*'|`(?:\\.|[^`])*`|\/\/.*|#.*|\/\*.*?\*\/|\b\d+(?:\.\d+)?\b|\b[A-Za-z_][A-Za-z0-9_]*\b)/g;
  const keywordPattern = KEYWORDS[language] || KEYWORDS.javascript;
  const tokens = [];
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(line)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ text: line.slice(lastIndex, match.index), type: 'plain' });
    }

    const text = match[0];
    keywordPattern.lastIndex = 0;
    let type = 'plain';
    if (/^(\/\/|#|\/\*)/.test(text)) type = 'comment';
    else if (/^["'`]/.test(text)) type = 'string';
    else if (/^\d/.test(text)) type = 'number';
    else if (keywordPattern.test(text)) type = 'keyword';

    tokens.push({ text, type });
    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < line.length) {
    tokens.push({ text: line.slice(lastIndex), type: 'plain' });
  }

  return tokens.length ? tokens : [{ text: ' ', type: 'plain' }];
};

const tokenClass = {
  plain: 'text-slate-100',
  keyword: 'text-sky-300',
  string: 'text-emerald-300',
  number: 'text-amber-300',
  comment: 'text-slate-500',
};

const CodingInterface = ({
  question,
  disabled = false,
  isComplete = false,
  onRun,
  onSubmit,
  onManualFinish,
}) => {
  const initialLanguage = question?.language && LANGUAGES.some((lang) => lang.value === question.language)
    ? question.language
    : 'java';
  const [language, setLanguage] = useState(initialLanguage);
  const [code, setCode] = useState(getStarterCode(question, initialLanguage));
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef(null);
  const highlightRef = useRef(null);
  const linesRef = useRef(null);

  useEffect(() => {
    const nextLanguage = question?.language && LANGUAGES.some((lang) => lang.value === question.language)
      ? question.language
      : 'java';
    setLanguage(nextLanguage);
    setCode(getStarterCode(question, nextLanguage));
    setOutput('');
  }, [question?.id]);

  const lineNumbers = useMemo(() => code.split('\n').map((_, index) => index + 1), [code]);
  const examples = question?.examples || [];
  const constraints = question?.constraints || [];
  const tags = question?.tags || [];

  const handleLanguageChange = (event) => {
    const nextLanguage = event.target.value;
    setLanguage(nextLanguage);
    setCode(getStarterCode(question, nextLanguage));
    setOutput('');
  };

  const syncScroll = (event) => {
    if (highlightRef.current) {
      highlightRef.current.scrollTop = event.currentTarget.scrollTop;
      highlightRef.current.scrollLeft = event.currentTarget.scrollLeft;
    }
    if (linesRef.current) {
      linesRef.current.scrollTop = event.currentTarget.scrollTop;
    }
  };

  const replaceSelection = (replacement, cursorOffset = replacement.length) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const nextCode = `${code.slice(0, start)}${replacement}${code.slice(end)}`;
    setCode(nextCode);
    window.requestAnimationFrame(() => {
      textarea.focus();
      textarea.selectionStart = start + cursorOffset;
      textarea.selectionEnd = start + cursorOffset;
    });
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      replaceSelection('    ');
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      const textarea = textareaRef.current;
      const cursor = textarea.selectionStart;
      const lineStart = code.lastIndexOf('\n', cursor - 1) + 1;
      const currentLine = code.slice(lineStart, cursor);
      const indentation = currentLine.match(/^\s*/)?.[0] || '';
      const extraIndent = /[{(:]\s*$/.test(currentLine.trim()) ? '    ' : '';
      replaceSelection(`\n${indentation}${extraIndent}`);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    toast.success('Code copied');
  };

  const handlePaste = async () => {
    const pasted = await navigator.clipboard.readText();
    replaceSelection(pasted);
    toast.success('Code pasted');
  };

  const handleReset = () => {
    setCode(getStarterCode(question, language));
    setOutput('');
    textareaRef.current?.focus();
  };

  const handleRun = async () => {
    if (!onRun) return;
    setIsRunning(true);
    setOutput('');
    try {
      const result = await onRun({ code, language, question });
      setOutput(result?.output || result?.message || 'Run completed.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!onSubmit) return;
    setIsSubmitting(true);
    try {
      await onSubmit({ code, language, question });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="card p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h3 className="font-semibold text-gray-700">{question?.title || 'Coding Problem'}</h3>
              <p className="text-xs text-gray-500 mt-1">
                {tags.length ? tags.join(' / ') : question?.category || 'Problem solving'}
              </p>
            </div>
            <span className="text-xs px-2 py-1 rounded-xl bg-soft-sky/20 text-denim font-medium">
              {question?.difficulty ? `Level ${question.difficulty}` : 'Coding'}
            </span>
          </div>

          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-normal">
            {question?.description || question?.questionText}
          </p>

          {examples.length > 0 && (
            <div className="mt-4">
              <div className="text-xs font-semibold text-gray-500 mb-2">Examples</div>
              <div className="space-y-2">
                {examples.map((example, index) => (
                  <div key={index} className="rounded-xl bg-soft-sky/10 p-3 text-xs text-gray-700">
                    <div><span className="font-semibold">Input:</span> {example.input}</div>
                    <div><span className="font-semibold">Output:</span> {example.output}</div>
                    {example.explanation && (
                      <div className="mt-1 text-gray-500">{example.explanation}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {constraints.length > 0 && (
            <div className="mt-4">
              <div className="text-xs font-semibold text-gray-500 mb-2">Constraints</div>
              <ul className="space-y-1 text-xs text-gray-600">
                {constraints.map((constraint, index) => (
                  <li key={index}>- {constraint}</li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className="card p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <div className="text-sm font-semibold text-gray-700">Code Editor</div>
              <div className="text-xs text-gray-500">{language.toUpperCase()}</div>
            </div>
            <select
              value={language}
              onChange={handleLanguageChange}
              disabled={disabled || isComplete}
              className="input-field py-2 px-3 w-36 text-sm"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>{lang.label}</option>
              ))}
            </select>
          </div>

          <div className="relative h-[440px] overflow-hidden rounded-xl bg-slate-950 border border-slate-800 font-mono text-sm">
            <div
              ref={linesRef}
              className="absolute left-0 top-0 bottom-0 w-12 overflow-hidden border-r border-slate-800 bg-slate-900/80 py-4 text-right text-slate-500"
            >
              {lineNumbers.map((line) => (
                <div key={line} className="h-5 pr-3 leading-5">{line}</div>
              ))}
            </div>
            <pre
              ref={highlightRef}
              aria-hidden="true"
              className="absolute inset-y-0 left-12 right-0 overflow-hidden whitespace-pre p-4 leading-5"
            >
              {code.split('\n').map((line, lineIndex) => (
                <React.Fragment key={lineIndex}>
                  {splitTokens(line, language).map((token, tokenIndex) => (
                    <span key={`${lineIndex}-${tokenIndex}`} className={tokenClass[token.type]}>
                      {token.text}
                    </span>
                  ))}
                  {lineIndex < lineNumbers.length - 1 ? '\n' : ''}
                </React.Fragment>
              ))}
            </pre>
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(event) => setCode(event.target.value)}
              onScroll={syncScroll}
              onKeyDown={handleKeyDown}
              disabled={disabled || isComplete}
              spellCheck="false"
              autoComplete="off"
              autoCorrect="off"
              className="absolute inset-y-0 left-12 right-0 resize-none overflow-auto whitespace-pre bg-transparent p-4 font-mono text-sm leading-5 text-transparent outline-none caret-white selection:bg-denim/40"
              style={{ tabSize: 4 }}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
            <div className="flex items-center gap-2">
              <button title="Reset code" onClick={handleReset} disabled={disabled || isComplete} className="btn-outline px-3 py-2 text-sm disabled:opacity-50">
                <RotateCcw size={16} />
              </button>
              <button title="Copy code" onClick={handleCopy} disabled={!code} className="btn-outline px-3 py-2 text-sm disabled:opacity-50">
                <Copy size={16} />
              </button>
              <button title="Paste code" onClick={handlePaste} disabled={disabled || isComplete} className="btn-outline px-3 py-2 text-sm disabled:opacity-50">
                <Clipboard size={16} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleRun} disabled={disabled || isComplete || isRunning} className="btn-outline inline-flex items-center px-4 py-2 text-sm disabled:opacity-50">
                {isRunning ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                <span className="ml-2">Run</span>
              </button>
              <button onClick={handleSubmit} disabled={disabled || isComplete || isSubmitting || !code.trim()} className="btn-primary inline-flex items-center px-4 py-2 text-sm disabled:opacity-50">
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                <span className="ml-2">Submit</span>
              </button>
            </div>
          </div>
        </section>
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="text-sm font-semibold text-gray-700">Run Output</div>
          {output && (
            <span className="inline-flex items-center text-xs text-green-600 font-medium">
              <CheckCircle size={14} className="mr-1" />
              Ready
            </span>
          )}
        </div>
        <pre className="min-h-[96px] max-h-[180px] overflow-auto rounded-xl bg-gray-50 p-3 text-xs text-gray-700 whitespace-pre-wrap">
          {output || 'No output yet.'}
        </pre>
        <div className="flex justify-between border-t border-gray-100 pt-3 mt-3">
          <button onClick={onManualFinish} disabled={disabled || isComplete} className="text-xs text-denim font-medium disabled:opacity-50">
            Finish Interview
          </button>
          <span className="text-[10px] text-gray-400">Coding Mode Enabled</span>
        </div>
      </div>
    </div>
  );
};

export default CodingInterface;

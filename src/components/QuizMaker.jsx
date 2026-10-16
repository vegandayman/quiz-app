import React, { useState, useRef } from 'react';

// Clean inline SVGs (zero external dependencies)
const PlusIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const TrashIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const DownloadIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const UploadIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const CheckIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const shapes = [
  { symbol: '▲', label: 'Red Triangle', bg: 'bg-red-600', ring: 'ring-red-500' },
  { symbol: '◆', label: 'Blue Diamond', bg: 'bg-blue-600', ring: 'ring-blue-500' },
  { symbol: '●', label: 'Yellow Circle', bg: 'bg-amber-500', ring: 'ring-amber-500' },
  { symbol: '■', label: 'Green Square', bg: 'bg-emerald-600', ring: 'ring-emerald-500' }
];

/**
 * QuizMaker Component
 * 
 * - Full quiz builder for multiple choice questions
 * - Supports saving to the live quiz
 * - Exports quiz as JSON file (.json)
 * - Imports previously saved JSON files to resume editing or play
 */
export default function QuizMaker({ initialQuestions = [], onSaveQuiz, onClose }) {
  const [quizTitle, setQuizTitle] = useState('My Custom Quiz');
  const [questions, setQuestions] = useState(() => {
    if (initialQuestions && initialQuestions.length > 0) {
      return JSON.parse(JSON.stringify(initialQuestions));
    }
    return [
      {
        id: 1,
        question: 'What is the capital of France?',
        options: ['London', 'Paris', 'Berlin', 'Madrid'],
        correctIndex: 1,
        secretNote: 'Paris has been the capital of France since 987 CE.',
        timeLimit: 20
      }
    ];
  });

  const [activeIdx, setActiveIdx] = useState(0);
  const [notification, setNotification] = useState('');
  const fileInputRef = useRef(null);

  const activeQ = questions[activeIdx] || questions[0];

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  // Add new blank question
  const handleAddQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      question: 'New Question',
      options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
      correctIndex: 0,
      secretNote: '',
      timeLimit: 20
    };
    const updated = [...questions, newQuestion];
    setQuestions(updated);
    setActiveIdx(updated.length - 1);
  };

  // Delete question
  const handleDeleteQuestion = (indexToDelete) => {
    if (questions.length <= 1) {
      alert('A quiz must have at least one question.');
      return;
    }
    const updated = questions.filter((_, idx) => idx !== indexToDelete);
    setQuestions(updated);
    setActiveIdx(Math.max(0, indexToDelete - 1));
  };

  // Update current question field
  const handleUpdateActiveQuestion = (field, value) => {
    const updated = [...questions];
    updated[activeIdx] = {
      ...updated[activeIdx],
      [field]: value
    };
    setQuestions(updated);
  };

  // Update option text
  const handleOptionChange = (optionIdx, text) => {
    const updated = [...questions];
    const newOptions = [...updated[activeIdx].options];
    newOptions[optionIdx] = text;
    updated[activeIdx].options = newOptions;
    setQuestions(updated);
  };

  // Export Quiz as JSON
  const handleExportJSON = () => {
    const exportData = {
      title: quizTitle,
      version: '1.0',
      exportedAt: new Date().toISOString(),
      questions: questions
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    const filename = `${quizTitle.toLowerCase().replace(/[^a-z0-9]/gi, '_') || 'quiz'}.json`;

    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showNotification(`Exported as "${filename}"!`);
  };

  // Import Quiz from JSON
  const handleImportJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result);

        // Check if format is { questions: [...] } or array [...]
        let loadedQuestions = [];
        if (Array.isArray(parsed)) {
          loadedQuestions = parsed;
        } else if (parsed && Array.isArray(parsed.questions)) {
          loadedQuestions = parsed.questions;
          if (parsed.title) setQuizTitle(parsed.title);
        } else {
          alert('Invalid quiz JSON format: expected an array of questions or an object with a "questions" array.');
          return;
        }

        // Validate basic question structure
        const validated = loadedQuestions.map((q, idx) => ({
          id: q.id || idx + 1,
          question: q.question || `Question ${idx + 1}`,
          options: Array.isArray(q.options) && q.options.length >= 2 ? q.options.slice(0, 4) : ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
          correctIndex: typeof q.correctIndex === 'number' && q.correctIndex >= 0 && q.correctIndex < 4 ? q.correctIndex : 0,
          secretNote: q.secretNote || '',
          timeLimit: q.timeLimit || 20
        }));

        setQuestions(validated);
        setActiveIdx(0);
        showNotification(`Successfully loaded ${validated.length} questions from JSON!`);
      } catch (err) {
        console.error('Failed to parse quiz JSON:', err);
        alert('Could not parse JSON file. Please ensure it is valid JSON.');
      }
    };
    reader.readAsText(file);
    // Reset file input so user can import the same file again if edited
    e.target.value = '';
  };

  // Save to live game
  const handleSaveToGame = () => {
    if (onSaveQuiz) {
      onSaveQuiz(questions, quizTitle);
    }
    showNotification('Quiz applied to live room!');
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col font-sans text-white">
      {/* Top Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={quizTitle}
            onChange={(e) => setQuizTitle(e.target.value)}
            className="text-lg sm:text-xl font-black bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-3 py-1.5 outline-none text-white min-w-[200px]"
            placeholder="Quiz Title..."
          />
          <span className="text-xs text-slate-400 font-medium">
            ({questions.length} {questions.length === 1 ? 'question' : 'questions'})
          </span>
        </div>

        {/* Action Buttons: Import, Export, Apply, Close */}
        <div className="flex items-center gap-2">
          {/* Hidden File Input for Import */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportJSON}
            accept=".json,application/json"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold cursor-pointer transition-all"
            title="Import quiz from a JSON file"
          >
            <UploadIcon className="w-3.5 h-3.5 text-purple-400" />
            <span>Import JSON</span>
          </button>

          <button
            type="button"
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold cursor-pointer transition-all"
            title="Export quiz as a JSON file"
          >
            <DownloadIcon className="w-3.5 h-3.5 text-purple-400" />
            <span>Export JSON</span>
          </button>

          <button
            type="button"
            onClick={handleSaveToGame}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 cursor-pointer transition-all"
          >
            <CheckIcon className="w-3.5 h-3.5" />
            <span>Apply to Live Room</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer ml-1"
            >
              <XIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-950 border border-emerald-500 text-emerald-200 px-4 py-2 rounded-xl text-xs font-bold shadow-xl animate-in fade-in duration-200">
          {notification}
        </div>
      )}

      {/* Main Workspace: Left Questions List + Right Question Editor */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Questions Index List */}
        <aside className="w-56 sm:w-64 bg-slate-900/60 border-r border-slate-800 flex flex-col justify-between overflow-y-auto p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Questions</span>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 font-bold cursor-pointer"
              >
                <PlusIcon className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            <div className="space-y-1.5 pt-1">
              {questions.map((q, idx) => (
                <div
                  key={q.id || idx}
                  onClick={() => setActiveIdx(idx)}
                  className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs font-medium transition-all ${
                    activeIdx === idx
                      ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/20'
                      : 'bg-slate-950/60 border border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="truncate flex-1 pr-2">
                    {idx + 1}. {q.question || 'Untitled Question'}
                  </span>

                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteQuestion(idx);
                      }}
                      className="opacity-0 group-hover:opacity-100 hover:text-rose-400 p-1 cursor-pointer transition-opacity"
                      title="Delete Question"
                    >
                      <TrashIcon className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddQuestion}
            className="w-full py-2.5 rounded-xl border border-dashed border-slate-700 hover:border-purple-500 hover:bg-purple-950/20 text-purple-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer mt-4"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Add Question</span>
          </button>
        </aside>

        {/* Right Editor Area */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-10 max-w-4xl mx-auto w-full space-y-6">
          {/* Question Text & Time Limit Header */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-purple-400">
                Question #{activeIdx + 1}
              </span>

              {/* Time limit picker */}
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-400 font-semibold">Time limit:</label>
                <select
                  value={activeQ.timeLimit || 20}
                  onChange={(e) => handleUpdateActiveQuestion('timeLimit', Number(e.target.value))}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-bold text-white outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option value={10}>10 seconds</option>
                  <option value={20}>20 seconds</option>
                  <option value={30}>30 seconds</option>
                  <option value={60}>60 seconds</option>
                </select>
              </div>
            </div>

            <textarea
              rows={2}
              value={activeQ.question}
              onChange={(e) => handleUpdateActiveQuestion('question', e.target.value)}
              placeholder="Enter your question here (e.g. Which planet is closest to the Sun?)"
              className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white text-lg sm:text-xl font-bold outline-none resize-none transition-all"
            />
          </div>

          {/* 4 Multiple Choice Answer Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Answer Options (Select the checkmark for the correct answer)
              </label>
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <CheckIcon className="w-3.5 h-3.5" /> Correct: {shapes[activeQ.correctIndex]?.label}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeQ.options.map((optionText, optIdx) => {
                const shape = shapes[optIdx];
                const isCorrect = optIdx === activeQ.correctIndex;

                return (
                  <div
                    key={optIdx}
                    className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-3 relative ${
                      isCorrect
                        ? 'bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Shape Icon */}
                    <div className={`w-9 h-9 rounded-xl ${shape.bg} flex items-center justify-center font-black text-white shrink-0 text-lg shadow`}>
                      {shape.symbol}
                    </div>

                    {/* Option Text Input */}
                    <input
                      type="text"
                      value={optionText}
                      onChange={(e) => handleOptionChange(optIdx, e.target.value)}
                      placeholder={`Answer ${optIdx + 1}...`}
                      className="flex-1 bg-transparent border-none text-white font-semibold text-sm outline-none px-1"
                    />

                    {/* Correct Toggle Radio Button */}
                    <button
                      type="button"
                      onClick={() => handleUpdateActiveQuestion('correctIndex', optIdx)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                        isCorrect
                          ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                          : 'bg-slate-800 text-slate-500 hover:bg-slate-700 hover:text-white'
                      }`}
                      title={isCorrect ? 'Correct Answer' : 'Set as Correct Answer'}
                    >
                      <CheckIcon className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Secret Host Trivia Note & Explanation */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-purple-700/60 text-purple-200 text-[10px] font-black uppercase">
                Host Confidential
              </span>
              <label className="text-xs font-bold text-slate-300">
                Secret Trivia Fact / Host Explanation
              </label>
            </div>
            <p className="text-[11px] text-slate-500">
              This note is displayed only on the Host Console screen to share interesting trivia when revealing answers.
            </p>
            <input
              type="text"
              value={activeQ.secretNote || ''}
              onChange={(e) => handleUpdateActiveQuestion('secretNote', e.target.value)}
              placeholder="e.g. Mercury orbits the Sun in just 88 days!"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 text-white text-xs outline-none"
            />
          </div>
        </main>
      </div>
    </div>
  );
}

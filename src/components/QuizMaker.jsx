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

const AwardIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="6" />
    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
  </svg>
);

const ImageIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
  </svg>
);

const ChevronUpIcon = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

const ChevronDownIcon = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const SparklesIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3Z" />
  </svg>
);

const shapes = [
  { symbol: '▲', label: 'Red Triangle', bg: 'bg-red-600', ring: 'ring-red-500' },
  { symbol: '◆', label: 'Blue Diamond', bg: 'bg-blue-600', ring: 'ring-blue-500' },
  { symbol: '●', label: 'Yellow Circle', bg: 'bg-amber-500', ring: 'ring-amber-500' },
  { symbol: '■', label: 'Green Square', bg: 'bg-emerald-600', ring: 'ring-emerald-500' }
];

// Curated themes & presets for fast splash creation
const splashPresets = [
  {
    name: '🎵 Music Round',
    title: 'Now the Music Round!',
    subtitle: 'Listen closely and name these iconic tunes and artists.',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: '🎬 Movies & TV',
    title: 'Movie & Pop Culture Round',
    subtitle: 'Put your cinematic memory and quote mastery to the test!',
    imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: '🔬 Science & Nature',
    title: 'Science & Discovery Round',
    subtitle: 'From microscopic wonders to the distant reaches of space.',
    imageUrl: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: '⚽ Sports & Games',
    title: 'Sports & Athletics Round',
    subtitle: 'Legendary moments, champions, and athletic trivia.',
    imageUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: '🍺 Half-time Break',
    title: 'Intermission & Drink Break!',
    subtitle: 'Stretch your legs and grab a refill — round two begins shortly!',
    imageUrl: 'https://images.unsplash.com/photo-1574096079513-d8259312b785?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: '🏆 Grand Finale',
    title: 'The Final Lightning Round!',
    subtitle: 'Highest stakes! This round decides who takes the gold podium.',
    imageUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80'
  }
];

/**
 * QuizMaker Component
 * 
 * - Full quiz & slide builder supporting Questions and Splash Screens
 * - Add splash screens between questions (with uploaded image or URL)
 * - Configurable score points per question (arbitrary numerical input, default 1)
 * - Move questions / splash screens up and down to arrange rounds
 * - Exports quiz as JSON file (.json)
 * - Imports previously saved JSON files
 * - Saves directly to the live Firebase room
 */
export default function QuizMaker({ initialQuestions = [], onSaveQuiz, onClose }) {
  const [quizTitle, setQuizTitle] = useState('My Custom Quiz');
  const [questions, setQuestions] = useState(() => {
    if (initialQuestions && initialQuestions.length > 0) {
      return JSON.parse(JSON.stringify(initialQuestions)).map((q) => {
        if (q.type === 'splash') {
          return {
            id: q.id || Date.now(),
            type: 'splash',
            title: q.title || 'Now the Music Round!',
            subtitle: q.subtitle || '',
            imageUrl: q.imageUrl || ''
          };
        }
        return {
          ...q,
          type: 'question',
          points: q.points !== undefined && q.points !== '' ? Number(q.points) : 1
        };
      });
    }
    return [
      {
        id: 1,
        type: 'question',
        question: 'Which planet in our solar system has the most moons?',
        options: ['Jupiter', 'Saturn', 'Neptune', 'Mars'],
        correctIndex: 1,
        points: 1,
        secretNote: 'Saturn has 146 confirmed moons.',
        timeLimit: 20
      },
      {
        id: 2,
        type: 'splash',
        title: 'Now the Music Round!',
        subtitle: 'Listen closely to the audio clues and name the artist or track.',
        imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 3,
        type: 'question',
        question: 'What was the first music video played on MTV in 1981?',
        options: ['Thriller', 'Video Killed the Radio Star', 'Bohemian Rhapsody', 'Take On Me'],
        correctIndex: 1,
        points: 1,
        secretNote: 'The Buggles released the single in 1979.',
        timeLimit: 20
      }
    ];
  });

  const [activeIdx, setActiveIdx] = useState(0);
  const [notification, setNotification] = useState('');
  const [imageTab, setImageTab] = useState('upload'); // 'upload' | 'url'
  const fileInputRef = useRef(null);
  const imageUploadRef = useRef(null);

  const activeQ = questions[activeIdx] || questions[0];

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  // Add new question slide
  const handleAddQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      type: 'question',
      question: 'New Question',
      options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
      correctIndex: 0,
      points: 1,
      secretNote: '',
      timeLimit: 20
    };
    const updated = [...questions, newQuestion];
    setQuestions(updated);
    setActiveIdx(updated.length - 1);
  };

  // Add new splash screen slide
  const handleAddSplash = () => {
    const newSplash = {
      id: Date.now(),
      type: 'splash',
      title: 'Now the Music Round!',
      subtitle: 'Get ready for round two! Listen closely to the clues.',
      imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80'
    };
    const updated = [...questions, newSplash];
    setQuestions(updated);
    setActiveIdx(updated.length - 1);
    showNotification('Splash screen added! Drag or move to place between questions.');
  };

  // Delete slide
  const handleDeleteItem = (indexToDelete) => {
    if (questions.length <= 1) {
      alert('A quiz must have at least one question or slide.');
      return;
    }
    const updated = questions.filter((_, idx) => idx !== indexToDelete);
    setQuestions(updated);
    setActiveIdx(Math.max(0, indexToDelete - 1));
  };

  // Reorder slide: move up (-1) or down (+1)
  const handleMoveItem = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= questions.length) return;
    const updated = [...questions];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setQuestions(updated);
    if (activeIdx === index) {
      setActiveIdx(targetIndex);
    } else if (activeIdx === targetIndex) {
      setActiveIdx(index);
    }
  };

  // Update current item field
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

  // Upload local image file as Data URL
  const handleImageFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WEBP, GIF, SVG).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image file is large (>5MB). For best performance, use images under 5MB.');
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const dataUrl = loadEvent.target?.result;
      handleUpdateActiveQuestion('imageUrl', dataUrl);
      showNotification('Image uploaded successfully!');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Apply splash preset
  const handleApplyPreset = (preset) => {
    const updated = [...questions];
    updated[activeIdx] = {
      ...updated[activeIdx],
      title: preset.title,
      subtitle: preset.subtitle,
      imageUrl: preset.imageUrl
    };
    setQuestions(updated);
    showNotification(`Applied preset "${preset.name}"!`);
  };

  // Export Quiz as JSON (including splash screens & points)
  const handleExportJSON = () => {
    const exportData = {
      title: quizTitle,
      version: '1.2',
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

  // Import Quiz from JSON (with splash screens & points compatibility)
  const handleImportJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result);

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

        const validated = loadedQuestions.map((q, idx) => {
          if (q.type === 'splash') {
            return {
              id: q.id || idx + 1,
              type: 'splash',
              title: q.title || 'Splash Announcement',
              subtitle: q.subtitle || '',
              imageUrl: q.imageUrl || ''
            };
          }

          return {
            id: q.id || idx + 1,
            type: 'question',
            question: q.question || `Question ${idx + 1}`,
            options: Array.isArray(q.options) && q.options.length >= 2 ? q.options.slice(0, 4) : ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
            correctIndex: typeof q.correctIndex === 'number' && q.correctIndex >= 0 && q.correctIndex < 4 ? q.correctIndex : 0,
            points: typeof q.points === 'number' && !isNaN(q.points) ? Math.max(0, Math.min(100000, q.points)) : 1,
            secretNote: q.secretNote || '',
            timeLimit: q.timeLimit || 20
          };
        });

        setQuestions(validated);
        setActiveIdx(0);
        showNotification(`Successfully loaded ${validated.length} slides from JSON!`);
      } catch (err) {
        console.error('Failed to parse quiz JSON:', err);
        alert('Could not parse JSON file. Please ensure it is valid JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Save to live game
  const handleSaveToGame = () => {
    if (onSaveQuiz) {
      onSaveQuiz(questions, quizTitle);
    }
    showNotification('Quiz and splash screens applied to live room!');
    if (onClose) {
      onClose();
    }
  };

  const questionCount = questions.filter(q => q.type !== 'splash').length;
  const splashCount = questions.filter(q => q.type === 'splash').length;

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
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <span className="px-2 py-0.5 rounded-md bg-purple-950/60 border border-purple-800/80 text-purple-300 font-bold">
              {questionCount} {questionCount === 1 ? 'Question' : 'Questions'}
            </span>
            {splashCount > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-amber-950/60 border border-amber-800/80 text-amber-300 font-bold flex items-center gap-1">
                <ImageIcon className="w-3 h-3" />
                {splashCount} {splashCount === 1 ? 'Splash Screen' : 'Splash Screens'}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons: Import, Export, Apply, Close */}
        <div className="flex items-center gap-2">
          {/* Hidden File Input for JSON Import */}
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

      {/* Main Workspace: Left Questions List + Right Editor */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Questions & Splash Screens Sequence */}
        <aside className="w-64 sm:w-72 bg-slate-900/70 border-r border-slate-800 flex flex-col justify-between overflow-y-auto p-4 shrink-0">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Quiz Sequence</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="px-2 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 text-[11px] font-bold cursor-pointer transition-all"
                  title="Add Question"
                >
                  + Question
                </button>
                <button
                  type="button"
                  onClick={handleAddSplash}
                  className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-500/30 text-[11px] font-bold cursor-pointer transition-all"
                  title="Add Splash Screen between questions"
                >
                  + Splash
                </button>
              </div>
            </div>

            {/* List of items */}
            <div className="space-y-2 pt-1">
              {questions.map((item, idx) => {
                const isSplash = item.type === 'splash';
                const isSelected = activeIdx === idx;

                return (
                  <div
                    key={item.id || idx}
                    onClick={() => setActiveIdx(idx)}
                    className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs transition-all border ${
                      isSelected
                        ? isSplash
                          ? 'bg-amber-950/70 border-amber-500 text-amber-100 shadow-lg shadow-amber-500/20'
                          : 'bg-purple-600 border-purple-400 text-white font-bold shadow-md shadow-purple-600/25'
                        : isSplash
                        ? 'bg-amber-950/20 border-amber-800/40 text-amber-200 hover:border-amber-700/60'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="truncate flex-1 pr-2 flex items-center gap-2">
                      {isSplash ? (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-[9px] uppercase tracking-wider">
                            SPLASH
                          </span>
                        </div>
                      ) : (
                        <span className={`font-mono font-bold shrink-0 ${isSelected ? 'text-purple-200' : 'text-purple-400'}`}>
                          {idx + 1}.
                        </span>
                      )}

                      <span className="truncate font-semibold">
                        {isSplash ? (item.title || 'Now the Music Round!') : (item.question || 'Untitled Question')}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {!isSplash && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900/80 border border-slate-700/60 text-amber-300">
                          {item.points !== undefined && item.points !== '' ? item.points : 1} {Number(item.points ?? 1) === 1 ? 'pt' : 'pts'}
                        </span>
                      )}

                      {/* Reorder Up/Down buttons */}
                      <div className="opacity-0 group-hover:opacity-100 flex items-center transition-opacity">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveItem(idx, -1);
                          }}
                          className={`p-0.5 rounded hover:bg-slate-800 ${idx === 0 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-300 hover:text-white cursor-pointer'}`}
                          title="Move Up"
                        >
                          <ChevronUpIcon />
                        </button>
                        <button
                          type="button"
                          disabled={idx === questions.length - 1}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveItem(idx, 1);
                          }}
                          className={`p-0.5 rounded hover:bg-slate-800 ${idx === questions.length - 1 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-300 hover:text-white cursor-pointer'}`}
                          title="Move Down"
                        >
                          <ChevronDownIcon />
                        </button>
                      </div>

                      {/* Delete */}
                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteItem(idx);
                          }}
                          className="opacity-0 group-hover:opacity-100 hover:text-rose-400 p-1 cursor-pointer transition-opacity text-slate-400"
                          title="Delete Slide"
                        >
                          <TrashIcon className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Dual Add Buttons */}
          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={handleAddQuestion}
              className="py-2.5 px-2 rounded-xl border border-dashed border-purple-500/50 hover:bg-purple-950/30 text-purple-300 text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <PlusIcon className="w-3.5 h-3.5" />
              <span>+ Question</span>
            </button>

            <button
              type="button"
              onClick={handleAddSplash}
              className="py-2.5 px-2 rounded-xl border border-dashed border-amber-500/50 hover:bg-amber-950/30 text-amber-300 text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>+ Splash</span>
            </button>
          </div>
        </aside>

        {/* Right Editor Area */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-10 max-w-4xl mx-auto w-full space-y-6">
          
          {/* ======================================================== */}
          {/* SPLASH SCREEN EDITOR */}
          {/* ======================================================== */}
          {activeQ.type === 'splash' ? (
            <div className="space-y-6">
              {/* Header card */}
              <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 shadow-xl space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-mono font-black text-xs uppercase tracking-wider">
                      Splash Screen #{activeIdx + 1}
                    </span>
                    <span className="text-xs text-amber-400 font-semibold">
                      Intermission / Round Announcement
                    </span>
                  </div>

                  <span className="text-xs text-slate-400">
                    Shown on the live big screen & player phones between question rounds
                  </span>
                </div>

                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Splash Title / Announcement Banner
                  </label>
                  <input
                    type="text"
                    value={activeQ.title || ''}
                    onChange={(e) => handleUpdateActiveQuestion('title', e.target.value)}
                    placeholder="e.g. Now the Music Round! or Halfway Mark - Drink Break!"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-white text-lg sm:text-xl font-bold outline-none transition-all"
                  />
                </div>

                {/* Subtitle / Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Subtitle / Instructions for Players
                  </label>
                  <input
                    type="text"
                    value={activeQ.subtitle || ''}
                    onChange={(e) => handleUpdateActiveQuestion('subtitle', e.target.value)}
                    placeholder="e.g. Listen carefully to each track. Answer fast for maximum points!"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-sm outline-none transition-all"
                  />
                </div>

                {/* Image Section: Upload file or URL */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-amber-400" />
                      Splash Image (Upload from device or provide web URL)
                    </label>

                    {/* Image Mode Tabs */}
                    <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => setImageTab('upload')}
                        className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${imageTab === 'upload' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                      >
                        Upload Image
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageTab('url')}
                        className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${imageTab === 'url' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                      >
                        Image URL
                      </button>
                    </div>
                  </div>

                  {/* Hidden file input for upload */}
                  <input
                    type="file"
                    ref={imageUploadRef}
                    onChange={handleImageFileUpload}
                    accept="image/*"
                    className="hidden"
                  />

                  {imageTab === 'upload' ? (
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <button
                        type="button"
                        onClick={() => imageUploadRef.current?.click()}
                        className="w-full sm:w-auto px-5 py-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md"
                      >
                        <UploadIcon className="w-4 h-4" />
                        <span>Choose Image File to Upload</span>
                      </button>
                      <span className="text-xs text-slate-500">
                        PNG, JPG, WEBP, GIF, SVG (embedded directly into quiz)
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        value={activeQ.imageUrl || ''}
                        onChange={(e) => handleUpdateActiveQuestion('imageUrl', e.target.value)}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs outline-none font-mono"
                      />
                    </div>
                  )}

                  {/* Quick Preset Theme Pills */}
                  <div className="pt-2">
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block mb-2">
                      Or select a quick round preset:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {splashPresets.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleApplyPreset(preset)}
                          className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 text-xs font-semibold text-slate-300 hover:text-amber-300 transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <span>{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Big Screen Live Preview Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <SparklesIcon className="w-4 h-4 text-amber-400" />
                    Audience Display Preview (How this splash screen will look live)
                  </span>

                  {activeQ.imageUrl && (
                    <button
                      type="button"
                      onClick={() => handleUpdateActiveQuestion('imageUrl', '')}
                      className="text-xs text-rose-400 hover:text-rose-300 cursor-pointer font-semibold"
                    >
                      Remove Image
                    </button>
                  )}
                </div>

                {/* Simulated live screen presentation */}
                <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-slate-950 via-purple-950/30 to-slate-950 border border-slate-800 p-8 sm:p-12 text-center min-h-[300px] flex flex-col justify-center items-center shadow-2xl">
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
                      Round Announcement
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-pink-200 to-purple-200 tracking-tight leading-tight max-w-2xl mb-3 mt-4">
                    {activeQ.title || 'Now the Music Round!'}
                  </h3>

                  {activeQ.subtitle && (
                    <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto mb-6 leading-relaxed">
                      {activeQ.subtitle}
                    </p>
                  )}

                  {activeQ.imageUrl ? (
                    <div className="relative max-w-md w-full mx-auto rounded-2xl overflow-hidden border border-purple-500/30 shadow-2xl shadow-purple-900/40 bg-slate-950">
                      <img
                        src={activeQ.imageUrl}
                        alt="Splash screen illustration"
                        className="w-full h-56 sm:h-64 object-cover object-center"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="p-8 rounded-2xl border border-dashed border-slate-800 text-slate-500 text-xs max-w-md w-full">
                      <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <span>No image set yet. Text banner will display on a starry ambient backdrop.</span>
                    </div>
                  )}

                  <div className="mt-8 text-xs text-purple-400 font-medium">
                    Quiz master will start next question shortly...
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ======================================================== */
            /* QUESTION SLIDE EDITOR */
            /* ======================================================== */
            <div className="space-y-6">
              {/* Question Text, Points & Time Limit Header */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs font-mono font-bold uppercase text-purple-400">
                    Question #{activeIdx + 1}
                  </span>

                  <div className="flex items-center flex-wrap gap-4">
                    {/* Score / Points Numerical Input */}
                    <div className="flex items-center gap-2">
                      <AwardIcon className="w-4 h-4 text-amber-400" />
                      <label htmlFor="question-points-input" className="text-xs text-slate-300 font-semibold">Points:</label>
                      <div className="flex items-center gap-1.5">
                        <input
                          id="question-points-input"
                          type="number"
                          min={0}
                          max={100000}
                          step={1}
                          value={activeQ.points !== undefined ? activeQ.points : 1}
                          onChange={(e) => {
                            const raw = e.target.value;
                            if (raw === '') {
                              handleUpdateActiveQuestion('points', '');
                            } else {
                              const num = Math.min(100000, Math.max(0, parseInt(raw, 10) || 0));
                              handleUpdateActiveQuestion('points', num);
                            }
                          }}
                          onBlur={() => {
                            if (activeQ.points === '' || activeQ.points === undefined || isNaN(Number(activeQ.points))) {
                              handleUpdateActiveQuestion('points', 1);
                            }
                          }}
                          className="w-20 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-bold text-amber-400 outline-none focus:border-purple-500 font-mono text-center"
                          placeholder="1"
                        />
                        <span className="text-xs text-slate-400 font-semibold font-mono">
                          {Number(activeQ.points ?? 1) === 1 ? 'pt' : 'pts'}
                        </span>
                      </div>
                    </div>

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
                </div>

                <textarea
                  rows={2}
                  value={activeQ.question || ''}
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
                  {(activeQ.options || ['Option 1', 'Option 2', 'Option 3', 'Option 4']).map((optionText, optIdx) => {
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
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

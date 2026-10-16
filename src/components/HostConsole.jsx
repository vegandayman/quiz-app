import React, { useState, useEffect } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { db } from '../firebase.js';
import QuizMaker from './QuizMaker.jsx';

// Clean inline SVGs (zero external dependencies)
const EyeIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EditIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const RefreshCwIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M8 16H3v5" />
  </svg>
);

const ExternalLinkIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h6v6" />
    <path d="M10 14 21 3" />
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
  </svg>
);

const CheckIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const PlayIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <polygon points="6 3 20 12 6 21 6 3" />
  </svg>
);

const ArrowRightIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const SparklesIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3Z" />
  </svg>
);

const shapes = ['▲ Triangle', '◆ Diamond', '● Circle', '■ Square'];

const defaultQuestions = [
  {
    id: 1,
    question: 'Which planet in our solar system has the most moons?',
    options: ['Jupiter', 'Saturn', 'Neptune', 'Mars'],
    correctIndex: 1,
    secretNote: 'Saturn has 146 confirmed moons, overtaking Jupiter (95 moons) in 2023!',
    timeLimit: 20
  },
  {
    id: 2,
    question: 'What was the first video game ever played in outer space?',
    options: ['Tetris', 'Pac-Man', 'Pong', 'Space Invaders'],
    correctIndex: 0,
    secretNote: 'Russian cosmonaut Aleksandr Serebrov played Tetris on his Game Boy aboard the Mir Space Station in 1993.',
    timeLimit: 20
  },
  {
    id: 3,
    question: 'How many hearts does an octopus have?',
    options: ['One', 'Two', 'Three', 'Four'],
    correctIndex: 2,
    secretNote: 'Two hearts pump blood to the gills, while the third circulates it to the rest of the body.',
    timeLimit: 20
  },
  {
    id: 4,
    question: 'Which programming language was created in only 10 days in May 1995?',
    options: ['Python', 'JavaScript', 'Java', 'PHP'],
    correctIndex: 1,
    secretNote: 'Brendan Eich designed Mocha (which became JavaScript) in 10 days for Netscape Navigator.',
    timeLimit: 20
  }
];

/**
 * HostConsole Component (Private Quiz Master Screen)
 * 
 * - Includes Quiz Maker modal to create, edit, save, export, and import quizzes
 * - Resets/generates room numbers
 * - Controls live game phases & reveals secret answers
 */
export default function HostConsole({ onOpenDisplay, onRoomCodeReady }) {
  const [roomCode, setRoomCode] = useState(() => Math.floor(1000 + Math.random() * 9000).toString());
  const [roomData, setRoomData] = useState(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [activeQuestions, setActiveQuestions] = useState(defaultQuestions);
  const [isQuizMakerOpen, setIsQuizMakerOpen] = useState(false);

  // Notify parent of room code
  useEffect(() => {
    if (roomCode && onRoomCodeReady) {
      onRoomCodeReady(roomCode);
    }
  }, [roomCode, onRoomCodeReady]);

  // Initialize room in Firebase
  useEffect(() => {
    if (!roomCode) return;

    const roomRef = ref(db, `rooms/${roomCode}`);

    update(roomRef, {
      roomCode,
      status: 'lobby',
      currentQuestionIndex: 0,
      questions: activeQuestions,
      createdAt: Date.now()
    }).catch((err) => console.error('Error initializing room:', err));

    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setRoomData(data);
        if (data.currentQuestionIndex !== undefined) {
          setCurrentQIndex(data.currentQuestionIndex);
        }
        if (data.questions && Array.isArray(data.questions)) {
          setActiveQuestions(data.questions);
        }
      }
    });

    return () => unsubscribe();
  }, [roomCode]);

  // Save custom quiz from QuizMaker
  const handleSaveQuiz = async (newQuestions, title) => {
    setActiveQuestions(newQuestions);
    setCurrentQIndex(0);

    if (roomCode) {
      const roomRef = ref(db, `rooms/${roomCode}`);
      await update(roomRef, {
        questions: newQuestions,
        currentQuestionIndex: 0,
        status: 'lobby'
      });
    }
  };

  // Reset Room PIN
  const handleResetRoomNumber = async () => {
    if (confirm('Generate a new Room PIN? Current players will be notified to join the new room.')) {
      if (roomCode) {
        try {
          await update(ref(db, `rooms/${roomCode}`), { status: 'closed' });
        } catch (e) {
          console.error(e);
        }
      }

      const newCode = Math.floor(1000 + Math.random() * 9000).toString();
      setRoomCode(newCode);
      setCurrentQIndex(0);
      if (onRoomCodeReady) {
        onRoomCodeReady(newCode);
      }
    }
  };

  const rawPlayers = roomData?.players || {};
  const players = Object.entries(rawPlayers).map(([id, p]) => ({
    id,
    name: typeof p === 'object' ? p.name : p,
    score: typeof p === 'object' ? p.score || 0 : 0,
    answers: typeof p === 'object' ? p.answers || {} : {}
  }));

  const activeQuestion = activeQuestions[currentQIndex];
  const status = roomData?.status || 'lobby';

  const choiceTally = [0, 0, 0, 0];
  let totalSubmitted = 0;

  players.forEach((p) => {
    const answer = p.answers?.[currentQIndex];
    if (answer !== undefined && answer.choiceIndex !== undefined) {
      choiceTally[answer.choiceIndex] = (choiceTally[answer.choiceIndex] || 0) + 1;
      totalSubmitted++;
    }
  });

  const handleStartQuiz = async () => {
    const roomRef = ref(db, `rooms/${roomCode}`);
    await update(roomRef, {
      status: 'question',
      currentQuestionIndex: 0,
      questionStartTime: Date.now(),
      timeLimit: activeQuestions[0]?.timeLimit || 20
    });
  };

  const handleRevealAnswer = async () => {
    const roomRef = ref(db, `rooms/${roomCode}`);
    await update(roomRef, {
      status: 'reveal'
    });
  };

  const handleShowLeaderboard = async () => {
    const roomRef = ref(db, `rooms/${roomCode}`);
    await update(roomRef, {
      status: 'leaderboard'
    });
  };

  const handleNextQuestion = async () => {
    const nextIndex = currentQIndex + 1;
    const roomRef = ref(db, `rooms/${roomCode}`);

    if (nextIndex < activeQuestions.length) {
      await update(roomRef, {
        status: 'question',
        currentQuestionIndex: nextIndex,
        questionStartTime: Date.now(),
        timeLimit: activeQuestions[nextIndex]?.timeLimit || 20
      });
    } else {
      await update(roomRef, {
        status: 'finished'
      });
    }
  };

  const handleResetQuiz = async () => {
    const roomRef = ref(db, `rooms/${roomCode}`);
    await update(roomRef, {
      status: 'lobby',
      currentQuestionIndex: 0
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4 sm:p-8 font-sans">
      {/* Top Header */}
      <header className="max-w-5xl mx-auto w-full flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-600/30">
            <SparklesIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-white">Quiz Master Console</h1>
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                Private Host Screen
              </span>
            </div>
            <p className="text-xs text-slate-400">Controls live game & displays secret answers</p>
          </div>
        </div>

        {/* Toolbar: Quiz Maker, PIN, Reset, Open Display */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Quiz Maker Button */}
          <button
            type="button"
            onClick={() => setIsQuizMakerOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-600/25 cursor-pointer transition-all"
          >
            <EditIcon className="w-3.5 h-3.5" />
            <span>Quiz Maker</span>
          </button>

          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
            PIN: <span className="text-purple-400 font-bold">{roomCode}</span>
          </div>

          <button
            type="button"
            onClick={handleResetRoomNumber}
            title="Generate a new Room PIN"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold cursor-pointer transition-all"
          >
            <RefreshCwIcon className="w-3.5 h-3.5 text-amber-400" />
            <span>New PIN</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenDisplay && onOpenDisplay(roomCode)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-semibold cursor-pointer transition-all"
          >
            <ExternalLinkIcon className="w-3.5 h-3.5 text-purple-400" />
            <span>Open Display</span>
          </button>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="max-w-5xl mx-auto w-full flex-1 my-6 space-y-6">
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Current Phase:</span>
            <span className="px-2.5 py-1 rounded-lg bg-purple-900/60 border border-purple-700 text-purple-300 font-bold uppercase tracking-wider text-[11px]">
              {status}
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Questions: <strong className="text-white">{activeQuestions.length}</strong></span>
            <span>Players: <strong className="text-white">{players.length}</strong></span>
          </div>
        </div>

        {/* SECRET HOST INFORMATION BOX */}
        {activeQuestion && (
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950/30 border-2 border-purple-500/40 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 font-mono text-xs font-bold">
                QUESTION {currentQIndex + 1} OF {activeQuestions.length}
              </span>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">
                <EyeIcon className="w-4 h-4 text-amber-400" />
                <span>CONFIDENTIAL ANSWER KEY</span>
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white mb-6">
              {activeQuestion.question}
            </h2>

            {/* Answer Options with SECRET HIGHLIGHT */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {activeQuestion.options.map((option, idx) => {
                const isCorrect = idx === activeQuestion.correctIndex;
                const votesCount = choiceTally[idx] || 0;

                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                      isCorrect
                        ? 'bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/30 text-white'
                        : 'bg-slate-950/80 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-slate-500">{shapes[idx]}</span>
                      <span className="font-bold text-sm">{option}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isCorrect && (
                        <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-black text-[10px] uppercase">
                          CORRECT ANSWER ✓
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-xs font-mono text-slate-300">
                        {votesCount} {votesCount === 1 ? 'vote' : 'votes'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* SECRET HOST TRIVIA FACT */}
            {activeQuestion.secretNote && (
              <div className="p-4 rounded-2xl bg-purple-950/50 border border-purple-800/80 text-purple-200 text-xs flex items-start gap-3">
                <span className="px-2 py-0.5 rounded bg-purple-700 text-white text-[10px] font-black uppercase shrink-0">
                  Host Trivia Fact
                </span>
                <p className="leading-relaxed">{activeQuestion.secretNote}</p>
              </div>
            )}
          </div>
        )}

        {/* Live Submissions Tracker */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            Player Responses: <strong className="text-white">{totalSubmitted} / {players.length}</strong> submitted
          </span>
          <span className="text-slate-500">Live Firebase sync</span>
        </div>
      </main>

      {/* Host Controls Footer */}
      <footer className="max-w-5xl mx-auto w-full pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetQuiz}
            className="px-4 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white text-xs font-semibold cursor-pointer transition-all"
          >
            Reset to Lobby
          </button>

          <button
            type="button"
            onClick={() => setIsQuizMakerOpen(true)}
            className="px-4 py-2.5 rounded-xl border border-purple-900/60 bg-purple-950/30 hover:bg-purple-950/60 text-purple-300 text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5"
          >
            <EditIcon className="w-3.5 h-3.5" />
            <span>Edit Questions</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {status === 'lobby' && (
            <button
              type="button"
              onClick={handleStartQuiz}
              className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-purple-600/30 cursor-pointer transition-all"
            >
              <PlayIcon className="w-4 h-4" />
              <span>Start Quiz on Live Display</span>
            </button>
          )}

          {status === 'question' && (
            <button
              type="button"
              onClick={handleRevealAnswer}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer transition-all"
            >
              <CheckIcon className="w-4 h-4" />
              <span>Reveal Answer on Big Screen</span>
            </button>
          )}

          {status === 'reveal' && (
            <button
              type="button"
              onClick={handleShowLeaderboard}
              className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-amber-600/30 cursor-pointer transition-all"
            >
              <span>Show Scoreboard</span>
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          )}

          {status === 'leaderboard' && (
            <button
              type="button"
              onClick={handleNextQuestion}
              className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-purple-600/30 cursor-pointer transition-all"
            >
              <span>
                {currentQIndex + 1 < activeQuestions.length
                  ? `Next Question (${currentQIndex + 2}/${activeQuestions.length})`
                  : 'Show Final Winner Podium'}
              </span>
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          )}

          {status === 'finished' && (
            <button
              type="button"
              onClick={handleResetQuiz}
              className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm cursor-pointer"
            >
              Play Again
            </button>
          )}
        </div>
      </footer>

      {/* QUIZ MAKER MODAL */}
      {isQuizMakerOpen && (
        <QuizMaker
          initialQuestions={activeQuestions}
          onSaveQuiz={handleSaveQuiz}
          onClose={() => setIsQuizMakerOpen(false)}
        />
      )}
    </div>
  );
}

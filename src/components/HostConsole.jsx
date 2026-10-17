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

const PlayIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <polygon points="6 3 20 12 6 21 6 3" />
  </svg>
);

const TrophyIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);

const ArrowRightIcon = ({ className = 'w-5 h-5' }) => (
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

const UsersIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const ClockIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const AwardIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="6" />
    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
  </svg>
);

const shapes = [
  { symbol: '▲', label: 'Triangle', color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/40' },
  { symbol: '◆', label: 'Diamond', color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/40' },
  { symbol: '●', label: 'Circle', color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/40' },
  { symbol: '■', label: 'Square', color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/40' }
];

const defaultQuestions = [
  {
    id: 1,
    type: 'question',
    question: 'Which planet in our solar system has the most moons?',
    options: ['Jupiter', 'Saturn', 'Neptune', 'Mars'],
    correctIndex: 1,
    points: 1,
    secretNote: 'Saturn has 146 confirmed moons, overtaking Jupiter (95 moons) in 2023!',
    timeLimit: 20
  },
  {
    id: 2,
    type: 'question',
    question: 'What was the first video game ever played in outer space?',
    options: ['Tetris', 'Pac-Man', 'Pong', 'Space Invaders'],
    correctIndex: 0,
    points: 1,
    secretNote: 'Russian cosmonaut Aleksandr Serebrov played Tetris on his Game Boy aboard the Mir Space Station in 1993.',
    timeLimit: 20
  },
  {
    id: 'splash-1',
    type: 'splash',
    title: 'Now the Music Round!',
    subtitle: 'Get your listening ears ready — test your knowledge of iconic hits and artists.',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 3,
    type: 'question',
    question: 'How many hearts does an octopus have?',
    options: ['One', 'Two', 'Three', 'Four'],
    correctIndex: 2,
    points: 1,
    secretNote: 'Two hearts pump blood to the gills, while the third circulates it to the rest of the body.',
    timeLimit: 20
  },
  {
    id: 4,
    type: 'question',
    question: 'Which programming language was created in only 10 days in May 1995?',
    options: ['Python', 'JavaScript', 'Java', 'PHP'],
    correctIndex: 1,
    points: 1,
    secretNote: 'Brendan Eich designed Mocha (which became JavaScript) in 10 days for Netscape Navigator.',
    timeLimit: 20
  }
];

/**
 * HostConsole Component
 * 
 * Master Controller for running Kahoot-style multiplayer quizzes:
 * - Starts quiz and launches questions
 * - Shows incoming player names and their selected answers in real time
 * - Displays secret answers and host trivia facts
 * - Reveals answers on the big screen
 * - Shows live leaderboards and advances rounds
 */
export default function HostConsole({ onOpenDisplay, onRoomCodeReady }) {
  const [roomCode, setRoomCode] = useState(() => Math.floor(1000 + Math.random() * 9000).toString());
  const [roomData, setRoomData] = useState(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [activeQuestions, setActiveQuestions] = useState(defaultQuestions);
  const [isQuizMakerOpen, setIsQuizMakerOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20);

  // Notify parent of room code
  useEffect(() => {
    if (roomCode && onRoomCodeReady) {
      onRoomCodeReady(roomCode);
    }
  }, [roomCode, onRoomCodeReady]);

  // Initialize room in Firebase Realtime Database
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

  // Host Countdown Timer synchronization
  useEffect(() => {
    if (roomData?.status !== 'question') return;

    const duration = roomData?.timeLimit || 20;
    const startTime = roomData?.questionStartTime || Date.now();

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, duration - elapsed);
      setTimeLeft(remaining);
    }, 500);

    return () => clearInterval(interval);
  }, [roomData?.status, roomData?.questionStartTime, roomData?.timeLimit]);

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

  // Extract players array
  const rawPlayers = roomData?.players || {};
  const players = Object.entries(rawPlayers).map(([id, p]) => ({
    id,
    name: typeof p === 'object' ? p.name : p,
    score: typeof p === 'object' ? p.score || 0 : 0,
    answers: typeof p === 'object' ? p.answers || {} : {}
  }));

  // Sort players for leaderboard
  const rankedPlayers = [...players].sort((a, b) => b.score - a.score);

  const activeQuestion = activeQuestions[currentQIndex] || activeQuestions[0];
  const nextQuestion = activeQuestions[currentQIndex + 1] || null;
  const status = roomData?.status || 'lobby';

  // Count choices and group players by choice for the current question
  const choiceTally = [0, 0, 0, 0];
  const choicePlayers = [[], [], [], []];
  let totalSubmitted = 0;

  players.forEach((p) => {
    const answer = p.answers?.[currentQIndex];
    if (answer !== undefined && answer.choiceIndex !== undefined) {
      choiceTally[answer.choiceIndex] = (choiceTally[answer.choiceIndex] || 0) + 1;
      choicePlayers[answer.choiceIndex].push({
        id: p.id,
        name: p.name,
        isCorrect: answer.isCorrect,
        pointsAwarded: answer.pointsAwarded,
        answeredAt: answer.answeredAt
      });
      totalSubmitted++;
    }
  });

  const allPlayersAnswered = players.length > 0 && totalSubmitted === players.length;

  // ----------------------------------------------------
  // GAME LIFECYCLE CONTROLLERS
  // ----------------------------------------------------

  // 1. START QUIZ (Lobby -> Question 1 or Splash 1)
  const handleStartQuiz = async () => {
    const roomRef = ref(db, `rooms/${roomCode}`);

    const resetPlayersUpdates = {};
    if (roomData?.players) {
      Object.keys(roomData.players).forEach((playerId) => {
        resetPlayersUpdates[`players/${playerId}/score`] = 0;
        resetPlayersUpdates[`players/${playerId}/answers`] = {};
      });
    }

    const firstItem = activeQuestions[0];
    const isSplash = firstItem?.type === 'splash';

    await update(roomRef, {
      ...resetPlayersUpdates,
      status: isSplash ? 'splash' : 'question',
      currentQuestionIndex: 0,
      questionStartTime: Date.now(),
      timeLimit: firstItem?.timeLimit || 20
    });
  };

  // 2. REVEAL ANSWER (Question -> Reveal)
  const handleRevealAnswer = async () => {
    const roomRef = ref(db, `rooms/${roomCode}`);
    await update(roomRef, {
      status: 'reveal'
    });
  };

  // 3. SHOW LEADERBOARD (Reveal -> Leaderboard)
  const handleShowLeaderboard = async () => {
    const roomRef = ref(db, `rooms/${roomCode}`);
    await update(roomRef, {
      status: 'leaderboard'
    });
  };

  // 4. NEXT SLIDE (Leaderboard / Splash -> Next Question / Splash OR Finished)
  const handleNextQuestion = async () => {
    const nextIndex = currentQIndex + 1;
    const roomRef = ref(db, `rooms/${roomCode}`);

    if (nextIndex < activeQuestions.length) {
      const nextItem = activeQuestions[nextIndex];
      const isSplash = nextItem?.type === 'splash';

      await update(roomRef, {
        status: isSplash ? 'splash' : 'question',
        currentQuestionIndex: nextIndex,
        questionStartTime: Date.now(),
        timeLimit: nextItem?.timeLimit || 20
      });
    } else {
      await update(roomRef, {
        status: 'finished'
      });
    }
  };

  // RESET TO LOBBY
  const handleResetQuiz = async () => {
    const roomRef = ref(db, `rooms/${roomCode}`);
    const resetPlayersUpdates = {};
    if (roomData?.players) {
      Object.keys(roomData.players).forEach((playerId) => {
        resetPlayersUpdates[`players/${playerId}/score`] = 0;
        resetPlayersUpdates[`players/${playerId}/answers`] = {};
      });
    }

    await update(roomRef, {
      ...resetPlayersUpdates,
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
            <p className="text-xs text-slate-400">Controls live game & monitors real-time player answers</p>
          </div>
        </div>

        {/* Toolbar: Quiz Maker, PIN, Reset, Open Display */}
        <div className="flex items-center flex-wrap gap-2">
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

      {/* Main Control Dashboard */}
      <main className="max-w-5xl mx-auto w-full flex-1 my-6 space-y-6">
        
        {/* ======================================================== */}
        {/* PRIMARY QUIZ FLOW CONTROLLER BANNER */}
        {/* ======================================================== */}
        <div className="bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border-2 border-purple-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

          {/* Stepper Status Indicators */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold text-slate-400">Current Phase:</span>
              <span className="px-3 py-1 rounded-xl bg-purple-600 text-white font-mono font-black text-xs uppercase tracking-wider shadow">
                {status.toUpperCase()}
              </span>
            </div>

            {/* Stage Progress Pills */}
            <div className="flex items-center gap-1 text-[11px] font-bold">
              <span className={`px-2.5 py-1 rounded-lg ${status === 'lobby' ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                1. Lobby
              </span>
              <span className="text-slate-600">→</span>
              <span className={`px-2.5 py-1 rounded-lg ${status === 'splash' ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-500'}`}>
                Splash
              </span>
              <span className="text-slate-600">→</span>
              <span className={`px-2.5 py-1 rounded-lg ${status === 'question' ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                2. Question
              </span>
              <span className="text-slate-600">→</span>
              <span className={`px-2.5 py-1 rounded-lg ${status === 'reveal' ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                3. Reveal
              </span>
              <span className="text-slate-600">→</span>
              <span className={`px-2.5 py-1 rounded-lg ${status === 'leaderboard' ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                4. Leaderboard
              </span>
            </div>
          </div>

          {/* Dynamic Big Control Action for the Active Phase */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              {status === 'lobby' && (
                <>
                  <h2 className="text-2xl font-black text-white">Lobby is Open</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {players.length} {players.length === 1 ? 'player has' : 'players have'} joined Room PIN <strong className="text-purple-400 font-mono text-sm">{roomCode}</strong>. Ready when you are!
                  </p>
                </>
              )}

              {status === 'splash' && (
                <>
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-md bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider">
                      Splash Announcement
                    </span>
                    <h2 className="text-2xl font-black text-amber-200">
                      {activeQuestion.title || 'Round Announcement'}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-300 mt-2">
                    {activeQuestion.subtitle || 'Active on the live big screen display and player devices.'} Take your time to introduce the round!
                  </p>
                </>
              )}

              {status === 'question' && (
                <>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-black text-white">
                      Question {currentQIndex + 1} of {activeQuestions.length} is Live!
                    </h2>
                    <span className="px-2.5 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 font-mono text-xs font-bold flex items-center gap-1.5">
                      <ClockIcon className="w-3.5 h-3.5 text-purple-400" />
                      <span>{timeLeft}s</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold">
                      {activeQuestion.points !== undefined && activeQuestion.points !== '' ? activeQuestion.points : 1} {Number(activeQuestion.points ?? 1) === 1 ? 'pt' : 'pts'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-2 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${allPlayersAnswered ? 'bg-emerald-400' : 'bg-purple-400 animate-pulse'}`} />
                    <span>
                      Players answering: <strong className="text-emerald-400 font-mono text-sm">{totalSubmitted} / {players.length}</strong> submitted
                    </span>
                    {allPlayersAnswered && (
                      <span className="ml-2 px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-[10px] font-bold uppercase">
                        All Answered!
                      </span>
                    )}
                  </p>
                </>
              )}

              {status === 'reveal' && (
                <>
                  <h2 className="text-2xl font-black text-emerald-400">Answer Revealed!</h2>
                  <p className="text-xs text-slate-300 mt-1">
                    Correct answer & vote stats are on the big screen. Discuss host notes below, then present the scoreboard!
                  </p>
                </>
              )}

              {status === 'leaderboard' && (
                <>
                  <h2 className="text-2xl font-black text-amber-300">Live Leaderboard Active</h2>
                  <p className="text-xs text-slate-300 mt-1">
                    Scores and rankings are displayed on the big screen. Advance to the next question when ready!
                  </p>
                </>
              )}

              {status === 'finished' && (
                <>
                  <h2 className="text-2xl font-black text-purple-300">🎉 Quiz Completed!</h2>
                  <p className="text-xs text-slate-300 mt-1">
                    Final Olympic podium is showing on the live display screen!
                  </p>
                </>
              )}
            </div>

            {/* Giant Primary Action Button */}
            <div className="shrink-0 w-full sm:w-auto">
              {status === 'lobby' && (
                <button
                  type="button"
                  onClick={handleStartQuiz}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-base flex items-center justify-center gap-3 shadow-xl shadow-purple-600/30 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                >
                  <PlayIcon className="w-5 h-5 fill-current" />
                  <span>
                    {activeQuestions[0]?.type === 'splash'
                      ? `Start Quiz (Splash: "${activeQuestions[0]?.title || 'Announcement'}")`
                      : 'Start Quiz (Question 1)'}
                  </span>
                </button>
              )}

              {status === 'splash' && (
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-base flex items-center justify-center gap-3 shadow-xl shadow-amber-500/30 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                >
                  <span>
                    {currentQIndex + 1 < activeQuestions.length
                      ? activeQuestions[currentQIndex + 1]?.type === 'splash'
                        ? `Continue to: "${activeQuestions[currentQIndex + 1]?.title || 'Next Splash'}"`
                        : `Start Next Question (${currentQIndex + 2} of ${activeQuestions.length})`
                      : 'Show Final Winner Podium'}
                  </span>
                  <ArrowRightIcon className="w-5 h-5 text-slate-950" />
                </button>
              )}

              {status === 'question' && (
                <button
                  type="button"
                  onClick={handleRevealAnswer}
                  className={`w-full sm:w-auto px-8 py-4 rounded-2xl text-white font-black text-base flex items-center justify-center gap-3 shadow-xl transition-all cursor-pointer ${
                    allPlayersAnswered || timeLeft === 0
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 shadow-emerald-500/40 ring-4 ring-emerald-500/40 animate-pulse'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/30'
                  }`}
                >
                  <EyeIcon className="w-5 h-5" />
                  <span>Reveal Answer on Big Screen</span>
                </button>
              )}

              {status === 'reveal' && (
                <button
                  type="button"
                  onClick={handleShowLeaderboard}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-base flex items-center justify-center gap-3 shadow-xl shadow-amber-500/30 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                >
                  <TrophyIcon className="w-5 h-5" />
                  <span>Present Scoreboard</span>
                </button>
              )}

              {status === 'leaderboard' && (
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-base flex items-center justify-center gap-3 shadow-xl shadow-purple-600/30 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                >
                  <span>
                    {currentQIndex + 1 < activeQuestions.length
                      ? activeQuestions[currentQIndex + 1]?.type === 'splash'
                        ? `Continue to: "${activeQuestions[currentQIndex + 1]?.title || 'Splash Screen'}"`
                        : `Start Question ${currentQIndex + 2} of ${activeQuestions.length}`
                      : 'Show Final Winner Podium'}
                  </span>
                  <ArrowRightIcon className="w-5 h-5" />
                </button>
              )}

              {status === 'finished' && (
                <button
                  type="button"
                  onClick={handleResetQuiz}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-base cursor-pointer shadow-lg transition-all"
                >
                  Play Again / Reset Quiz
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* LEADERBOARD STANDINGS (SHOWN DURING LEADERBOARD & FINISHED) */}
        {/* ======================================================== */}
        {(status === 'leaderboard' || status === 'finished') && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <TrophyIcon className="w-4 h-4 text-amber-400" />
                Live Standings Overview (Shown on Big Screen)
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {players.length} Competitors
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {rankedPlayers.slice(0, 6).map((player, idx) => (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-3.5 rounded-xl border text-sm ${
                    idx === 0
                      ? 'bg-amber-950/30 border-amber-500/50 text-amber-200'
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-base w-6 text-center">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                    </span>
                    <span className="font-bold">{player.name}</span>
                  </div>
                  <span className="font-mono font-black text-purple-400">{player.score} pts</span>
                </div>
              ))}
            </div>

            {/* Next Question Preview for Host */}
            {nextQuestion && status === 'leaderboard' && (
              <div className="mt-4 p-4 rounded-2xl bg-purple-950/30 border border-purple-800/50">
                <span className="text-[10px] font-black uppercase text-purple-300 tracking-wider">
                  Upcoming: Slide #{currentQIndex + 2} Preview
                </span>
                {nextQuestion.type === 'splash' ? (
                  <div className="mt-1 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 text-[10px] font-black uppercase">
                      Splash Screen
                    </span>
                    <span className="font-bold text-white text-sm">{nextQuestion.title || 'Announcement'}</span>
                    {nextQuestion.subtitle && (
                      <span className="text-xs text-slate-400">({nextQuestion.subtitle})</span>
                    )}
                  </div>
                ) : (
                  <>
                    <p className="font-bold text-white text-sm mt-1">{nextQuestion.question}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs">
                      <span className="text-emerald-400 font-semibold">
                        Correct Answer: {nextQuestion.options?.[nextQuestion.correctIndex]}
                      </span>
                      <span className="text-amber-400 font-mono">
                        ({nextQuestion.points !== undefined && nextQuestion.points !== '' ? nextQuestion.points : 1} {Number(nextQuestion.points ?? 1) === 1 ? 'pt' : 'pts'})
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* CONFIDENTIAL ANSWER KEY & REAL-TIME PLAYER SELECTIONS OR SPLASH PREVIEW */}
        {/* ======================================================== */}
        {activeQuestion && status !== 'finished' && (
          activeQuestion.type === 'splash' ? (
            <div className="bg-slate-900/90 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold">
                    SLIDE {currentQIndex + 1} OF {activeQuestions.length} • SPLASH SCREEN
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">
                  <EyeIcon className="w-4 h-4 text-amber-400" />
                  <span>ACTIVE ON LIVE BIG SCREEN & PLAYERS</span>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-6">
                {activeQuestion.imageUrl && (
                  <div className="w-full md:w-64 h-44 rounded-2xl overflow-hidden border border-purple-500/30 shadow-lg shrink-0 bg-slate-950">
                    <img
                      src={activeQuestion.imageUrl}
                      alt="Splash banner"
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                )}
                <div className="flex-1 space-y-2 text-center md:text-left">
                  <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">Round Title</span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white">
                    {activeQuestion.title || 'Now the Music Round!'}
                  </h2>
                  {activeQuestion.subtitle && (
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {activeQuestion.subtitle}
                    </p>
                  )}
                  <div className="pt-2 text-xs text-purple-300 flex items-center justify-center md:justify-start gap-1.5 font-medium">
                    <span>💡 Host guidance: Players have no choices to submit during splash screens. Use this time to introduce the round, announce rules, or play audio. Click the button above when ready to launch questions.</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 font-mono text-xs font-bold">
                  QUESTION {currentQIndex + 1} OF {activeQuestions.length}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold flex items-center gap-1">
                  <AwardIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span>{activeQuestion.points !== undefined ? activeQuestion.points : 1000} pts</span>
                </span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">
                <EyeIcon className="w-4 h-4 text-amber-400" />
                <span>CONFIDENTIAL ANSWER KEY (ONLY HOST SEES THIS)</span>
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white">
              {activeQuestion.question}
            </h2>

            {/* Answer Options with SECRET HIGHLIGHT + PLAYER NAMES WHO PICKED EACH */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeQuestion.options.map((option, idx) => {
                const isCorrect = idx === activeQuestion.correctIndex;
                const votesCount = choiceTally[idx] || 0;
                const voters = choicePlayers[idx] || [];
                const shape = shapes[idx] || shapes[0];

                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border-2 flex flex-col justify-between transition-all ${
                      isCorrect
                        ? 'bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/30 text-white shadow-lg'
                        : 'bg-slate-950/80 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-mono font-bold ${shape.color}`}>{shape.symbol} {shape.label}</span>
                        <span className="font-bold text-sm">{option}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isCorrect && (
                          <span className="px-2 py-0.5 rounded-lg bg-emerald-500 text-slate-950 font-black text-[10px] uppercase tracking-wider">
                            CORRECT ✓
                          </span>
                        )}
                        <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-xs font-mono text-slate-300">
                          {votesCount} {votesCount === 1 ? 'vote' : 'votes'}
                        </span>
                      </div>
                    </div>

                    {/* Real-time player badges under this option */}
                    {voters.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                          Chosen by:
                        </span>
                        {voters.map((v) => (
                          <span
                            key={v.id}
                            className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${
                              isCorrect
                                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200'
                                : 'bg-rose-500/20 border-rose-500/40 text-rose-200'
                            }`}
                          >
                            {v.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Real-time Live Incoming Answers Feed */}
            <div className="mt-4 p-4 rounded-2xl bg-slate-950/90 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Incoming Answers Feed ({totalSubmitted} of {players.length} answered)
                </span>
                <span className="text-[11px] text-slate-500 font-mono">Real-time Firebase update</span>
              </div>

              {players.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No players in the room yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
                  {players.map((p) => {
                    const ans = p.answers?.[currentQIndex];
                    const hasAnswered = ans !== undefined && ans.choiceIndex !== undefined;
                    const choiceShape = hasAnswered ? shapes[ans.choiceIndex] : null;
                    const choiceText = hasAnswered ? activeQuestion.options[ans.choiceIndex] : '';
                    const isCorrect = hasAnswered && ans.choiceIndex === activeQuestion.correctIndex;

                    return (
                      <div
                        key={p.id}
                        className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 transition-all ${
                          hasAnswered
                            ? isCorrect
                              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-100'
                              : 'bg-rose-950/40 border-rose-500/40 text-rose-100'
                            : 'bg-slate-900/60 border-slate-800/80 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${hasAnswered ? (isCorrect ? 'bg-emerald-400' : 'bg-rose-400') : 'bg-amber-400 animate-ping'}`} />
                          <span className="font-bold text-white truncate">{p.name}</span>
                        </div>

                        {hasAnswered ? (
                          <div className="flex items-center gap-1.5 shrink-0 font-mono font-bold">
                            <span className={`px-1.5 py-0.5 rounded ${choiceShape?.bg} ${choiceShape?.color} border ${choiceShape?.border}`}>
                              {choiceShape?.symbol}
                            </span>
                            <span className="truncate max-w-[80px]" title={choiceText}>
                              {choiceText}
                            </span>
                            <span className={isCorrect ? 'text-emerald-400' : 'text-rose-400'}>
                              {isCorrect ? '✓' : '✗'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-amber-400/80 font-medium italic shrink-0">
                            Thinking...
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* SECRET HOST TRIVIA FACT */}
            {activeQuestion.secretNote && (
              <div className="p-4 rounded-2xl bg-purple-950/50 border border-purple-800/80 text-purple-200 text-xs flex items-start gap-3">
                <span className="px-2.5 py-1 rounded-lg bg-purple-700 text-white text-[10px] font-black uppercase shrink-0">
                  Host Trivia Fact
                </span>
                <p className="leading-relaxed text-purple-100">{activeQuestion.secretNote}</p>
              </div>
            )}
          </div>
          )
        )}

        {/* ======================================================== */}
        {/* PLAYERS IN ROOM TRACKER */}
        {/* ======================================================== */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <UsersIcon className="w-4 h-4 text-purple-400" />
              Players in Room ({players.length})
            </span>
            <span className="text-slate-500 font-mono">Live Firebase sync</span>
          </div>

          {players.length === 0 ? (
            <p className="text-slate-500 italic">No players have joined yet. Tell players to enter PIN {roomCode}.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {players.map((p) => {
                const hasAnswered = p.answers && p.answers[currentQIndex] !== undefined;
                return (
                  <div
                    key={p.id}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                      hasAnswered
                        ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                        : 'bg-slate-950 border-slate-800 text-slate-300'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${hasAnswered ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                    <span className="font-bold">{p.name}</span>
                    <span className="text-slate-500 text-[10px]">({p.score} pts)</span>
                    {hasAnswered && <span className="text-[10px] text-emerald-400 font-bold">✓ answered</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Footer Utility Bar */}
      <footer className="max-w-5xl mx-auto w-full pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div>
          Room Code: <code className="text-purple-400 font-mono font-bold">/rooms/{roomCode}</code>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetQuiz}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Reset to Lobby
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => setIsQuizMakerOpen(true)}
            className="text-purple-400 hover:text-purple-300 transition-colors cursor-pointer font-semibold"
          >
            Edit Questions in Quiz Maker
          </button>
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

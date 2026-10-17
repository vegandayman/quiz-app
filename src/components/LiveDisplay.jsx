import React, { useState, useEffect } from 'react';
import { ref, onValue, get } from 'firebase/database';
import { db } from '../firebase.js';

// Clean inline SVGs (zero external dependencies)
const UsersIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const SparklesIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3Z" />
  </svg>
);

const TrophyIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);

const TvIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="15" x="2" y="7" rx="2" ry="2" />
    <polyline points="17 2 12 7 7 2" />
  </svg>
);

const ArrowRightIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const LoaderIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={`${className} animate-spin`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="2" x2="12" y2="6" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
    <line x1="2" y1="12" x2="6" y2="12" />
    <line x1="18" y1="12" x2="22" y2="12" />
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
  </svg>
);

const CrownIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <polygon points="12 2 15 8 21 9 17 14 18 20 12 17 6 20 7 14 3 9 9 8 12 2" />
  </svg>
);

const shapes = [
  { symbol: '▲', name: 'Triangle', bg: 'bg-red-600', border: 'border-red-500', glow: 'shadow-red-600/30' },
  { symbol: '◆', name: 'Diamond', bg: 'bg-blue-600', border: 'border-blue-500', glow: 'shadow-blue-600/30' },
  { symbol: '●', name: 'Circle', bg: 'bg-amber-500', border: 'border-amber-400', glow: 'shadow-amber-500/30' },
  { symbol: '■', name: 'Square', bg: 'bg-emerald-600', border: 'border-emerald-500', glow: 'shadow-emerald-600/30' }
];

/**
 * LiveDisplay Component (Shared Big Screen / TV / Projector)
 * 
 * - Full capability to join or switch to a new room at any time
 * - Shows Lobby (Big PIN), Questions, Timer, Revealed Answers with Vote Distribution, and Leaderboard
 * - Celebratory Olympic Podium for the Finished game stage
 */
export default function LiveDisplay({ roomCode: initialRoomCode = '' }) {
  const getInitialPin = () => {
    if (initialRoomCode) return initialRoomCode;
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('pin') || '';
    }
    return '';
  };

  const [activeCode, setActiveCode] = useState(getInitialPin);
  const [inputCode, setInputCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [roomData, setRoomData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(20);

  // Sync if roomCode prop changes
  useEffect(() => {
    if (initialRoomCode) {
      setActiveCode(initialRoomCode);
    }
  }, [initialRoomCode]);

  // Connect handler using validated 4-digit PIN
  const handleConnectRoom = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmed = inputCode.trim();
    if (!trimmed || trimmed.length !== 4) {
      setErrorMessage('Please enter a valid 4-digit Room PIN.');
      return;
    }

    setIsVerifying(true);

    try {
      const roomRef = ref(db, `rooms/${trimmed}`);
      const snapshot = await get(roomRef);

      if (!snapshot.exists()) {
        setErrorMessage(`Room "${trimmed}" not found. Verify the PIN on the Host Console.`);
        setIsVerifying(false);
        return;
      }

      setActiveCode(trimmed);
      setIsVerifying(false);
    } catch (err) {
      console.error('Error verifying room:', err);
      setErrorMessage(err.message || 'Failed to connect to Firebase.');
      setIsVerifying(false);
    }
  };

  // Switch room / join new room handler
  const handleSwitchRoom = () => {
    setActiveCode('');
    setInputCode('');
    setRoomData(null);
    setErrorMessage('');
  };

  // Real-time listener for the room state
  useEffect(() => {
    if (!activeCode) return;

    const roomRef = ref(db, `rooms/${activeCode}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      setRoomData(data);
    });

    return () => unsubscribe();
  }, [activeCode]);

  // Countdown timer effect
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

  // ----------------------------------------------------
  // PIN ENTRY SCREEN (Join New Room)
  // ----------------------------------------------------
  if (!activeCode) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between items-center p-6 sm:p-10 font-sans">
        <header className="flex items-center gap-2 pt-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-md shadow-purple-500/30">
            <SparklesIcon className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-lg font-black tracking-tight text-white">QuizPulse LIVE</h1>
        </header>

        <main className="w-full max-w-md my-auto">
          <div className="w-full bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="text-center mb-6">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-purple-400 mb-3 shadow">
                <TvIcon className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black tracking-tight text-white">
                Live Room Display
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter the 4-digit PIN generated on the Host Console
              </p>
            </div>

            <form onSubmit={handleConnectRoom} className="space-y-4">
              <div>
                <label htmlFor="roomPinInput" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 text-left">
                  Game PIN
                </label>
                <input
                  id="roomPinInput"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 4921"
                  disabled={isVerifying}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white font-mono text-center text-2xl font-bold tracking-widest placeholder:text-slate-600 transition-all outline-none"
                  autoComplete="off"
                  required
                />
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-950/50 border border-rose-800/80 rounded-xl text-rose-300 text-xs text-left leading-relaxed animate-in fade-in duration-200">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isVerifying || inputCode.length !== 4}
                className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg mt-2 ${
                  isVerifying || inputCode.length !== 4
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/30 hover:scale-[1.01] active:scale-95'
                }`}
              >
                {isVerifying ? (
                  <>
                    <LoaderIcon className="w-4 h-4 text-white" />
                    <span>Connecting Display...</span>
                  </>
                ) : (
                  <>
                    <span>Connect Big Screen</span>
                    <ArrowRightIcon className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </main>

        <footer className="w-full max-w-md text-center py-2 text-xs text-slate-600">
          QuizPulse TV & Projector Screen
        </footer>
      </div>
    );
  }

  // ----------------------------------------------------
  // ROOM CLOSED STATE (When host generates new PIN)
  // ----------------------------------------------------
  if (roomData?.status === 'closed') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-4">
            <TvIcon className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Room Closed</h2>
          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            The host has closed this room or generated a new PIN. Connect to the new room to resume live display.
          </p>
          <button
            type="button"
            onClick={handleSwitchRoom}
            className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 cursor-pointer transition-all"
          >
            Connect to New Room PIN
          </button>
        </div>
      </div>
    );
  }

  const rawPlayers = roomData?.players || {};
  const players = Object.entries(rawPlayers).map(([id, p]) => ({
    id,
    name: typeof p === 'object' ? p.name : p,
    score: typeof p === 'object' ? p.score || 0 : 0,
    answers: typeof p === 'object' ? p.answers || {} : {}
  }));

  const currentQIndex = roomData?.currentQuestionIndex || 0;
  const currentQuestion = roomData?.questions?.[currentQIndex] || null;

  // Answers tally per option
  const choiceTally = [0, 0, 0, 0];
  let totalAnswersSubmitted = 0;

  players.forEach((p) => {
    const ans = p.answers?.[currentQIndex];
    if (ans !== undefined && ans.choiceIndex !== undefined) {
      choiceTally[ans.choiceIndex] = (choiceTally[ans.choiceIndex] || 0) + 1;
      totalAnswersSubmitted++;
    }
  });

  // ----------------------------------------------------
  // 1. LOBBY VIEW
  // ----------------------------------------------------
  if (!roomData || roomData.status === 'lobby') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-6 sm:p-12 font-sans overflow-hidden">
        <header className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <SparklesIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white">QuizPulse LIVE</h1>
              <p className="text-xs uppercase tracking-widest text-purple-400 font-bold">Room Display</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-slate-900 border border-slate-800 text-slate-200">
              <UsersIcon className="w-5 h-5 text-purple-400" />
              <span className="text-lg font-bold">
                {players.length} {players.length === 1 ? 'Player' : 'Players'} Joined
              </span>
            </div>

            <button
              type="button"
              onClick={handleSwitchRoom}
              className="text-xs text-slate-400 hover:text-white transition-colors px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer font-semibold"
            >
              Switch Room / Change PIN
            </button>
          </div>
        </header>

        <main className="my-auto text-center flex flex-col items-center">
          <p className="text-lg sm:text-2xl font-bold uppercase tracking-widest text-purple-400 mb-3">
            Join on your phone with Game PIN
          </p>

          <div className="py-6 px-12 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md">
            <span className="text-7xl sm:text-9xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 drop-shadow-[0_15px_30px_rgba(168,85,247,0.4)]">
              {activeCode}
            </span>
          </div>

          <div className="w-full max-w-5xl mt-12">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center justify-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              Players in the Lobby
            </h2>

            {players.length === 0 ? (
              <p className="text-slate-500 text-lg animate-pulse">Waiting for players to enter PIN...</p>
            ) : (
              <div className="flex flex-wrap justify-center gap-3 max-h-56 overflow-y-auto p-2">
                {players.map((player, idx) => (
                  <div
                    key={player.id || idx}
                    className="px-5 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-base font-bold text-slate-100 shadow-lg animate-in zoom-in-95 duration-200 flex items-center gap-2"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                    <span>{player.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        <footer className="text-center text-slate-500 text-sm">
          Quiz Master will start the game shortly
        </footer>
      </div>
    );
  }

  // ----------------------------------------------------
  // 2. SPLASH SCREEN VIEW (Intermission / Round Announcement)
  // ----------------------------------------------------
  if (roomData.status === 'splash') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-6 sm:p-12 font-sans relative overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <header className="flex items-center justify-between border-b border-slate-800 pb-4 relative z-10">
          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              Round Announcement
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Slide {currentQIndex + 1} of {roomData.questions?.length || 1}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold">
              <UsersIcon className="w-4 h-4 text-purple-400" />
              <span>{players.length} Players Connected</span>
            </div>

            <button
              type="button"
              onClick={handleSwitchRoom}
              className="text-xs text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer"
            >
              Switch Room
            </button>
          </div>
        </header>

        {/* Main Splash Centerstage */}
        <main className="my-auto w-full max-w-4xl mx-auto flex flex-col items-center text-center relative z-10 py-6">
          <div className="inline-block mb-4">
            <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-pink-500/20 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold uppercase tracking-widest shadow-lg">
              Next Up
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-purple-200 drop-shadow-[0_10px_35px_rgba(245,158,11,0.25)] mb-4 leading-tight">
            {currentQuestion?.title || 'Now the Music Round!'}
          </h1>

          {currentQuestion?.subtitle && (
            <p className="text-lg sm:text-2xl text-slate-300 font-medium max-w-2xl mx-auto mb-8 leading-relaxed">
              {currentQuestion.subtitle}
            </p>
          )}

          {currentQuestion?.imageUrl && (
            <div className="relative max-w-xl w-full mx-auto rounded-3xl overflow-hidden border-2 border-purple-500/40 shadow-2xl shadow-purple-900/50 bg-slate-900/80 my-2">
              <img
                src={currentQuestion.imageUrl}
                alt={currentQuestion.title || 'Splash banner'}
                className="w-full max-h-[380px] sm:max-h-[440px] object-cover object-center"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
        </main>

        {/* Bottom Banner */}
        <footer className="text-center text-slate-400 text-xs relative z-10 flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          <span>Quiz Master will begin the round shortly...</span>
        </footer>
      </div>
    );
  }

  // ----------------------------------------------------
  // 3. QUESTION & REVEAL VIEW
  // ----------------------------------------------------
  if (roomData.status === 'question' || roomData.status === 'reveal') {
    const isReveal = roomData.status === 'reveal';

    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-6 sm:p-10 font-sans">
        <header className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1.5 rounded-xl bg-purple-900/60 border border-purple-700 text-purple-200 text-sm font-bold">
              Question {currentQIndex + 1} of {roomData.questions?.length || 1}
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold">
              {currentQuestion?.points !== undefined && currentQuestion.points !== '' ? currentQuestion.points : 1} {Number(currentQuestion?.points ?? 1) === 1 ? 'pt' : 'pts'}
            </span>
          </div>

          {!isReveal ? (
            <div className="w-16 h-16 rounded-full bg-slate-900 border-2 border-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <span className={`text-2xl font-black ${timeLeft <= 5 ? 'text-rose-400 animate-ping' : 'text-purple-300'}`}>
                {timeLeft}
              </span>
            </div>
          ) : (
            <div className="px-5 py-2 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-300 font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/20">
              ✓ Answers Revealed
            </div>
          )}

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">Answers</p>
              <p className="text-xl font-black text-slate-100">{totalAnswersSubmitted} / {players.length}</p>
            </div>

            <button
              type="button"
              onClick={handleSwitchRoom}
              className="text-xs text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer"
            >
              Switch Room
            </button>
          </div>
        </header>

        <main className="my-auto w-full max-w-5xl mx-auto flex flex-col items-center">
          <div className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center shadow-2xl mb-8">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-snug">
              {currentQuestion?.question || 'Get ready...'}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            {currentQuestion?.options?.map((option, idx) => {
              const shape = shapes[idx % shapes.length];
              const isCorrectAnswer = isReveal && idx === currentQuestion.correctIndex;
              const votes = choiceTally[idx] || 0;

              return (
                <div
                  key={idx}
                  className={`p-6 sm:p-8 rounded-2xl flex items-center justify-between gap-4 transition-all duration-300 border-2 ${shape.border} ${shape.bg} ${shape.glow} ${
                    isReveal
                      ? isCorrectAnswer
                        ? 'scale-[1.03] ring-4 ring-emerald-400 shadow-2xl opacity-100'
                        : 'opacity-40 grayscale-[40%]'
                      : 'opacity-100'
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <span className="w-10 h-10 rounded-xl bg-black/25 flex items-center justify-center text-xl font-black text-white shrink-0">
                      {shape.symbol}
                    </span>
                    <span className="text-xl sm:text-2xl font-bold text-white text-left">
                      {option}
                    </span>
                  </div>

                  {/* Reveal Badges & Vote Counts */}
                  {isReveal && (
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-3 py-1 rounded-xl bg-black/30 backdrop-blur text-white text-xs font-mono font-bold">
                        {votes} {votes === 1 ? 'vote' : 'votes'}
                      </span>
                      {isCorrectAnswer && (
                        <span className="px-3 py-1 rounded-xl bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow">
                          Correct ✓
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </main>

        <footer className="text-center text-slate-500 text-xs">
          QuizPulse Live Room Projection
        </footer>
      </div>
    );
  }

  // ----------------------------------------------------
  // 3. LEADERBOARD VIEW
  // ----------------------------------------------------
  if (roomData.status === 'leaderboard') {
    const rankedPlayers = [...players].sort((a, b) => b.score - a.score);

    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-6 sm:p-12 font-sans">
        <header className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <TrophyIcon className="w-8 h-8 text-amber-400" />
            <div>
              <h1 className="text-2xl font-black text-white">Current Leaderboard</h1>
              <p className="text-xs text-slate-400">Question {currentQIndex + 1} Standings</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-mono text-purple-400">Room {activeCode}</span>
            <button
              type="button"
              onClick={handleSwitchRoom}
              className="text-xs text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer"
            >
              Switch Room
            </button>
          </div>
        </header>

        <main className="my-auto max-w-3xl mx-auto w-full space-y-3">
          {rankedPlayers.slice(0, 5).map((player, index) => {
            const podiumMedal =
              index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;

            return (
              <div
                key={player.id}
                className={`flex items-center justify-between p-4 sm:p-5 rounded-2xl border transition-all ${
                  index === 0
                    ? 'bg-gradient-to-r from-amber-500/20 to-purple-600/20 border-amber-500/50 scale-[1.02] shadow-xl'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold w-10 text-center">{podiumMedal}</span>
                  <span className="text-lg sm:text-xl font-bold text-slate-100">{player.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-xl sm:text-2xl font-black text-purple-400">{player.score}</span>
                  <span className="text-xs text-slate-500 ml-1">pts</span>
                </div>
              </div>
            );
          })}
        </main>

        <footer className="text-center text-slate-500 text-xs">
          Waiting for host to advance to the next round...
        </footer>
      </div>
    );
  }

  // ----------------------------------------------------
  // 4. FINISHED / OLYMPIC PODIUM VIEW
  // ----------------------------------------------------
  if (roomData.status === 'finished') {
    const rankedPlayers = [...players].sort((a, b) => b.score - a.score);
    const first = rankedPlayers[0];
    const second = rankedPlayers[1];
    const third = rankedPlayers[2];
    const runnersUp = rankedPlayers.slice(3, 8);

    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-6 sm:p-10 font-sans relative overflow-hidden">
        {/* Celebration Ambient Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        <header className="flex items-center justify-between border-b border-slate-800 pb-4 relative z-10">
          <div className="flex items-center gap-3">
            <TrophyIcon className="w-8 h-8 text-amber-400" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500">
                Final Winner Podium!
              </h1>
              <p className="text-xs text-slate-400">Quiz Completed</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSwitchRoom}
            className="text-xs text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer"
          >
            Switch Room
          </button>
        </header>

        {/* Podium Stage */}
        <main className="my-auto max-w-4xl mx-auto w-full relative z-10 py-6">
          <div className="flex items-end justify-center gap-4 sm:gap-6 mb-8">
            
            {/* 2nd Place (Silver - Left) */}
            {second && (
              <div className="flex flex-col items-center flex-1 max-w-[200px]">
                <div className="mb-2 text-center">
                  <span className="text-2xl sm:text-3xl">🥈</span>
                  <p className="font-black text-slate-200 text-sm sm:text-base truncate max-w-[150px]">{second.name}</p>
                  <p className="text-xs font-mono font-bold text-slate-400">{second.score} pts</p>
                </div>
                <div className="w-full h-36 sm:h-44 rounded-t-2xl bg-gradient-to-t from-slate-800 to-slate-700 border-t-2 border-slate-400 shadow-xl flex items-center justify-center">
                  <span className="text-3xl sm:text-5xl font-black text-slate-400">2</span>
                </div>
              </div>
            )}

            {/* 1st Place (Gold - Center) */}
            {first && (
              <div className="flex flex-col items-center flex-1 max-w-[220px]">
                <div className="mb-2 text-center">
                  <CrownIcon className="w-8 h-8 text-amber-400 mx-auto animate-bounce" />
                  <p className="font-black text-amber-300 text-base sm:text-xl truncate max-w-[180px]">{first.name}</p>
                  <p className="text-xs sm:text-sm font-mono font-black text-amber-400">{first.score} pts</p>
                </div>
                <div className="w-full h-48 sm:h-60 rounded-t-2xl bg-gradient-to-t from-amber-700 via-amber-600 to-yellow-500 border-t-4 border-yellow-300 shadow-2xl shadow-amber-500/30 flex items-center justify-center">
                  <span className="text-4xl sm:text-7xl font-black text-slate-950">1</span>
                </div>
              </div>
            )}

            {/* 3rd Place (Bronze - Right) */}
            {third && (
              <div className="flex flex-col items-center flex-1 max-w-[200px]">
                <div className="mb-2 text-center">
                  <span className="text-2xl sm:text-3xl">🥉</span>
                  <p className="font-black text-amber-200 text-sm sm:text-base truncate max-w-[150px]">{third.name}</p>
                  <p className="text-xs font-mono font-bold text-amber-300/80">{third.score} pts</p>
                </div>
                <div className="w-full h-28 sm:h-32 rounded-t-2xl bg-gradient-to-t from-amber-900 to-amber-800 border-t-2 border-amber-600 shadow-xl flex items-center justify-center">
                  <span className="text-2xl sm:text-4xl font-black text-amber-600">3</span>
                </div>
              </div>
            )}
          </div>

          {/* Runners-up List */}
          {runnersUp.length > 0 && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 max-w-lg mx-auto">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block text-center mb-2">
                Honorable Mentions
              </span>
              <div className="flex flex-wrap justify-center gap-3">
                {runnersUp.map((p, idx) => (
                  <div key={p.id} className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center gap-2">
                    <span className="text-slate-500 font-mono">#{idx + 4}</span>
                    <span className="font-bold text-slate-200">{p.name}</span>
                    <span className="text-purple-400 font-mono font-semibold">{p.score} pts</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        <footer className="text-center text-slate-500 text-xs relative z-10">
          Quiz complete! Host can restart or start a new quiz anytime.
        </footer>
      </div>
    );
  }

  return null;
}

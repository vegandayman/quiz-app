import React, { useState, useEffect } from 'react';
import { ref, get, set, push, onValue, update } from 'firebase/database';
import { db } from '../firebase.js';

// Clean inline SVGs (zero external dependencies)
const GamepadIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="6" x2="10" y1="12" y2="12" />
    <line x1="8" x2="8" y1="10" y2="14" />
    <line x1="15" x2="15.01" y1="13" y2="13" />
    <line x1="18" x2="18.01" y1="11" y2="11" />
    <rect width="20" height="12" x="2" y="6" rx="6" />
  </svg>
);

const CheckCircleIcon = ({ className = 'w-8 h-8' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const XCircleIcon = ({ className = 'w-8 h-8' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

const LoaderIcon = ({ className = 'w-5 h-5' }) => (
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

const answerButtons = [
  { symbol: '▲', label: 'Triangle', bg: 'bg-red-600 hover:bg-red-500 active:bg-red-700', border: 'border-red-500' },
  { symbol: '◆', label: 'Diamond', bg: 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700', border: 'border-blue-500' },
  { symbol: '●', label: 'Circle', bg: 'bg-amber-500 hover:bg-amber-400 active:bg-amber-600', border: 'border-amber-400' },
  { symbol: '■', label: 'Square', bg: 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700', border: 'border-emerald-500' }
];

/**
 * PlayerJoin Component
 * 
 * - Handles entering 4-digit PIN and nickname
 * - Live synchronized answering on player mobile screen
 * - Real-time countdown timer bar
 * - Dynamic score calculation based on question points and speed bonus
 * - Dynamic feedback for Reveal, Leaderboard, and Final Winner Podium
 */
export default function PlayerJoin({ initialRoomCode = '' }) {
  const getInitialPin = () => {
    if (initialRoomCode) return initialRoomCode;
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('pin') || '';
    }
    return '';
  };

  const [roomCode, setRoomCode] = useState(getInitialPin);
  const [playerName, setPlayerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Player session state
  const [isJoined, setIsJoined] = useState(false);
  const [joinedRoomCode, setJoinedRoomCode] = useState('');
  const [currentPlayerId, setCurrentPlayerId] = useState('');
  const [roomData, setRoomData] = useState(null);
  const [myAnswer, setMyAnswer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(20);

  // Sync if prop changes externally
  useEffect(() => {
    if (initialRoomCode && !isJoined) {
      setRoomCode(initialRoomCode);
    }
  }, [initialRoomCode, isJoined]);

  // Join Room Form Handler
  const handleJoinRoom = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedCode = roomCode.trim();
    const trimmedName = playerName.trim();

    if (!trimmedCode || trimmedCode.length !== 4) {
      setErrorMessage('Please enter a valid 4-digit Room PIN.');
      return;
    }

    if (!trimmedName) {
      setErrorMessage('Please enter your nickname.');
      return;
    }

    setIsLoading(true);

    const withTimeout = (promise, ms = 6000) => {
      return Promise.race([
        promise,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Connection timed out. Please verify the Room PIN and network connection.')), ms)
        )
      ]);
    };

    try {
      const roomRef = ref(db, `rooms/${trimmedCode}`);
      const snapshot = await withTimeout(get(roomRef));

      if (!snapshot.exists()) {
        setErrorMessage(`Room "${trimmedCode}" not found. Verify PIN with the host.`);
        setIsLoading(false);
        return;
      }

      const data = snapshot.val();

      if (data.status === 'closed') {
        setErrorMessage('This room has been closed. Please ask the host for the new Room PIN.');
        setIsLoading(false);
        return;
      }

      if (data.status !== 'lobby') {
        setErrorMessage('This game has already started. You cannot join now.');
        setIsLoading(false);
        return;
      }

      // Add player to rooms/{roomCode}/players/{playerId}
      const playersListRef = ref(db, `rooms/${trimmedCode}/players`);
      const newPlayerRef = push(playersListRef);
      const generatedPlayerId = newPlayerRef.key;

      await withTimeout(set(newPlayerRef, {
        id: generatedPlayerId,
        name: trimmedName,
        score: 0,
        joinedAt: Date.now()
      }));

      setCurrentPlayerId(generatedPlayerId);
      setJoinedRoomCode(trimmedCode);
      setIsJoined(true);
      setIsLoading(false);
    } catch (err) {
      console.error('Error joining room in Firebase:', err);
      setErrorMessage(err.message || 'Failed to connect to Firebase.');
      setIsLoading(false);
    }
  };

  // Leave / Join New Room Action
  const handleLeaveAndJoinNew = () => {
    setIsJoined(false);
    setJoinedRoomCode('');
    setCurrentPlayerId('');
    setMyAnswer(null);
    setRoomData(null);
    setRoomCode('');
    setErrorMessage('');
  };

  // Real-time listener for room updates once joined
  useEffect(() => {
    if (!isJoined || !joinedRoomCode) return;

    const roomRef = ref(db, `rooms/${joinedRoomCode}`);

    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      setRoomData(data);

      const qIndex = data.currentQuestionIndex || 0;
      const myAnswers = data.players?.[currentPlayerId]?.answers;
      if (myAnswers && myAnswers[qIndex] !== undefined) {
        setMyAnswer(myAnswers[qIndex].choiceIndex);
      } else {
        setMyAnswer(null);
      }
    });

    return () => unsubscribe();
  }, [isJoined, joinedRoomCode, currentPlayerId]);

  // Countdown timer effect on player phone
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

  // Handle Player Tapping an Answer Button with speed-based Kahoot scoring and custom question points
  const handleSelectAnswer = async (choiceIndex) => {
    if (myAnswer !== null || !roomData || timeLeft <= 0) return;

    const currentQIndex = roomData.currentQuestionIndex || 0;
    const currentQ = roomData.questions?.[currentQIndex];
    const isCorrect = choiceIndex === currentQ?.correctIndex;

    // Use custom question points (defaults to 1000 if not specified in editor)
    const maxPoints = currentQ?.points !== undefined ? currentQ.points : 1000;
    const timeLimit = roomData.timeLimit || currentQ?.timeLimit || 20;
    const startTime = roomData.questionStartTime || Date.now();
    const timeElapsedSec = Math.max(0, (Date.now() - startTime) / 1000);
    const speedRatio = Math.max(0, Math.min(1, 1 - (timeElapsedSec / timeLimit) / 2));
    const pointsAwarded = isCorrect ? Math.round(maxPoints * speedRatio) : 0;

    setMyAnswer(choiceIndex);

    const currentScore = roomData.players?.[currentPlayerId]?.score || 0;
    const playerRef = ref(db, `rooms/${joinedRoomCode}/players/${currentPlayerId}`);

    await update(playerRef, {
      score: currentScore + pointsAwarded,
      [`answers/${currentQIndex}`]: {
        choiceIndex,
        choiceText: currentQ?.options?.[choiceIndex] || '',
        isCorrect,
        pointsAwarded,
        timeElapsedSec: parseFloat(timeElapsedSec.toFixed(1)),
        answeredAt: Date.now()
      }
    });
  };

  const status = roomData?.status || 'lobby';
  const currentQIndex = roomData?.currentQuestionIndex || 0;
  const currentQuestion = roomData?.questions?.[currentQIndex];
  const myPlayerObj = roomData?.players?.[currentPlayerId];
  const lastAnswerObj = myPlayerObj?.answers?.[currentQIndex];

  // Compute rankings
  const rawPlayers = roomData?.players || {};
  const sortedPlayers = Object.entries(rawPlayers)
    .map(([id, p]) => ({
      id,
      name: typeof p === 'object' ? p.name : p,
      score: typeof p === 'object' ? p.score || 0 : 0
    }))
    .sort((a, b) => b.score - a.score);

  const myRank = sortedPlayers.findIndex((p) => p.id === currentPlayerId) + 1;

  // ----------------------------------------------------
  // VIEW: Joined Player Screen
  // ----------------------------------------------------
  if (isJoined) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4 sm:p-6 font-sans">
        {/* Top Mini Bar with Switch Room Button */}
        <header className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-slate-200">{playerName}</span>
            <span className="text-[10px] text-slate-400 font-mono bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">
              PIN: {joinedRoomCode}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs font-mono text-purple-400 font-bold">
              {myPlayerObj?.score || 0} pts
            </div>

            <button
              type="button"
              onClick={handleLeaveAndJoinNew}
              className="text-[11px] text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 bg-slate-900 px-2.5 py-1 rounded-lg cursor-pointer transition-colors"
            >
              Switch Room
            </button>
          </div>
        </header>

        {/* NOTICE: ROOM CLOSED BY HOST */}
        {status === 'closed' && (
          <main className="my-auto text-center flex flex-col items-center">
            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 max-w-sm w-full shadow-2xl">
              <h2 className="text-xl font-black text-white mb-2">Room Closed</h2>
              <p className="text-xs text-slate-400 leading-relaxed mb-5">
                The host has closed this room or generated a new PIN.
              </p>
              <button
                type="button"
                onClick={handleLeaveAndJoinNew}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-lg shadow-purple-600/30"
              >
                Join New Room
              </button>
            </div>
          </main>
        )}

        {/* 1. LOBBY WAITING SCREEN */}
        {status === 'lobby' && (
          <main className="my-auto text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-2xl font-black text-purple-300 mb-4 shadow-lg shadow-purple-500/20">
              {playerName.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-2xl font-black text-white mb-1">You're in!</h2>
            <p className="text-xs text-slate-400 mb-6">See your name on the live display screen?</p>
            <div className="px-5 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Waiting for quiz master to start...</span>
            </div>
          </main>
        )}

        {/* 2. QUESTION SCREEN */}
        {status === 'question' && (
          <main className="my-auto w-full max-w-md mx-auto flex flex-col items-center">
            {/* Header: Question Number, Points Value & Live Timer Bar */}
            <div className="w-full flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold uppercase tracking-wider text-purple-400">
                  Question {currentQIndex + 1}
                </p>
                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-[10px] font-mono text-amber-300 font-bold">
                  {currentQuestion?.points !== undefined ? currentQuestion.points : 1000} pts
                </span>
              </div>
              <span className={`text-xs font-mono font-bold ${timeLeft <= 5 ? 'text-rose-400 animate-ping' : 'text-slate-400'}`}>
                {timeLeft}s
              </span>
            </div>

            {/* Timer Progress Bar */}
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden mb-4 border border-slate-800">
              <div
                className={`h-full transition-all duration-500 ${
                  timeLeft <= 5 ? 'bg-rose-500' : 'bg-gradient-to-r from-purple-500 to-indigo-500'
                }`}
                style={{ width: `${Math.max(0, Math.min(100, (timeLeft / (roomData?.timeLimit || 20)) * 100))}%` }}
              />
            </div>

            {myAnswer === null ? (
              timeLeft > 0 ? (
                <div className="grid grid-cols-2 gap-3 w-full h-80 sm:h-96">
                  {answerButtons.map((btn, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectAnswer(idx)}
                      className={`${btn.bg} ${btn.border} border-2 rounded-2xl flex flex-col items-center justify-center gap-2 text-white shadow-xl cursor-pointer transition-transform active:scale-95`}
                    >
                      <span className="text-5xl font-black">{btn.symbol}</span>
                      <span className="text-xs font-bold uppercase opacity-80">{btn.label}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-12 px-6 rounded-3xl bg-slate-900 border border-slate-800 text-center w-full shadow-2xl">
                  <div className="w-16 h-16 mx-auto rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-4">
                    <XCircleIcon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black text-white">Time's Up!</h3>
                  <p className="text-xs text-slate-400 mt-2">
                    Look up at the live display screen for the results...
                  </p>
                </div>
              )
            ) : (
              <div className="py-12 px-6 rounded-3xl bg-slate-900 border border-slate-800 text-center w-full shadow-2xl">
                <div className="w-16 h-16 mx-auto rounded-full bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 mb-4">
                  <CheckCircleIcon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-white">Answer Locked In!</h3>
                <p className="text-xs text-slate-300 mt-1">
                  You selected <strong className="text-purple-300">{answerButtons[myAnswer]?.symbol} {answerButtons[myAnswer]?.label}</strong>
                </p>
                <p className="text-xs text-slate-500 mt-3">
                  Look up at the big screen for results...
                </p>
              </div>
            )}
          </main>
        )}

        {/* 3. REVEAL / SCORE SCREEN */}
        {status === 'reveal' && (
          <main className="my-auto text-center flex flex-col items-center">
            {myAnswer === currentQuestion?.correctIndex ? (
              <div className="p-8 rounded-3xl bg-emerald-950/60 border border-emerald-500/60 shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200">
                <CheckCircleIcon className="w-16 h-16 text-emerald-400 mx-auto mb-3" />
                <h2 className="text-2xl font-black text-white">Correct!</h2>
                <p className="text-lg font-black text-emerald-400 mt-1">
                  +{lastAnswerObj?.pointsAwarded ?? (currentQuestion?.points || 1000)} Points
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  Total Score: <span className="text-purple-300 font-mono font-bold">{myPlayerObj?.score || 0} pts</span>
                </p>
              </div>
            ) : myAnswer !== null ? (
              <div className="p-8 rounded-3xl bg-rose-950/60 border border-rose-500/60 shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200">
                <XCircleIcon className="w-16 h-16 text-rose-400 mx-auto mb-3" />
                <h2 className="text-2xl font-black text-white">Incorrect!</h2>
                <p className="text-xs text-rose-300 mt-1">Keep going, next question is coming!</p>
                <p className="text-xs text-slate-400 mt-2">
                  Total Score: <span className="text-purple-300 font-mono font-bold">{myPlayerObj?.score || 0} pts</span>
                </p>
              </div>
            ) : (
              <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl max-w-sm w-full">
                <div className="w-14 h-14 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
                  <XCircleIcon className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-black text-white">No Answer</h2>
                <p className="text-xs text-slate-400 mt-1">You didn't submit an answer in time.</p>
              </div>
            )}
          </main>
        )}

        {/* 4. LEADERBOARD SCREEN */}
        {status === 'leaderboard' && (
          <main className="my-auto text-center flex flex-col items-center">
            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 max-w-sm w-full shadow-2xl">
              <TrophyIcon className="w-12 h-12 text-amber-400 mx-auto mb-3" />
              <h2 className="text-xl font-black text-white mb-1">
                You are in {myRank === 1 ? '🥇 1st' : myRank === 2 ? '🥈 2nd' : myRank === 3 ? '🥉 3rd' : `#${myRank}`} Place!
              </h2>
              <p className="text-xs text-slate-400 mb-5">
                {myRank === 1 ? 'Outstanding! Holding the top spot!' : 'Look up at the live screen to view the full scoreboard!'}
              </p>
              <div className="px-6 py-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-xs text-slate-500 uppercase font-bold">Your Total Score</span>
                <p className="text-3xl font-black text-purple-400 mt-1">{myPlayerObj?.score || 0} pts</p>
              </div>
            </div>
          </main>
        )}

        {/* 5. FINISHED / FINAL WINNER PODIUM */}
        {status === 'finished' && (
          <main className="my-auto text-center flex flex-col items-center">
            <div className="p-8 rounded-3xl bg-gradient-to-b from-purple-950/40 to-slate-900 border-2 border-purple-500/40 max-w-sm w-full shadow-2xl">
              <span className="text-4xl block mb-2">
                {myRank === 1 ? '👑' : myRank === 2 ? '🥈' : myRank === 3 ? '🥉' : '🎉'}
              </span>
              <h2 className="text-2xl font-black text-white mb-1">
                {myRank === 1 ? 'CHAMPION!' : `Finished #${myRank}!`}
              </h2>
              <p className="text-xs text-slate-300 mb-6">
                {myRank <= 3 ? 'You made it onto the final podium!' : 'Great game! Thanks for playing!'}
              </p>
              <div className="px-6 py-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-xs text-slate-500 uppercase font-bold">Final Score</span>
                <p className="text-3xl font-black text-amber-400 mt-1">{myPlayerObj?.score || 0} pts</p>
              </div>
            </div>
          </main>
        )}

        <footer className="text-center text-slate-600 text-[11px] py-1">
          QuizPulse Player Controller
        </footer>
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW: Join Form (Enter PIN & Nickname)
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between items-center p-6 font-sans">
      <header className="flex items-center gap-2 pt-2">
        <SparklesIcon className="w-5 h-5 text-purple-400" />
        <h1 className="text-lg font-black text-white">QuizPulse</h1>
      </header>

      <main className="w-full max-w-md my-auto">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-800 flex items-center justify-center text-purple-400 mb-2">
              <GamepadIcon className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-white">Join Quiz</h2>
            <p className="text-xs text-slate-400">Enter the 4-digit PIN on the live display</p>
          </div>

          <form onSubmit={handleJoinRoom} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Game PIN</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 4921"
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-center text-2xl font-mono font-bold tracking-widest text-white outline-none focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Nickname</label>
              <input
                type="text"
                maxLength={18}
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="e.g. Alex"
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold outline-none focus:border-purple-500"
                required
              />
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-950/50 border border-rose-800 text-rose-300 text-xs rounded-xl">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !roomCode || !playerName}
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-bold rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? <LoaderIcon className="w-4 h-4" /> : <span>Enter Game</span>}
            </button>
          </form>
        </div>
      </main>

      <footer className="text-slate-600 text-xs">QuizPulse Realtime Multiplayer</footer>
    </div>
  );
}

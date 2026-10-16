import React, { useState, useEffect } from 'react';
import { ref, onValue, update, get } from 'firebase/database';
import { db } from '../firebase.js';

// Clean inline SVGs (no external icon dependencies required)
const UsersIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const CopyIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
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

const SparklesIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
  </svg>
);

const AlertTriangleIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

/**
 * HostLobby Component
 * 
 * - Generates stable 4-digit numeric room code
 * - Creates room at `/rooms/{roomCode}` in Firebase Realtime Database without wiping players
 * - Listens in real-time to `/rooms/{roomCode}/players` with StrictMode-resilient listener
 * - Renders live grid of joined players
 */
export default function HostLobby({ onStartGame }) {
  // Generate code once on initial state creation so it remains stable across re-renders
  const [roomCode] = useState(() => Math.floor(1000 + Math.random() * 9000).toString());
  const [players, setPlayers] = useState([]);
  const [syncStatus, setSyncStatus] = useState('connecting');
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);

  // 1. Initialize room in Firebase Realtime Database
  useEffect(() => {
    if (!roomCode) return;

    const roomRef = ref(db, `rooms/${roomCode}`);

    // Use update() so we never overwrite an existing players collection
    update(roomRef, {
      roomCode: roomCode,
      status: 'lobby',
      createdAt: Date.now()
    })
      .then(() => {
        setSyncStatus('connected');
        setErrorMessage('');
      })
      .catch((err) => {
        console.error('Firebase Realtime Database Error:', err);
        setSyncStatus('error');
        setErrorMessage(
          err.message?.includes('PERMISSION_DENIED')
            ? 'Firebase Permission Denied: In Firebase Console -> Realtime Database -> Rules, set ".read": true, ".write": true for development.'
            : `Firebase error: ${err.message || 'Unable to connect to database'}`
        );
      });
  }, [roomCode]);

  // 2. Real-time listener for players: Resilient to React 18/19 StrictMode remounts
  useEffect(() => {
    if (!roomCode) return;

    const playersRef = ref(db, `rooms/${roomCode}/players`);

    // onValue returns a dedicated unsubscribe function
    const unsubscribe = onValue(
      playersRef,
      (snapshot) => {
        const data = snapshot.val();
        console.log('[HostLobby] Real-time players update received:', data);

        if (!data) {
          setPlayers([]);
          return;
        }

        let playersList = [];
        if (Array.isArray(data)) {
          playersList = data
            .map((item, idx) => {
              if (!item) return null;
              return typeof item === 'string'
                ? { id: `player-${idx}`, name: item }
                : { id: item.id || `player-${idx}`, name: item.name || 'Anonymous' };
            })
            .filter(Boolean);
        } else if (typeof data === 'object') {
          playersList = Object.entries(data).map(([key, value]) => {
            if (typeof value === 'string') {
              return { id: key, name: value };
            }
            return {
              id: key,
              name: value.name || 'Anonymous',
              score: value.score || 0
            };
          });
        }

        setPlayers(playersList);
      },
      (err) => {
        console.error('[HostLobby] Error listening to players list:', err);
      }
    );

    // Return the unsubscribe function cleanly
    return () => {
      unsubscribe();
    };
  }, [roomCode]);

  const handleCopyCode = async () => {
    if (!roomCode) return;
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const avatarColors = [
    'from-red-500 to-pink-500',
    'from-purple-500 to-indigo-500',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-500',
    'from-amber-500 to-orange-500',
    'from-rose-500 to-red-600',
    'from-fuchsia-500 to-purple-600',
    'from-lime-500 to-emerald-600'
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4 sm:p-8 font-sans selection:bg-purple-500 selection:text-white">
      {/* Top Header */}
      <header className="max-w-6xl mx-auto w-full flex flex-wrap items-center justify-between gap-4 py-2 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <SparklesIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white">QuizPulse</h1>
            <p className="text-xs text-slate-400 font-medium">Host Game Lobby</p>
          </div>
        </div>

        {/* Realtime Status & Player Count Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                syncStatus === 'connected'
                  ? 'bg-emerald-400 animate-pulse'
                  : syncStatus === 'error'
                  ? 'bg-rose-500'
                  : 'bg-amber-400 animate-ping'
              }`}
            />
            <span className="text-slate-300 capitalize">{syncStatus}</span>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-slate-200">
            <UsersIcon className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-semibold">
              {players.length} {players.length === 1 ? 'Player' : 'Players'} Joined
            </span>
          </div>
        </div>
      </header>

      {/* Main Center Content */}
      <main className="max-w-4xl mx-auto w-full flex-1 flex flex-col items-center justify-center my-8 text-center">
        {/* Prominent Room Code Card */}
        <div className="w-full max-w-xl bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <p className="text-xs sm:text-sm font-bold tracking-widest uppercase text-purple-400 mb-2">
            Join with Game PIN
          </p>

          <div className="my-2 flex flex-col items-center">
            {/* 4-Digit Room Code Display */}
            <div className="relative group inline-block">
              <span className="text-6xl sm:text-8xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 drop-shadow-[0_10px_20px_rgba(168,85,247,0.35)] select-all">
                {roomCode}
              </span>
            </div>

            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopyCode}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/80 hover:bg-slate-700/80 active:scale-95 transition-all text-xs font-semibold text-slate-300 border border-slate-700 hover:border-slate-600 cursor-pointer"
            >
              {copied ? (
                <>
                  <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Code Copied!</span>
                </>
              ) : (
                <>
                  <CopyIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy Room PIN</span>
                </>
              )}
            </button>
          </div>

          {errorMessage && (
            <div className="mt-5 p-3.5 bg-amber-950/40 border border-amber-800/60 rounded-xl text-amber-200 text-xs text-left flex items-start gap-2.5">
              <AlertTriangleIcon className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}
        </div>

        {/* Players Grid Section */}
        <section className="w-full mt-10">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-sm font-bold tracking-wider uppercase text-slate-400 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Lobby Members ({players.length})
            </h2>
            <span className="text-xs text-slate-500">Live Firebase sync</span>
          </div>

          {players.length === 0 ? (
            <div className="py-12 px-6 rounded-2xl border border-dashed border-slate-800/80 bg-slate-900/40 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-800/60 flex items-center justify-center text-slate-400 mb-3 animate-pulse">
                <UsersIcon className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-300">Waiting for players to join...</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Players enter code <span className="font-mono text-purple-400 font-bold">{roomCode}</span> on their devices to enter the lobby.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 max-h-72 overflow-y-auto p-1 pr-2">
              {players.map((player, index) => {
                const colorGradient = avatarColors[index % avatarColors.length];
                return (
                  <div
                    key={player.id || index}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-md hover:border-slate-700 transition-all transform hover:-translate-y-0.5 animate-in fade-in duration-200"
                  >
                    <div
                      className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${colorGradient} flex items-center justify-center font-bold text-sm text-white shrink-0 shadow`}
                    >
                      {player.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-bold text-slate-100 truncate text-left flex-1" title={player.name}>
                      {player.name}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Footer Controls */}
      <footer className="max-w-4xl mx-auto w-full pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-slate-500">
          Firebase Path: <code className="text-purple-400 font-mono">/rooms/{roomCode}</code>
        </p>

        <button
          type="button"
          onClick={() => onStartGame && onStartGame(roomCode)}
          disabled={players.length === 0}
          className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
            players.length > 0
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/30 hover:scale-[1.02] active:scale-95'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
          }`}
        >
          <PlayIcon className="w-4 h-4" />
          <span>Start Game</span>
          {players.length > 0 && (
            <span className="ml-1 px-2 py-0.5 rounded-md bg-white/20 text-xs">
              {players.length}
            </span>
          )}
        </button>
      </footer>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import HostConsole from './components/HostConsole.jsx';
import LiveDisplay from './components/LiveDisplay.jsx';
import PlayerJoin from './components/PlayerJoin.jsx';

const ExternalLinkIcon = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h6v6" />
    <path d="M10 14 21 3" />
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
  </svg>
);

export default function App() {
  // Determine which role this specific tab is responsible for rendering
  const getInitialRole = () => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlRole = params.get('role');
      if (urlRole === 'display' || urlRole === 'player' || urlRole === 'host') {
        return urlRole;
      }
    }
    return 'host';
  };

  const getInitialPin = () => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('pin') || '';
    }
    return '';
  };

  const [activeRole, setActiveRole] = useState(getInitialRole);
  const [activePin, setActivePin] = useState(getInitialPin);

  // Helper to construct URL for new tabs
  const getDisplayUrl = (role: string) => {
    if (typeof window === 'undefined') return `?role=${role}`;
    const base = `${window.location.origin}${window.location.pathname}`;
    if (activePin && (role === 'display' || role === 'player')) {
      return `${base}?role=${role}&pin=${encodeURIComponent(activePin)}`;
    }
    return `${base}?role=${role}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans">
      {/* Top Bar with New-Tab Launcher Buttons */}
      <div className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
          <span className="font-black uppercase tracking-wider text-slate-200">
            QuizPulse Multiplayer
          </span>
          <span className="px-2 py-0.5 rounded-md bg-purple-950 border border-purple-800 text-[11px] text-purple-300 font-semibold">
            Viewing: {activeRole === 'host' ? 'Host Console' : activeRole === 'display' ? 'Live Room Display' : 'Player Screen'}
          </span>
        </div>

        {/* Display Buttons (Open in New Tab) */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 hidden sm:inline">Open in New Tab:</span>

          <a
            href={getDisplayUrl('host')}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold transition-all ${
              activeRole === 'host'
                ? 'bg-purple-900/60 border-purple-500 text-purple-200'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
            }`}
          >
            <span>1. Host Console</span>
            <ExternalLinkIcon className="text-purple-400" />
          </a>

          <a
            href={getDisplayUrl('display')}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold transition-all ${
              activeRole === 'display'
                ? 'bg-purple-900/60 border-purple-500 text-purple-200'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
            }`}
          >
            <span>2. Live Display (TV)</span>
            <ExternalLinkIcon className="text-purple-400" />
          </a>

          <a
            href={getDisplayUrl('player')}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold transition-all ${
              activeRole === 'player'
                ? 'bg-purple-900/60 border-purple-500 text-purple-200'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
            }`}
          >
            <span>3. Player Phone</span>
            <ExternalLinkIcon className="text-purple-400" />
          </a>
        </div>
      </div>

      {/* Screen 1: Host Master Console (Private with Secret Answers) */}
      {activeRole === 'host' && (
        <HostConsole
          onRoomCodeReady={(pin: string) => setActivePin(pin)}
          onOpenDisplay={(pin: string) => {
            setActivePin(pin);
            window.open(getDisplayUrl('display'), '_blank');
          }}
        />
      )}

      {/* Screen 2: Shared Big Screen / TV Live Display */}
      {activeRole === 'display' && (
        <LiveDisplay roomCode={activePin} />
      )}

      {/* Screen 3: Player Phone Screen */}
      {activeRole === 'player' && (
        <PlayerJoin initialRoomCode={activePin} />
      )}
    </div>
  );
}

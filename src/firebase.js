/**
 * Firebase Realtime Database Initialization
 * 
 * This module initializes the Firebase application and exports the Realtime Database
 * reference (`db`) used across the application to synchronize room state at `/rooms/{roomCode}`.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Firebase configuration object with placeholder values.
// Replace these with your actual Firebase project configuration found in:
// Firebase Console -> Project Settings -> General -> Your apps -> Web app -> SDK setup and configuration.
//
// NOTE FOR REALTIME DATABASE:
// Make sure `databaseURL` is present. It usually looks like:
// "https://<your-project-id>-default-rtdb.firebaseio.com" (US) or 
// "https://<your-project-id>-default-rtdb.europe-west1.firebasedatabase.app" (Europe)
const firebaseConfig = {
  apiKey: 'AIzaSyClTJ0hasmUyd1n4_loHpmiICcFt9P8hIg',
  authDomain: 'quiz-app-2d5e5.firebaseapp.com',
  databaseURL: 'https://quiz-app-2d5e5-default-rtdb.firebaseio.com',
  projectId: 'quiz-app-2d5e5',
  storageBucket: 'quiz-app-2d5e5.firebasestorage.app',
  messagingSenderId: '539159285496',
  appId: '1:539159285496:web:01fed2a2c772d23683f50d',
  measurementId: 'G-QEC3FWB9D1',
};

// Initialize Firebase App (prevent re-initializing in hot-module reload environments)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Realtime Database instance
const db = getDatabase(app);

// Export the initialized db instance and app for use in your components/hooks
export { db, app };
export default db;

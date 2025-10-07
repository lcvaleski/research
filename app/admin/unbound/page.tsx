'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc } from 'firebase/firestore';
// import { getAuth } from 'firebase/auth'; // Uncomment if you need auth later

// Firebase configuration - replace with your config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAiEhWi-3BOKXaWxjEGLpoMafMJaMvnUC0",
  authDomain: "unboundapp-2a86c.firebaseapp.com",
  projectId: "unboundapp-2a86c",
  storageBucket: "unboundapp-2a86c.appspot.com",
  messagingSenderId: "709403883610",
  appId: "1:709403883610:web:your-web-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
// const auth = getAuth(app); // Uncomment if you need auth later

interface ChallengeCard {
  id: number;
  type: string;
  title?: string;
  content: string;
  buttonText?: string;
}

interface Challenge {
  day: number;
  title: string;
  description: string;
  enabled: boolean;
  order: number;
  finalButtonText?: string;
  cards: ChallengeCard[];
}

export default function UnboundAdmin() {
  const [challenges, setChallenges] = useState<Record<string, Challenge>>({});
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [expandedDay, setExpandedDay] = useState<number | null>(1);

  // Load challenges on mount
  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'challenges'));
      const loadedChallenges: Record<string, Challenge> = {};

      querySnapshot.forEach((doc) => {
        loadedChallenges[doc.id] = doc.data() as Challenge;
      });

      setChallenges(loadedChallenges);
    } catch (error) {
      console.error('Error loading challenges:', error);
      alert('Failed to load challenges. Check console for details.');
    }
    setLoading(false);
  };

  const saveChallenge = async (dayId: string) => {
    setSaveStatus('Saving...');
    try {
      const challenge = challenges[dayId];

      // Save to challenges collection
      await setDoc(doc(db, 'challenges', dayId), challenge);

      // Also update courseContent collection to keep titles in sync
      await setDoc(doc(db, 'courseContent', dayId), {
        day: challenge.day,
        title: challenge.title,
        description: challenge.description,
        enabled: challenge.enabled,
        order: challenge.order
      });

      setSaveStatus('Saved successfully!');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('Error saving challenge:', error);
      setSaveStatus('Save failed!');
    }
  };

  const updateChallenge = (dayId: string, field: keyof Challenge, value: string | boolean | number) => {
    setChallenges(prev => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        [field]: value
      }
    }));
  };

  const updateCard = (dayId: string, cardIndex: number, field: keyof ChallengeCard, value: string | number) => {
    setChallenges(prev => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        cards: prev[dayId].cards.map((card, index) =>
          index === cardIndex ? { ...card, [field]: value } : card
        )
      }
    }));
  };

  const createNewChallenge = async () => {
    const nextDay = Math.max(...Object.values(challenges).map(c => c.day), 0) + 1;
    const newChallenge: Challenge = {
      day: nextDay,
      title: `Day ${nextDay} Challenge`,
      description: "New challenge description",
      enabled: true,  // Changed to true so new challenges appear immediately
      order: nextDay,
      finalButtonText: "Start Challenge",
      cards: [
        {
          id: 1,
          type: 'intro',
          title: `Day ${nextDay} Intro`,
          content: "Introduction content here..."
        },
        {
          id: 2,
          type: 'instruction',
          title: 'How it works',
          content: "Instructions here..."
        },
        {
          id: 3,
          type: 'notification',
          title: 'Reminders',
          content: "Reminder settings...",
          buttonText: 'Enable Reminders'
        },
        {
          id: 4,
          type: 'why',
          title: 'Why this works',
          content: "Explanation here..."
        }
      ]
    };

    const dayId = `day${nextDay}`;

    try {
      await setDoc(doc(db, 'challenges', dayId), newChallenge);

      // Also create courseContent entry
      await setDoc(doc(db, 'courseContent', dayId), {
        day: nextDay,
        title: newChallenge.title,
        description: newChallenge.description,
        enabled: true,  // Ensure this is also true
        order: newChallenge.order
      });

      setChallenges(prev => ({ ...prev, [dayId]: newChallenge }));
      setExpandedDay(nextDay);
      setSaveStatus(`Day ${nextDay} created successfully!`);
    } catch (error) {
      console.error('Error creating challenge:', error);
      setSaveStatus('Failed to create challenge');
    }
  };


  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading challenges...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-4">
        <Link
          href="/"
          className="inline-block px-4 py-2 text-sm border border-black rounded hover:bg-gray-50 mb-4"
        >
          ← Back to Main
        </Link>
      </div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Unbound Content Editor</h1>
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <button
              onClick={() => createNewChallenge()}
              className="px-4 py-2 bg-black text-white rounded hover:opacity-80"
            >
              + Add New Day
            </button>
            <button
              onClick={() => loadChallenges()}
              className="px-4 py-2 border border-black rounded hover:bg-gray-50"
            >
              Refresh All
            </button>
          </div>
          {saveStatus && (
            <span className={`px-3 py-1 rounded ${
              saveStatus.includes('success') ? 'bg-green-100 text-green-700' :
              saveStatus.includes('failed') ? 'bg-red-100 text-red-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {saveStatus}
            </span>
          )}
        </div>
      </div>

      <div>
        {Object.entries(challenges)
          .sort((a, b) => a[1].day - b[1].day)
          .map(([dayId, challenge]) => (
          <div key={dayId} className="p-4 border rounded mb-4">
            <div
              className="flex justify-between items-start cursor-pointer"
              onClick={() => setExpandedDay(expandedDay === challenge.day ? null : challenge.day)}
            >
              <div className="flex-1">
                <h2 className="text-lg font-semibold mb-2">
                  Day {challenge.day}: {challenge.title}
                </h2>
                <p className="text-gray-600 text-sm">{challenge.description}</p>
              </div>
              <div className="flex gap-2 items-center">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={challenge.enabled}
                    onChange={(e) => updateChallenge(dayId, 'enabled', e.target.checked)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-4 h-4"
                  />
                  <span>Enabled</span>
                </label>
                <span className="text-xl text-gray-600">{expandedDay === challenge.day ? '−' : '+'}</span>
              </div>
            </div>

            {expandedDay === challenge.day && (
              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input
                      type="text"
                      value={challenge.title}
                      onChange={(e) => updateChallenge(dayId, 'title', e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Final Button Text</label>
                    <input
                      type="text"
                      value={challenge.finalButtonText || 'Start Challenge'}
                      onChange={(e) => updateChallenge(dayId, 'finalButtonText', e.target.value)}
                      placeholder="e.g., Let's Do This"
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={challenge.description}
                    onChange={(e) => updateChallenge(dayId, 'description', e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                    rows={2}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-lg">Challenge Cards</h3>
                  {challenge.cards.map((card, cardIndex) => (
                    <div key={cardIndex} className="bg-gray-50 p-4 rounded">
                      <div className="mb-2 text-sm font-medium text-gray-600">
                        Card {cardIndex + 1}: {card.type}
                      </div>

                      {card.title && (
                        <div className="mb-3">
                          <label className="block text-sm font-medium mb-1">Title</label>
                          <input
                            type="text"
                            value={card.title}
                            onChange={(e) => updateCard(dayId, cardIndex, 'title', e.target.value)}
                            className="w-full p-2 border rounded"
                          />
                        </div>
                      )}

                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">Content</label>
                        <textarea
                          value={card.content}
                          onChange={(e) => updateCard(dayId, cardIndex, 'content', e.target.value)}
                          className="w-full p-2 border rounded"
                          rows={3}
                        />
                      </div>

                      {card.type === 'notification' && (
                        <div>
                          <label className="block text-sm font-medium mb-1">Button Text</label>
                          <input
                            type="text"
                            value={card.buttonText || ''}
                            onChange={(e) => updateCard(dayId, cardIndex, 'buttonText', e.target.value)}
                            className="w-full p-2 border rounded"
                            placeholder="e.g., Enable Reminders"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => saveChallenge(dayId)}
                  className="w-full bg-black text-white py-3 rounded hover:opacity-80 font-medium"
                >
                  Save Day {challenge.day} Changes
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
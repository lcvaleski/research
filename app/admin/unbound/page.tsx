'use client';

import React, { useState, useEffect } from 'react';
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
  title: string;
  content: string;
  buttonText?: string;
  imageUrl?: string;
}

interface NotificationMessage {
  time: 'morning' | 'afternoon' | 'evening';
  hour: number;
  title: string;
  body: string;
}

interface Challenge {
  day: number;
  title: string;
  description: string;
  enabled: boolean;
  order: number;
  finalButtonText?: string;
  cards: ChallengeCard[];
  notifications?: NotificationMessage[];
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

  const updateNotification = (dayId: string, notifIndex: number, field: keyof NotificationMessage, value: string | number) => {
    setChallenges(prev => {
      const challenge = prev[dayId];
      const notifications = challenge.notifications || [];
      const updatedNotifications = notifications.map((notif, index) =>
        index === notifIndex ? { ...notif, [field]: value } : notif
      );

      return {
        ...prev,
        [dayId]: {
          ...challenge,
          notifications: updatedNotifications
        }
      };
    });
  };

  const addNotification = (dayId: string) => {
    setChallenges(prev => {
      const challenge = prev[dayId];
      const existingNotifications = challenge.notifications || [];

      // Determine the next time slot
      let nextTime: 'morning' | 'afternoon' | 'evening' = 'morning';
      let nextHour = 9;

      if (existingNotifications.length > 0) {
        const lastNotif = existingNotifications[existingNotifications.length - 1];
        if (lastNotif.time === 'morning') {
          nextTime = 'afternoon';
          nextHour = 14;
        } else if (lastNotif.time === 'afternoon') {
          nextTime = 'evening';
          nextHour = 19;
        }
      }

      const newNotification: NotificationMessage = {
        time: nextTime,
        hour: nextHour,
        title: `Day ${challenge.day} ${nextTime.charAt(0).toUpperCase() + nextTime.slice(1)}`,
        body: 'Enter notification message here...'
      };

      return {
        ...prev,
        [dayId]: {
          ...challenge,
          notifications: [...existingNotifications, newNotification]
        }
      };
    });
  };

  const removeNotification = (dayId: string, notifIndex: number) => {
    setChallenges(prev => {
      const challenge = prev[dayId];
      const notifications = challenge.notifications || [];

      return {
        ...prev,
        [dayId]: {
          ...challenge,
          notifications: notifications.filter((_, index) => index !== notifIndex)
        }
      };
    });
  };

  const addCard = (dayId: string) => {
    setChallenges(prev => {
      const challenge = prev[dayId];
      const newCardId = Math.max(...challenge.cards.map(c => c.id), 0) + 1;
      const newCard: ChallengeCard = {
        id: newCardId,
        type: 'custom', // Default type, user can change it
        title: 'New Screen',
        content: 'Enter your content here...',
      };

      return {
        ...prev,
        [dayId]: {
          ...challenge,
          cards: [...challenge.cards, newCard]
        }
      };
    });
  };

  const removeCard = (dayId: string, cardIndex: number) => {
    setChallenges(prev => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        cards: prev[dayId].cards.filter((_, index) => index !== cardIndex)
      }
    }));
  };

  const moveCard = (dayId: string, fromIndex: number, direction: 'up' | 'down') => {
    setChallenges(prev => {
      const challenge = prev[dayId];
      const newCards = [...challenge.cards];
      const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;

      if (toIndex < 0 || toIndex >= newCards.length) return prev;

      // Swap the cards
      [newCards[fromIndex], newCards[toIndex]] = [newCards[toIndex], newCards[fromIndex]];

      return {
        ...prev,
        [dayId]: {
          ...challenge,
          cards: newCards
        }
      };
    });
  };

  const insertCardAt = (dayId: string, position: number) => {
    setChallenges(prev => {
      const challenge = prev[dayId];
      const newCardId = Math.max(...challenge.cards.map(c => c.id), 0) + 1;
      const newCard: ChallengeCard = {
        id: newCardId,
        type: 'custom',
        title: 'New Screen',
        content: 'Enter your content here...',
      };

      const newCards = [...challenge.cards];
      newCards.splice(position, 0, newCard);

      return {
        ...prev,
        [dayId]: {
          ...challenge,
          cards: newCards
        }
      };
    });
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
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg">Challenge Cards</h3>
                    <button
                      onClick={() => addCard(dayId)}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      + Add Card at End
                    </button>
                  </div>

                  {/* Insert button at beginning */}
                  <div className="flex justify-center">
                    <button
                      onClick={() => insertCardAt(dayId, 0)}
                      className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                    >
                      + Insert Card Here
                    </button>
                  </div>

                  {challenge.cards.map((card, cardIndex) => (
                    <React.Fragment key={cardIndex}>
                      <div className="bg-gray-50 p-4 rounded relative">
                        {/* Card controls */}
                        <div className="absolute top-2 right-2 flex gap-2">
                          {/* Move buttons */}
                          <button
                            onClick={() => moveCard(dayId, cardIndex, 'up')}
                            disabled={cardIndex === 0}
                            className={`px-2 py-1 text-sm ${
                              cardIndex === 0
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-blue-600 hover:text-blue-800'
                            }`}
                            title="Move up"
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => moveCard(dayId, cardIndex, 'down')}
                            disabled={cardIndex === challenge.cards.length - 1}
                            className={`px-2 py-1 text-sm ${
                              cardIndex === challenge.cards.length - 1
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-blue-600 hover:text-blue-800'
                            }`}
                            title="Move down"
                          >
                            ↓
                          </button>
                          <button
                            onClick={() => removeCard(dayId, cardIndex)}
                            className="text-red-500 hover:text-red-700 font-bold text-lg"
                            title="Remove card"
                          >
                            ×
                          </button>
                        </div>

                        <div className="mb-2 text-sm font-medium text-gray-600">
                          Card {cardIndex + 1}
                        </div>

                        <div className="mb-3">
                          <label className="block text-sm font-medium mb-1">Title</label>
                          <input
                            type="text"
                            value={card.title || ''}
                            onChange={(e) => updateCard(dayId, cardIndex, 'title', e.target.value)}
                            className="w-full p-2 border rounded"
                            placeholder="Screen title"
                            required
                          />
                        </div>

                        <div className="mb-3">
                          <label className="block text-sm font-medium mb-1">Content</label>
                          <textarea
                            value={card.content}
                            onChange={(e) => updateCard(dayId, cardIndex, 'content', e.target.value)}
                            className="w-full p-2 border rounded"
                            rows={3}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Button Text (optional)</label>
                            <input
                              type="text"
                              value={card.buttonText || ''}
                              onChange={(e) => updateCard(dayId, cardIndex, 'buttonText', e.target.value)}
                              className="w-full p-2 border rounded"
                              placeholder="e.g., Continue, Enable Reminders"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Image URL (optional)</label>
                            <input
                              type="text"
                              value={card.imageUrl || ''}
                              onChange={(e) => updateCard(dayId, cardIndex, 'imageUrl', e.target.value)}
                              className="w-full p-2 border rounded"
                              placeholder="https://example.com/image.png"
                            />
                          </div>
                        </div>

                        {/* Preview image if URL is provided */}
                        {card.imageUrl && (
                          <div className="mt-3">
                            <label className="block text-sm font-medium mb-1">Image Preview</label>
                            <img
                              src={card.imageUrl}
                              alt="Preview"
                              className="max-w-full h-32 object-contain border rounded"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                              onLoad={(e) => {
                                (e.target as HTMLImageElement).style.display = 'block';
                              }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Insert button between cards */}
                      <div className="flex justify-center">
                        <button
                          onClick={() => insertCardAt(dayId, cardIndex + 1)}
                          className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                        >
                          + Insert Card Here
                        </button>
                      </div>
                    </React.Fragment>
                  ))}
                </div>

                {/* Notifications Section */}
                <div className="space-y-4 border-t pt-4 mt-6">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg">Daily Notifications</h3>
                    <button
                      onClick={() => addNotification(dayId)}
                      className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                    >
                      + Add Notification
                    </button>
                  </div>

                  {(!challenge.notifications || challenge.notifications.length === 0) ? (
                    <div className="text-gray-500 text-sm italic">
                      No notifications configured. Add notifications to send reminders throughout the day.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {challenge.notifications.map((notification, notifIndex) => (
                        <div key={notifIndex} className="bg-purple-50 p-4 rounded relative">
                          <div className="absolute top-2 right-2">
                            <button
                              onClick={() => removeNotification(dayId, notifIndex)}
                              className="text-red-500 hover:text-red-700 font-bold text-lg"
                              title="Remove notification"
                            >
                              ×
                            </button>
                          </div>

                          <div className="grid grid-cols-3 gap-3 mb-3">
                            <div>
                              <label className="block text-sm font-medium mb-1">Time</label>
                              <select
                                value={notification.time}
                                onChange={(e) => updateNotification(dayId, notifIndex, 'time', e.target.value)}
                                className="w-full p-2 border rounded"
                              >
                                <option value="morning">Morning</option>
                                <option value="afternoon">Afternoon</option>
                                <option value="evening">Evening</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Hour (24h)</label>
                              <input
                                type="number"
                                min="0"
                                max="23"
                                value={notification.hour}
                                onChange={(e) => updateNotification(dayId, notifIndex, 'hour', parseInt(e.target.value))}
                                className="w-full p-2 border rounded"
                                placeholder="9"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Time Preview</label>
                              <div className="p-2 bg-white border rounded text-center">
                                {notification.hour < 12 ?
                                  `${notification.hour === 0 ? 12 : notification.hour}:00 AM` :
                                  `${notification.hour === 12 ? 12 : notification.hour - 12}:00 PM`
                                }
                              </div>
                            </div>
                          </div>

                          <div className="mb-3">
                            <label className="block text-sm font-medium mb-1">Notification Title</label>
                            <input
                              type="text"
                              value={notification.title}
                              onChange={(e) => updateNotification(dayId, notifIndex, 'title', e.target.value)}
                              className="w-full p-2 border rounded"
                              placeholder="Day 1: One Word Check-In"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-1">Message Body</label>
                            <textarea
                              value={notification.body}
                              onChange={(e) => updateNotification(dayId, notifIndex, 'body', e.target.value)}
                              className="w-full p-2 border rounded"
                              rows={2}
                              placeholder="What's one word to describe your emotional state right now?"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
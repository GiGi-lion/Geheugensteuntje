import { StoredMeeting, ProcessingResult } from '../types';

const STORAGE_KEY = 'notulist_history_v1';

export const saveMeeting = (data: ProcessingResult): StoredMeeting => {
  const existing = getMeetings();
  
  const newMeeting: StoredMeeting = {
    id: crypto.randomUUID(),
    title: new Date().toLocaleString('nl-NL', { dateStyle: 'medium', timeStyle: 'short' }),
    date: new Date().toISOString(),
    data: data
  };

  const updated = [newMeeting, ...existing];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return newMeeting;
};

export const getMeetings = (): StoredMeeting[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to load meetings", e);
    return [];
  }
};

export const updateMeetingTitle = (id: string, newTitle: string): StoredMeeting[] => {
  const meetings = getMeetings();
  const updated = meetings.map(m => m.id === id ? { ...m, title: newTitle } : m);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

export const deleteMeeting = (id: string): StoredMeeting[] => {
  const meetings = getMeetings();
  const updated = meetings.filter(m => m.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};
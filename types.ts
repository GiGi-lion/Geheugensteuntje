export interface CalendarEvent {
  title: string;
  description: string;
  location?: string;
  startDateTime?: string; // ISO 8601
  endDateTime?: string; // ISO 8601
  isAllDay?: boolean;
}

export interface SummarySection {
  theme: string;
  points: string[];
}

export interface ProcessingResult {
  transcript: string;
  summary: SummarySection[]; // Changed from string to structured array
  actionItems: string[];
  calendarEvents: CalendarEvent[];
}

export interface StoredMeeting {
  id: string;
  title: string;
  date: string; // ISO String
  data: ProcessingResult;
}

export enum AppState {
  IDLE = 'IDLE',
  RECORDING = 'RECORDING',
  PROCESSING = 'PROCESSING',
  FINISHED = 'FINISHED',
  ERROR = 'ERROR'
}
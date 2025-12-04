import { CalendarEvent } from '../types';

export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:audio/webm;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const generateGoogleCalendarLink = (event: CalendarEvent): string => {
  const baseUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
  
  // Format dates to YYYYMMDDTHHMMSSZ
  const formatDate = (isoString?: string) => {
    if (!isoString) return '';
    return isoString.replace(/[-:.]/g, '').slice(0, 15) + 'Z';
  };

  const start = event.startDateTime ? formatDate(new Date(event.startDateTime).toISOString()) : '';
  // Default to 1 hour if no end time
  const end = event.endDateTime 
    ? formatDate(new Date(event.endDateTime).toISOString()) 
    : event.startDateTime 
      ? formatDate(new Date(new Date(event.startDateTime).getTime() + 60 * 60 * 1000).toISOString())
      : '';

  const params = new URLSearchParams({
    text: event.title,
    details: `${event.description}\n\n(Gegenereerd door Notulist AI)`,
    location: event.location || '',
  });

  if (start && end) {
    params.append('dates', `${start}/${end}`);
  }

  return `${baseUrl}&${params.toString()}`;
};

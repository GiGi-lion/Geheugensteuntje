import { CalendarEvent } from '../types';

export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const generateGoogleCalendarLink = (event: CalendarEvent): string => {
  const baseUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
  
  const formatDate = (isoString?: string) => {
    if (!isoString) return '';
    return isoString.replace(/[-:.]/g, '').slice(0, 15) + 'Z';
  };

  const start = event.startDateTime ? formatDate(new Date(event.startDateTime).toISOString()) : '';
  const end = event.endDateTime 
    ? formatDate(new Date(event.endDateTime).toISOString()) 
    : event.startDateTime 
      ? formatDate(new Date(new Date(event.startDateTime).getTime() + 60 * 60 * 1000).toISOString())
      : '';

  const params = new URLSearchParams({
    text: event.title,
    details: `${event.description}\n\n(Gegenereerd door Geheugensteuntje)`,
    location: event.location || '',
  });

  if (start && end) {
    params.append('dates', `${start}/${end}`);
  }

  return `${baseUrl}&${params.toString()}`;
};

/**
 * Verwijst naar de hoofdpagina van Google Tasks. 
 * Dit is de meest stabiele URL voor consumenten.
 */
export const getGoogleTasksUrl = (): string => {
  return 'https://tasks.google.com/';
};

/**
 * Verbeterde klembord-functie met betere foutafhandeling.
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      // Zorg dat het element niet zichtbaar is
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    }
  } catch (err) {
    console.error('Kopiëren naar klembord mislukt:', err);
    return false;
  }
};

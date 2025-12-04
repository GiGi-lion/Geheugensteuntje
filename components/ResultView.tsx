import React, { useState, useEffect } from 'react';
import { ProcessingResult } from '../types';
import { generateGoogleCalendarLink } from '../services/utils';

interface ResultViewProps {
  data: ProcessingResult;
  title: string;
  onUpdateTitle: (newTitle: string) => void;
}

const ResultView: React.FC<ResultViewProps> = ({ data, title, onUpdateTitle }) => {
  const [localTitle, setLocalTitle] = useState(title);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);

  useEffect(() => {
    setLocalTitle(title);
  }, [title]);

  const handleBlur = () => {
    if (localTitle.trim() !== title && localTitle.trim() !== '') {
      onUpdateTitle(localTitle);
    } else if (localTitle.trim() === '') {
      setLocalTitle(title); // Revert if empty
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-8 duration-500">
      
      {/* Title Input */}
      <div className="mb-8">
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Titel van gesprek</label>
        <div className="relative group">
          <input 
            type="text" 
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            onBlur={handleBlur}
            placeholder="Klik om titel te wijzigen"
            className="w-full text-3xl font-extrabold text-slate-800 bg-transparent border-b-2 border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none transition-all py-2 pr-10 rounded-sm"
          />
          {/* Pencil Icon */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-hover:text-indigo-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 1. Action Items (Left Top) */}
        <div className="md:col-span-1 flex flex-col">
          <div className="bg-white rounded-2xl shadow-sm border border-rose-100 overflow-hidden h-full">
            <div className="bg-gradient-to-r from-rose-50 to-white px-6 py-4 border-b border-rose-100 flex items-center gap-2">
              <div className="bg-rose-100 p-1.5 rounded-lg">
                <svg className="w-5 h-5 text-rose-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
              </div>
              <h3 className="text-lg font-bold text-rose-900">Actiepunten</h3>
            </div>
            <div className="p-6">
              {data.actionItems.length > 0 ? (
                <ul className="space-y-4">
                  {data.actionItems.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="mt-1 w-5 h-5 rounded border-2 border-rose-200 flex items-center justify-center flex-shrink-0 bg-rose-50">
                         <div className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
                      </div>
                      <span className="text-slate-800 font-medium text-sm leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-400 italic text-sm">Geen specifieke actiepunten gevonden.</p>
              )}
            </div>
          </div>
        </div>

        {/* 2. Calendar Events (Right Top) */}
        <div className="md:col-span-1 flex flex-col">
          <div className="bg-white rounded-2xl shadow-sm border border-violet-100 overflow-hidden h-full">
            <div className="bg-gradient-to-r from-violet-50 to-white px-6 py-4 border-b border-violet-100 flex items-center gap-2">
              <div className="bg-violet-100 p-1.5 rounded-lg">
                <svg className="w-5 h-5 text-violet-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              </div>
              <h3 className="text-lg font-bold text-violet-900">Agenda</h3>
            </div>
            <div className="p-6">
              {data.calendarEvents && data.calendarEvents.length > 0 ? (
                <div className="space-y-4">
                  {data.calendarEvents.map((event, idx) => (
                    <div key={idx} className="bg-violet-50 p-4 rounded-xl border border-violet-100 flex flex-col gap-3">
                      <div>
                        <p className="font-bold text-slate-800 text-sm leading-snug">{event.title}</p>
                        <p className="text-xs text-violet-600 font-semibold mt-1 uppercase tracking-wide flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          {event.startDateTime 
                            ? new Date(event.startDateTime).toLocaleString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit'})
                            : 'Datum onbekend'}
                        </p>
                      </div>
                      <a 
                        href={generateGoogleCalendarLink(event)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-full px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                      >
                        Inplannen
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-32 text-slate-400 text-sm italic">
                  <p>Geen afspraken herkend.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. Summary (Full Width Middle) */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-teal-100 overflow-hidden">
            <div className="bg-gradient-to-r from-teal-50 to-white px-6 py-4 border-b border-teal-100 flex items-center gap-2">
              <div className="bg-teal-100 p-1.5 rounded-lg">
                 <svg className="w-5 h-5 text-teal-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="21" y1="18" x2="3" y2="18"></line></svg>
              </div>
              <h3 className="text-lg font-bold text-teal-900">Samenvatting</h3>
            </div>
            
            <div className="p-6 space-y-6">
              {data.summary.map((section, idx) => (
                <div key={idx} className="space-y-3">
                  <h4 className="font-bold text-teal-900 text-lg flex items-center gap-2">
                    <span className="w-2 h-6 bg-teal-400 rounded-full inline-block"></span>
                    {section.theme}
                  </h4>
                  <ul className="space-y-3 pl-2">
                    {section.points.map((point, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-3 text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-teal-400 flex-shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Full Transcript (Full Width Bottom - Collapsible) */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
             <button 
               onClick={() => setIsTranscriptOpen(!isTranscriptOpen)}
               className="w-full px-6 py-4 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between cursor-pointer group"
             >
               <div className="flex items-center gap-2">
                 <div className="bg-slate-200 p-1.5 rounded-lg group-hover:bg-white transition-colors">
                   <svg className="w-5 h-5 text-slate-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                 </div>
                 <h3 className="text-lg font-bold text-slate-700">Volledige Transcriptie</h3>
               </div>
               <svg 
                 className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isTranscriptOpen ? 'rotate-180' : ''}`} 
                 fill="none" 
                 stroke="currentColor" 
                 viewBox="0 0 24 24"
               >
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
               </svg>
             </button>
             
             {/* Collapsible Content */}
             <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isTranscriptOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
               <div className="p-6 border-t border-slate-100 bg-white">
                 <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap font-mono p-4 bg-slate-50 rounded-xl border border-slate-100">
                   {data.transcript}
                 </p>
               </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ResultView;
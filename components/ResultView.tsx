import React, { useState, useEffect } from 'react';
import { ProcessingResult } from '../types';
import { generateGoogleCalendarLink, getGoogleTasksUrl, copyToClipboard } from '../services/utils';

interface ResultViewProps {
  data: ProcessingResult;
  title: string;
  onUpdateTitle: (newTitle: string) => void;
}

const ResultView: React.FC<ResultViewProps> = ({ data, title, onUpdateTitle }) => {
  const [localTitle, setLocalTitle] = useState(title);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [taskExportIndex, setTaskExportIndex] = useState<number | null>(null);

  useEffect(() => {
    setLocalTitle(title);
  }, [title]);

  const handleBlur = () => {
    if (localTitle.trim() !== title && localTitle.trim() !== '') {
      onUpdateTitle(localTitle);
    } else if (localTitle.trim() === '') {
      setLocalTitle(title);
    }
  };

  const handleCopy = async (text: string, index: number) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  const handleTasksExport = async (text: string, index: number) => {
    const success = await copyToClipboard(text);
    if (success) {
      setTaskExportIndex(index);
      // Open Google Tasks in een nieuw tabblad
      window.open(getGoogleTasksUrl(), '_blank');
      // Reset status na 5 seconden
      setTimeout(() => setTaskExportIndex(null), 5000);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-8 duration-500">
      
      {/* Titel van het gesprek */}
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
          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-hover:text-indigo-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 1. Actiepunten Sectie */}
        <div className="md:col-span-1 flex flex-col">
          <div className="bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden h-full flex flex-col">
            <div className="bg-gradient-to-r from-blue-50 to-white px-6 py-4 border-b border-blue-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-blue-600 p-1.5 rounded-lg">
                  <svg className="w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
                </div>
                <h3 className="text-lg font-bold text-blue-900 tracking-tight">Actiepunten</h3>
              </div>
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-100 px-2.5 py-1 rounded-full">Google Tasks</span>
            </div>
            
            <div className="p-6 flex-1">
              {data.actionItems.length > 0 ? (
                <ul className="space-y-4">
                  {data.actionItems.map((item, idx) => (
                    <li key={idx} className="flex flex-col gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 transition-all hover:bg-white hover:shadow-md hover:border-blue-200 group">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 w-5 h-5 rounded-full border-2 border-blue-200 flex items-center justify-center flex-shrink-0 bg-white group-hover:border-blue-500 transition-colors">
                           <div className="w-2 h-2 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <span className="text-slate-700 font-medium text-sm leading-snug flex-1">{item}</span>
                      </div>
                      
                      <div className="flex justify-end gap-2 items-center">
                        {taskExportIndex === idx && (
                          <span className="text-[10px] font-bold text-green-600 animate-pulse mr-auto">
                            Gekopieerd! Plakken in Tasks (Ctrl+V)
                          </span>
                        )}
                        <button 
                          onClick={() => handleCopy(item, idx)}
                          className={`p-2 rounded-lg border transition-all ${copiedIndex === idx ? 'bg-green-50 border-green-200 text-green-600' : 'bg-white border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200'}`}
                          title="Alleen kopiëren"
                        >
                          {copiedIndex === idx ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                          )}
                        </button>
                        <button 
                          onClick={() => handleTasksExport(item, idx)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition-all active:scale-95 shadow-sm ${taskExportIndex === idx ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                          {taskExportIndex === idx ? 'Open Tasks...' : 'Zet in Tasks'}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 opacity-60">
                  <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                  <p className="italic text-sm">Geen actiepunten gevonden.</p>
                </div>
              )}
            </div>
            
            <div className="px-6 py-3 bg-blue-50 text-[10px] text-blue-600 font-medium border-t border-blue-100">
               💡 Tip: Na het klikken wordt de tekst gekopieerd. Druk op <b>Ctrl+V</b> in het nieuwe scherm om de taak toe te voegen.
            </div>
          </div>
        </div>

        {/* 2. Agenda Sectie */}
        <div className="md:col-span-1 flex flex-col">
          <div className="bg-white rounded-2xl shadow-sm border border-violet-100 overflow-hidden h-full">
            <div className="bg-gradient-to-r from-violet-50 to-white px-6 py-4 border-b border-violet-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-violet-600 p-1.5 rounded-lg">
                  <svg className="w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                </div>
                <h3 className="text-lg font-bold text-violet-900 tracking-tight">Agenda</h3>
              </div>
              <span className="text-[10px] font-black text-violet-600 uppercase tracking-widest bg-violet-100 px-2.5 py-1 rounded-full">Calendar</span>
            </div>
            <div className="p-6">
              {data.calendarEvents && data.calendarEvents.length > 0 ? (
                <div className="space-y-4">
                  {data.calendarEvents.map((event, idx) => (
                    <div key={idx} className="bg-violet-50 p-5 rounded-xl border border-violet-100 flex flex-col gap-4 transition-all hover:bg-white hover:shadow-md hover:border-violet-200">
                      <div>
                        <p className="font-bold text-slate-800 text-base leading-tight">{event.title}</p>
                        <div className="flex items-center gap-2 mt-2">
                           <div className="p-1 bg-violet-100 rounded text-violet-600">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                           </div>
                           <p className="text-xs text-violet-700 font-bold uppercase tracking-wide">
                            {event.startDateTime 
                              ? new Date(event.startDateTime).toLocaleString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit'})
                              : 'Datum onbekend'}
                          </p>
                        </div>
                      </div>
                      <a 
                        href={generateGoogleCalendarLink(event)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-full px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-lg transition-all shadow-sm active:scale-95"
                      >
                        Nu inplannen
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 opacity-60">
                   <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                   <p className="italic text-sm text-center">Geen afspraken herkend in dit gesprek.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. Samenvatting Sectie */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-teal-100 overflow-hidden">
            <div className="bg-gradient-to-r from-teal-50 to-white px-6 py-4 border-b border-teal-100 flex items-center gap-2">
              <div className="bg-teal-600 p-1.5 rounded-lg">
                 <svg className="w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="21" y1="18" x2="3" y2="18"></line></svg>
              </div>
              <h3 className="text-lg font-bold text-teal-900 tracking-tight">Samenvatting</h3>
            </div>
            
            <div className="p-8 space-y-8">
              {data.summary.map((section, idx) => (
                <div key={idx} className="space-y-4">
                  <h4 className="font-bold text-teal-900 text-xl flex items-center gap-3">
                    <span className="w-1.5 h-8 bg-teal-500 rounded-full inline-block"></span>
                    {section.theme}
                  </h4>
                  <ul className="grid grid-cols-1 gap-3 pl-4">
                    {section.points.map((point, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-3 text-slate-700 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100 hover:border-teal-100 hover:bg-white transition-all">
                        <span className="mt-2 w-2 h-2 rounded-full bg-teal-400 flex-shrink-0" />
                        <span className="text-sm md:text-base">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Volledige Transcriptie Sectie */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
             <button 
               onClick={() => setIsTranscriptOpen(!isTranscriptOpen)}
               className="w-full px-6 py-5 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between cursor-pointer group"
             >
               <div className="flex items-center gap-3">
                 <div className="bg-slate-200 p-1.5 rounded-lg group-hover:bg-white transition-colors">
                   <svg className="w-5 h-5 text-slate-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                 </div>
                 <h3 className="text-lg font-bold text-slate-700 tracking-tight">Volledige Transcriptie</h3>
               </div>
               <div className={`p-2 rounded-full bg-white border border-slate-200 transition-transform duration-300 ${isTranscriptOpen ? 'rotate-180' : ''}`}>
                 <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
               </div>
             </button>
             
             <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isTranscriptOpen ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'}`}>
               <div className="p-8 border-t border-slate-100 bg-white">
                 <div className="text-slate-600 text-sm md:text-base leading-relaxed whitespace-pre-wrap font-mono p-6 bg-slate-50 rounded-2xl border border-slate-100">
                   {data.transcript}
                 </div>
               </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ResultView;

import React from 'react';
import { StoredMeeting } from '../types';

interface HistorySidebarProps {
  meetings: StoredMeeting[];
  onSelect: (meeting: StoredMeeting) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  currentId?: string;
  isOpen: boolean;
  onToggle: () => void;
  onNew: () => void;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({ 
  meetings, 
  onSelect, 
  onDelete, 
  currentId, 
  isOpen, 
  onToggle,
  onNew
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-72 bg-white border-r border-slate-200 shadow-xl lg:shadow-none
        transform transition-transform duration-300 ease-in-out
        flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-8 h-8 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
              <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
            </svg>
            <h2 className="font-bold text-slate-800 tracking-tight">Geheugensteuntje</h2>
          </div>
          <button onClick={onToggle} className="lg:hidden p-1 text-slate-500">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-4">
           <button 
             onClick={onNew}
             className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2.5 px-4 rounded-xl font-medium transition-colors shadow-sm"
           >
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
             Nieuwe Opname
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {meetings.length === 0 ? (
            <div className="text-center text-slate-400 py-10 text-sm">
              Nog geen opnames opgeslagen.
            </div>
          ) : (
            meetings.map((meeting) => (
              <div 
                key={meeting.id}
                onClick={() => onSelect(meeting)}
                className={`
                  group relative p-3 rounded-xl cursor-pointer transition-all border
                  ${currentId === meeting.id 
                    ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
                    : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'
                  }
                `}
              >
                <h3 className={`font-medium text-sm mb-1 pr-6 truncate ${currentId === meeting.id ? 'text-indigo-900' : 'text-slate-700'}`}>
                  {meeting.title}
                </h3>
                <p className="text-xs text-slate-400">
                  {new Date(meeting.date).toLocaleDateString('nl-NL', {day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit'})}
                </p>
                
                <button 
                  onClick={(e) => onDelete(meeting.id, e)}
                  className="absolute right-2 top-3 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all"
                  title="Verwijderen"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default HistorySidebar;
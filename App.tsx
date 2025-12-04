import React, { useState, useRef, useEffect } from 'react';
import { AppState, StoredMeeting } from './types';
import RecordButton from './components/RecordButton';
import ResultView from './components/ResultView';
import HistorySidebar from './components/HistorySidebar';
import { processMeetingAudio } from './services/geminiService';
import { saveMeeting, getMeetings, updateMeetingTitle, deleteMeeting } from './services/storageService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Data management
  const [meetings, setMeetings] = useState<StoredMeeting[]>([]);
  const [currentMeetingId, setCurrentMeetingId] = useState<string | null>(null);
  
  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Audio refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // Load history on mount
  useEffect(() => {
    setMeetings(getMeetings());
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStreams();
    };
  }, []);

  const stopStreams = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = handleRecordingStopped;

      mediaRecorder.start();
      setAppState(AppState.RECORDING);
      setErrorMsg(null);
      setCurrentMeetingId(null); // Clear current selection when recording starts
    } catch (err) {
      console.error("Microphone access error:", err);
      setErrorMsg("Kon geen toegang krijgen tot de microfoon.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      stopStreams();
    }
  };

  const handleRecordingStopped = async () => {
    setAppState(AppState.PROCESSING);
    
    try {
      const audioBlob = new Blob(audioChunksRef.current, { 
        type: mediaRecorderRef.current?.mimeType || 'audio/webm' 
      });

      if (audioBlob.size < 1000) throw new Error("Opname was te kort.");

      const resultData = await processMeetingAudio(audioBlob);
      
      // Save immediately
      const saved = saveMeeting(resultData);
      setMeetings(getMeetings()); // Refresh list
      setCurrentMeetingId(saved.id);
      
      setAppState(AppState.FINISHED);
    } catch (err: any) {
      console.error("Processing error:", err);
      setErrorMsg(err.message || "Fout bij verwerken.");
      setAppState(AppState.ERROR);
    }
  };

  const toggleRecording = () => {
    if (appState === AppState.IDLE || appState === AppState.ERROR || appState === AppState.FINISHED) {
      startRecording();
    } else if (appState === AppState.RECORDING) {
      stopRecording();
    }
  };

  const handleSelectMeeting = (meeting: StoredMeeting) => {
    if (appState === AppState.RECORDING) return; // Prevent switching while recording
    setCurrentMeetingId(meeting.id);
    setAppState(AppState.FINISHED);
    setIsSidebarOpen(false); // Close sidebar on mobile on select
  };

  const handleDeleteMeeting = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Weet je zeker dat je deze opname wilt verwijderen?")) {
      const updated = deleteMeeting(id);
      setMeetings(updated);
      if (currentMeetingId === id) {
        handleNewRecording();
      }
    }
  };

  const handleUpdateTitle = (newTitle: string) => {
    if (currentMeetingId) {
      const updated = updateMeetingTitle(currentMeetingId, newTitle);
      setMeetings(updated);
    }
  };

  const handleNewRecording = () => {
    stopStreams(); // Ensure any existing stream is stopped
    setAppState(AppState.IDLE);
    setCurrentMeetingId(null);
    setErrorMsg(null);
    setIsSidebarOpen(false);
  };

  // Derived state for current view
  const currentMeeting = meetings.find(m => m.id === currentMeetingId);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      {/* Sidebar */}
      <HistorySidebar 
        meetings={meetings}
        onSelect={handleSelectMeeting}
        onDelete={handleDeleteMeeting}
        currentId={currentMeetingId || undefined}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onNew={handleNewRecording}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Top Navigation Bar (Mobile & Desktop) */}
        <div className="flex-shrink-0 bg-white border-b border-slate-200 h-16 px-4 lg:px-8 flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar Toggle */}
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>

            {/* Logo/Title (Visible on Mobile mostly, or if Sidebar hidden) */}
            <div className="flex items-center gap-2 lg:hidden">
               <svg className="w-6 h-6 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
                <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
              </svg>
              <span className="font-bold text-slate-800 hidden sm:inline">Geheugensteuntje</span>
            </div>
          </div>

          {/* Top Right Action - Visible New Recording Button */}
          <button 
             onClick={handleNewRecording}
             className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2 px-4 rounded-full shadow-sm transition-transform active:scale-95"
           >
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
             <span className="hidden sm:inline">Nieuwe Opname</span>
           </button>
        </div>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          
          {/* Main Layout Centering Container */}
          <div className="max-w-5xl mx-auto h-full flex flex-col">

            {/* ERROR STATE */}
            {errorMsg && (
              <div className="mb-8 mx-auto p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg max-w-md text-center animate-in fade-in slide-in-from-top-4">
                {errorMsg}
                <button onClick={handleNewRecording} className="block mx-auto mt-2 text-sm font-semibold hover:underline">
                  Probeer opnieuw
                </button>
              </div>
            )}

            {/* RECORDING / IDLE STATE */}
            {(appState === AppState.IDLE || appState === AppState.RECORDING || appState === AppState.ERROR) && (
              <div className="flex-1 flex flex-col items-center justify-center min-h-[500px]">
                <div className="text-center mb-12">
                   <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
                     <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Geheugensteuntje</span>
                   </h1>
                   <p className="text-slate-500 text-lg">Jouw persoonlijke AI notulist.</p>
                </div>
                
                <RecordButton 
                  isRecording={appState === AppState.RECORDING} 
                  onToggle={toggleRecording}
                  disabled={appState === AppState.ERROR && !errorMsg}
                />
              </div>
            )}

            {/* PROCESSING STATE */}
            {appState === AppState.PROCESSING && (
               <div className="flex-1 flex flex-col items-center justify-center">
                <div className="relative w-24 h-24 mb-6">
                   <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
                   <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <h2 className="text-xl font-semibold text-slate-800">Gesprek analyseren...</h2>
                <p className="text-slate-500 mt-2">Moment geduld, de AI structureert je notulen.</p>
              </div>
            )}

            {/* FINISHED / VIEW STATE */}
            {appState === AppState.FINISHED && currentMeeting && (
              <ResultView 
                data={currentMeeting.data} 
                title={currentMeeting.title}
                onUpdateTitle={handleUpdateTitle}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
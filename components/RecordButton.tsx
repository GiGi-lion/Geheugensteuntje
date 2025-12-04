import React from 'react';

interface RecordButtonProps {
  isRecording: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

const RecordButton: React.FC<RecordButtonProps> = ({ isRecording, onToggle, disabled }) => {
  return (
    <div className="relative flex items-center justify-center">
      {/* Ripple Effect Background - Only active when recording */}
      {isRecording && (
        <div className="absolute w-full h-full rounded-full bg-red-500 opacity-20 animate-ripple"></div>
      )}
      
      <button
        onClick={onToggle}
        disabled={disabled}
        className={`
          relative z-10 flex items-center justify-center 
          w-32 h-32 rounded-full 
          transition-all duration-300 ease-in-out shadow-xl
          focus:outline-none focus:ring-4 focus:ring-red-300
          ${isRecording 
            ? 'bg-red-600 scale-110 shadow-red-500/50' 
            : 'bg-white hover:bg-gray-50 border-4 border-slate-200'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        aria-label={isRecording ? "Stop opname" : "Start opname"}
      >
        {isRecording ? (
          // Stop Icon (Square)
          <div className="w-10 h-10 bg-white rounded-md shadow-sm transition-transform duration-300 hover:scale-90" />
        ) : (
          // Mic Icon
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="w-12 h-12 text-red-500" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
            <line x1="12" y1="19" x2="12" y2="23"></line>
            <line x1="8" y1="23" x2="16" y2="23"></line>
          </svg>
        )}
      </button>

      {/* Text Indicator */}
      <div className="absolute -bottom-16 text-center w-64">
        <p className={`text-lg font-medium transition-colors duration-300 ${isRecording ? 'text-red-600 animate-pulse' : 'text-slate-500'}`}>
          {isRecording ? "Aan het opnemen..." : "Tik om te starten"}
        </p>
      </div>
    </div>
  );
};

export default RecordButton;

import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Square, X, Sparkles, Volume2, AlertCircle, RefreshCw } from 'lucide-react';
import { voiceRecognition } from '../services/speech';

interface VoiceInputProps {
  onAutoSubmitQuestion: (question: string) => void;
  disabled?: boolean;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({ onAutoSubmitQuestion, disabled }) => {
  const [isListening, setIsListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    setIsSupported(voiceRecognition.isSupported());
  }, []);

  const handleStartListening = () => {
    setErrorMessage(null);
    setLiveTranscript('');

    if (!isSupported) {
      setErrorMessage('Speech recognition is not supported in this browser. Please use Google Chrome, Microsoft Edge, or Safari.');
      return;
    }

    voiceRecognition.start({
      onStart: () => {
        setIsListening(true);
      },
      onInterimResult: (text: string) => {
        setLiveTranscript(text);
      },
      onFinalAutoSubmit: (finalText: string) => {
        setIsListening(false);
        setLiveTranscript('');
        // AUTOMATIC SPEECH SUBMISSION: directly calls the AI pipeline
        onAutoSubmitQuestion(finalText);
      },
      onError: (err: string) => {
        setIsListening(false);
        setErrorMessage(err);
      },
      onEnd: () => {
        setIsListening(false);
      },
    });
  };

  const handleManualStop = () => {
    // If user manually clicks stop, submit whatever is transcribed
    if (liveTranscript.trim()) {
      const text = liveTranscript.trim();
      voiceRecognition.stop();
      setIsListening(false);
      setLiveTranscript('');
      onAutoSubmitQuestion(text);
    } else {
      voiceRecognition.stop();
      setIsListening(false);
    }
  };

  const handleCancel = () => {
    voiceRecognition.cancel();
    setIsListening(false);
    setLiveTranscript('');
    setErrorMessage(null);
  };

  return (
    <>
      {/* Primary Microphone Trigger Button */}
      <button
        type="button"
        onClick={isListening ? handleManualStop : handleStartListening}
        disabled={disabled}
        className={`relative p-2.5 rounded-xl font-medium transition-all flex items-center justify-center shrink-0 ${
          isListening
            ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 animate-pulse ring-2 ring-rose-400/50'
            : 'bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 border border-brand-500/30 hover:border-brand-500/60 shadow-sm'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        title={isListening ? 'Listening... click to send immediately' : 'Ask by Voice (Hands-Free)'}
      >
        <Mic className={`w-5 h-5 ${isListening ? 'text-white scale-110' : 'text-brand-400'} transition-transform`} />
        {isListening && (
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
          </span>
        )}
      </button>

      {/* Floating Active Voice Assistant Banner */}
      {isListening && (
        <div className="fixed inset-x-0 bottom-24 z-50 flex justify-center px-4 pointer-events-auto">
          <div className="bg-slate-900/98 border border-rose-500/50 rounded-2xl p-4 shadow-2xl backdrop-blur-2xl max-w-xl w-full flex flex-col gap-3 ring-2 ring-rose-500/30 animate-in fade-in slide-in-from-bottom-4 duration-200">
            {/* Top row: Status & Wave animation */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                </span>
                <span className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                  🔴 Listening... Speak your programming question
                </span>
              </div>

              {/* Sound Wave */}
              <div className="sound-wave">
                <div className="sound-bar bg-rose-500"></div>
                <div className="sound-bar bg-rose-400"></div>
                <div className="sound-bar bg-brand-400"></div>
                <div className="sound-bar bg-rose-400"></div>
                <div className="sound-bar bg-rose-500"></div>
              </div>
            </div>

            {/* Live Transcription Preview */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 min-h-[56px] flex flex-col justify-center">
              {liveTranscript ? (
                <div>
                  <span className="text-[10px] uppercase font-bold text-brand-400 tracking-wider block mb-0.5">
                    You said:
                  </span>
                  <p className="text-xs sm:text-sm font-mono text-slate-100 leading-relaxed break-words font-medium">
                    "{liveTranscript}"
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  Say something like: "Write a Python program to check whether a number is prime" or "Find the largest number in an array"...
                </p>
              )}
            </div>

            {/* Footer with instant auto-submit notice and controls */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                <span>Stops and generates code automatically when you finish speaking.</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center gap-1 text-slate-400 hover:text-slate-200 px-2.5 py-1 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>

                <button
                  type="button"
                  onClick={handleManualStop}
                  disabled={!liveTranscript.trim()}
                  className="flex items-center gap-1 font-bold text-slate-950 bg-gradient-to-r from-brand-400 to-emerald-400 hover:from-brand-300 hover:to-emerald-300 px-3 py-1 rounded-lg shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span>Send Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Toast Notification if voice fails */}
      {errorMessage && !isListening && (
        <div className="fixed bottom-24 right-6 z-50 bg-slate-900 border border-rose-500/40 text-rose-300 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 max-w-md animate-in fade-in slide-in-from-bottom-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <p className="text-xs">{errorMessage}</p>
          <button
            onClick={() => setErrorMessage(null)}
            className="p-1 hover:bg-rose-500/20 rounded text-rose-400 ml-auto"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </>
  );
};

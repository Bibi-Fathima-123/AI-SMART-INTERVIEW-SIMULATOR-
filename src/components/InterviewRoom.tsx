import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, AlertCircle, Loader2 } from 'lucide-react';
import { useGeminiLive } from '../hooks/useGeminiLive';
import { InterviewRole } from '../types';
import { cn } from '../lib/utils';

interface InterviewRoomProps {
  role: InterviewRole;
  onEnd: (transcript: string) => void;
}

export function InterviewRoom({ role, onEnd }: InterviewRoomProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [transcript, setTranscript] = useState<{ text: string; isModel: boolean }[]>([]);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);

  const handleTranscription = useCallback((text: string, isModel: boolean) => {
    setTranscript(prev => [...prev, { text, isModel }]);
  }, []);

  const { isConnected, isConnecting, error, connect, disconnect, sendVideoFrame } = useGeminiLive({
    role: role.title,
    onTranscription: handleTranscription,
  });

  // Setup camera
  useEffect(() => {
    let stream: MediaStream | null = null;
    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    }
    startCamera();
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  // Send video frames to Gemini
  useEffect(() => {
    if (!isConnected || !isCameraOn) return;

    const interval = setInterval(() => {
      if (videoRef.current && canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, 320, 240);
          const base64Data = canvasRef.current.toDataURL('image/jpeg', 0.5).split(',')[1];
          sendVideoFrame(base64Data);
        }
      }
    }, 1000); // Send frame every second

    return () => clearInterval(interval);
  }, [isConnected, isCameraOn, sendVideoFrame]);

  const handleEndInterview = () => {
    disconnect();
    const fullTranscript = transcript.map(t => `${t.isModel ? 'Interviewer' : 'Candidate'}: ${t.text}`).join('\n');
    onEnd(fullTranscript);
  };

  const currentQuestion = [...transcript].reverse().find(t => t.isModel)?.text;
  const lastUserSpeech = [...transcript].reverse().find(t => !t.isModel)?.text;

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a] text-white overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between p-6 border-bottom border-white/10 bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
          <div>
            <h1 className="text-lg font-semibold">{role.title} Interview</h1>
            <p className="text-xs text-white/40 uppercase tracking-widest">Live Session</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMicOn(!isMicOn)}
            className={cn(
              "p-3 rounded-full transition-all",
              isMicOn ? "bg-white/10 hover:bg-white/20" : "bg-red-500/20 text-red-500"
            )}
          >
            {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>
          <button 
            onClick={() => setIsCameraOn(!isCameraOn)}
            className={cn(
              "p-3 rounded-full transition-all",
              isCameraOn ? "bg-white/10 hover:bg-white/20" : "bg-red-500/20 text-red-500"
            )}
          >
            {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>
          <button 
            onClick={handleEndInterview}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-full font-medium transition-colors"
          >
            <PhoneOff className="w-4 h-4" /> End Session
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex gap-6 p-6 overflow-hidden">
        {/* Video Section */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="relative flex-1 bg-zinc-900 rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
            <video 
              ref={videoRef} 
              autoPlay 
              muted 
              playsInline 
              className={cn(
                "w-full h-full object-cover transition-opacity duration-500",
                isCameraOn ? "opacity-100" : "opacity-0"
              )}
            />
            {!isCameraOn && (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center">
                  <VideoOff className="w-10 h-10 text-zinc-600" />
                </div>
              </div>
            )}
            
            {/* AI Overlay */}
            <div className="absolute top-6 right-6 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                isConnected ? "bg-emerald-500" : "bg-zinc-500"
              )} />
              <span className="text-xs font-medium uppercase tracking-wider">
                {isConnected ? "AI Interviewer Active" : "AI Offline"}
              </span>
            </div>

            {/* Current Question Overlay */}
            <AnimatePresence mode="wait">
              {currentQuestion && isConnected && (
                <motion.div
                  key="question"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute bottom-6 left-6 right-6 p-6 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl z-10"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-indigo-500/20 rounded-lg">
                      <MessageSquare className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold mb-1">Current Question</p>
                      <p className="text-lg font-medium leading-relaxed text-white/90">{currentQuestion}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* User Speech "Voice Command" Overlay */}
            <AnimatePresence>
              {lastUserSpeech && isConnected && (
                <motion.div
                  key="user-speech"
                  initial={{ opacity: 0, scale: 0.9, y: -20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute top-20 left-1/2 -translate-x-1/2 px-6 py-3 bg-indigo-500/20 backdrop-blur-md rounded-full border border-indigo-500/30 shadow-lg z-20 flex items-center gap-3"
                >
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                  <span className="text-xs font-medium text-indigo-200">AI Hears: </span>
                  <span className="text-xs text-white/80 italic">"{lastUserSpeech}"</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Hidden canvas for frame capture */}
            <canvas ref={canvasRef} width={320} height={240} className="hidden" />
          </div>

          {/* Controls / Status */}
          <div className="h-32 bg-white/5 rounded-3xl border border-white/10 p-6 flex items-center justify-center">
            {!isConnected && !isConnecting && (
              <button 
                onClick={connect}
                className="px-10 py-4 bg-indigo-500 hover:bg-indigo-600 rounded-2xl font-bold text-lg shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95"
              >
                Start Interview
              </button>
            )}
            {isConnecting && (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                <p className="text-sm text-white/60">Establishing secure connection...</p>
              </div>
            )}
            {isConnected && (
              <div className="flex items-center gap-8">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <motion.div 
                        key={i}
                        animate={{ height: [8, 24, 8] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                        className="w-1 bg-indigo-400 rounded-full"
                      />
                    ))}
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-white/40">AI Listening</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Transcript Section */}
        <div className="w-96 flex flex-col bg-zinc-900/50 rounded-3xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
            <h2 className="font-semibold">Live Transcript</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            <AnimatePresence initial={false}>
              {transcript.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                  <AlertCircle className="w-8 h-8 mb-2" />
                  <p className="text-sm">Transcript will appear here once the interview starts.</p>
                </div>
              ) : (
                transcript.map((t, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: t.isModel ? -10 : 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                      "max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed",
                      t.isModel 
                        ? "bg-indigo-500/10 text-indigo-100 self-start rounded-tl-none border border-indigo-500/20" 
                        : "bg-white/10 text-white self-end rounded-tr-none border border-white/10 ml-auto"
                    )}
                  >
                    <p className="text-[10px] uppercase tracking-widest opacity-40 mb-1">
                      {t.isModel ? "Interviewer" : "You"}
                    </p>
                    {t.text}
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {error && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 px-6 py-3 bg-red-500 text-white rounded-full shadow-xl flex items-center gap-2 z-50">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

interface UseGeminiLiveProps {
  role: string;
  onTranscription?: (text: string, isModel: boolean) => void;
  onInterrupted?: () => void;
  onFeedback?: (feedback: any) => void;
}

export function useGeminiLive({ role, onTranscription, onInterrupted, onFeedback }: UseGeminiLiveProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioQueueRef = useRef<Int16Array[]>([]);
  const isPlayingRef = useRef(false);

  const stopAudio = useCallback(() => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    audioQueueRef.current = [];
    isPlayingRef.current = false;
  }, []);

  const playQueuedAudio = useCallback(async () => {
    if (isPlayingRef.current || audioQueueRef.current.length === 0 || !audioContextRef.current) return;

    isPlayingRef.current = true;
    const ctx = audioContextRef.current;

    while (audioQueueRef.current.length > 0) {
      const pcmData = audioQueueRef.current.shift()!;
      const float32Data = new Float32Array(pcmData.length);
      for (let i = 0; i < pcmData.length; i++) {
        float32Data[i] = pcmData[i] / 32768.0;
      }

      const buffer = ctx.createBuffer(1, float32Data.length, 24000);
      buffer.getChannelData(0).set(float32Data);

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      
      await new Promise<void>((resolve) => {
        source.onended = () => resolve();
        source.start();
      });
    }

    isPlayingRef.current = false;
  }, []);

  const connect = useCallback(async () => {
    if (isConnecting || isConnected) return;
    
    setIsConnecting(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const session = await ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-09-2025",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: `You are a professional, elite interviewer for the position of ${role}. 
          Your mission is to conduct a high-stakes, realistic technical interview.
          
          STRICT INTERVIEW FLOW:
          1. INTRODUCTION: Start by introducing yourself briefly and ask the candidate to introduce themselves.
          2. ONE BY ONE: Ask exactly ONE question at a time. Wait for the candidate to finish their entire answer before responding.
          3. ACTIVE LISTENING: Listen intently to the candidate's response. If their answer is vague, ask a follow-up question to dig deeper.
          4. CLARITY: If the candidate says something you don't understand due to audio issues, politely ask them to repeat or clarify.
          5. TRANSCRIPTION AWARENESS: You are aware that your conversation is being transcribed. Speak clearly.
          6. ROLE-SPECIFIC: Ask questions that are highly relevant to the ${role} role, covering both technical skills and behavioral traits.
          7. ENDING: After 5-7 questions, thank the candidate and tell them the interview is over.
          
          BEHAVIOR:
          - Do not talk over the candidate.
          - Do not provide long monologues.
          - Be professional, slightly challenging, but fair.
          - Use the video feed to note their confidence and body language.`,
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            setIsConnecting(false);
            console.log("Live session opened");
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle audio output
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
              const binaryString = atob(base64Audio);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              const pcmData = new Int16Array(bytes.buffer);
              audioQueueRef.current.push(pcmData);
              playQueuedAudio();
            }

            // Handle transcription
            if (message.serverContent?.modelTurn?.parts?.[0]?.text) {
              onTranscription?.(message.serverContent.modelTurn.parts[0].text, true);
            }
            
            // Handle user transcription (from inputAudioTranscription)
            const serverContent = message.serverContent as any;
            if (serverContent?.inputAudioTranscription?.text) {
              onTranscription?.(serverContent.inputAudioTranscription.text, false);
            }
            
            if (message.serverContent?.interrupted) {
              audioQueueRef.current = [];
              isPlayingRef.current = false;
              onInterrupted?.();
            }
          },
          onclose: () => {
            setIsConnected(false);
            stopAudio();
            console.log("Live session closed");
          },
          onerror: (err) => {
            console.error("Live session error:", err);
            setError("Connection error. Please try again.");
            setIsConnecting(false);
            stopAudio();
          }
        }
      });

      sessionRef.current = session;

      // Setup Audio Capture
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = audioCtx;
      
      const source = audioCtx.createMediaStreamSource(stream);
      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
        }
        
        const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
        session.sendRealtimeInput({
          media: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
        });
      };

      source.connect(processor);
      processor.connect(audioCtx.destination);

    } catch (err) {
      console.error("Failed to connect:", err);
      setError("Failed to access microphone or connect to AI.");
      setIsConnecting(false);
    }
  }, [role, isConnecting, isConnected, onTranscription, onInterrupted, playQueuedAudio, stopAudio]);

  const disconnect = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    setIsConnected(false);
    stopAudio();
  }, [stopAudio]);

  const sendVideoFrame = useCallback((base64Data: string) => {
    if (sessionRef.current && isConnected) {
      sessionRef.current.sendRealtimeInput({
        media: { data: base64Data, mimeType: 'image/jpeg' }
      });
    }
  }, [isConnected]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    sendVideoFrame
  };
}

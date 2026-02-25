import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Brain, Mic2, BarChart3 } from 'lucide-react';
import { RoleSelector } from './components/RoleSelector';
import { InterviewRoom } from './components/InterviewRoom';
import { FeedbackReport } from './components/FeedbackReport';
import { generateInterviewFeedback } from './services/feedbackService';
import { InterviewRole, InterviewFeedback } from './types';

type AppState = 'landing' | 'interviewing' | 'evaluating' | 'feedback';

export default function App() {
  const [state, setState] = useState<AppState>('landing');
  const [selectedRole, setSelectedRole] = useState<InterviewRole | null>(null);
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);

  const handleRoleSelect = (role: InterviewRole) => {
    setSelectedRole(role);
    setState('interviewing');
  };

  const handleInterviewEnd = async (transcript: string) => {
    if (!selectedRole) return;
    
    setState('evaluating');
    try {
      const result = await generateInterviewFeedback(selectedRole.title, transcript);
      setFeedback(result);
      setState('feedback');
    } catch (error) {
      console.error("Evaluation failed:", error);
      setState('landing');
      alert("Something went wrong during evaluation. Please try again.");
    }
  };

  const handleRestart = () => {
    setFeedback(null);
    setSelectedRole(null);
    setState('landing');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-indigo-500/30">
      <AnimatePresence mode="wait">
        {state === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative min-h-screen flex flex-col items-center justify-center py-20 px-6"
          >
            {/* Background Glows */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px] -z-10" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[128px] -z-10" />

            <div className="text-center max-w-3xl mb-16">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-indigo-400 text-sm font-medium mb-8"
              >
                <Sparkles className="w-4 h-4" />
                Next-Gen Interview Prep
              </motion.div>
              <h1 className="text-6xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                Master Your Next <br /> Big Interview
              </h1>
              <p className="text-xl text-white/40 leading-relaxed max-w-2xl mx-auto">
                Practice with our advanced AI interviewer. Get real-time voice feedback, 
                emotion analysis, and detailed performance reports.
              </p>
            </div>

            <div className="w-full max-w-7xl mx-auto">
              <RoleSelector onSelect={handleRoleSelect} />
            </div>

            <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto border-t border-white/5 pt-20">
              {[
                { icon: Mic2, title: "Voice First", desc: "Natural, real-time voice conversations powered by Gemini Live." },
                { icon: Brain, title: "Smart Analysis", desc: "Deep technical evaluation and communication quality scoring." },
                { icon: BarChart3, title: "Growth Tracking", desc: "Personalized feedback loops to improve your interview readiness." },
              ].map((feature, i) => (
                <div key={i} className="flex flex-col items-center text-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                  <p className="text-sm text-white/40">{feature.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {state === 'interviewing' && selectedRole && (
          <motion.div
            key="interview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-screen"
          >
            <InterviewRoom role={selectedRole} onEnd={handleInterviewEnd} />
          </motion.div>
        )}

        {state === 'evaluating' && (
          <motion.div
            key="evaluating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-screen flex flex-col items-center justify-center gap-8 bg-[#050505]"
          >
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Brain className="w-8 h-8 text-indigo-400 animate-pulse" />
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">Analyzing Performance</h2>
              <p className="text-white/40">Our AI is reviewing your technical answers and communication style...</p>
            </div>
          </motion.div>
        )}

        {state === 'feedback' && feedback && (
          <motion.div
            key="feedback"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen py-20"
          >
            <FeedbackReport feedback={feedback} onRestart={handleRestart} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

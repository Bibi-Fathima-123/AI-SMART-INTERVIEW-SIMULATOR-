import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Target, MessageCircle, Brain, CheckCircle2, ArrowRight, RefreshCcw } from 'lucide-react';
import { InterviewFeedback } from '../types';
import { cn } from '../lib/utils';

interface FeedbackReportProps {
  feedback: InterviewFeedback;
  onRestart: () => void;
}

export function FeedbackReport({ feedback, onRestart }: FeedbackReportProps) {
  return (
    <div className="max-w-5xl mx-auto p-8 space-y-8">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2.5rem] p-12 text-white shadow-2xl shadow-indigo-500/20"
      >
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h1 className="text-5xl font-bold mb-4">Interview Complete</h1>
            <p className="text-indigo-100 text-lg max-w-md">
              Great job! We've analyzed your performance across technical, communication, and emotional metrics.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="transparent"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="12"
                />
                <motion.circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="transparent"
                  stroke="white"
                  strokeWidth="12"
                  strokeDasharray={440}
                  initial={{ strokeDashoffset: 440 }}
                  animate={{ strokeDashoffset: 440 - (440 * feedback.score) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold">{feedback.score}</span>
                <span className="text-xs font-medium uppercase tracking-widest opacity-60">Overall Score</span>
              </div>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: "Technical Accuracy", content: feedback.technicalAccuracy, icon: Target, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { title: "Communication", content: feedback.communicationClarity, icon: MessageCircle, color: "text-blue-400", bg: "bg-blue-500/10" },
          { title: "Emotional Intelligence", content: feedback.emotionalIntelligence, icon: Brain, color: "text-amber-400", bg: "bg-amber-500/10" },
        ].map((metric, i) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors"
          >
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6", metric.bg)}>
              <metric.icon className={cn("w-6 h-6", metric.color)} />
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">{metric.title}</h3>
            <p className="text-white/60 text-sm leading-relaxed">{metric.content}</p>
          </motion.div>
        ))}
      </div>

      {/* Suggestions & Next Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/5 border border-white/10 rounded-[2rem] p-10"
        >
          <div className="flex items-center gap-3 mb-8">
            <Trophy className="w-6 h-6 text-indigo-400" />
            <h2 className="text-2xl font-bold text-white">Areas for Improvement</h2>
          </div>
          <ul className="space-y-4">
            {feedback.suggestions.map((suggestion, i) => (
              <li key={i} className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                <div className="mt-1">
                  <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                </div>
                <span className="text-white/80 leading-relaxed">{suggestion}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col gap-6"
        >
          <div className="flex-1 bg-indigo-500/10 border border-indigo-500/20 rounded-[2rem] p-10 flex flex-col items-center justify-center text-center">
            <Target className="w-12 h-12 text-indigo-400 mb-6" />
            <h3 className="text-2xl font-bold text-white mb-4">Ready for another round?</h3>
            <p className="text-white/60 mb-8 max-w-xs">
              Practice makes perfect. Try a different role or focus on the suggestions above.
            </p>
            <button
              onClick={onRestart}
              className="w-full py-4 bg-white text-black rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/90 transition-all active:scale-95"
            >
              <RefreshCcw className="w-5 h-5" /> Start New Interview
            </button>
          </div>
          
          <div className="p-8 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="text-white font-semibold">Share Performance</p>
                <p className="text-white/40 text-xs">Export your feedback report</p>
              </div>
            </div>
            <button className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
              <ArrowRight className="w-5 h-5 text-white" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

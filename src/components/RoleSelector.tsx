import React from 'react';
import { motion } from 'motion/react';
import { 
  Code, Briefcase, Database, Palette, Layout, Server, 
  Smartphone, Cloud, ShieldCheck, Lock, ChevronRight 
} from 'lucide-react';
import { INTERVIEW_ROLES, InterviewRole } from '../types';
import { cn } from '../lib/utils';

interface RoleSelectorProps {
  onSelect: (role: InterviewRole) => void;
}

const iconMap: Record<string, React.ElementType> = {
  Code,
  Briefcase,
  Database,
  Palette,
  Layout,
  Server,
  Smartphone,
  Cloud,
  ShieldCheck,
  Lock,
};

export function RoleSelector({ onSelect }: RoleSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto p-6">
      {INTERVIEW_ROLES.map((role, index) => {
        const Icon = iconMap[role.icon] || Code;
        return (
          <motion.button
            key={role.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelect(role)}
            className={cn(
              "group relative flex flex-col items-start p-6 bg-white/5 border border-white/10 rounded-3xl text-left transition-all hover:bg-white/10 hover:border-white/20 hover:scale-[1.02] active:scale-[0.98]"
            )}
          >
            <div className="p-3 bg-indigo-500/20 rounded-xl mb-4 group-hover:bg-indigo-500/30 transition-colors">
              <Icon className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">{role.title}</h3>
            <p className="text-white/60 text-xs leading-relaxed mb-4 line-clamp-2">{role.description}</p>
            <div className="flex items-center text-indigo-400 font-medium text-xs group-hover:translate-x-1 transition-transform">
              Start Interview <ChevronRight className="w-3 h-3 ml-1" />
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

import React from 'react';
import { X } from 'lucide-react';
import { WorkoutDetailsView } from './WorkoutDetailsView.tsx';

interface ViewWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  workout: any;
}

export function ViewWorkoutModal({ isOpen, onClose, workout }: ViewWorkoutModalProps) {
  if (!isOpen || !workout) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col h-[90vh]">
        <div className="flex justify-end p-4 shrink-0 absolute right-0 top-0 z-10">
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-white rounded-full text-slate-400 hover:text-slate-600 transition-colors shadow-sm">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-hidden relative">
           <WorkoutDetailsView workout={workout} onBack={onClose} />
        </div>
      </div>
    </div>
  );
}

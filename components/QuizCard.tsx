import React, { useState, useEffect, useMemo } from 'react';
import { Question, Option } from '../types';

interface QuizCardProps {
  question: Question;
  onAnswer: (isCorrect: boolean) => void;
}

export const QuizCard: React.FC<QuizCardProps> = ({ question, onAnswer }) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  // Shuffle options only once per question instance
  const shuffledOptions = useMemo(() => {
    const opts = [...question.options];
    // Fisher-Yates shuffle
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    return opts;
  }, [question]);

  // Reset state when question changes
  useEffect(() => {
    setSelectedIdx(null);
    setIsRevealed(false);
  }, [question]);

  const handleSelect = (idx: number) => {
    if (isRevealed) return; // Prevent changing after reveal
    setSelectedIdx(idx);
    setIsRevealed(true);
    
    // Slight delay before notifying parent to allow user to see the result animation
    setTimeout(() => {
        onAnswer(shuffledOptions[idx].isCorrect || false);
    }, 1500);
  };

  return (
    <div className="w-full max-w-3xl mx-auto animate-slide-up">
      {/* Question Text */}
      <div className="bg-glass-200 backdrop-blur-xl border border-glass-border rounded-2xl p-8 mb-6 shadow-2xl">
        <h2 className="text-2xl md:text-3xl font-display font-semibold text-white leading-tight">
          {question.question}
        </h2>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 gap-4">
        {shuffledOptions.map((opt, idx) => {
          let stateStyles = "bg-glass-100 border-glass-border hover:bg-glass-200";
          let icon = null;

          if (isRevealed) {
            if (opt.isCorrect) {
              stateStyles = "bg-emerald-500/20 border-emerald-500/50 text-emerald-100";
              icon = "✅";
            } else if (selectedIdx === idx) {
              stateStyles = "bg-red-500/20 border-red-500/50 text-red-100";
              icon = "❌";
            } else {
              stateStyles = "opacity-50 grayscale";
            }
          } else if (selectedIdx === idx) {
            stateStyles = "bg-primary-600 border-primary-400";
          }

          return (
            <div key={idx} className="group relative">
                <button
                onClick={() => handleSelect(idx)}
                disabled={isRevealed}
                className={`w-full text-left p-6 rounded-xl border transition-all duration-300 transform ${
                    isRevealed ? '' : 'hover:scale-[1.01] hover:shadow-lg active:scale-[0.99]'
                } ${stateStyles}`}
                >
                <div className="flex items-center justify-between">
                    <span className="text-lg font-medium">{opt.text}</span>
                    {icon && <span className="text-xl">{icon}</span>}
                </div>
                </button>
                
                {/* Rationale / Explanation (Only show relevant ones) */}
                {isRevealed && (opt.isCorrect || selectedIdx === idx) && (
                    <div className="mt-2 p-4 bg-slate-900/50 rounded-lg text-sm text-slate-300 border-l-2 border-slate-500 animate-fade-in">
                        <span className="font-bold uppercase text-xs tracking-wider opacity-70 block mb-1">Analysis</span>
                        {opt.rationale}
                    </div>
                )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
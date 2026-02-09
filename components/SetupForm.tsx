import React, { useState } from 'react';
import { QuizConfig } from '../types';
import { Button } from './Button';

interface SetupFormProps {
  onStart: (config: QuizConfig) => void;
}

export const SetupForm: React.FC<SetupFormProps> = ({ onStart }) => {
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [difficulty, setDifficulty] = useState<QuizConfig['difficulty']>('Medium');
  const [qCount, setQCount] = useState(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic && !content) return;
    
    // If no specific content is provided, use the topic as content context
    const finalContent = content.length > 10 ? content : `Topic to generate quiz about: ${topic}`;

    onStart({
      topic: topic || 'General Knowledge',
      content: finalContent,
      difficulty,
      questionCount: qCount
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-accent-400 mb-4">
          Lumina Quiz
        </h1>
        <p className="text-slate-400 text-lg">
          Transform any text or topic into an interactive mastery session.
        </p>
      </div>

      <div className="bg-glass-100 backdrop-blur-md border border-glass-border rounded-2xl p-8 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Quiz Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Anatomy of the Heart, History of Java..."
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Context / Material <span className="text-slate-500 text-xs">(Optional, paste text here)</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your study notes, article, or documentation here..."
              rows={4}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
            <div>
               <label className="block text-sm font-medium text-slate-300 mb-2">Questions</label>
               <input 
                 type="number" 
                 min={3} 
                 max={20} 
                 value={qCount}
                 onChange={(e) => setQCount(parseInt(e.target.value))}
                 className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary-500"
               />
            </div>
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full py-4 text-lg shadow-primary-500/25">
              Generate Quiz ✨
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
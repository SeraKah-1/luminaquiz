import React, { useState } from 'react';
import { GameState, Question, QuizConfig, UserAnswer } from './types';
import { generateQuiz } from './services/geminiService';
import { SetupForm } from './components/SetupForm';
import { QuizCard } from './components/QuizCard';
import { ProgressBar } from './components/ProgressBar';
import { Button } from './components/Button';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.SETUP);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  // Background decoration
  const Background = () => (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-slate-950">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black"></div>
      <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-primary-600/10 rounded-full blur-[120px] animate-pulse-slow"></div>
      <div className="absolute top-[40%] -right-[10%] w-[40%] h-[60%] bg-accent-500/10 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
    </div>
  );

  const handleStart = async (config: QuizConfig) => {
    setGameState(GameState.LOADING);
    setErrorMsg('');
    try {
      const generatedQuestions = await generateQuiz(config);
      setQuestions(generatedQuestions);
      setCurrentQIdx(0);
      setScore(0);
      setUserAnswers([]);
      setGameState(GameState.PLAYING);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate quiz');
      setGameState(GameState.ERROR);
    }
  };

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) setScore(s => s + 1);
    
    // Automatically advance after a short delay (handled by visual component timing, but logic here)
    if (currentQIdx < questions.length - 1) {
      setCurrentQIdx(prev => prev + 1);
    } else {
      setGameState(GameState.FINISHED);
    }
  };

  const handleReset = () => {
    setGameState(GameState.SETUP);
    setQuestions([]);
    setScore(0);
  };

  return (
    <div className="min-h-screen font-sans text-slate-100 flex flex-col">
      <Background />
      
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col justify-center items-center">
        
        {/* SETUP PHASE */}
        {gameState === GameState.SETUP && (
          <SetupForm onStart={handleStart} />
        )}

        {/* LOADING PHASE */}
        {gameState === GameState.LOADING && (
          <div className="text-center animate-fade-in">
            <div className="w-24 h-24 mx-auto mb-6 relative">
              <div className="absolute inset-0 rounded-full border-4 border-slate-700"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-primary-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
            </div>
            <h2 className="text-2xl font-display font-semibold text-white mb-2">Constructing Quiz...</h2>
            <p className="text-slate-400">Analyzing content and designing cognitive challenges.</p>
          </div>
        )}

        {/* ERROR PHASE */}
        {gameState === GameState.ERROR && (
          <div className="text-center max-w-md bg-red-900/20 border border-red-500/30 p-8 rounded-2xl backdrop-blur-md">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Generation Failed</h2>
            <p className="text-slate-300 mb-6">{errorMsg}</p>
            <Button onClick={() => setGameState(GameState.SETUP)} variant="secondary">Try Again</Button>
          </div>
        )}

        {/* PLAYING PHASE */}
        {gameState === GameState.PLAYING && questions.length > 0 && (
          <div className="w-full flex flex-col items-center">
            <div className="w-full max-w-3xl mb-4 flex justify-between items-center px-2">
                <Button onClick={handleReset} variant="glass" className="py-1 px-3 text-xs">Exit</Button>
                <div className="text-slate-400 text-sm font-mono">Score: {score}</div>
            </div>
            
            <ProgressBar current={currentQIdx + 1} total={questions.length} />
            
            <QuizCard 
              key={currentQIdx} // Force re-render on new question
              question={questions[currentQIdx]} 
              onAnswer={handleAnswer} 
            />
          </div>
        )}

        {/* FINISHED PHASE */}
        {gameState === GameState.FINISHED && (
            <div className="text-center animate-slide-up bg-glass-100 p-10 rounded-3xl border border-glass-border shadow-2xl backdrop-blur-xl max-w-lg w-full">
                <div className="text-6xl mb-4">
                    {score / questions.length > 0.8 ? '🏆' : score / questions.length > 0.5 ? '👍' : '📚'}
                </div>
                <h2 className="text-4xl font-display font-bold text-white mb-2">Quiz Complete!</h2>
                <p className="text-slate-400 text-lg mb-8">You mastered this session.</p>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-slate-900/50 p-4 rounded-2xl">
                        <div className="text-3xl font-bold text-primary-400">{score}</div>
                        <div className="text-xs text-slate-500 uppercase tracking-wide">Score</div>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-2xl">
                        <div className="text-3xl font-bold text-accent-400">{Math.round((score/questions.length)*100)}%</div>
                        <div className="text-xs text-slate-500 uppercase tracking-wide">Accuracy</div>
                    </div>
                </div>

                <Button onClick={handleReset} className="w-full">
                    Create New Quiz
                </Button>
            </div>
        )}

      </main>
      
      <footer className="py-6 text-center text-slate-600 text-sm">
        <p>Powered by Google Gemini • Cognitive Design Principles</p>
      </footer>
    </div>
  );
};

export default App;
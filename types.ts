export interface Option {
  text: string;
  rationale: string;
  isCorrect?: boolean; // Added internally after generation
}

export interface Question {
  question: string;
  options: Option[];
}

export interface QuizConfig {
  topic: string;
  content: string; // The raw text context
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  questionCount: number;
}

export enum GameState {
  SETUP,
  LOADING,
  PLAYING,
  FINISHED,
  ERROR
}

export interface UserAnswer {
  questionIndex: number;
  selectedOptionIndex: number;
  isCorrect: boolean;
}
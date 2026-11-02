import type { GameMode, QuizModule } from '@/core/types';
import { timeQuiz } from './time';
import { phoneQuiz } from './phone';
import { numberQuiz } from './number';
import { priceQuiz } from './price';
import { dateQuiz } from './date';

/**
 * All quiz types. To add a new one, create a folder next to these with an `index.ts`
 * that exports a `QuizModule`, and add it here. It then shows up as its own mode
 * and as part of "Mix".
 */
export const QUIZZES: readonly QuizModule[] = [timeQuiz, phoneQuiz, numberQuiz, priceQuiz, dateQuiz];

const single = (quiz: QuizModule): GameMode => ({
  id: quiz.id,
  label: quiz.label,
  icon: quiz.icon,
  colors: quiz.colors,
  quizzes: [quiz],
});

export const MIX_MODE: GameMode = {
  id: 'mix',
  label: { de: 'Mix', zh: '混合' },
  icon: '<path d="M3 7h4l10 10h4M3 17h4l3-3M14 10l3-3h4M18 4l3 3-3 3M18 14l3 3-3 3"/>',
  colors: ['#FF6A9A', '#5C86FF'],
  quizzes: QUIZZES,
};

export const MODES: readonly GameMode[] = [...QUIZZES.map(single), MIX_MODE];

export const findMode = (id: string): GameMode | undefined => MODES.find((m) => m.id === id);
export const findQuiz = (id: string): QuizModule | undefined => QUIZZES.find((q) => q.id === id);

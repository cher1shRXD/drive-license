export type QuestionType =
  | "sentence_4_1"
  | "sentence_4_2"
  | "image_5_1"
  | "image_5_2"
  | "sign_4_1"
  | "sign_4_2"
  | "video_4_1"
  | "unknown";

export interface Question {
  id: number;
  number: number;
  question: string;
  options: string[];
  correct_answers: string[];
  explanation: string;
  situation?: string;
  image?: string;
  video_url?: string;
  type: QuestionType;
}

export interface QuestionsData {
  total: number;
  by_type: Record<QuestionType, Question[]>;
  all_questions: Question[];
}

export interface ExamResult {
  id: string;
  timestamp: number;
  score: number;
  totalQuestions: number;
  correctCount: number;
  timeSpent: number; // seconds
  answers: Record<string, string[]>; // questionId -> selectedAnswers
  byType: Record<QuestionType, {
    total: number;
    correct: number;
  }>;
}

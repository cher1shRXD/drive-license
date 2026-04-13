'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQuestions, getRandomQuestions } from '@/hooks/useQuestions';
import { useTimer } from '@/hooks/useTimer';
import { Question, ExamResult } from '@/types';
import Timer from '@/components/Timer';
import QuestionCard from '@/components/QuestionCard';
import { ChevronLeft, ChevronRight, Send, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const EXAM_TIME = 40 * 60;
const EXAM_QUESTIONS = 40;

export default function MockExam() {
  const router = useRouter();
  const { data, loading } = useQuestions();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [isFinished, setIsFinished] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (isFinished) return;
    setIsFinished(true);

    let correctCount = 0;
    const byType: Record<string, { total: number; correct: number }> = {};

    questions.forEach((q) => {
      const userAnswers = answers[q.id.toString()] || [];
      const isCorrect =
        userAnswers.length === q.correct_answers.length &&
        userAnswers.every((a) => q.correct_answers.includes(a));

      if (isCorrect) correctCount++;
      if (!byType[q.type]) byType[q.type] = { total: 0, correct: 0 };
      byType[q.type].total++;
      if (isCorrect) byType[q.type].correct++;
    });

    const result: ExamResult = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      score: Math.round((correctCount / questions.length) * 100),
      totalQuestions: questions.length,
      correctCount,
      timeSpent: EXAM_TIME - timer.secondsLeft,
      answers,
      byType,
    };

    const prev = JSON.parse(localStorage.getItem('examResults') || '[]') as ExamResult[];
    localStorage.setItem('examResults', JSON.stringify([...prev, result]));
    router.push(`/mock-exam/results/${result.id}`);
  }, [isFinished, questions, answers]);

  const timer = useTimer({ initialSeconds: EXAM_TIME, onTimeUp: handleSubmit });

  useEffect(() => {
    if (data) setQuestions(getRandomQuestions(data.all_questions, EXAM_QUESTIONS));
  }, [data]);

  if (loading || questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <p className="text-zinc-500 text-sm">시험 준비 중...</p>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <p className="text-zinc-500 text-sm">결과 처리 중...</p>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;

  return (
    <div className="min-h-screen bg-[#080808] flex flex-col">
      {/* 헤더 */}
      <header className="border-b border-zinc-800 bg-[#080808]/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200 transition-colors text-sm cursor-pointer">
            <ArrowLeft className="w-4 h-4" />
            나가기
          </Link>
          <Timer
            display={timer.display}
            isRunning={timer.isRunning}
            secondsLeft={timer.secondsLeft}
            totalSeconds={EXAM_TIME}
            onPause={timer.pause}
            onResume={timer.resume}
          />
          <div className="text-sm text-zinc-400 tabular-nums">
            <span className="text-white font-medium">{answeredCount}</span>/{questions.length}
          </div>
        </div>
      </header>

      <div className="flex-1 flex max-w-4xl mx-auto w-full gap-6 px-6 py-8">
        {/* 메인 컨텐츠 */}
        <div className="flex-1 min-w-0">
          <div className="bg-zinc-900 border border-zinc-800 p-8">
            <QuestionCard
              question={currentQ}
              questionNumber={currentIndex + 1}
              totalQuestions={questions.length}
              selectedAnswers={answers[currentQ.id.toString()] || []}
              onSelectAnswer={(sel) =>
                setAnswers(prev => ({ ...prev, [currentQ.id.toString()]: sel }))
              }
            />
          </div>

          {/* 이전/다음 */}
          <div className="flex justify-between mt-4">
            <button
              onClick={() => setCurrentIndex(i => i - 1)}
              disabled={currentIndex === 0}
              className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm font-medium hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              이전
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex(i => i + 1)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-zinc-200 text-[#080808] text-sm font-medium transition-all cursor-pointer"
              >
                다음
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-zinc-200 text-[#080808] text-sm font-semibold transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                제출하기
                {unansweredCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-zinc-200 text-zinc-700 text-xs">
                    {unansweredCount}개 미답변
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* 사이드: 문제 번호 그리드 */}
        <aside className="w-44 flex-shrink-0">
          <div className="bg-zinc-900 border border-zinc-800 p-4 sticky top-20">
            <p className="text-xs font-medium text-zinc-500 mb-3 uppercase tracking-wider">문제 목록</p>
            <div className="grid grid-cols-5 gap-1.5">
              {questions.map((q, idx) => {
                const isAnswered = !!answers[q.id.toString()];
                const isCurrent = idx === currentIndex;
                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`aspect-square text-xs font-medium transition-all duration-100 cursor-pointer ${
                      isCurrent
                        ? 'bg-white text-[#080808]'
                        : isAnswered
                        ? 'bg-white/20 text-white border border-white/20'
                        : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-800 space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <div className="w-3 h-3 bg-white/20 border border-white/20" />
                답변 완료
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <div className="w-3 h-3 bg-zinc-800" />
                미답변
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

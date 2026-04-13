'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuestions } from '@/hooks/useQuestions';
import QuestionCard from '@/components/QuestionCard';
import { QuestionType } from '@/types';
import { ArrowLeft, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

const TYPE_LABELS: Record<string, string> = {
  sentence_4_1: '문장형 4지선다 (1답)',
  sentence_4_2: '문장형 4지선다 (2답)',
  image_5_2:    '사진형 5지선다 (2답)',
  sign_4_1:     '안전표지형 4지선다 (1답)',
  sign_4_2:     '안전표지형 4지선다 (2답)',
  video_4_1:    '동영상형 4지선다 (1답)',
};

export default function QuestionDetail() {
  const params = useParams();
  const router = useRouter();
  const { data } = useQuestions();
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);

  const questionType = params.type as QuestionType;
  const questionId = parseInt(params.id as string);

  const typeQuestions = useMemo(
    () => (data?.by_type[questionType] ?? []),
    [data, questionType]
  );

  const currentIndex = useMemo(
    () => typeQuestions.findIndex(q => q.id === questionId),
    [typeQuestions, questionId]
  );

  const currentQuestion = typeQuestions[currentIndex];
  const prev = currentIndex > 0 ? typeQuestions[currentIndex - 1] : null;
  const next = currentIndex < typeQuestions.length - 1 ? typeQuestions[currentIndex + 1] : null;

  const reset = useCallback(() => {
    setSelectedAnswers([]);
    setShowExplanation(false);
  }, []);

  const goNext = useCallback(() => {
    if (next) {
      reset();
      router.push(`/study/${questionType}/${next.id}`);
    } else {
      router.push(`/study?type=${questionType}`);
    }
  }, [next, questionType, router, reset]);

  const handleSelectAnswer = useCallback((newAnswers: string[]) => {
    if (!currentQuestion) return;
    setSelectedAnswers(newAnswers);
    if (newAnswers.length >= currentQuestion.correct_answers.length) {
      setShowExplanation(true);
    }
  }, [currentQuestion]);

  // 정답이면 2초 후 자동 이동
  const isCorrect = showExplanation &&
    selectedAnswers.length === currentQuestion?.correct_answers.length &&
    selectedAnswers.every(a => currentQuestion?.correct_answers.includes(a));

  useEffect(() => {
    if (!isCorrect) return;
    const t = setTimeout(goNext, 2000);
    return () => clearTimeout(t);
  }, [isCorrect, goNext]);

  // 키보드 단축키
  useEffect(() => {
    if (!currentQuestion) return;

    const handleKey = (e: KeyboardEvent) => {
      // 입력 필드에서는 무시
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const num = e.key; // '1'~'5'
      if (['1', '2', '3', '4', '5'].includes(num)) {
        const idx = parseInt(num);
        if (idx > currentQuestion.options.length) return;
        if (showExplanation) return;

        const isMultiple = currentQuestion.correct_answers.length > 1;
        if (isMultiple) {
          const next = selectedAnswers.includes(num)
            ? selectedAnswers.filter(a => a !== num)
            : [...selectedAnswers, num];
          handleSelectAnswer(next);
        } else {
          handleSelectAnswer([num]);
        }
        return;
      }

      // 스페이스바: 오답 해설 확인 후 다음 문제
      if (e.code === 'Space' && showExplanation && !isCorrect) {
        e.preventDefault();
        goNext();
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentQuestion, showExplanation, isCorrect, selectedAnswers, handleSelectAnswer, goNext]);

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <p className="text-zinc-400">문제를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] flex flex-col">
      {/* 헤더 */}
      <header className="border-b border-zinc-800 bg-[#080808]/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            href={`/study?type=${questionType}`}
            className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200 transition-colors text-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            목록
          </Link>
          <div className="text-center">
            <p className="text-xs text-zinc-500">{TYPE_LABELS[questionType]}</p>
          </div>
          <button
            onClick={reset}
            className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200 transition-colors text-sm cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            초기화
          </button>
        </div>
      </header>

      <div className="flex-1 max-w-3xl mx-auto w-full px-6 py-8">
        {/* 문제 카드 */}
        <div className="bg-zinc-900 border border-zinc-800 p-8 mb-4">
          <QuestionCard
            question={currentQuestion}
            questionNumber={currentIndex + 1}
            totalQuestions={typeQuestions.length}
            selectedAnswers={selectedAnswers}
            onSelectAnswer={handleSelectAnswer}
            showExplanation={showExplanation}
          />
        </div>

        {/* 정답 후 카운트다운 or 스페이스바 안내 */}
        {showExplanation && (
          <div className="mb-4 text-center text-xs text-zinc-600">
            {isCorrect ? '2초 후 다음 문제로 이동합니다...' : 'Space — 다음 문제'}
          </div>
        )}

        {/* 이전/다음 내비게이션 */}
        <div className="flex gap-3">
          {prev ? (
            <Link
              href={`/study/${questionType}/${prev.id}`}
              onClick={reset}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-sm font-medium text-zinc-300 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              이전 문제
            </Link>
          ) : (
            <div className="flex-1 py-3 border border-zinc-800/30 text-center text-sm text-zinc-700">
              첫 번째 문제
            </div>
          )}

          {next ? (
            <Link
              href={`/study/${questionType}/${next.id}`}
              onClick={reset}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-white hover:bg-zinc-200 text-sm font-semibold text-[#080808] transition-all cursor-pointer"
            >
              다음 문제
              <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              href={`/study?type=${questionType}`}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-white hover:bg-zinc-200 text-sm font-semibold text-[#080808] transition-all cursor-pointer"
            >
              학습 완료
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

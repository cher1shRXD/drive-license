'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ExamResult, Question } from '@/types';
import { useQuestions } from '@/hooks/useQuestions';
import QuestionCard from '@/components/QuestionCard';
import {
  CheckCircle, XCircle, Clock, Target, BarChart3,
  RotateCcw, Home, ChevronDown, ChevronUp
} from 'lucide-react';

const TYPE_LABELS: Record<string, string> = {
  sentence_4_1: '문장형 4지선다 (1답)',
  sentence_4_2: '문장형 4지선다 (2답)',
  image_5_2:    '사진형 5지선다 (2답)',
  sign_4_1:     '안전표지형 4지선다 (1답)',
  sign_4_2:     '안전표지형 4지선다 (2답)',
  video_4_1:    '동영상형 4지선다 (1답)',
};

export default function ExamResults() {
  const params = useParams();
  const { data } = useQuestions();
  const [result, setResult] = useState<ExamResult | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [filterWrong, setFilterWrong] = useState(false);

  useEffect(() => {
    const results = JSON.parse(localStorage.getItem('examResults') || '[]') as ExamResult[];
    const found = results.find(r => r.id === params.id);
    if (found && data) {
      setResult(found);
      const ids = Object.keys(found.answers).map(Number);
      setQuestions(data.all_questions.filter(q => ids.includes(q.id)));
    }
  }, [params.id, data]);

  if (!result) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <p className="text-zinc-500 text-sm">결과 불러오는 중...</p>
      </div>
    );
  }

  const isPassed = result.score >= 60;

  const wrongQuestions = questions.filter(q => {
    const userAns = result.answers[q.id.toString()] || [];
    return !(
      userAns.length === q.correct_answers.length &&
      userAns.every(a => q.correct_answers.includes(a))
    );
  });

  const displayQuestions = filterWrong ? wrongQuestions : questions;

  return (
    <div className="min-h-screen bg-[#080808]">
      {/* 헤더 */}
      <header className="border-b border-zinc-800 bg-[#080808]/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200 transition-colors text-sm cursor-pointer">
            <Home className="w-4 h-4" />
            홈으로
          </Link>
          <span className="text-sm font-medium text-zinc-300">시험 결과</span>
          <Link href="/mock-exam" className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200 transition-colors text-sm cursor-pointer">
            <RotateCcw className="w-4 h-4" />
            다시 풀기
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* 점수 카드 */}
        <div className={`p-10 text-center mb-8 border ${
          isPassed
            ? 'bg-white/5 border-white/20'
            : 'bg-zinc-900 border-zinc-700'
        }`}>
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-white/10">
            {isPassed
              ? <CheckCircle className="w-8 h-8 text-white" />
              : <XCircle className="w-8 h-8 text-zinc-400" />
            }
          </div>
          <p className={`text-7xl font-bold mb-2 tabular-nums ${isPassed ? 'text-white' : 'text-zinc-300'}`}>
            {result.score}
            <span className="text-3xl font-medium ml-1">점</span>
          </p>
          <p className={`text-lg font-semibold mb-1 ${isPassed ? 'text-white' : 'text-zinc-400'}`}>
            {isPassed ? '합격' : '불합격'}
          </p>
          <p className="text-zinc-500 text-sm">
            {result.correctCount} / {result.totalQuestions} 정답 &middot; 합격선 60점
          </p>
        </div>

        {/* 통계 3개 */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            {
              icon: Target,
              label: '정답률',
              value: `${Math.round((result.correctCount / result.totalQuestions) * 100)}%`,
            },
            {
              icon: Clock,
              label: '소요 시간',
              value: `${Math.floor(result.timeSpent / 60)}분 ${result.timeSpent % 60}초`,
            },
            {
              icon: XCircle,
              label: '틀린 문제',
              value: `${result.totalQuestions - result.correctCount}개`,
            },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-zinc-900 border border-zinc-800 p-6 flex items-center gap-4">
              <div className="w-10 h-10 bg-white/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{value}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 유형별 성적 */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 mb-6">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="w-4 h-4 text-zinc-400" />
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">유형별 성적</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(result.byType).map(([type, stats]) => {
              const pct = Math.round((stats.correct / stats.total) * 100);
              return (
                <div key={type} className="p-4 bg-zinc-800/50 border border-zinc-700/50">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs text-zinc-400">{TYPE_LABELS[type] || type}</p>
                    <span className="text-xs font-bold text-white">{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-zinc-700 overflow-hidden">
                    <div className="h-full bg-white" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-xs text-zinc-500 mt-1.5">{stats.correct} / {stats.total} 정답</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 문제별 검토 토글 */}
        <div className="bg-zinc-900 border border-zinc-800 overflow-hidden">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-zinc-800/50 transition-colors cursor-pointer"
          >
            <span className="text-sm font-semibold text-zinc-300">문제별 상세 검토</span>
            {showDetails ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
          </button>

          {showDetails && (
            <div className="border-t border-zinc-800">
              <div className="px-6 py-3 flex items-center gap-3 border-b border-zinc-800 bg-[#080808]/50">
                <button
                  onClick={() => setFilterWrong(false)}
                  className={`px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                    !filterWrong ? 'bg-white text-[#080808]' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  전체 {questions.length}개
                </button>
                <button
                  onClick={() => setFilterWrong(true)}
                  className={`px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                    filterWrong ? 'bg-white text-[#080808]' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  오답 {wrongQuestions.length}개
                </button>
              </div>

              <div className="divide-y divide-zinc-800">
                {displayQuestions.map((q, idx) => {
                  const userAns = result.answers[q.id.toString()] || [];
                  const isCorrect =
                    userAns.length === q.correct_answers.length &&
                    userAns.every(a => q.correct_answers.includes(a));

                  return (
                    <div key={q.id} className={`p-6 border-l-2 ${isCorrect ? 'border-white/40' : 'border-zinc-600'}`}>
                      <QuestionCard
                        question={q}
                        questionNumber={idx + 1}
                        totalQuestions={displayQuestions.length}
                        selectedAnswers={userAns}
                        onSelectAnswer={() => {}}
                        showExplanation
                        disabled
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

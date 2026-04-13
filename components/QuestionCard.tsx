'use client';

import Image from 'next/image';
import { Question } from '@/types';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswers: string[];
  onSelectAnswer: (answers: string[]) => void;
  showExplanation?: boolean;
  disabled?: boolean;
}

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswers,
  onSelectAnswer,
  showExplanation = false,
  disabled = false,
}: QuestionCardProps) {
  const isMultiple = question.correct_answers.length > 1;

  const handleToggle = (answerNum: string) => {
    if (disabled || showExplanation) return;
    if (isMultiple) {
      if (selectedAnswers.includes(answerNum)) {
        onSelectAnswer(selectedAnswers.filter(a => a !== answerNum));
      } else {
        onSelectAnswer([...selectedAnswers, answerNum]);
      }
    } else {
      onSelectAnswer([answerNum]);
    }
  };

  const isCorrect =
    selectedAnswers.length > 0 &&
    selectedAnswers.length === question.correct_answers.length &&
    selectedAnswers.every(a => question.correct_answers.includes(a));

  const progressPct = ((questionNumber - 1) / totalQuestions) * 100;

  return (
    <div className="space-y-6">
      {/* 진행 상태 */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-zinc-400">
          {questionNumber} <span className="text-zinc-600">/ {totalQuestions}</span>
        </span>
        <div className="flex-1 h-1 bg-zinc-800 overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        {isMultiple && (
          <span className="flex items-center gap-1 text-xs text-zinc-300 bg-white/10 px-2 py-0.5 border border-white/20">
            <AlertCircle className="w-3 h-3" />
            복수 정답
          </span>
        )}
      </div>

      {/* 문제 */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-zinc-100 leading-relaxed">
          {question.question}
        </h2>

        {/* 동영상 */}
        {question.video_url && (
          question.video_url.startsWith('/') ? (
            <video
              src={question.video_url}
              controls
              autoPlay
              muted
              className="w-full border border-zinc-800 bg-black"
            />
          ) : (
            <a
              href={question.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-zinc-900 border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800 transition-all duration-150 cursor-pointer group"
            >
              <div className="w-10 h-10 bg-zinc-800 group-hover:bg-zinc-700 flex items-center justify-center flex-shrink-0 transition-colors">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-white">동영상 보기</p>
                <p className="text-xs text-zinc-500 mt-0.5">도로교통공단 공식 사이트에서 영상 확인</p>
              </div>
              <svg className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 ml-auto flex-shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )
        )}

        {/* 이미지 */}
        {question.image && (
          <div className="border border-zinc-800 overflow-hidden">
            <Image
              src={question.image}
              alt="문제 이미지"
              width={600}
              height={400}
              className="w-full h-auto object-contain"
              unoptimized
            />
          </div>
        )}

        {/* 사진형 상황 설명 */}
        {question.situation && (
          <div className="p-3 bg-zinc-800/60 border border-zinc-700/50 text-xs text-zinc-400 leading-relaxed">
            {question.situation}
          </div>
        )}
      </div>

      {/* 선택지 */}
      <div className="space-y-2">
        {question.options.map((option, idx) => {
          const num = (idx + 1).toString();
          const isSelected = selectedAnswers.includes(num);
          const isCorrectAnswer = question.correct_answers.includes(num);
          const isWrong = showExplanation && isSelected && !isCorrectAnswer;
          const isRight = showExplanation && isCorrectAnswer;

          let containerClass = 'bg-zinc-900 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800/80';
          let numClass = 'bg-zinc-800 text-zinc-400';
          let textClass = 'text-zinc-300';

          if (!showExplanation && isSelected) {
            containerClass = 'bg-white/10 border-white/40';
            numClass = 'bg-white text-[#080808]';
            textClass = 'text-white';
          } else if (showExplanation) {
            if (isRight) {
              containerClass = 'bg-white/10 border-white/30';
              numClass = 'bg-white text-[#080808]';
              textClass = 'text-white';
            } else if (isWrong) {
              containerClass = 'bg-zinc-800/50 border-zinc-600';
              numClass = 'bg-zinc-600 text-white';
              textClass = 'text-zinc-500 line-through';
            }
          }

          return (
            <button
              key={num}
              onClick={() => handleToggle(num)}
              disabled={disabled || showExplanation}
              className={`w-full flex items-center gap-3 p-4 border transition-all duration-150 text-left ${showExplanation ? 'cursor-default' : 'cursor-pointer'} ${containerClass}`}
            >
              <span className={`w-6 h-6 text-xs font-bold flex items-center justify-center flex-shrink-0 transition-colors ${numClass}`}>
                {idx + 1}
              </span>
              <span className={`text-sm leading-relaxed ${textClass}`}>{option}</span>
              {showExplanation && isRight && (
                <CheckCircle className="w-4 h-4 text-white ml-auto flex-shrink-0" />
              )}
              {showExplanation && isWrong && (
                <XCircle className="w-4 h-4 text-zinc-500 ml-auto flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* 정답/오답 표시 */}
      {showExplanation && selectedAnswers.length > 0 && (
        <div className={`flex items-center gap-2 p-3 text-sm font-medium ${
          isCorrect
            ? 'bg-white/10 border border-white/20 text-white'
            : 'bg-zinc-800/50 border border-zinc-600 text-zinc-300'
        }`}>
          {isCorrect
            ? <><CheckCircle className="w-4 h-4" /> 정답입니다!</>
            : <><XCircle className="w-4 h-4" /> 오답입니다. 정답: {question.correct_answers.join(', ')}번</>
          }
        </div>
      )}

      {/* 해설 */}
      {showExplanation && question.explanation && (
        <div className="p-4 bg-zinc-900 border border-zinc-800">
          <p className="text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wider">해설</p>
          <p className="text-sm text-zinc-300 leading-relaxed">{question.explanation}</p>
        </div>
      )}
    </div>
  );
}

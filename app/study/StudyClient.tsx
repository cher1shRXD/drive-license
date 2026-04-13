'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuestions } from '@/hooks/useQuestions';
import { useSolvedQuestions } from '@/hooks/useSolvedQuestions';
import { QuestionType } from '@/types';
import {
  ChevronRight, FileText, Image, ShieldAlert, Video, Search, RotateCcw
} from 'lucide-react';

const TYPE_CONFIG: Record<string, {
  label: string;
  icon: React.ElementType;
}> = {
  sentence_4_1: { label: '문장형 4지선다 (1답)', icon: FileText },
  sentence_4_2: { label: '문장형 4지선다 (2답)', icon: FileText },
  image_5_2:    { label: '사진형 5지선다 (2답)', icon: Image },
  sign_4_1:     { label: '안전표지형 4지선다 (1답)', icon: ShieldAlert },
  sign_4_2:     { label: '안전표지형 4지선다 (2답)', icon: ShieldAlert },
  video_4_1:    { label: '동영상형 4지선다 (1답)', icon: Video },
};

export default function StudyClient() {
  const { data, loading } = useQuestions();
  const { isSolved, solvedCountByType, resetByType } = useSolvedQuestions();
  const searchParams = useSearchParams();
  const [selectedType, setSelectedType] = useState<QuestionType>('sentence_4_1');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const typeParam = searchParams.get('type') as QuestionType | null;
    if (typeParam) setSelectedType(typeParam);
    // else stays at default 'sentence_4_1'
  }, [searchParams]);

  const types = useMemo(() => {
    if (!data) return [];
    return Object.keys(data.by_type).filter(t => t !== 'unknown') as QuestionType[];
  }, [data]);

  const filteredQuestions = useMemo(() => {
    if (!data) return [];
    const qs = data.by_type[selectedType] || [];
    if (!searchQuery.trim()) return qs;
    return qs.filter(q => q.question.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [data, selectedType, searchQuery]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-zinc-500 text-sm">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-8 flex gap-6">
      {/* 왼쪽: 유형 선택 */}
      <aside className="w-72 flex-shrink-0">
        <div className="sticky top-20 space-y-1.5">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3 px-1">문제 유형</p>
          {types.map(type => {
            const cfg = TYPE_CONFIG[type];
            if (!cfg) return null;
            const Icon = cfg.icon;
            const typeQuestions = data?.by_type[type] ?? [];
            const count = typeQuestions.length;
            const typeIds = typeQuestions.map(q => q.id);
            const solvedCount = solvedCountByType(typeIds);
            const isActive = selectedType === type;
            const allSolved = count > 0 && solvedCount === count;

            return (
              <button
                key={type}
                onClick={() => {
                  setSelectedType(type);
                  setSearchQuery('');
                }}
                className={`w-full flex items-center gap-3 p-3 text-left transition-all duration-150 cursor-pointer border ${
                  isActive
                    ? 'bg-white/10 border-white/20 shadow-sm'
                    : 'bg-transparent border-transparent hover:bg-zinc-900'
                }`}
              >
                <div className={`w-8 h-8 flex items-center justify-center flex-shrink-0 ${
                  isActive ? 'bg-white/10' : 'bg-zinc-800'
                }`}>
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-500'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium leading-tight ${isActive ? 'text-white' : 'text-zinc-400'}`}>
                    {cfg.label}
                  </p>
                  <p className={`text-xs mt-0.5 ${isActive ? 'text-zinc-300' : 'text-zinc-600'}`}>
                    {solvedCount > 0
                      ? <><span className={allSolved ? 'text-emerald-500' : 'text-emerald-700'}>{solvedCount}</span>/{count}문제</>
                      : <>{count}문제</>
                    }
                  </p>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-zinc-300 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      </aside>

      {/* 오른쪽: 문제 목록 */}
      <main className="flex-1 min-w-0">
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="문제 검색..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
            />
          </div>
          {solvedCountByType((data?.by_type[selectedType] ?? []).map(q => q.id)) > 0 && (
            <button
              onClick={() => {
                const ids = (data?.by_type[selectedType] ?? []).map(q => q.id);
                resetByType(ids);
              }}
              className="flex items-center gap-1.5 px-3 py-2.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              초기화
            </button>
          )}
        </div>
        <div className="space-y-px">
          {filteredQuestions.length === 0 ? (
            <div className="py-16 text-center text-zinc-600 text-sm">검색 결과가 없습니다.</div>
          ) : (
            filteredQuestions.map((q) => {
              const solved = isSolved(q.id);
              return (
                <Link
                  key={q.id}
                  href={`/study/${selectedType}/${q.id}`}
                  className="group w-full flex items-center gap-4 px-4 h-14 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50 transition-all duration-150 cursor-pointer overflow-hidden"
                >
                  <span className={`w-7 h-7 flex items-center justify-center text-xs font-medium flex-shrink-0 transition-colors tabular-nums ${
                    solved
                      ? 'bg-emerald-900/40 text-emerald-500'
                      : 'bg-zinc-800 group-hover:bg-zinc-700 text-zinc-500'
                  }`}>
                    {solved ? '✓' : q.number}
                  </span>
                  <p className={`flex-1 min-w-0 text-sm truncate transition-colors ${
                    solved ? 'text-zinc-500 group-hover:text-zinc-400' : 'text-zinc-300 group-hover:text-zinc-100'
                  }`}>
                    {q.question}
                  </p>
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 flex-shrink-0 transition-colors" />
                </Link>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}

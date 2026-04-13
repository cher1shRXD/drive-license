'use client';

import { useState, useEffect, useCallback } from 'react';
import { QuestionType } from '@/types';

const STORAGE_KEY = 'drive-license-solved';

function loadSolved(): Set<number> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return new Set<number>(parsed);
  } catch {
    // ignore
  }
  return new Set();
}

function saveSolved(solved: Set<number>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...solved]));
  } catch {
    // ignore
  }
}

export function useSolvedQuestions() {
  const [solved, setSolved] = useState<Set<number>>(() => loadSolved());

  // 다른 탭에서 변경 감지
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setSolved(loadSolved());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const markSolved = useCallback((questionId: number) => {
    setSolved(prev => {
      if (prev.has(questionId)) return prev;
      const next = new Set(prev);
      next.add(questionId);
      saveSolved(next);
      return next;
    });
  }, []);

  const resetByType = useCallback((questionIds: number[]) => {
    setSolved(prev => {
      const next = new Set(prev);
      questionIds.forEach(id => next.delete(id));
      saveSolved(next);
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    setSolved(new Set());
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }, []);

  const isSolved = useCallback((questionId: number) => solved.has(questionId), [solved]);

  const solvedCountByType = useCallback(
    (questionIds: number[]) => questionIds.filter(id => solved.has(id)).length,
    [solved]
  );

  return { solved, markSolved, resetByType, resetAll, isSolved, solvedCountByType };
}

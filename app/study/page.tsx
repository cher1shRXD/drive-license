import Link from 'next/link';
import { Suspense } from 'react';
import { ArrowLeft } from 'lucide-react';
import StudyClient from './StudyClient';

export default function StudyPage() {
  return (
    <div className="min-h-screen bg-[#080808] flex flex-col">
      <header className="border-b border-zinc-800 bg-[#080808]/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200 transition-colors text-sm cursor-pointer">
            <ArrowLeft className="w-4 h-4" />
            홈으로
          </Link>
          <span className="text-sm font-medium text-zinc-300">유형별 학습</span>
          <div className="w-20" />
        </div>
      </header>
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center">
          <p className="text-zinc-500 text-sm">로딩 중...</p>
        </div>
      }>
        <StudyClient />
      </Suspense>
    </div>
  );
}

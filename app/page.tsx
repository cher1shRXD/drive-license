'use client';

import Link from 'next/link';
import { BookOpen, Clock, BarChart3, ChevronRight, CheckCircle } from 'lucide-react';
import { useQuestions } from '@/hooks/useQuestions';

const TYPE_LABELS: Record<string, string> = {
  sentence_4_1: '문장형 4지선다 (1답)',
  sentence_4_2: '문장형 4지선다 (2답)',
  image_5_2:    '사진형 5지선다 (2답)',
  sign_4_1:     '안전표지형 4지선다 (1답)',
  sign_4_2:     '안전표지형 4지선다 (2답)',
  video_4_1:    '동영상형 4지선다 (1답)',
  unknown:      '기타',
};

export default function Home() {
  const { data, loading } = useQuestions();

  return (
    <div className="min-h-screen bg-[#080808]">
      <main className="max-w-6xl mx-auto px-6 py-16">
        {/* 히어로 */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 text-zinc-300 text-xs font-medium mb-6">
            <CheckCircle className="w-3.5 h-3.5" />
            운전면허 필기시험 전문 학습
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 leading-tight tracking-tight">
            한 번에 합격하는<br />
            <span className="text-zinc-300">필기시험 학습 플랫폼</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-lg mx-auto leading-relaxed">
            실제 문제은행 기반의 모의고사와 유형별 맞춤 학습으로<br />
            운전면허 필기시험을 확실하게 대비하세요.
          </p>
          <div className="flex justify-center gap-3 mt-8">
            <Link
              href="/mock-exam"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-zinc-200 text-[#080808] font-semibold transition-all duration-150 cursor-pointer"
            >
              <Clock className="w-4 h-4" />
              모의고사 시작
            </Link>
            <Link
              href="/study"
              className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold transition-all duration-150 cursor-pointer border border-zinc-700"
            >
              <BookOpen className="w-4 h-4" />
              유형별 학습
            </Link>
          </div>
        </div>

        {/* 통계 카드 */}
        {!loading && data && (
          <div className="grid grid-cols-3 gap-4 mb-12">
            {[
              { icon: BookOpen, label: '전체 문제', value: data.total.toLocaleString() },
              { icon: BarChart3, label: '문제 유형', value: Object.keys(data.by_type).filter(t => t !== 'unknown').length },
              { icon: Clock, label: '모의고사 시간', value: '40분' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-zinc-900 border border-zinc-800 p-6 flex items-center gap-4">
                <div className="w-10 h-10 bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{value}</p>
                  <p className="text-sm text-zinc-500 mt-0.5">{label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 주요 기능 */}
        <div className="grid grid-cols-2 gap-4 mb-12">
          {/* 모의고사 카드 */}
          <Link
            href="/mock-exam"
            className="group bg-zinc-900 border border-zinc-800 p-8 hover:border-zinc-600 hover:bg-zinc-900/80 transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 bg-white/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">모의고사</h2>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
              실제 시험과 동일한 환경에서 40분 / 40문제로 구성된 모의고사를 응시하세요.
            </p>
            <div className="flex gap-3">
              {['40문제', '40분', '합격 60점+'].map(tag => (
                <span key={tag} className="px-2.5 py-1 bg-zinc-800 text-zinc-400 text-xs border border-zinc-700">
                  {tag}
                </span>
              ))}
            </div>
          </Link>

          {/* 유형별 학습 카드 */}
          <Link
            href="/study"
            className="group bg-zinc-900 border border-zinc-800 p-8 hover:border-zinc-600 hover:bg-zinc-900/80 transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 bg-white/10 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">유형별 학습</h2>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
              문장형, 사진형, 안전표지형, 동영상형 등 유형별로 집중 학습할 수 있습니다.
            </p>
            <div className="flex gap-3">
              {['6가지 유형', '해설 제공', '진도 관리'].map(tag => (
                <span key={tag} className="px-2.5 py-1 bg-zinc-800 text-zinc-400 text-xs border border-zinc-700">
                  {tag}
                </span>
              ))}
            </div>
          </Link>
        </div>

        {/* 유형별 분포 */}
        {!loading && data && (
          <div className="bg-zinc-900 border border-zinc-800 p-8">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-zinc-400" />
              <h3 className="text-base font-semibold text-zinc-200">유형별 문제 분포</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(data.by_type)
                .filter(([t]) => t !== 'unknown')
                .sort(([, a], [, b]) => b.length - a.length)
                .map(([type, questions]) => {
                  const pct = Math.round((questions.length / data.total) * 100);
                  return (
                    <Link
                      key={type}
                      href={`/study?type=${type}`}
                      className="group p-4 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 hover:border-zinc-600 transition-all duration-150 cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <p className="text-sm text-zinc-300 font-medium leading-snug">
                          {TYPE_LABELS[type] || type}
                        </p>
                        <span className="text-xs text-zinc-500 flex-shrink-0 ml-2">{pct}%</span>
                      </div>
                      <div className="flex items-end gap-2">
                        <p className="text-2xl font-bold text-white">{questions.length}</p>
                        <p className="text-zinc-500 text-xs mb-1">문제</p>
                      </div>
                      <div className="mt-3 h-1 bg-zinc-700 overflow-hidden">
                        <div
                          className="h-full bg-white transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </Link>
                  );
                })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

import { useState, useRef, useCallback, useEffect } from 'react';
import { SlideContainer, ExportButton } from './components/SlideLayout';
import { useData } from './hooks/useData';
import { useProcessedData } from './hooks/useProcessedData';
import ExecutiveSummary from './pages/ExecutiveSummary';
import EffortOverview from './pages/EffortOverview';
import TeamPerformance from './pages/TeamPerformance';
import EffortGap from './pages/EffortGap';
import DefectAnalysis from './pages/DefectAnalysis';

const SLIDES = [
  { id: 'executive', label: 'Executive Summary', Component: ExecutiveSummary },
  { id: 'effort', label: 'Effort Overview', Component: EffortOverview },
  { id: 'team', label: 'Team Performance', Component: TeamPerformance },
  { id: 'gap', label: 'Effort Gap', Component: EffortGap },
  { id: 'defects', label: 'Defect Analysis', Component: DefectAnalysis },
];

function getInitialSlide() {
  const hash = window.location.hash.replace('#', '');
  const idx = SLIDES.findIndex((s) => s.id === hash);
  return idx >= 0 ? idx : 0;
}

export default function App() {
  const [currentSlide, setCurrentSlide] = useState(getInitialSlide);
  const [copied, setCopied] = useState(false);
  const slideRef = useRef(null);
  const { cards, bugs, loading, source } = useData();
  const data = useProcessedData(cards, bugs);

  // Sync hash with current slide
  useEffect(() => {
    window.location.hash = SLIDES[currentSlide].id;
  }, [currentSlide]);

  // Listen for hash changes (browser back/forward)
  useEffect(() => {
    const onHash = () => {
      const hash = window.location.hash.replace('#', '');
      const idx = SLIDES.findIndex((s) => s.id === hash);
      if (idx >= 0) setCurrentSlide(idx);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const goNext = useCallback(() => {
    setCurrentSlide((prev) => Math.min(prev + 1, SLIDES.length - 1));
  }, []);

  const goPrev = useCallback(() => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  }, []);

  const copyLink = useCallback(() => {
    const url = `${window.location.origin}${window.location.pathname}#${SLIDES[currentSlide].id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [currentSlide]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        goPrev();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center" style={{ background: '#F8FAFC' }}>
        <div className="flex flex-col items-center gap-4">
          <div
            style={{
              width: 40,
              height: 40,
              border: '3px solid #E2E8F0',
              borderTopColor: '#1E3A5F',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <div style={{ fontSize: 15, color: '#64748B', fontWeight: 500 }}>Loading data...</div>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      </div>
    );
  }

  const { Component } = SLIDES[currentSlide];

  return (
    <SlideContainer
      nav={
        <div className="export-hide flex items-center justify-center gap-4 w-full h-full">
          {/* Source indicator */}
          {source === 'sample' && (
            <div
              style={{
                position: 'absolute',
                left: 16,
                fontSize: 11,
                fontWeight: 600,
                background: '#FFFBEB',
                color: '#D97706',
                border: '1px solid #FDE68A',
                borderRadius: 8,
                padding: '4px 12px',
                letterSpacing: '0.02em',
              }}
            >
              Sample Data
            </div>
          )}

          {/* Prev */}
          <button
            onClick={goPrev}
            disabled={currentSlide === 0}
            className="cursor-pointer flex items-center justify-center"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: '1px solid #E2E8F0',
              background: currentSlide === 0 ? '#F8FAFC' : '#FFFFFF',
              color: currentSlide === 0 ? '#CBD5E1' : '#334155',
              fontSize: 16,
              transition: 'all 0.15s ease',
            }}
          >
            &#8249;
          </button>

          {/* Dots */}
          <div className="flex gap-1.5 items-center">
            {SLIDES.map((slide, i) => (
              <button
                key={slide.id}
                onClick={() => setCurrentSlide(i)}
                className="cursor-pointer"
                title={slide.label}
                style={{
                  width: i === currentSlide ? 28 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: i === currentSlide
                    ? 'linear-gradient(90deg, #1E3A5F, #6366F1)'
                    : '#CBD5E1',
                  border: 'none',
                  padding: 0,
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />
            ))}
          </div>

          {/* Page counter */}
          <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600, minWidth: 36, textAlign: 'center' }}>
            {currentSlide + 1} / {SLIDES.length}
          </span>

          {/* Next */}
          <button
            onClick={goNext}
            disabled={currentSlide === SLIDES.length - 1}
            className="cursor-pointer flex items-center justify-center"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: '1px solid #E2E8F0',
              background: currentSlide === SLIDES.length - 1 ? '#F8FAFC' : '#FFFFFF',
              color: currentSlide === SLIDES.length - 1 ? '#CBD5E1' : '#334155',
              fontSize: 16,
              transition: 'all 0.15s ease',
            }}
          >
            &#8250;
          </button>

          {/* Right side: Copy Link + Export */}
          <div className="flex items-center gap-3" style={{ position: 'absolute', right: 16 }}>
            <button
              onClick={copyLink}
              className="cursor-pointer flex items-center gap-1.5 rounded-lg"
              style={{
                fontSize: 12,
                fontWeight: 600,
                padding: '6px 14px',
                border: '1px solid #E2E8F0',
                background: copied ? '#F0FDF4' : '#FFFFFF',
                color: copied ? '#16A34A' : '#475569',
                transition: 'all 0.2s ease',
                letterSpacing: '0.02em',
              }}
            >
              {copied ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
                  Copy Link
                </>
              )}
            </button>
            <ExportButton slideRef={slideRef} />
          </div>
        </div>
      }
    >
      <Component data={data} slideRef={slideRef} />
    </SlideContainer>
  );
}

import { useRef, useEffect, useState, useCallback } from 'react';
import { toPng } from 'html-to-image';

export default function SlideLayout({ title, subtitle, children, slideRef }) {
  return (
    <div
      ref={slideRef}
      className="slide flex flex-col"
      style={{
        padding: '36px 64px 28px',
        background: '#F8FAFC',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div className="flex-none mb-5 animate-slide-up">
        <h1
          className="font-extrabold tracking-tight"
          style={{
            fontSize: 38,
            margin: 0,
            color: '#0F172A',
            letterSpacing: '-0.025em',
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className="mt-2"
            style={{
              fontSize: 17,
              color: '#64748B',
              fontWeight: 500,
              letterSpacing: '-0.01em',
            }}
          >
            {subtitle}
          </p>
        )}
        <div
          className="mt-4"
          style={{
            height: 3,
            width: 56,
            background: 'linear-gradient(90deg, #1E3A5F, #6366F1)',
            borderRadius: 4,
          }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0">{children}</div>
    </div>
  );
}

export function SlideContainer({ children, nav }) {
  const [scale, setScale] = useState(1);
  const containerRef = useRef(null);
  const NAV_HEIGHT = 48;

  const updateScale = useCallback(() => {
    const w = window.innerWidth;
    const h = window.innerHeight - NAV_HEIGHT;
    const s = Math.min(w / 1920, h / 1080);
    setScale(s);
  }, []);

  useEffect(() => {
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [updateScale]);

  const slideW = 1920 * scale;
  const slideH = 1080 * scale;
  const availH = window.innerHeight - NAV_HEIGHT;

  return (
    <div ref={containerRef} className="w-full flex flex-col" style={{ height: '100vh', background: '#E2E8F0' }}>
      {/* Slide area */}
      <div className="flex-1 relative overflow-hidden" style={{ minHeight: 0 }}>
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            width: 1920,
            height: 1080,
            position: 'absolute',
            left: `${(window.innerWidth - slideW) / 2}px`,
            top: `${Math.max(0, (availH - slideH) / 2)}px`,
          }}
        >
          {children}
        </div>
      </div>

      {/* Navigation bar — below slide, never overlapping */}
      {nav && (
        <div
          className="flex-none relative"
          style={{
            height: NAV_HEIGHT,
            background: '#FFFFFF',
            borderTop: '1px solid #E2E8F0',
          }}
        >
          {nav}
        </div>
      )}
    </div>
  );
}

export function ExportButton({ slideRef }) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (!slideRef.current || exporting) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(slideRef.current, {
        width: 1920,
        height: 1080,
        pixelRatio: 2,
      });
      const link = document.createElement('a');
      link.download = 'slide.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className="export-hide text-white px-4 py-1.5 rounded-lg cursor-pointer"
      style={{
        fontSize: 12,
        fontWeight: 600,
        background: 'linear-gradient(135deg, #1E3A5F, #6366F1)',
        border: 'none',
        boxShadow: '0 1px 4px rgba(30, 58, 95, 0.2)',
        letterSpacing: '0.02em',
        transition: 'opacity 0.15s ease',
        opacity: exporting ? 0.6 : 1,
      }}
    >
      {exporting ? 'Exporting...' : 'Export PNG'}
    </button>
  );
}

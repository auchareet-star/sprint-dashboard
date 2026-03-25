import { useRef, useEffect, useState, useCallback } from 'react';
import { toPng } from 'html-to-image';

const LOGO_URL = import.meta.env.BASE_URL + 'ayodia-logo.png';

export default function SlideLayout({ title, subtitle, children, slideRef }) {
  return (
    <div
      ref={slideRef}
      className="slide flex"
      style={{
        background: '#F8FAFC',
        overflow: 'hidden',
      }}
    >
      {/* Left black bar */}
      <div style={{ width: 8, background: '#0F172A', flexShrink: 0 }} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col" style={{ padding: '24px 48px 18px' }}>
        {/* Header row */}
        <div className="flex-none mb-3 animate-slide-up flex items-start justify-between">
          <div>
            <h1
              className="font-extrabold tracking-tight"
              style={{
                fontSize: 32,
                margin: 0,
                color: '#0F172A',
                letterSpacing: '-0.025em',
              }}
            >
              {title}
            </h1>
            {/* Yellow-red gradient underline bar */}
            <div
              style={{
                height: 5,
                width: 120,
                background: 'linear-gradient(90deg, #FACC15 20%, #EF4444 20%)',
                marginTop: 6,
                borderRadius: 3,
                boxShadow: '0 2px 6px rgba(245, 158, 11, 0.35)',
              }}
            />
            {subtitle && (
              <p
                className="mt-2"
                style={{
                  fontSize: 15,
                  color: '#94A3B8',
                  fontWeight: 500,
                  letterSpacing: '-0.01em',
                }}
              >
                {subtitle}
              </p>
            )}
          </div>

          {/* Logo top-right */}
          <img
            src={LOGO_URL}
            alt="Ayodia"
            style={{
              width: 60,
              height: 60,
              objectFit: 'contain',
              flexShrink: 0,
              marginLeft: 24,
            }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0">{children}</div>
      </div>
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
        cacheBust: true,
        imagePlaceholder: '',
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
      {exporting ? 'Exporting...' : 'Save PNG'}
    </button>
  );
}

export function CopyImageButton({ slideRef }) {
  const [state, setState] = useState('idle'); // idle | copying | copied | error

  const handleCopy = async () => {
    if (!slideRef.current || state === 'copying') return;
    setState('copying');
    try {
      // Use toPng then convert to blob — more reliable than toBlob with cross-origin images
      const dataUrl = await toPng(slideRef.current, {
        width: 1920,
        height: 1080,
        pixelRatio: 2,
        cacheBust: true,
        imagePlaceholder: '',
      });
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      setState('copied');
      setTimeout(() => setState('idle'), 2000);
    } catch (err) {
      console.error('Copy image failed:', err);
      setState('error');
      setTimeout(() => setState('idle'), 2000);
    }
  };

  const label = {
    idle: 'Copy Image',
    copying: 'Copying...',
    copied: 'Copied!',
    error: 'Failed',
  }[state];

  return (
    <button
      onClick={handleCopy}
      disabled={state === 'copying'}
      className="export-hide px-4 py-1.5 rounded-lg cursor-pointer flex items-center gap-1.5"
      style={{
        fontSize: 12,
        fontWeight: 600,
        background: state === 'copied' ? '#F0FDF4' : '#FFFFFF',
        color: state === 'copied' ? '#16A34A' : state === 'error' ? '#F43F5E' : '#475569',
        border: '1px solid #E2E8F0',
        letterSpacing: '0.02em',
        transition: 'all 0.2s ease',
        opacity: state === 'copying' ? 0.6 : 1,
      }}
    >
      {state === 'copied' ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
      )}
      {label}
    </button>
  );
}

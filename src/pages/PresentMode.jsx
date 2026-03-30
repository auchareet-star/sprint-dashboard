import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { SlideContainer } from '../components/SlideLayout';
import { toPng } from 'html-to-image';
import CoverPage from './CoverPage';
import AgendaPage from './AgendaPage';
import TeamMembers from './TeamMembers';
import OverviewUpdate from './OverviewUpdate';
import SprintGoals from './SprintGoals';
import ExecutiveSummary from './ExecutiveSummary';
import EffortOverview from './EffortOverview';
import TeamPerformance from './TeamPerformance';
import EffortGap from './EffortGap';
import DefectAnalysis from './DefectAnalysis';
import { CardInSprintAssignee, CardInSprintBugs } from './CardInSprint';
import Retrospective from './Retrospective';
import IssuesEncountered from './IssuesEncountered';
import NextSprintGoals from './NextSprintGoals';
import ThankYouPage from './ThankYouPage';

const STATIC_PRESENT = [
  { id: 'cover', label: 'Cover', Component: CoverPage },
  { id: 'agenda', label: 'Agenda', Component: AgendaPage },
  { id: 'members', label: 'Team Members', Component: TeamMembers },
  { id: 'overview', label: 'Overview Update', Component: OverviewUpdate },
  { id: 'goals', label: 'Sprint Goals', Component: SprintGoals },
  { id: 'executive', label: 'Executive Summary', Component: ExecutiveSummary },
  { id: 'effort', label: 'Effort Overview', Component: EffortOverview },
  { id: 'team', label: 'Team Performance', Component: TeamPerformance },
  { id: 'gap', label: 'Effort Gap', Component: EffortGap },
  { id: 'defects', label: 'Defect Analysis', Component: DefectAnalysis },
  '__CARDS__',
  { id: 'card-bugs', label: 'Card in Sprint: Bug', Component: CardInSprintBugs },
  { id: 'retro', label: 'Retrospective', Component: Retrospective },
  { id: 'issues', label: 'Issues Encountered', Component: IssuesEncountered },
  { id: 'next-goals', label: 'Next Sprint Goals', Component: NextSprintGoals },
  { id: 'thankyou', label: 'Thank You', Component: ThankYouPage },
];

export default function PresentMode({ data, onExit }) {
  const slideRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [exporting, setExporting] = useState(false);

  // Build slides with dynamic Card in Sprint per assignee
  const slides = useMemo(() => {
    const cards = data.cards || [];
    const counts = {};
    cards.forEach((c) => {
      if (c.assignee && c.assignee.trim()) counts[c.assignee] = (counts[c.assignee] || 0) + 1;
    });
    const assignees = Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([name]) => name);

    const cardSlides = assignees.map((name) => ({
      id: `card-${name}`,
      label: `Cards: ${name}`,
      render: (props) => <CardInSprintAssignee data={props.data} slideRef={props.slideRef} assigneeName={name} />,
    }));

    const result = [];
    STATIC_PRESENT.forEach((s) => {
      if (s === '__CARDS__') {
        result.push(...cardSlides);
      } else {
        result.push({
          ...s,
          render: (props) => <s.Component data={props.data} slideRef={props.slideRef} />,
        });
      }
    });
    return result;
  }, [data.cards]);

  const total = slides.length;
  const current = Math.min(index, total - 1);
  const slideObj = slides[current];

  const goNext = useCallback(() => setIndex((i) => Math.min(i + 1, total - 1)), [total]);
  const goPrev = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), []);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (exporting) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        goPrev();
      } else if (e.key === 'Escape') {
        onExit();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev, onExit, exporting]);

  // Build PDF filename from sprint data
  const pdfFileName = useMemo(() => {
    const meta = data.sprintGoals?.meta || {};
    const endDate = (meta.endDate || '').replace(/\//g, '');
    const sprint = meta.sprint || 'Sprint';
    return `AYD-Sprint review monitoring_${endDate}_HA.OS-Sprint review (${sprint})`;
  }, [data.sprintGoals]);

  // Wait for DOM paint + recharts animation to complete
  const waitForRender = () => new Promise((resolve) => {
    // Double requestAnimationFrame ensures the browser has painted
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Extra delay for recharts animations to settle
        setTimeout(resolve, 800);
      });
    });
  });

  // Export all slides to PDF
  const handleExportPDF = useCallback(async () => {
    if (exporting) return;
    setExporting(true);

    const savedIndex = index;
    const { jsPDF } = await import('jspdf');
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [1920, 1080] });

    try {
      for (let i = 0; i < slides.length; i++) {
        // Use functional update to ensure React processes the state change
        await new Promise((resolve) => {
          setIndex(i);
          // Wait for React render + paint + recharts animation (~2s)
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setTimeout(resolve, 2500);
            });
          });
        });

        const el = slideRef.current;
        if (!el) continue;

        // Capture slide as JPEG (smaller file size than PNG)
        let dataUrl;
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            dataUrl = await toPng(el, {
              width: 1920,
              height: 1080,
              pixelRatio: 1,
              cacheBust: true,
              imagePlaceholder: '',
            });
            break;
          } catch (err) {
            if (attempt === 1) throw err;
            await new Promise((r) => setTimeout(r, 500));
          }
        }

        if (!dataUrl) continue;

        if (i > 0) pdf.addPage([1920, 1080], 'landscape');
        pdf.addImage(dataUrl, 'JPEG', 0, 0, 1920, 1080, undefined, 'FAST');
      }

      pdf.save(`${pdfFileName}.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setIndex(savedIndex);
      setExporting(false);
    }
  }, [exporting, index, slides, pdfFileName]);

  return (
    <SlideContainer
      nav={
        <div className="export-hide flex items-center justify-center gap-4 w-full h-full">
          {/* Left: Exit button */}
          <div className="flex items-center gap-3" style={{ position: 'absolute', left: 16 }}>
            <button
              onClick={onExit}
              className="cursor-pointer flex items-center gap-1.5 rounded-lg"
              style={{ fontSize: 12, fontWeight: 600, padding: '6px 14px', border: '1px solid #E2E8F0', background: '#FFFFFF', color: '#475569' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#F1F5F9'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
              Dashboard
            </button>
          </div>

          {/* Center: Navigation */}
          <button onClick={goPrev} disabled={current === 0} className="cursor-pointer flex items-center justify-center" style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #E2E8F0', background: current === 0 ? '#F8FAFC' : '#FFFFFF', color: current === 0 ? '#CBD5E1' : '#334155', fontSize: 16, transition: 'all 0.15s ease' }}>
            &#8249;
          </button>

          <div className="flex gap-1.5 items-center" style={{ maxWidth: 400, overflow: 'hidden' }}>
            {slides.map((s, i) => (
              <button key={s.id} onClick={() => setIndex(i)} className="cursor-pointer" title={s.label} style={{ width: i === current ? 20 : 6, height: 6, borderRadius: 3, background: i === current ? 'linear-gradient(90deg, #1E3A5F, #6366F1)' : '#CBD5E1', border: 'none', padding: 0, transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)', flexShrink: 0 }} />
            ))}
          </div>

          <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600, minWidth: 44, textAlign: 'center' }}>
            {current + 1} / {total}
          </span>

          <button onClick={goNext} disabled={current === total - 1} className="cursor-pointer flex items-center justify-center" style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #E2E8F0', background: current === total - 1 ? '#F8FAFC' : '#FFFFFF', color: current === total - 1 ? '#CBD5E1' : '#334155', fontSize: 16, transition: 'all 0.15s ease' }}>
            &#8250;
          </button>

          {/* Right: Export PDF */}
          <div className="flex items-center gap-3" style={{ position: 'absolute', right: 16 }}>
            <button
              onClick={handleExportPDF}
              disabled={exporting}
              className="cursor-pointer flex items-center gap-1.5 rounded-lg text-white px-4 py-1.5"
              style={{
                fontSize: 16,
                fontWeight: 600,
                background: exporting ? '#94A3B8' : 'linear-gradient(135deg, #1E3A5F, #6366F1)',
                border: 'none',
                boxShadow: '0 1px 4px rgba(30, 58, 95, 0.2)',
                letterSpacing: '0.02em',
                transition: 'opacity 0.15s ease',
                opacity: exporting ? 0.7 : 1,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <polyline points="9 15 12 18 15 15" />
              </svg>
              {exporting ? `Exporting... (${current + 1}/${total})` : 'Export PDF'}
            </button>
          </div>
        </div>
      }
    >
      {slideObj.render({ data, slideRef })}
    </SlideContainer>
  );
}

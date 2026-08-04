import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { SlideContainer, ExportButton, CopyImageButton } from './components/SlideLayout';
import SheetSettings from './components/SheetSettings';
import { useData } from './hooks/useData';
import { useProcessedData } from './hooks/useProcessedData';
import ExecutiveSummary from './pages/ExecutiveSummary';
import EffortOverview from './pages/EffortOverview';
import TeamPerformance from './pages/TeamPerformance';
import EffortGap from './pages/EffortGap';
import DefectAnalysis from './pages/DefectAnalysis';
import TeamMembers from './pages/TeamMembers';
import AssigneeView from './pages/AssigneeView';
import BugListView from './pages/BugListView';
import SprintGoals from './pages/SprintGoals';
import OverviewUpdate from './pages/OverviewUpdate';
import NextSprintGoals from './pages/NextSprintGoals';
import IssuesEncountered from './pages/IssuesEncountered';
import SprintInsights from './pages/SprintInsights';
import MAAnalysis from './pages/MAAnalysis';
import MATimeline from './pages/MATimeline';
import PresentMode from './pages/PresentMode';

const SLIDES = [
  { id: 'goals', label: 'Sprint Goals', Component: SprintGoals },
  { id: 'members', label: 'Team Members', Component: TeamMembers },
  { id: 'overview', label: 'Overview Update', Component: OverviewUpdate },
  { id: 'executive', label: 'Executive Summary', Component: ExecutiveSummary },
  { id: 'effort', label: 'Effort Overview', Component: EffortOverview },
  { id: 'team', label: 'Team Performance', Component: TeamPerformance },
  { id: 'gap', label: 'Effort Gap', Component: EffortGap },
  { id: 'defects', label: 'Defect Analysis', Component: DefectAnalysis },
  { id: 'ma-analysis', label: 'MA Analysis', Component: MAAnalysis },
  { id: 'ma-timeline', label: 'MA Timeline', Component: MATimeline },
  { id: 'insights', label: 'Sprint Insights', Component: SprintInsights },
  { id: 'issues', label: 'Issues Encountered', Component: IssuesEncountered },
  { id: 'next-goals', label: 'Next Sprint Goals', Component: NextSprintGoals },
];

function parseHash(slides) {
  const hash = window.location.hash.replace('#', '');
  if (hash.startsWith('assignee/')) {
    return { view: 'assignee', name: decodeURIComponent(hash.slice('assignee/'.length)) };
  }
  if (hash === 'bugs') {
    return { view: 'bugs' };
  }
  if (hash === 'present' || hash.startsWith('present/')) {
    return { view: 'present' };
  }
  const idx = slides.findIndex((s) => s.id === hash);
  return { view: 'slide', index: idx >= 0 ? idx : 0 };
}

function AssigneeNav({ assigneeName, assigneeList, goToAssignee, onBack, slideRef, bugCount = 0 }) {
  const [showMenu, setShowMenu] = useState(false);
  return (
    <>
      <div className="flex items-center gap-3" style={{ position: 'absolute', left: 16 }}>
        <button onClick={onBack} className="cursor-pointer flex items-center gap-1.5 rounded-lg"
          style={{ fontSize: 12, fontWeight: 600, padding: '6px 14px', border: '1px solid #E2E8F0', background: '#FFFFFF', color: '#475569' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#F1F5F9'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          Dashboard
        </button>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowMenu((v) => !v)} className="cursor-pointer flex items-center gap-1.5 rounded-lg"
            style={{ fontSize: 12, fontWeight: 600, padding: '6px 14px', border: '1px solid #E2E8F0', background: showMenu ? '#F1F5F9' : '#FFFFFF', color: '#475569' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4-4v-2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
            View Cards
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
          </button>
          {showMenu && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 98 }} onClick={() => setShowMenu(false)} />
              <div style={{ position: 'absolute', bottom: '100%', left: 0, marginBottom: 6, zIndex: 99, background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', padding: 6, width: 240, maxHeight: 320, overflow: 'auto' }}>
                {assigneeList.map((a) => (
                  <button key={a.name} onClick={() => { setShowMenu(false); goToAssignee(a.name); }}
                    className="cursor-pointer flex items-center justify-between w-full"
                    style={{ padding: '7px 12px', borderRadius: 6, border: 'none', background: a.name === assigneeName ? '#F1F5F9' : 'transparent', fontSize: 12, fontWeight: a.name === assigneeName ? 700 : 500, color: '#334155', textAlign: 'left' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#F1F5F9'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = a.name === assigneeName ? '#F1F5F9' : 'transparent'; }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</span>
                    <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, marginLeft: 8, flexShrink: 0 }}>{a.count}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        <button
          onClick={() => { window.location.hash = 'bugs'; }}
          className="cursor-pointer flex items-center gap-1.5 rounded-lg"
          style={{ fontSize: 12, fontWeight: 600, padding: '6px 14px', border: '1px solid #FECACA', background: '#FFFFFF', color: '#F43F5E', transition: 'all 0.15s ease' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#FEF2F2'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
          Bug ({bugCount})
        </button>
      </div>
      <div className="flex items-center gap-3" style={{ position: 'absolute', right: 16 }}>
        <CopyImageButton slideRef={slideRef} />
        <ExportButton slideRef={slideRef} />
      </div>
    </>
  );
}

function BugListNav({ assigneeList, goToAssignee, slideRef }) {
  const [showMenu, setShowMenu] = useState(false);
  return (
    <div className="export-hide flex items-center w-full h-full" style={{ position: 'relative' }}>
      <div className="flex items-center gap-3" style={{ position: 'absolute', left: 16 }}>
        <button onClick={() => { window.location.hash = 'defects'; }} className="cursor-pointer flex items-center gap-1.5 rounded-lg"
          style={{ fontSize: 12, fontWeight: 600, padding: '6px 14px', border: '1px solid #E2E8F0', background: '#FFFFFF', color: '#475569' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#F1F5F9'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          Dashboard
        </button>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowMenu((v) => !v)} className="cursor-pointer flex items-center gap-1.5 rounded-lg"
            style={{ fontSize: 12, fontWeight: 600, padding: '6px 14px', border: '1px solid #E2E8F0', background: showMenu ? '#F1F5F9' : '#FFFFFF', color: '#475569' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4-4v-2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
            View Cards
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
          </button>
          {showMenu && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 98 }} onClick={() => setShowMenu(false)} />
              <div style={{ position: 'absolute', bottom: '100%', left: 0, marginBottom: 6, zIndex: 99, background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', padding: 6, width: 240, maxHeight: 320, overflow: 'auto' }}>
                {assigneeList.map((a) => (
                  <button key={a.name} onClick={() => { setShowMenu(false); goToAssignee(a.name); }}
                    className="cursor-pointer flex items-center justify-between w-full"
                    style={{ padding: '7px 12px', borderRadius: 6, border: 'none', background: 'transparent', fontSize: 12, fontWeight: 500, color: '#334155', textAlign: 'left' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#F1F5F9'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</span>
                    <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, marginLeft: 8, flexShrink: 0 }}>{a.count}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3" style={{ position: 'absolute', right: 16 }}>
        <CopyImageButton slideRef={slideRef} />
        <ExportButton slideRef={slideRef} />
      </div>
    </div>
  );
}

export default function App() {
  const [showAssigneeMenu, setShowAssigneeMenu] = useState(false);
  const slideRef = useRef(null);
  const { cards, bugs, maIssues, team, sprintGoals, nextSprintGoals, issues, overviewUpdate, sprintList, project, loading, source } = useData();
  const processed = useProcessedData(cards, bugs);
  const data = { ...processed, team, sprintGoals, nextSprintGoals, issues, overviewUpdate, sprintList, maIssues, project };

  const [route, setRoute] = useState(() => parseHash(SLIDES));

  // Sync hash
  useEffect(() => {
    if (route.view === 'slide') {
      window.location.hash = SLIDES[route.index].id;
    }
  }, [route]);

  // Listen for hash changes
  useEffect(() => {
    const onHash = () => setRoute(parseHash(SLIDES));
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const setSlide = useCallback((i) => setRoute({ view: 'slide', index: i }), []);
  const currentSlide = route.view === 'slide' ? route.index : 0;

  const goNext = useCallback(() => {
    setRoute((r) => r.view === 'slide' ? { ...r, index: Math.min(r.index + 1, SLIDES.length - 1) } : r);
  }, []);

  const goPrev = useCallback(() => {
    setRoute((r) => r.view === 'slide' ? { ...r, index: Math.max(r.index - 1, 0) } : r);
  }, []);


  // Assignee list for dropdown
  const assigneeList = useMemo(() => {
    const counts = {};
    cards.forEach((c) => {
      if (c.assignee && c.assignee.trim()) counts[c.assignee] = (counts[c.assignee] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }));
  }, [cards]);

  // Navigate to assignee view
  const goToAssignee = useCallback((name) => {
    window.location.hash = `assignee/${encodeURIComponent(name)}`;
  }, []);

  useEffect(() => {
    if (route.view !== 'slide') return;
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
  }, [goNext, goPrev, route.view]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center" style={{ background: '#F8FAFC' }}>
        <div className="flex flex-col items-center gap-4">
          <div style={{ width: 40, height: 40, border: '3px solid #E2E8F0', borderTopColor: '#1E3A5F', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <div style={{ fontSize: 15, color: '#64748B', fontWeight: 500 }}>Loading data...</div>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      </div>
    );
  }

  // Assignee view
  if (route.view === 'assignee') {
    return (
      <SlideContainer
        nav={
          <div className="export-hide flex items-center w-full h-full" style={{ position: 'relative' }}>
            <AssigneeNav
              assigneeName={route.name}
              assigneeList={assigneeList}
              goToAssignee={goToAssignee}
              onBack={() => { window.location.hash = 'team'; }}
              slideRef={slideRef}
              bugCount={bugs.length}
            />
          </div>
        }
      >
        <AssigneeView
          cards={cards}
          bugs={bugs}
          assigneeName={route.name}
          slideRef={slideRef}
        />
      </SlideContainer>
    );
  }

  // Bug list view
  if (route.view === 'bugs') {
    return (
      <SlideContainer
        nav={
          <BugListNav
            assigneeList={assigneeList}
            goToAssignee={goToAssignee}
            slideRef={slideRef}
          />
        }
      >
        <BugListView bugs={bugs} slideRef={slideRef} />
      </SlideContainer>
    );
  }

  // Present mode
  if (route.view === 'present') {
    return <PresentMode data={{ ...data, cards, bugs }} onExit={() => { window.location.hash = 'goals'; }} />;
  }

  // Slide view
  const { Component } = SLIDES[currentSlide];

  return (
    <SlideContainer
      nav={
        <div className="export-hide flex items-center justify-center gap-4 w-full h-full">
          {/* Left side: Source + View Cards dropdown */}
          <div className="flex items-center gap-3" style={{ position: 'absolute', left: 16 }}>
            {source === 'sample' && (
              <div style={{ fontSize: 11, fontWeight: 600, background: '#FFFBEB', color: '#D97706', border: '1px solid #FDE68A', borderRadius: 8, padding: '4px 12px', letterSpacing: '0.02em' }}>
                Sample Data
              </div>
            )}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowAssigneeMenu((v) => !v)}
                className="cursor-pointer flex items-center gap-1.5 rounded-lg"
                style={{ fontSize: 12, fontWeight: 600, padding: '6px 14px', border: '1px solid #E2E8F0', background: showAssigneeMenu ? '#F1F5F9' : '#FFFFFF', color: '#475569', transition: 'all 0.15s ease' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4-4v-2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                View Cards
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
              </button>
              {showAssigneeMenu && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 98 }} onClick={() => setShowAssigneeMenu(false)} />
                  <div style={{
                    position: 'absolute', bottom: '100%', left: 0, marginBottom: 6, zIndex: 99,
                    background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 10,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)', padding: '6px', width: 240, maxHeight: 320, overflow: 'auto',
                  }}>
                    {assigneeList.map((a) => (
                      <button
                        key={a.name}
                        onClick={() => { setShowAssigneeMenu(false); goToAssignee(a.name); }}
                        className="cursor-pointer flex items-center justify-between w-full"
                        style={{ padding: '7px 12px', borderRadius: 6, border: 'none', background: 'transparent', fontSize: 12, fontWeight: 500, color: '#334155', textAlign: 'left', transition: 'background 0.1s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#F1F5F9'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</span>
                        <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, marginLeft: 8, flexShrink: 0 }}>{a.count}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <button
              onClick={() => { window.location.hash = 'bugs'; }}
              className="cursor-pointer flex items-center gap-1.5 rounded-lg"
              style={{ fontSize: 12, fontWeight: 600, padding: '6px 14px', border: '1px solid #FECACA', background: '#FFFFFF', color: '#F43F5E', transition: 'all 0.15s ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#FEF2F2'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
              Bug ({bugs.length})
            </button>
            <button
              onClick={() => { window.location.hash = 'present'; }}
              className="cursor-pointer flex items-center gap-1.5 rounded-lg"
              style={{ fontSize: 12, fontWeight: 600, padding: '6px 14px', border: 'none', background: 'linear-gradient(135deg, #1E3A5F, #6366F1)', color: '#FFFFFF', transition: 'all 0.15s ease', boxShadow: '0 1px 4px rgba(30,58,95,0.2)' }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Present
            </button>
          </div>

          <button onClick={goPrev} disabled={currentSlide === 0} className="cursor-pointer flex items-center justify-center" style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #E2E8F0', background: currentSlide === 0 ? '#F8FAFC' : '#FFFFFF', color: currentSlide === 0 ? '#CBD5E1' : '#334155', fontSize: 16, transition: 'all 0.15s ease' }}>
            &#8249;
          </button>

          <div className="flex gap-1.5 items-center">
            {SLIDES.map((slide, i) => (
              <button key={slide.id} onClick={() => setSlide(i)} className="cursor-pointer" title={slide.label} style={{ width: i === currentSlide ? 28 : 8, height: 8, borderRadius: 4, background: i === currentSlide ? 'linear-gradient(90deg, #1E3A5F, #6366F1)' : '#CBD5E1', border: 'none', padding: 0, transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }} />
            ))}
          </div>

          <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600, minWidth: 36, textAlign: 'center' }}>
            {currentSlide + 1} / {SLIDES.length}
          </span>

          <button onClick={goNext} disabled={currentSlide === SLIDES.length - 1} className="cursor-pointer flex items-center justify-center" style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #E2E8F0', background: currentSlide === SLIDES.length - 1 ? '#F8FAFC' : '#FFFFFF', color: currentSlide === SLIDES.length - 1 ? '#CBD5E1' : '#334155', fontSize: 16, transition: 'all 0.15s ease' }}>
            &#8250;
          </button>

          <div className="flex items-center gap-3" style={{ position: 'absolute', right: 16 }}>
            <SheetSettings />
            <CopyImageButton slideRef={slideRef} />
            <ExportButton slideRef={slideRef} />
          </div>
        </div>
      }
    >
      <Component data={data} slideRef={slideRef} goToAssignee={goToAssignee} />
    </SlideContainer>
  );
}

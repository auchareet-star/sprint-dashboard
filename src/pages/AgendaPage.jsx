import { T } from '../utils/typography';
import SlideLayout from '../components/SlideLayout';

const AGENDA_ITEMS = [
  'Team members',
  'Overview',
  'Milestone Tracking',
  'Sprint Goals',
  'Executive Summary',
  'Effort Overview',
  'Team Performance',
  'Effort Gap Analysis',
  'Defect Analysis',
  'Card in Sprint',
  'Retrospective',
  'Issues Encountered',
  'Next Sprint Goals',
];

export default function AgendaPage({ data, slideRef }) {
  return (
    <SlideLayout title="Agenda" slideRef={slideRef}>
      <div className="flex flex-col h-full animate-slide-up animate-delay-1" style={{ paddingTop: 8 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingLeft: 16 }}>
          {AGENDA_ITEMS.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-4"
              style={{ animationDelay: `${0.05 * i}s` }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: '#F59E0B',
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: T.bodyLg,
                  fontWeight: 600,
                  color: '#0F172A',
                }}
              >
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>
    </SlideLayout>
  );
}

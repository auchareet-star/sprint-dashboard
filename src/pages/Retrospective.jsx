import { T } from '../utils/typography';
import SlideLayout from '../components/SlideLayout';

export default function Retrospective({ data, slideRef }) {
  return (
    <SlideLayout title="Retrospective" slideRef={slideRef}>
      <div className="flex items-center justify-center h-full">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
            padding: '40px 60px',
            background: '#FFFFFF',
            borderRadius: 16,
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18" />
            <path d="M9 21V9" />
          </svg>
          <span style={{ fontSize: T.section, fontWeight: 600, color: '#64748B' }}>
            Coming Soon
          </span>
          <span style={{ fontSize: T.label, color: '#94A3B8', fontWeight: 400 }}>
            ยังไม่มีข้อมูล Retrospective สำหรับ Sprint นี้
          </span>
        </div>
      </div>
    </SlideLayout>
  );
}

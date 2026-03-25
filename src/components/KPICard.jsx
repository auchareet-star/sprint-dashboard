import { T } from '../utils/typography';

export default function KPICard({ label, value, subtitle, color = '#1E3A5F', large = false, delay = 0 }) {
  return (
    <div
      className={`card flex flex-col justify-center items-center animate-slide-up ${delay ? `animate-delay-${delay}` : ''}`}
      style={{ padding: large ? '20px 16px' : '14px 12px', minHeight: large ? 120 : 88 }}
    >
      <div className="font-extrabold" style={{ fontSize: large ? T.kpiBig : T.kpiSmall, color, lineHeight: 1, letterSpacing: '-0.03em' }}>
        {value}
      </div>
      <div className="font-medium mt-2 text-center" style={{ fontSize: large ? T.kpiLabel : T.kpiLabel, color: '#64748B', letterSpacing: '0.01em' }}>
        {label}
      </div>
      {subtitle && (
        <div className="mt-1 text-center" style={{ fontSize: T.kpiSublabel, color: '#94A3B8', fontWeight: 500 }}>
          {subtitle}
        </div>
      )}
    </div>
  );
}

import { T } from '../utils/typography';
import SlideLayout from '../components/SlideLayout';
import KPICard from '../components/KPICard';
import HorizontalStackedBar from '../charts/HorizontalStackedBar';

export default function ExecutiveSummary({ data, slideRef }) {
  const pctPlanned = data.total > 0 ? Math.round((data.plannedCount / data.total) * 100) : 0;
  const isHighUnplanned = data.pctUnplanned > 30;

  return (
    <SlideLayout title="Executive Summary" subtitle="Sprint Overview" slideRef={slideRef}>
      <div className="flex flex-col gap-4 h-full">
        {/* Top: KPI Row — 5 metrics in one line */}
        <div className="grid gap-3 flex-none animate-slide-up animate-delay-1" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
          <KPICard label="Total Cards" value={data.total} color="#1E3A5F" large delay={1} />
          <KPICard label="Planned" value={data.plannedCount} subtitle={`${pctPlanned}% of total`} color="#1E3A5F" delay={1} />
          <KPICard label="Unplanned" value={data.unplannedCount} subtitle={`${data.pctUnplanned}% of total`} color="#F59E0B" delay={1} />
          <KPICard label="% Done" value={`${data.pctDone}%`} color="#0D9488" delay={1} />
          <KPICard label="Total Bugs" value={data.totalBugs} color="#F43F5E" delay={1} />
        </div>

        {/* Bottom: Chart + Insights */}
        <div className="flex gap-4 flex-1 min-h-0">
          {/* Chart — 70% width */}
          <div
            className="card flex flex-col animate-slide-up animate-delay-2"
            style={{ padding: '16px 20px 12px', flex: 7 }}
          >
            <h2 className="font-semibold" style={{ fontSize: T.section, color: '#0F172A', margin: '0 0 2px 4px', letterSpacing: '-0.01em' }}>
              Planned vs Unplanned by Status
            </h2>
            <p style={{ fontSize: T.desc, color: '#94A3B8', margin: '0 0 2px 4px', fontWeight: 500 }}>
              Breakdown of work items across statuses
            </p>
            <div className="flex-1 min-h-0">
              <HorizontalStackedBar data={data.statusByType} height="100%" />
            </div>
          </div>

          {/* Key Insights — 30% width */}
          <div
            className="card flex flex-col animate-slide-up animate-delay-3"
            style={{ padding: '16px 20px', flex: 3 }}
          >
            <h2 className="font-semibold" style={{ fontSize: T.section, color: '#0F172A', margin: '0 0 8px 0', letterSpacing: '-0.01em' }}>
              Key Insights
            </h2>
            <div className="flex flex-col gap-3 flex-1">
              <InsightRow
                label="Completion Rate"
                value={`${data.pctDone}%`}
                color="#0D9488"
                bar={data.pctDone}
              />
              <InsightRow
                label="Planned Ratio"
                value={`${pctPlanned}%`}
                color="#1E3A5F"
                bar={pctPlanned}
              />
              <InsightRow
                label="Unplanned Ratio"
                value={`${data.pctUnplanned}%`}
                color="#F59E0B"
                bar={data.pctUnplanned}
              />
              <InsightRow
                label="Bug Count"
                value={data.totalBugs}
                color="#F43F5E"
              />

              {/* Risk Alert */}
              {isHighUnplanned && (
                <div
                  className="rounded-lg mt-auto"
                  style={{
                    background: '#FEF2F2',
                    border: '1px solid #FECACA',
                    padding: '10px 14px',
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#F43F5E', marginBottom: 2 }}>
                    Risk Alert
                  </div>
                  <div style={{ fontSize: 11, color: '#64748B', lineHeight: 1.5 }}>
                    Unplanned work exceeds 30% ({data.pctUnplanned}%). Review sprint scope and capacity planning.
                  </div>
                </div>
              )}

              {!isHighUnplanned && (
                <div
                  className="rounded-lg mt-auto"
                  style={{
                    background: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    padding: '10px 14px',
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#16A34A', marginBottom: 2 }}>
                    On Track
                  </div>
                  <div style={{ fontSize: 11, color: '#64748B', lineHeight: 1.5 }}>
                    Unplanned work is within acceptable range ({data.pctUnplanned}%).
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </SlideLayout>
  );
}

function InsightRow({ label, value, color, bar }) {
  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: 3 }}>
        <span style={{ fontSize: 12, color: '#64748B', fontWeight: 500 }}>{label}</span>
        <span className="font-bold" style={{ fontSize: 14, color, letterSpacing: '-0.02em' }}>{value}</span>
      </div>
      {bar != null && (
        <div style={{ width: '100%', height: 4, background: '#F1F5F9', borderRadius: 2 }}>
          <div style={{
            width: `${Math.min(bar, 100)}%`,
            height: '100%',
            background: color,
            borderRadius: 2,
            transition: 'width 0.6s ease',
          }} />
        </div>
      )}
    </div>
  );
}

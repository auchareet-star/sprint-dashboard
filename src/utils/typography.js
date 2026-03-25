/**
 * Typography scale — single source of truth.
 *
 * Usage rules:
 *   Page title      → T.pageTitle  (32px) — unchanged
 *   Subtitle        → T.subtitle   (15px) — unchanged
 *   Section title   → T.section    (15px) — unchanged
 *   Section desc    → T.desc       (14px)
 *   KPI big number  → T.kpiBig / T.kpiSmall
 *   Body            → T.body       (15px)
 *   Label / caption → T.label      (13px)
 *   Micro           → T.micro      (12px)
 *   Chart axis      → T.chartAxis  (15px)
 *   Chart label     → T.chartLabel (13px)
 *   Chart legend    → T.chartLegend(15px)
 *   Badge           → T.badge      (13px)
 *   Table header    → T.tableHead  (13px)
 *   Table cell      → T.tableCell  (14px)
 */

// Font sizes (numbers for inline style)
export const T = {
  // Page-level (headers — NOT changed)
  pageTitle: 32,
  subtitle: 18,

  // Section / card headers
  section: 18,

  // Description (+2)
  desc: 14,

  // KPI numbers (+2)
  kpiBig: 46,
  kpiSmall: 36,
  kpiLabel: 14,
  kpiSublabel: 13,
  kpiHero: 50,

  // Body (+2)
  body: 15,
  bodyLg: 16,

  // Small / meta (+2)
  label: 13,
  micro: 12,
  caption: 11,

  // Chart (+2)
  chartAxis: 15,
  chartLabel: 13,
  chartLegend: 15,
  chartTooltip: 15,
  chartBarLabel: 14,

  // Table (+2)
  tableHead: 13,
  tableCell: 14,

  // Badge (+2)
  badge: 13,

  // Metric (+2)
  metricValue: 26,
  metricLg: 30,
  metricXl: 42,

  // Nav / UI (+2)
  nav: 14,
  button: 14,
};

// Shared tooltip style for recharts
export const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid #E2E8F0',
  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
  fontSize: T.chartTooltip,
  fontWeight: 500,
  padding: '10px 14px',
};

// Shared chart axis tick style
export const axisTickPrimary = { fontSize: T.chartAxis, fill: '#334155', fontWeight: 500 };
export const axisTickSecondary = { fontSize: T.chartAxis, fill: '#94A3B8', fontWeight: 500 };

// Shared legend style
export const legendStyle = { fontSize: T.chartLegend, fontWeight: 600, paddingTop: 12, color: '#475569' };

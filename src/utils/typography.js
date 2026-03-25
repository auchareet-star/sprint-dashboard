/**
 * Typography scale — single source of truth.
 * Maps to CSS :root vars in index.css.
 *
 * Usage rules:
 *   Page title      → T.pageTitle  (28px)
 *   Section title   → T.section    (15px)
 *   Section desc    → T.desc       (12px)
 *   KPI big number  → T.kpiBig / T.kpiSmall
 *   Body            → T.body       (13px)
 *   Label / caption → T.label      (11px)
 *   Micro           → T.micro      (10px)
 *   Chart axis      → T.chartAxis  (13px)
 *   Chart label     → T.chartLabel (11px)
 *   Chart legend    → T.chartLegend(13px)
 *   Badge           → T.badge      (11px)
 *   Table header    → T.tableHead  (11px)
 *   Table cell      → T.tableCell  (12px)
 */

// Font sizes (numbers for inline style)
export const T = {
  // Page-level
  pageTitle: 32,
  subtitle: 15,

  // Section / card headers
  section: 15,
  desc: 12,

  // KPI numbers
  kpiBig: 44,
  kpiSmall: 34,
  kpiLabel: 12,
  kpiSublabel: 11,
  kpiHero: 48,

  // Body
  body: 13,
  bodyLg: 14,

  // Small / meta
  label: 11,
  micro: 10,
  caption: 9,

  // Chart
  chartAxis: 13,
  chartLabel: 11,
  chartLegend: 13,
  chartTooltip: 13,
  chartBarLabel: 12,

  // Table
  tableHead: 11,
  tableCell: 12,

  // Badge
  badge: 11,

  // Metric
  metricValue: 24,
  metricLg: 28,
  metricXl: 40,

  // Nav / UI
  nav: 12,
  button: 12,
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

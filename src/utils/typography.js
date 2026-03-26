/**
 * Typography scale — single source of truth.
 */

// Font sizes (numbers for inline style)
export const T = {
  // Page-level
  pageTitle: 34,
  subtitle: 20,

  // Section / card headers
  section: 20,

  // Description
  desc: 16,

  // KPI numbers
  kpiBig: 48,
  kpiSmall: 38,
  kpiLabel: 16,
  kpiSublabel: 15,
  kpiHero: 52,

  // Body
  body: 17,
  bodyLg: 18,

  // Small / meta
  label: 15,
  micro: 14,
  caption: 13,

  // Chart
  chartAxis: 17,
  chartLabel: 15,
  chartLegend: 17,
  chartTooltip: 17,
  chartBarLabel: 16,

  // Table
  tableHead: 15,
  tableCell: 16,

  // Badge
  badge: 15,

  // Metric
  metricValue: 28,
  metricLg: 32,
  metricXl: 44,

  // Nav / UI
  nav: 16,
  button: 16,
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

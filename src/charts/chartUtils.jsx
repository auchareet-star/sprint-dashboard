import { T } from '../utils/typography';

/**
 * Shared chart utilities — single source of truth for WrapTick, RoundedBarShape, TotalOnTop.
 */

/** Wraps long Y-axis labels into 2 lines at the space closest to middle */
export function WrapTick({ x, y, payload, maxChars = 16 }) {
  const text = payload.value || '';
  let lines;
  if (text.length <= maxChars) {
    lines = [text];
  } else {
    const mid = Math.floor(text.length / 2);
    let best = -1;
    for (let i = 0; i < text.length; i++) {
      if (text[i] === ' ' && (best === -1 || Math.abs(i - mid) < Math.abs(best - mid))) best = i;
    }
    lines = best > 0 ? [text.slice(0, best), text.slice(best + 1)] : [text];
  }
  const lh = 15;
  const topY = y - ((lines.length - 1) * lh) / 2;
  return (
    <text x={x} textAnchor="end" fontSize={T.chartAxis} fontWeight={500} fill="#334155">
      {lines.map((l, i) => <tspan key={i} x={x} y={topY + i * lh}>{l}</tspan>)}
    </text>
  );
}

/**
 * Rounds the right edge of a horizontal stacked bar only if it's the topmost segment.
 * @param keys - array of dataKeys in stack order (e.g. STATUS_ORDER or ['Planned','Unplanned'])
 * @param currentKey - the dataKey this Bar represents
 * @param dataEntry - the data row object
 */
export function RoundedBarShape({ x, y, width, height, fill, keys, currentKey, dataEntry }) {
  if (!width || !height) return null;
  let isTop = true;
  const myIdx = keys.indexOf(currentKey);
  for (let i = myIdx + 1; i < keys.length; i++) {
    if ((dataEntry[keys[i]] || 0) > 0) { isTop = false; break; }
  }
  const r = isTop ? 6 : 0;
  return (
    <path
      d={`M${x},${y} h${width - r} ${r ? `a${r},${r} 0 0 1 ${r},${r}` : `h${r}`} v${height - 2 * r} ${r ? `a${r},${r} 0 0 1 ${-r},${r}` : `v${r}`} h${-(width - r)} z`}
      fill={fill}
    />
  );
}

/**
 * Shows total label at the right end of a horizontal stacked bar.
 * Only renders on the topmost visible segment.
 * @param keys - array of dataKeys in stack order
 * @param currentKey - the dataKey this Bar represents
 * @param data - full data array
 * @param totalKey - optional key for pre-computed total (e.g. '_total' or 'Total')
 */
export function TotalOnTop({ x, y, width, height, index, keys, currentKey, data, totalKey = '_total' }) {
  if (!data?.[index]) return null;
  const row = data[index];
  let topKey = null;
  for (let i = keys.length - 1; i >= 0; i--) {
    if ((row[keys[i]] || 0) > 0) { topKey = keys[i]; break; }
  }
  if (currentKey !== topKey) return null;
  const total = totalKey ? row[totalKey] : keys.reduce((s, k) => s + (row[k] || 0), 0);
  if (!total) return null;
  return (
    <text x={x + width + 8} y={y + height / 2} fill="#475569" fontSize={T.chartLabel} fontWeight={700} dominantBaseline="central">
      {typeof total === 'number' && total % 1 !== 0 ? total.toFixed(2) : total}
    </text>
  );
}

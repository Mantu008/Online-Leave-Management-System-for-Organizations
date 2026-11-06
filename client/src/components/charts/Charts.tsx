import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);
ChartJS.defaults.font.family = "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

// Colours follow the data-viz reference palette: one categorical blue for a
// single series, and the reserved status colours for leave states. Status is
// never conveyed by colour alone — every chart has a legend and a data table.
export const SERIES_COLORS = {
  primary: '#6366f1',
  approved: '#10b981',
  pending: '#f59e0b',
  rejected: '#f43f5e',
} as const;

const INK_MUTED = '#64748b';
const GRIDLINE = '#f1f5f9';
const SURFACE = '#ffffff';

export interface Series {
  label: string;
  data: number[];
  color: string;
}

interface BarChartProps {
  labels: string[];
  series: Series[];
  /** Accessible name for the chart, e.g. "Leave requests per month". */
  title: string;
  orientation?: 'vertical' | 'horizontal';
  height?: number;
}

function Legend({ series }: { series: Series[] }) {
  if (series.length < 2) return null;
  return (
    <ul className="mb-4 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-slate-600" aria-hidden="true">
      {series.map((s) => (
        <li key={s.label} className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
          {s.label}
        </li>
      ))}
    </ul>
  );
}

function DataTable({ title, labels, series }: { title: string; labels: string[]; series: Series[] }) {
  return (
    <table className="sr-only">
      <caption>{title}</caption>
      <thead>
        <tr>
          <th scope="col">Period</th>
          {series.map((s) => (
            <th key={s.label} scope="col">
              {s.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {labels.map((label, i) => (
          <tr key={label}>
            <th scope="row">{label}</th>
            {series.map((s) => (
              <td key={s.label}>{s.data[i]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Column or bar chart; multiple series are stacked. */
export function BarChart({ labels, series, title, orientation = 'vertical', height = 240 }: BarChartProps) {
  const horizontal = orientation === 'horizontal';
  const stacked = series.length > 1;
  const last = series.length - 1;

  const data: ChartData<'bar'> = {
    labels,
    datasets: series.map((s, i) => ({
      label: s.label,
      data: s.data,
      backgroundColor: s.color,
      hoverBackgroundColor: s.color,
      maxBarThickness: 28,
      // Rounded data-end on the outermost segment only, square at the baseline.
      borderRadius: i === last ? (horizontal ? { topRight: 6, bottomRight: 6 } : { topLeft: 6, topRight: 6 }) : 0,
      borderSkipped: false,
      // A surface-coloured gap between stacked segments.
      borderColor: SURFACE,
      borderWidth: stacked && i !== last ? (horizontal ? { right: 2 } : { top: 2 }) : 0,
    })),
  };

  const valueAxis = {
    stacked,
    beginAtZero: true,
    border: { display: false },
    grid: { color: GRIDLINE, lineWidth: 1, drawTicks: false },
    ticks: { color: INK_MUTED, precision: 0, padding: 8, font: { size: 11 } },
  };
  const categoryAxis = {
    stacked,
    border: { color: '#e2e8f0' },
    grid: { display: false },
    // Skip labels rather than rotate them when space is tight.
    ticks: { color: INK_MUTED, font: { size: 11 }, maxRotation: 0, autoSkip: true, autoSkipPadding: 12 },
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: horizontal ? 'y' : 'x',
    // No entrance animation: figures should be readable immediately.
    animation: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 12,
        cornerRadius: 8,
        boxPadding: 4,
        usePointStyle: true,
        titleFont: { weight: 600 },
      },
    },
    scales: horizontal ? { x: valueAxis, y: categoryAxis } : { x: categoryAxis, y: valueAxis },
  };

  return (
    <figure>
      <Legend series={series} />
      <div style={{ height }} role="img" aria-label={title}>
        <Bar data={data} options={options} />
      </div>
      <DataTable title={title} labels={labels} series={series} />
    </figure>
  );
}

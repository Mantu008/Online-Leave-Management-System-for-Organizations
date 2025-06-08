declare module 'chart.js' {
    export * from 'chart.js/auto';
}

declare module 'react-chartjs-2' {
    import { ChartType, ChartData, ChartOptions } from 'chart.js';
    import { Component } from 'react';

    export interface ChartProps {
        type: ChartType;
        data: ChartData;
        options?: ChartOptions;
        width?: number;
        height?: number;
        id?: string;
        className?: string;
        fallbackContent?: React.ReactNode;
        redraw?: boolean;
    }

    export class Chart extends Component<ChartProps> { }
    export class Line extends Component<ChartProps> { }
    export class Bar extends Component<ChartProps> { }
    export class HorizontalBar extends Component<ChartProps> { }
    export class Radar extends Component<ChartProps> { }
    export class Doughnut extends Component<ChartProps> { }
    export class PolarArea extends Component<ChartProps> { }
    export class Bubble extends Component<ChartProps> { }
    export class Pie extends Component<ChartProps> { }
    export class Scatter extends Component<ChartProps> { }
} 
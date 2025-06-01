declare module '@mui/system/colorManipulator' {
    export function darken(color: string, coefficient?: number): string;
    export function lighten(color: string, coefficient?: number): string;
    export function emphasize(color: string, coefficient?: number): string;
    export function fade(color: string, value: number): string;
    export function alpha(color: string, value: number): string;
    export function getContrastRatio(foreground: string, background: string): number;
    export function getLuminance(color: string): number;
    export function decomposeColor(color: string): {
        type: string;
        values: number[];
    };
    export function recomposeColor(color: {
        type: string;
        values: number[];
    }): string;
    export function rgbToHex(color: string): string;
    export function hexToRgb(color: string): string;
    export function hslToRgb(color: string): string;
    export function rgbToHsl(color: string): string;
} 
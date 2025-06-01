declare module 'date-fns/_lib/format/longFormatters' {
    export const longFormatters: {
        [key: string]: (date: Date, locale: any) => string;
    };
}

declare module 'date-fns/locale' {
    export const enUS: any;
    export const enGB: any;
    export const fr: any;
    export const de: any;
    export const es: any;
    export const it: any;
    export const pt: any;
    export const ru: any;
    export const zhCN: any;
    export const ja: any;
    export const ko: any;
} 
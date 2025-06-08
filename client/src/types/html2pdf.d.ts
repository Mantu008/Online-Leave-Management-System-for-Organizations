declare module 'html2pdf.js' {
    interface Options {
        margin?: number;
        filename?: string;
        image?: {
            type?: string;
            quality?: number;
        };
        html2canvas?: {
            scale?: number;
        };
        jsPDF?: {
            unit?: string;
            format?: string;
            orientation?: 'portrait' | 'landscape';
        };
    }

    interface Html2PdfInstance {
        set(options: Options): Html2PdfInstance;
        from(element: HTMLElement): Html2PdfInstance;
        save(): Promise<void>;
    }

    function html2pdf(): Html2PdfInstance;
    export default html2pdf;
}

declare module 'html2pdf.js/dist/html2pdf.bundle.min.js' {
    const html2pdf: any;
    export default html2pdf;
} 
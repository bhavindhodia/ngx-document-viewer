export type PDFPageProxy =
  import('pdfjs-dist/types/src/display/api').PDFPageProxy;
export type PDFSource =
  import('pdfjs-dist/types/src/display/api').DocumentInitParameters;
export type PDFDocumentProxy =
  import('pdfjs-dist/types/src/display/api').PDFDocumentProxy;
export type PDFDocumentLoadingTask =
  import('pdfjs-dist/types/src/display/api').PDFDocumentLoadingTask;
export type PDFViewerOptions =
  import('pdfjs-dist/types/web/pdf_viewer').PDFViewerOptions;

export enum LoadingProgressStatus {
  LOADING = 'loading',
  COMPLETE = 'complete',
  ERROR = 'error',
  STALE = 'stale',
}
export interface LoadingProgress {
  loaded:  string;
  total:  string;
  percent: number;
  status: LoadingProgressStatus;
  message?: string;
}
export interface PDFProgressData {
  loaded: number;
  total: number;
}
export enum RenderTextMode {
  DISABLED,
  ENABLED,
  ENHANCED,
}

export type ZoomScale = 'page-height' | 'page-fit' | 'page-width';

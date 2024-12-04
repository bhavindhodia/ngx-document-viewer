import {
  DestroyRef,
  ElementRef,
  inject,
  Injectable,
  Optional,
  signal,
  SkipSelf,
} from '@angular/core';
import {
  PDFDocumentProxy,
  PDFPageProxy,
  PDFDocumentLoadingTask,
} from 'pdfjs-dist/types/src/display/api';
import { getDocument } from 'pdfjs-dist';
import * as PDFJS from 'pdfjs-dist';
import * as PDFJSViewer from 'pdfjs-dist/web/pdf_viewer.mjs';
import { EventBus, PDFViewerOptions } from 'pdfjs-dist/types/web/pdf_viewer';
import { createEventBus } from '../utils/event-bus.utils';
import { BehaviorSubject, from, Observable, skipWhile } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  LoadingProgress,
  LoadingProgressStatus,
  PDFProgressData,
  RenderTextMode,
} from '../utils/typings';
import { ResourceLoader } from 'ngx-document-viewer/src/lib/shared/model/resource-loader';
import { ResourceLoaderService } from 'ngx-document-viewer/src/lib/shared/services/resource-loader.service';

@Injectable({
  providedIn: 'root',
})
export class PdfViewerService extends ResourceLoader {
  //Static Values
  private static CSS_UNITS = 96.0 / 72.0;
  private static BORDER_WIDTH = 9;
  //private static PDF_CONTAINER_ID = 'pdf-viewer-container';
  //Services
  destroy$ = inject(DestroyRef);
  _resource = inject(ResourceLoaderService);
  // Subjects
  progressInitialValue: LoadingProgress = {
    loaded: 0,
    total: 0,
    percent: 0,
    status: LoadingProgressStatus.STALE,
  };

  private loadingProgress_ = new BehaviorSubject<LoadingProgress>(
    this.progressInitialValue
  );
  loadingProgress$: Observable<LoadingProgress> =
    this.loadingProgress_.asObservable();
  pageInit_ = new BehaviorSubject<CustomEvent | null>(null);
  pageInit$ = this.pageInit_.asObservable();

  private _pageInitialized = signal<CustomEvent<PDFDocumentProxy> | null>(null);
  pageInitialized = this._pageInitialized.asReadonly();
  private _afterLoadComplete = signal<PDFDocumentProxy | null>(null);
  afterLoadComplete = this._afterLoadComplete.asReadonly();

  //Variables
  private _pdf: PDFDocumentProxy | null = null;
  private _loadingTask!: PDFDocumentLoadingTask;
  private eventBus!: EventBus;
  private pdfLinkService!: PDFJSViewer.PDFLinkService;
  private pdfFindController!: PDFJSViewer.PDFFindController;
  private _imageResourcesPath =
    typeof PDFJS !== 'undefined'
      ? `https://unpkg.com/pdfjs-dist@${(PDFJS as any).version}/web/images/`
      : undefined;

  private pdfViewer!: PDFJSViewer.PDFViewer | PDFJSViewer.PDFSinglePageViewer;
  public isServiceInitialized: boolean = false;

  //Getter Setter
  get pdfDocument() {
    return this._pdf;
  }
  //Page
  private _page: number = 1;
  get page(): number {
    return this._page;
  }
  set page(pageNumber: number | string) {
    pageNumber =
      typeof pageNumber === 'string' ? parseInt(pageNumber, 10) : pageNumber;
    const originalPage = pageNumber;
    if (this._pdf) {
      pageNumber = this.getValidPageNumber(pageNumber);
    }
    this._page = pageNumber;
  }

  myPdfContainer: HTMLDivElement | null = null;
  constructor(
    @Optional() @SkipSelf() pdfViewerService: PdfViewerService
    //@Inject(DOCUMENT) private document: Document
    //private be: PDFJSViewer.EventBus
  ) {
    super();
    if (pdfViewerService) {
      throw new Error('Instance of this service already exist');
    }
    this.initializeServices();
  }
  /*
  To Open link in PDF
  private getPDFLinkServiceConfig() {
    return { externalLinkTarget: 'blank' };
    } */

  initializeServices() {
    if (this.isServiceInitialized) return;
    this.isServiceInitialized = true;
    this.eventBus = createEventBus(PDFJSViewer, this.destroy$);
    /* fromEvent<CustomEvent>(this.eventBus, 'pagesinit')
      .pipe(takeUntilDestroyed(this.destroy$))
      .subscribe((event) => {
        console.log('CUSTOM EVENT pagesinit', event);
        this.pageInit_.next(event);
      }); */
  }

  loadPdf(
    url: string,
    canvas: ElementRef<HTMLDivElement>
  ): PDFDocumentProxy | null {
    console.log('PDFVIIEWER SERVICE', this._resource.src);
    //this.loadingProgress_.next(this.progressInitialValue);
    this.setupViewer(canvas);
    this.clear();
    this._loadingTask = getDocument({ url });
    this.setLoadingProgress();
    from(this._loadingTask!.promise as Promise<PDFDocumentProxy>)
      .pipe(takeUntilDestroyed(this.destroy$))
      .subscribe({
        next: (pdf: PDFDocumentProxy) => {
          this._pdf = pdf;
          this._afterLoadComplete.set(pdf);
          this.resetPdfDocument();
          this.update(canvas);
        },
        error: (error) => {},
      });
    return this._pdf;
  }

  private update(canvas: ElementRef<HTMLDivElement>) {
    this.page = this._page;
    this.render(canvas);
  }
  private render(canvas: ElementRef<HTMLDivElement>) {
    this._page = this.getValidPageNumber(this._page);

    if (
      this._rotation !== 0 ||
      this.pdfViewer.pagesRotation !== this._rotation
    ) {
      // wait until at least the first page is available.
      this.pdfViewer.firstPagePromise?.then(
        () => (this.pdfViewer.pagesRotation = this._rotation)
      );
    }

    if (this._stickToPage) {
      setTimeout(() => {
        this.pdfViewer.currentPageNumber = this._page;
      });
    }

    if (!this.pdfViewer._pages?.length) {
      // the first time we wait until pages init
      this.pageInit$
        .pipe(
          skipWhile((customEvent) => !customEvent),
          takeUntilDestroyed(this.destroy$)
        )
        .subscribe((c) => {
          this.updateSize(canvas);
        });
    } else {
      this.updateSize(canvas);
    }
  }
  public updateSize(canvas: ElementRef<HTMLDivElement>): void {
    from(this._pdf!.getPage(this.pdfViewer.currentPageNumber))
      .pipe(takeUntilDestroyed(this.destroy$))
      .subscribe({
        next: (page: PDFPageProxy) => {
          const rotation = this.rotation + page.rotate;
          const viewportWidth =
            page.getViewport({
              scale: this._zoom,
              rotation,
            }).width * PdfViewerService.CSS_UNITS;
          let scale = this._zoom;
          let stickToPage = true;

          console.log('viewPort', viewportWidth);
          // Scale the document when it shouldn't be in original size or doesn't fit into the viewport
          if (
            !this._originalSize ||
            (this._fitToPage &&
              viewportWidth >
                canvas.nativeElement.querySelector('div')!.clientWidth)
          ) {
            const viewPort = page.getViewport({ scale: 1, rotation });

            scale = this.getScale(
              canvas.nativeElement.querySelector('div')!,
              viewPort.width,
              viewPort.height
            );
            stickToPage = !this._stickToPage;
          }
          this.pdfViewer.currentScale = scale;
          if (stickToPage) {
            this.pdfViewer.scrollPageIntoView({
              pageNumber: page.pageNumber,
              ignoreDestinationZoom: true,
            });
          }
        },
      });
  }
  private setLoadingProgress(): void {

    this._loadingTask.onProgress = (progressData: PDFProgressData) => {
      const percent = (progressData.loaded / progressData.total) * 100;
      this.loadingProgress_.next({
        loaded: progressData.loaded,
        total: progressData.total,
        percent: Math.round(percent),
        status:
          progressData.loaded === progressData.total
            ? LoadingProgressStatus.COMPLETE
            : LoadingProgressStatus.LOADING,
        message: `Loading PDF: ${Math.round(percent)}%`,
      });
      if (progressData.loaded === progressData.total) {
        //this.loadingProgress_.complete();

      }
    };
  }
  private getScale(
    canvas: HTMLDivElement,
    viewportWidth: number,
    viewportHeight: number
  ) {
    const borderSize = this._showBorders
      ? 2 * PdfViewerService.BORDER_WIDTH
      : 0;

    const pdfContainerWidth = canvas.clientWidth - borderSize;
    const pdfContainerHeight = canvas.clientHeight - borderSize;
    if (
      pdfContainerHeight === 0 ||
      viewportHeight === 0 ||
      pdfContainerWidth === 0 ||
      viewportWidth === 0
    ) {
      return 1;
    }

    let ratio = 1;
    switch (this._zoomScale) {
      case 'page-fit':
        ratio = Math.min(
          pdfContainerHeight / viewportHeight,
          pdfContainerWidth / viewportWidth
        );
        break;
      case 'page-height':
        ratio = pdfContainerHeight / viewportHeight;
        break;
      case 'page-width':
      default:
        ratio = pdfContainerWidth / viewportWidth;
        break;
    }

    return (this._zoom * ratio) / PdfViewerService.CSS_UNITS;
  }
  public setupViewer(canvas: ElementRef<HTMLDivElement>) {
    console.log('PdfViewerService setupViewer');
    if (this.pdfViewer) {
      this.pdfViewer.setDocument(null as any);
    }
    //assign(PDFJS, 'disableTextLayer', false);
    this.initPDFServices();
    this.pdfViewer = new PDFJSViewer.PDFViewer(this.getPDFOptions(canvas));
    this.pdfLinkService.setViewer(this.pdfViewer);
    this.pdfViewer._currentPageNumber = this._page;
  }

  private initPDFServices() {
    this.pdfLinkService = new PDFJSViewer.PDFLinkService({
      eventBus: this.eventBus,
    });
    this.pdfFindController = new PDFJSViewer.PDFFindController({
      eventBus: this.eventBus,
      linkService: this.pdfLinkService,
    });
  }

  private getPDFOptions(canvas: ElementRef<HTMLDivElement>): PDFViewerOptions {
    return {
      eventBus: this.eventBus,
      container: canvas.nativeElement.querySelector('div')!,
      removePageBorders: this.showBorders,
      linkService: this.pdfLinkService,
      textLayerMode: RenderTextMode.DISABLED,
      findController: this.pdfFindController,
      l10n: new PDFJSViewer.GenericL10n('en'),
      imageResourcesPath: this._imageResourcesPath,
      annotationEditorMode: PDFJS.AnnotationEditorType.DISABLE,
    };
  }
  private resetPdfDocument() {
    this.pdfLinkService.setDocument(this._pdf, null);
    this.pdfFindController.setDocument(this._pdf!);
    this.pdfViewer.setDocument(this._pdf!);
  }

  private getValidPageNumber(page: number): number {
    if (page < 1) {
      return 1;
    }

    if (page > this._pdf!.numPages) {
      return this._pdf!.numPages;
    }

    return page;
  }
  public clear() {
    if (this._loadingTask && !this._loadingTask.destroyed) {
      this._loadingTask.destroy();
    }
    //this.resetLoadingStatus()

    if (this._pdf) {
      //this._latestScrolledPage = 0;
      this._pdf.destroy();
      this._pdf = null;
    }

    this.pdfViewer && this.pdfViewer.setDocument(null as any);
    this.pdfLinkService && this.pdfLinkService.setDocument(null, null);
    this.pdfFindController && this.pdfFindController.setDocument(null as any);
  }
}

import {
  DestroyRef, effect,
  ElementRef,
  inject,
  Injectable,
  Optional,
  signal,
  SkipSelf,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ResourceLoaderService } from 'ngx-document-viewer/src/lib/shared/services/resource-loader.service';
import * as PDFJS from 'pdfjs-dist';
import { getDocument } from 'pdfjs-dist';
import {
  DocumentInitParameters,
  PDFDocumentLoadingTask,
  PDFDocumentProxy,
  PDFPageProxy,
  TypedArray,
} from 'pdfjs-dist/types/src/display/api';
import { EventBus, PDFViewerOptions } from 'pdfjs-dist/types/web/pdf_viewer';
import * as PDFJSViewer from 'pdfjs-dist/web/pdf_viewer.mjs';
import { BehaviorSubject, from, skipWhile } from 'rxjs';
import { createEventBus } from '../utils/event-bus.utils';
import {
  PDFProgressData,
  RenderTextMode
} from '../utils/typings';

@Injectable({
  providedIn: 'root',
})
export class PdfViewerService  {
  //Static Values
  private static CSS_UNITS = 96.0 / 72.0;
  private static BORDER_WIDTH = 9;
  //private static PDF_CONTAINER_ID = 'pdf-viewer-container';
  //Services
  destroy$ = inject(DestroyRef);
  _resource = inject(ResourceLoaderService);
  // Subjects

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

  constructor(
    @Optional() @SkipSelf() pdfViewerService: PdfViewerService
  ) {
    if (pdfViewerService) {
      throw new Error('Instance of this service already exist');
    }
    this.initializeServices();

    effect(() => {
      if((this._resource.zoom()) && this.pdfViewer){
        console.log("PDF VIEWER SERVICE EFFECT",this._resource.zoom())
        this.pdfViewer.currentScale = this._resource.zoom()
      }
    });


  }
  /*
  To Open link in PDF
  private getPDFLinkServiceConfig() {
    return { externalLinkTarget: 'blank' };
    } */

  initializeServices() {
    if (this.isServiceInitialized) return;
    this.isServiceInitialized = true;
    this.eventBus = createEventBus(PDFJSViewer, this.destroy$,this._resource);
  }

  loadPdf(
    url: string | URL | TypedArray | ArrayBuffer | DocumentInitParameters,
    canvas: ElementRef<HTMLDivElement>
  ): PDFDocumentProxy | null {
    console.log('PDFVIIEWER SERVICE URL', url);
    //this.loadingProgress_.next(this.progressInitialValue);
    this.setupViewer(canvas);
    this.clear();
    //this._loadingTask = getDocument({ url });
    this._loadingTask = getDocument(url);
    this.setLoadingProgress();
    from(this._loadingTask!.promise as Promise<PDFDocumentProxy>)
      .pipe(takeUntilDestroyed(this.destroy$))
      .subscribe({
        next: (pdf: PDFDocumentProxy) => {
          this._pdf = pdf;
          this._afterLoadComplete.set(pdf);
          this.resetPdfDocument();
          this.update(canvas);
          this._resource.setTotalPage(pdf.numPages)
        },
        error: (error) => {},
      });
    return this._pdf;
  }

  private update(canvas: ElementRef<HTMLDivElement>) {
    this.render(canvas);
  }
  private render(canvas: ElementRef<HTMLDivElement>) {
    if (
      this._resource.rotation() !== 0 ||
      this.pdfViewer.pagesRotation !== this._resource.rotation()
    ) {
      // wait until at least the first page is available.
      this.pdfViewer.firstPagePromise?.then(
        () => (this.pdfViewer.pagesRotation = this._resource.rotation())
      );
    }

    if (this._resource.stickToPage()) {
      setTimeout(() => {
        this.pdfViewer.currentPageNumber = this._resource.page();
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
          const rotation = this._resource.rotation() + page.rotate;
          const viewportWidth =
            page.getViewport({
              scale: this._resource.zoom(),
              rotation,
            }).width * PdfViewerService.CSS_UNITS;
          let scale = this._resource.zoom();
          let stickToPage = true;
          // Scale the document when it shouldn't be in original size or doesn't fit into the viewport
          if (
            !this._resource.originalSize() ||
            (this._resource.fitToPage() &&
              viewportWidth >
                canvas.nativeElement.querySelector('div')!.clientWidth)
          ) {
            const viewPort = page.getViewport({ scale: 1, rotation });

            scale = this.getScale(
              canvas.nativeElement.querySelector('div')!,
              viewPort.width,
              viewPort.height
            );
            stickToPage = !this._resource.stickToPage();
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
      //console.log("progressData",progressData)
      this._resource.updateProgress(progressData.loaded.toString(),progressData.total.toString())
      if (progressData.loaded === progressData.total) {
        this._resource.completeLoading()

      }
    };
  }
  private getScale(
    canvas: HTMLDivElement,
    viewportWidth: number,
    viewportHeight: number
  ) {
    const borderSize = this._resource.showBorders()
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
    switch (this._resource.zoomScale()) {
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

    return (this._resource.zoom() * ratio) / PdfViewerService.CSS_UNITS;
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
    this.pdfViewer._currentPageNumber = this._resource.page();
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
      removePageBorders: this._resource.showBorders(),
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

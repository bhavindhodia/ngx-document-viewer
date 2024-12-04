import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  NgZone,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { assign, isSSR } from './utils/helpers';
import * as PDFJS from 'pdfjs-dist';
import { GlobalWorkerOptions } from 'pdfjs-dist';
import { PdfViewerService } from './services/pdf.viewer.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, filter, fromEvent } from 'rxjs';
@Component({
  selector: 'lib-pdf-viewer',
  standalone: true,
  imports: [],
  template: `
    <div
      #pdfViewerContainer
      id="pdf-viewer-container"
      class="pdf-viewer-container"
    >
      <div class="pdfViewer"></div>
    </div>
  `,
  styleUrl: './pdf-viewer.component.scss',
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class PdfViewerComponent implements OnInit, OnDestroy, AfterViewChecked {
  title = input<string>();
  src = input.required<string>();
  private isVisible = false;
  private isInitialized = false;

  private destroy$ = inject(DestroyRef);
  private pdfViewerService = inject(PdfViewerService);
  private ngZone = inject(NgZone);
  private pdfContainer: ElementRef<HTMLDivElement> = inject(ElementRef);

  constructor() {
    /* Get PdfWorker  */
    let pdfWorkerSrc: string;
    const pdfJsVersion: string = (PDFJS as any).version;
    const versionSpecificPdfWorkerUrl: string = (window as any)[
      `pdfWorkerSrc${pdfJsVersion}`
    ];

    if (versionSpecificPdfWorkerUrl) {
      pdfWorkerSrc = versionSpecificPdfWorkerUrl;
    } else if (
      window.hasOwnProperty('pdfWorkerSrc') &&
      typeof (window as any).pdfWorkerSrc === 'string' &&
      (window as any).pdfWorkerSrc
    ) {
      pdfWorkerSrc = (window as any).pdfWorkerSrc;
    } else {
      pdfWorkerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfJsVersion}/legacy/build/pdf.worker.min.mjs`;
    }

    assign(GlobalWorkerOptions, 'workerSrc', pdfWorkerSrc);
  }

  ngOnInit(): void {
    console.log('PdfViewerComponent OnINIT');
//assign(PDFJS, 'verbosity', PDFJS.VerbosityLevel.INFOS);
    //this.initEventBus()
    this.setupResizeListener();
    //this.pdfViewerService.setupViewer(this.pdfContainer);
  }
  ngAfterViewChecked() {
    if (this.isInitialized) {
      return;
    }
    const offset =
    this.pdfContainer.nativeElement.querySelector('div')!.offsetParent;

    if (this.isVisible === true && offset == null) {
      this.isVisible = false;
      return;
    }
    if (this.isVisible === false && offset != null) {
      console.log('PdfViewerComponent VIEW CHECKED');
      this.isVisible = true;
      setTimeout(() => {
        this.ngOnChanges({ src: this.src } as any);
      });
    }

  }
  /* private initialize(): void {
    if (isSSR() || !this.isVisible) {
      return;
    }

    this.isInitialized = true;
    this.pdfViewerService.setupViewer(this.pdfContainer);
  } */
  ngOnChanges(changes: SimpleChanges) {
    if (isSSR() || !this.pdfContainer.nativeElement.offsetParent) {
      return;
    }
    if ('src' in changes) {
      console.log('PdfViewerComponent ONCHANGE',changes);
      this.loadPDF();
    }
  }
  private loadPDF() {
    this.pdfViewerService.loadPdf(
      this.src(),
      this.pdfContainer
    );
  }
  private setupResizeListener(): void {
    if (isSSR()) {
      return;
    }
    this.ngZone.runOutsideAngular(() => {
      fromEvent(window, 'resize')
        .pipe(
          debounceTime(500),
          filter(
            () =>
              this.pdfViewerService.canAutoResize &&
              !!this.pdfViewerService.pdfDocument
          ),
          takeUntilDestroyed(this.destroy$)
        )
        .subscribe(() => {
          this.pdfViewerService.updateSize(
            this.pdfContainer
          );
        });
    });
  }

  ngOnDestroy(): void {
    console.log('PdfViewerComponent DESTROYED');
    this.pdfViewerService.clear();
  }
}

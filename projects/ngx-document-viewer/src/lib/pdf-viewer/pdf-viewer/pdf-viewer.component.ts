import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  NgZone,
  OnChanges,
  OnDestroy,
  SimpleChanges
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ResourceLoaderService } from 'ngx-document-viewer/src/lib/shared';
import * as PDFJS from 'pdfjs-dist';
import { GlobalWorkerOptions } from 'pdfjs-dist';
import { TypedArray } from 'pdfjs-dist/types/src/display/api';
import { debounceTime, filter, fromEvent } from 'rxjs';
import { PdfViewerService } from './services/pdf.viewer.service';
import { assign, isSSR } from './utils/helpers';

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
export class PdfViewerComponent implements  OnDestroy,AfterViewInit,OnChanges {
  title = input<string>();
  src = input.required<string | TypedArray>();

  private destroy$ = inject(DestroyRef);
  private pdfViewerService = inject(PdfViewerService);
  private resourceLoaderService = inject(ResourceLoaderService);
  private ngZone = inject(NgZone);
  private pdfContainer!: ElementRef<HTMLDivElement>;
  private host: ElementRef<HTMLDivElement> = inject<ElementRef<HTMLDivElement>>(ElementRef)
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

  ngAfterViewInit(): void {
    // this.loadPDF(this.src());
    /*    this.pdfContainer = new ElementRef<HTMLDivElement>(
      this.host.nativeElement.querySelector('#pdf-viewer-container') as HTMLDivElement
      );
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadPDF('observer');
            }
            });
            });
            observer.observe(this.pdfContainer.nativeElement);*/
            this.setupResizeListener();
          }


  ngOnChanges(changes: SimpleChanges): void{
    if(!isSSR() && changes['src']){
      console.log('CHANGES', changes);
      this.loadPDF(this.src());
    }

  }
  private loadPDF(src:string | TypedArray) {
    //console.log('PdfViewerComponent loadPDF',this.src());
    this.pdfViewerService.loadPdf(
      src,
      this.host
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
              this.resourceLoaderService.canAutoResize() &&
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

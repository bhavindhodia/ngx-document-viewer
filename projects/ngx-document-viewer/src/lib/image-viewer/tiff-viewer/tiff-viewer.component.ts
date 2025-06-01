import {ChangeDetectionStrategy, Component, effect, inject, input, OnDestroy, signal} from '@angular/core';
import {PdfViewerComponent} from 'ngx-document-viewer/src/lib/pdf-viewer';
import {TiffViewerService} from 'ngx-document-viewer/src/lib/image-viewer/tiff-viewer/services/tiff-viewer.service';
import {ResourceLoaderService} from 'ngx-document-viewer/src/lib/shared';

@Component({
  selector: 'lib-tiff-viewer',
  standalone: true,
  imports: [
    PdfViewerComponent
  ],
  template: `<lib-pdf-viewer [src]="_pdfBytes()"></lib-pdf-viewer>`,
  styleUrl: './tiff-viewer.component.scss',
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class TiffViewerComponent   implements OnDestroy {
  title = input<string>();
  src = input.required<string>();
  _pdfBytes = signal<Uint8Array>(new Uint8Array());
  private tiffViewerService = inject(TiffViewerService);
  private resourceLoaderService = inject(ResourceLoaderService);


  constructor() {
    effect(() => {
      if (!!this.src().length) {
        this.loadTiff(this.src());
      }
    });
  }

  loadTiff(src:string)
  {
    this.resourceLoaderService.startLoading()
    this.tiffViewerService.convertTiffToPdf(src).subscribe({
      next: (pdfBytes: Uint8Array) => {
      console.log('TiffViewerComponent loadTiff', pdfBytes);
        this._pdfBytes.set(pdfBytes);
        console.log("STATUS",this.resourceLoaderService.currentProgress)
      },
      error: (err) => {
        console.error('Error:', err);
      }
    });
  }
  ngOnDestroy(): void {
    console.log('TiffViewerComponent ngOnDestroy');
  }
}

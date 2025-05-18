import {Component, inject, input, OnChanges, OnDestroy, SimpleChanges} from '@angular/core';
import {PdfViewerComponent} from 'ngx-document-viewer/src/lib/pdf-viewer';
import {TiffViewerService} from 'ngx-document-viewer/src/lib/image-viewer/tiff-viewer/services/tiff-viewer.service';

@Component({
  selector: 'lib-tiff-viewer',
  standalone: true,
  imports: [
    PdfViewerComponent
  ],
  template: `<lib-pdf-viewer [src]="_pdf"></lib-pdf-viewer>`,
  styleUrl: './tiff-viewer.component.scss'
})
export class TiffViewerComponent   implements OnDestroy, OnChanges {
  title = input<string>();
  src = input.required<string>();
  _pdf:Uint8Array= new Uint8Array();
  private tiffViewerService = inject(TiffViewerService);

  ngOnChanges(changes: SimpleChanges) {
    if ('src' in changes) {
      console.log('TiffViewerComponent ONCHANGE', changes);
      this.loadTiff()
    }
  }

  loadTiff()
  {
    this.tiffViewerService.convertTiffToPdf(this.src()).subscribe({
      next: (pdfBytes: Uint8Array) => {
      console.log('TiffViewerComponent loadTiff', pdfBytes);
        this._pdf = pdfBytes;
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

import { AfterViewChecked, AfterViewInit, Component, ElementRef, inject, Input, input, OnDestroy, OnInit, SimpleChange, SimpleChanges } from '@angular/core';
import { ImageViewerService } from './image-viewer.service';

@Component({
  selector: 'lib-image-viewer',
  standalone: true,
  imports: [],
  /* template: ` <canvas #imageContainer> </canvas> `, */
  template: `
    <div
      #pdfViewerContainer
      id="image-viewer-container"
      class="image-viewer-container"
    >
      <div class="image-viewer">
        <canvas #imageCanvas> </canvas>
      </div>
    </div>
  `,
  styleUrl: './image-viewer.component.scss',
  /* styles: [
    `
      :host {
        display: block;
      }
      :host canvas {
        margin: 0 auto;
        display: block;
      }
      [hidden] {
        display: none !important;
      }
    `,
  ], */
})
export class ImageViewerComponent
  implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy
{
  title = input<string>();
  src = input.required<string>();

  private isVisible = false;

  private _imageService = inject(ImageViewerService);
  private imageContainer: ElementRef<HTMLDivElement> = inject(ElementRef);

  ngOnInit(): void {
    console.log('ImageViewerComponent OnInit');
  }
  ngAfterViewInit(): void {
    console.log('ImageViewerComponent AfterViewInit');
  }
  ngAfterViewChecked(): void {
    /*    const offset =
    this.imageContainer.nativeElement.querySelector('div')!.offsetParent;

    if (this.isVisible === true && offset == null) {
      this.isVisible = false;
      return;
    }
    if (this.isVisible === false && offset != null) {
      console.log('PdfViewerComponent VIEW CHECKED');
      this.isVisible = true;
      setTimeout(() => {
        //this.ngOnChanges({ src: this.src } as any);
      });
  } */
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('ImageViewerComponent SimpleChanges', changes);
    if ('src' in changes) {
      console.log('PdfViewerComponent ONCHANGE', changes);
      this._imageService.loadImage(
        this.src(),
        this.imageContainer
      );
    }
  }
  ngOnDestroy(): void {
    console.log('ImageViewerComponent ngOnDestroy');
  }
}

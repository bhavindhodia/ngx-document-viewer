import {Component, DestroyRef, inject, input, OnChanges, OnDestroy, SimpleChanges} from '@angular/core';
import {ImageViewerService} from './services/image-viewer.service';
import {fromEvent} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {debounceTime} from 'rxjs/operators';

@Component({
  selector: 'lib-image-viewer',
  standalone: true,
  imports: [],
  template: ` <canvas id="fabricImageSurface"> </canvas> `,
  styleUrl: './image-viewer.component.scss',
})
export class ImageViewerComponent
  implements OnDestroy,OnChanges
{
  title = input<string>();
  src = input.required<string>();
  private _imageService = inject(ImageViewerService);

  constructor() {


  }


  ngOnChanges(changes: SimpleChanges) {
    if ('src' in changes) {
      console.log('ImageViewerComponent ONCHANGE', changes);
      this._imageService.loadImageToCanvas(this.src())
    }
  }
  ngOnDestroy(): void {
    console.log('ImageViewerComponent ngOnDestroy');
    this._imageService.destroyedCanvas();
  }
}

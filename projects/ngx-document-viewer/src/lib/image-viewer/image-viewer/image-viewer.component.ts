import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  Input,
  input, NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges
} from '@angular/core';
import { ImageViewerService } from './image-viewer.service';
import {FabricService} from 'ngx-document-viewer/src/lib/shared/services/fabric.service';
import {Canvas} from 'fabric';

@Component({
  selector: 'lib-image-viewer',
  standalone: true,
  imports: [],
   template: ` <canvas id="fabricSurface"> </canvas> `,
  /*template: `
    <div
      #pdfViewerContainer
      id="image-viewer-container"
      class="image-viewer-container"
    >
      <div class="image-viewer">
        <canvas id="fabricSurface"></canvas>
      </div>
    </div>
  `,*/
  styleUrl: './image-viewer.component.scss',
})
export class ImageViewerComponent
  implements OnInit, AfterViewInit, OnDestroy,OnChanges
{
  title = input<string>();
  src = input.required<string>();
  //

  private _imageService = inject(ImageViewerService);
  private _zone = inject(NgZone)
  private _fabricService = inject(FabricService)
  private imageContainer: ElementRef<HTMLDivElement> = inject(ElementRef) as ElementRef<HTMLDivElement>;
  protected _canvas?: Canvas;
  ngOnInit(): void {
    console.log('ImageViewerComponent OnInit');
    /*{
      this._zone.runOutsideAngular(() => {
        this._canvas = new Canvas('fabricSurface', {
          backgroundColor: '#ebebef',
          selection: false,
          preserveObjectStacking: true,
        });

        this._fabricService.canvas = this._canvas;
      });
    }*/
    //this._imageService.initializeCanvas("fabricSurface")
    //this._imageService.loadImageToCanvas(this.src())
  }
  ngAfterViewInit(): void {
    console.log('ImageViewerComponent AfterViewInit');
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('ImageViewerComponent SimpleChanges', changes);
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

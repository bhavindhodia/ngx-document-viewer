import {DestroyRef, inject, Injectable, NgZone} from '@angular/core';
import {ResourceLoader} from '../../../shared/model/resource-loader';
import {Canvas, FabricImage, Point} from 'fabric'
import {debounceTime} from 'rxjs/operators';
import {fromEvent} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';


@Injectable({
  providedIn: 'root',
})
export class ImageViewerService extends ResourceLoader {
  private static CSS_UNITS = 96.0 / 72.0;
  private static CANVAS_ID = 'fabricImageSurface'
  private _zone = inject(NgZone)

  private canvas?: Canvas | null;
  private image?:FabricImage;
  private destroy$ = inject(DestroyRef);
  constructor() {
    super();
    fromEvent(window, 'resize')
      .pipe(takeUntilDestroyed(this.destroy$), debounceTime(500))
      .subscribe(() => this.setImage());
  }

  private initializeCanvas(canvasId: string): void {
    this._zone.runOutsideAngular(() => {
      this.canvas = new Canvas(canvasId, {
        backgroundColor: '#ebebef',
        selection: false,
        preserveObjectStacking: true,
      });
    })
  }

  loadImageToCanvas(imageUrl: string): void {
    if (!this.canvas) {
      console.warn('Canvas is not initialized.');
      this.initializeCanvas(ImageViewerService.CANVAS_ID)
    }
    FabricImage.fromURL(imageUrl).then((img) => {
      this.image = img
      this.setImage()
    });
  }

  setImage(){
    if(this.image && this.canvas){

    const MAX_WIDTH = window.innerWidth * 0.7;
    const MAX_HEIGHT = window.innerHeight * 0.8;
    const imgWidth = this.image.width ?? 0;
    const imgHeight = this.image.height ?? 0;

    // Calculate scale factor if image is larger than allowed
    const scaleX = MAX_WIDTH / imgWidth;
    const scaleY = MAX_HEIGHT / imgHeight;
    const scale = Math.min(scaleX, scaleY, 1); // only downscale

    // Set canvas size according to scaled image size
    const finalWidth = imgWidth * scale;
    const finalHeight = imgHeight * scale;

    this.canvas.setDimensions({width: imgWidth * scale, height: imgHeight * scale})

    this.image.scale(0);
    this.image.scale(scale);

    const point = new Point(finalWidth / 2, finalHeight / 2)
    this.image.set({
      left: point.x,
      top: point.y,
      selectable: false,       // Cannot be selected
      evented: false,          // Ignores events like mouse down/up
      hasControls: false,      // No resize/rotate controls
      hasBorders: false,       // No border box
      lockMovementX: true,     // Lock horizontal movement
      lockMovementY: true,     // Lock vertical movement
      lockScalingX: true,      // Lock horizontal scaling
      lockScalingY: true,      // Lock vertical scaling
      lockRotation: true
    })

    this.clearCanvas();
    this.canvas.add(this.image);
    this.canvas.centerObject(this.image)
    this.canvas.setActiveObject(this.image)
    this.canvas.renderAll();
  }
  }

  clearCanvas(): void {
    this.canvas?.clear();
  }

  destroyedCanvas(): void {
    if (this.canvas) {
      // Removes all event listeners from the canvas
      this.canvas.off();
    }
    // 2. Dispose of the canvas if not reused
    if (this.canvas) {
      this.canvas.dispose().then(r => {
        this.canvas = null;
      });

    }
  }

  rotate() {
    //this.angle = (this.angle + 90) % 360;
    /* this.drawCanvas(); */
  }

  zoomIn() {
    this._zoom *= 1.1;
    /* this.drawCanvas(); */
  }

  zoomOut() {
    this._zoom /= 1.1;
    /* this.drawCanvas(); */
  }
}

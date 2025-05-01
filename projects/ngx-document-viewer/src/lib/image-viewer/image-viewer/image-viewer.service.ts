import {Injectable} from '@angular/core';
import {ResourceLoader} from '../../shared/model/resource-loader';
import {Canvas, FabricImage, Point} from 'fabric'

export interface ImageLoadConfig {
  maxWidth?: number;
  maxHeight?: number;
  maintainAspectRatio?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ImageViewerService extends ResourceLoader{
  private static CSS_UNITS = 96.0 / 72.0;

  public canvas?:Canvas | null;
  private readonly MAX_WIDTH = window.innerWidth * 0.7;  // 90% of viewport width
  private readonly MAX_HEIGHT = window.innerHeight * 0.8; // 90% of viewport height

  constructor() {
    super();}

  initializeCanvas(canvasId: string): void {
    this.canvas = new Canvas(canvasId,{uniformScaling:false});
  }

  loadImageToCanvas(imageUrl: string): void {
    if (!this.canvas) {
      console.error('Canvas is not initialized. Call initializeCanvas() first.');
      this.initializeCanvas("fabricSurface")
    }

    FabricImage.fromURL(imageUrl).then((img) => {
      const imgWidth = img.width ?? 0;
      const imgHeight = img.height ?? 0;

      // Calculate scale factor if image is larger than allowed
      const scaleX = this.MAX_WIDTH / imgWidth;
      const scaleY = this.MAX_HEIGHT / imgHeight;
      const scale = Math.min(scaleX, scaleY, 1); // only downscale

      // Set canvas size according to scaled image size
      const finalWidth = imgWidth * scale;
      const finalHeight = imgHeight * scale;

      this.canvas?.setDimensions({width:imgWidth*scale ,height:imgHeight*scale})


      img.scale(scale);
      const point = new Point(finalWidth/2,finalHeight/2)
      img.set({
        left : point.x,
        top : point.y,
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
      this.canvas!.add(img);
      this.canvas!.centerObject(img)
      this.canvas?.setActiveObject(img)
      this.canvas!.renderAll();
    });
  }

  clearCanvas(): void {
    this.canvas?.clear();
  }

  destroyedCanvas():void{
    if (this.canvas) {
      this.canvas.off(); // Removes all event listeners from the canvas
    }

    // 2. Dispose of the canvas if not reused
    if (this.canvas) {
      this.canvas.dispose().then(r => {
        this.canvas = null;
      }); // Removes all objects and cleans up internal state

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

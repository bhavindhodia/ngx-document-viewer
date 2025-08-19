import { DestroyRef, effect, inject, Injectable, NgZone } from '@angular/core';
import { Canvas, FabricImage, Group, Point } from 'fabric';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ResourceLoaderService } from '@ngx-document-viewer';
import { fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';


@Injectable({
  providedIn: 'root',
})
export class ImageViewerService  {
  private static CANVAS_ID = 'fabricImageSurface'
  private _zone = inject(NgZone)

  private canvas?: Canvas | null;
  private image?:FabricImage;
  private destroy$ = inject(DestroyRef);
  private _resource = inject(ResourceLoaderService)
  //private readonly zoom = computed(() => this._resource.zoom());
  //private readonly rotation = computed(() => this._resource.rotation());
  constructor() {
    fromEvent(window, 'resize')
      .pipe(takeUntilDestroyed(this.destroy$), debounceTime(500))
      .subscribe(() => this.setImage());
    effect(() => {
      const rotation = this._resource.rotation()
      if(this.image && this.canvas){
        console.log("Image Viewer Current Rotation")
        this.clearCanvas();
        this.image.set('angle',rotation)
        this.canvas.add(this.image);
        this.canvas.centerObject(this.image)
        this.canvas.setActiveObject(this.image)
        this.canvas.renderAll()
      }
    });
    effect(() => {
        this.zoomToContent(this._resource.zoom());
    });
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
    this._resource.startLoading()
    FabricImage.fromURL(imageUrl).then((img) => {
      this.image = img
      this.setImage()
      const {height,width} = this.image.getOriginalSize();
      const size = height * width
      this._resource.updateProgress(size.toString(),size.toString())
    }).catch(
      (error)=>{
        console.error("IMG",error);
        this._resource.setError("Image Service")
        return error
      }
    ).finally(() => this._resource.completeLoading());
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
      lockScalingX: false,      // Lock horizontal scaling
      lockScalingY: false,      // Lock vertical scaling
      lockRotation: false
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

  zoomToContent(zoom:number){
    if (!this.canvas ||this.canvas.getObjects().length < 1) {
      return;
    }
    this.canvas.setZoom(1);
    const group = new Group(this.canvas.getObjects());
    const x = (group.left + (group.width / 2)) - (this.canvas.width / 2);
    const y = (group.top + (group.height / 2)) - (this.canvas.height / 2);
    this.canvas.absolutePan(new Point(x,y));
  /*  const heightDist = this.canvas.getHeight() - group.height;
    const widthDist = this.canvas.getWidth() - group.width;
    let groupDimension = 0;
    let canvasDimension = 0;
    if (heightDist < widthDist) {
      groupDimension = group.height;
      canvasDimension = this.canvas.getHeight();
    } else {
      groupDimension = group.width;
      canvasDimension = this.canvas.getWidth();
    }*/
    const point = new Point(this.canvas.width/2,this.canvas
      .height/2)
    this.canvas.zoomToPoint(point, zoom);
  }
}

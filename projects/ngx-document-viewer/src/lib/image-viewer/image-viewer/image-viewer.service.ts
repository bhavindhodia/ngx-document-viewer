import { HttpClient } from '@angular/common/http';
import { DestroyRef, ElementRef, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, Observable, windowTime } from 'rxjs';
import { ResourceLoader } from '../../shared/model/resource-loader';

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
  destroy$ = inject(DestroyRef);

  private image = new Image();
  private ctx: CanvasRenderingContext2D | null = null;
  private imageContainer: HTMLDivElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  constructor(private http: HttpClient) {
    super()
  }
  loadImage(url: string, imageContainer:ElementRef<HTMLDivElement>) {
    this.imageContainer =
      imageContainer.nativeElement.querySelector('.image-viewer');
    this.canvas = imageContainer.nativeElement.querySelector('canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d');
    this.fetchImage(url).subscribe((img) => {
      img.onload = () => {
        //this.drawCanvas();
        if(this.canvas){
          this.drawImageOnCanvas(this.canvas,img,{maxHeight:this.imageContainer?.offsetHeight,maxWidth:this.imageContainer?.offsetWidth});
        }
      };
    });
  }

  fetchImage(url: string): Observable<HTMLImageElement> {
    return this.http.get(url, { responseType: 'blob' }).pipe(
      takeUntilDestroyed(this.destroy$),
      map((blob) => {
        this.image = new Image();
        this.image.src = URL.createObjectURL(blob);
        return this.image;
      })
    );
  }

/*   drawImageOnCanvas(
    canvas: HTMLCanvasElement,
    image: HTMLImageElement,
    config: ImageLoadConfig = {}
  ): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Calculate scaled dimensions
    let drawWidth = image.width;
    let drawHeight = image.height;

    // Respect max width/height if provided
    const maxWidth = config.maxWidth || viewportWidth;
    const maxHeight = config.maxHeight || viewportHeight;

    // Scale down if image exceeds viewport
    if (drawWidth > maxWidth || drawHeight > maxHeight) {
      const widthRatio = canvas.clientWidth / viewportWidth;
      const heightRatio = canvas.clientHeight / viewportHeight;
      const scaleFactor = (Math.min(widthRatio, heightRatio))/ImageViewerService.CSS_UNITS;
      //const scaleFactor = (this._zoom *  heightRatio)/ImageViewerService.CSS_UNITS;

      drawWidth *= 1;
      drawHeight *=1;
    }

    // Set canvas size to match scaled image
    canvas.width = drawWidth;
    canvas.height = drawHeight;

    // Clear canvas and draw
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, drawWidth, drawHeight);
  } */
  drawImageOnCanvas(
    canvas: HTMLCanvasElement,
    img: HTMLImageElement,
    config: ImageLoadConfig = {}
  ): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    var MAX_WIDTH = config.maxWidth || window.innerWidth;
    var MAX_HEIGHT = config.maxHeight || window.innerHeight;

    var width = img.width;
    var height = img.height;

    // Change the resizing logic
    if (width > height) {
      if (width > MAX_WIDTH) {
        height = height * (MAX_WIDTH / width);
        width = MAX_WIDTH;
      }
    } else {
      if (height > MAX_HEIGHT) {
        width = width * (MAX_HEIGHT / height);
        height = MAX_HEIGHT;
      }
    }

    var canvas = document.createElement('canvas');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);
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

import {computed, ElementRef, Injectable, signal} from '@angular/core';
import {LoadingProgress, LoadingProgressStatus, ZoomScale} from '../../pdf-viewer/pdf-viewer/utils/typings';
import {BehaviorSubject, distinctUntilChanged, Observable} from 'rxjs';
import {TypedArray} from 'pdfjs-dist/types/src/display/api';
import { niceBytes } from '@ngx-document-viewer';

@Injectable({
  providedIn: 'root',
})
export class ResourceLoaderService {
  private _src = signal<string|TypedArray>('');
  private _zoom = signal<number>(1.0);
  private _rotation = signal<number>(0);
  private _zoomScale = signal<ZoomScale>('page-width');
  private _stickToPage = signal<boolean>(false);
  private _originalSize = signal<boolean>(true);
  private _canAutoResize = signal<boolean>(true);
  private _fitToPage = signal<boolean>(false);
  private _showBorders = signal<boolean>(true);
  private _page = signal<number>(1);
  private _totalPage = signal<number>(1);
  private _canvas = signal<ElementRef<HTMLCanvasElement>|null>(null);

  restResource(){
    console.log('RESET RESOURCE');
    this.setSrc('')
    this.setZoom(1.0)
    this.setRotation(0)
    this.setZoomScale('page-width')
    this.setPage(1)
  }

  progressInitialValue: LoadingProgress = {
    loaded: "0",
    total: "0",
    percent: 0,
    status: LoadingProgressStatus.STALE,
  };

  private loadingProgress_ = new BehaviorSubject<LoadingProgress>(
    this.progressInitialValue
  );
  loadingProgress$: Observable<LoadingProgress> =
    this.loadingProgress_.pipe(
      distinctUntilChanged((a, b) =>
        a.status === b.status &&
        a.percent === b.percent
      )
    );
  get currentProgress(): LoadingProgress {
    return this.loadingProgress_.value;
  }
  updateProgress(loaded: string, total?: string): void {
    const current = this.loadingProgress_.value;
    const currentTotal = typeof current.total === 'string'
        ? parseInt(current.total)
        : current.total
    const newTotal =
      Number(total ?? current.total);
    const percent = newTotal > 0
      ? Math.min(Math.round((parseInt(loaded) / newTotal) * 100), 100)
      : 0;

    this.loadingProgress_.next({
      loaded,
      total: String(newTotal),
      percent,
      status: LoadingProgressStatus.LOADING
    });
  }
  startLoading(total?: string): void {
    this.loadingProgress_.next({
      loaded: '0',
      total: total || '0',
      percent: 0,
      status: LoadingProgressStatus.LOADING
    });
  }
  completeLoading(message="Loading Complete"): void {
    const current = this.loadingProgress_.value;
    this.loadingProgress_.next({
      loaded: niceBytes(current.total),
      total: niceBytes(current.total),
      percent: 100,
      status: LoadingProgressStatus.COMPLETE,
      message,
    });
  }
  setError(message="Something went wrong"): void {
    const current = this.loadingProgress_.value;
    this.loadingProgress_.next({
      ...current,
      status: LoadingProgressStatus.ERROR,
      message
    });
  }

  // Reset to initial state
  reset(): void {
    this.loadingProgress_.next(this.progressInitialValue);
  }

  readonly src = computed<string|TypedArray>(() => this._src())
  setSrc(value: string) {
    this._src.set(value);
  }
  //Rotate content
  readonly rotation = computed<number>(() => this._rotation())
  // Should be multiple of 90
  setRotation(value: number) {
    if (!(value % 90 === 0)) {
      console.warn('Invalid pages rotation angle.');
      return;
    }
    this._rotation.set(value);
  }
  //Set zoom value
  readonly zoom = computed<number>(() => this._zoom())
  setZoom(value: number) {
    if (value <= 0.25 || value >=4) return;
    this._zoom.set(value);
  }

  //Zoom scale for canvas dimension
  readonly zoomScale = computed<ZoomScale>(() => this._zoomScale())
  setZoomScale(value: ZoomScale) {
    this._zoomScale.set(value);
  }

  readonly canAutoResize = computed<boolean>(() => this._canAutoResize())
  setCanAutoResize(value: boolean) {
    this._canAutoResize.set(value);
  }
  readonly originalSize = computed<boolean>(() => this._originalSize())
  setOriginalSize(value: boolean) {
    this._originalSize.set(value);
  }
  readonly stickToPage = computed<boolean>(() => this._stickToPage())
  setStickToPage(value: boolean) {
    this._stickToPage.set(value);
  }
  readonly fitToPage = computed<boolean>(() => this._fitToPage())
  setFitToPage(value: boolean) {
    this._fitToPage.set(value);
  }
  readonly showBorders = computed<boolean>(() => this._showBorders())
  setShowBorders(value: boolean) {
    this._showBorders.set(value);
  }
  readonly page = computed<number>(() => this._page())
  setPage(value: number) {
    if(value > 0 && value <= this.totalPage()){
      this._page.set(value);
    }
  }
  readonly totalPage = computed<number>(() => this._totalPage())
  setTotalPage(value: number) {
    this._totalPage.set(value);
  }

  readonly canvas = computed<ElementRef<HTMLCanvasElement>|null>(() => this._canvas())
  setCanvas(value: ElementRef<HTMLCanvasElement>) {
    this._canvas.set(value);
  }
}

import { Injectable } from '@angular/core';
import {LoadingProgress, LoadingProgressStatus, ZoomScale} from '../../pdf-viewer/pdf-viewer/utils/typings';
import {BehaviorSubject, distinctUntilChanged, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ResourceLoaderService {
  protected _src: string = '';
  protected _rotation = 0;
  protected _zoom = 1.0;
  protected _zoomScale: ZoomScale = 'page-width';
  protected _canAutoResize = true;
  protected _originalSize = true;
  protected _stickToPage = false;
  protected _fitToPage = false;
  protected _showBorders = true;

  progressInitialValue: LoadingProgress = {
    loaded: 0,
    total: 0,
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
  updateProgress(loaded: number, total?: number): void {
    const current = this.loadingProgress_.value;
    const newTotal = total ?? current.total;
    const percent = newTotal > 0
      ? Math.min(Math.round((loaded / newTotal) * 100), 100)
      : 0;

    this.loadingProgress_.next({
      loaded,
      total: newTotal,
      percent,
      status: LoadingProgressStatus.LOADING
    });
  }
  startLoading(total?: number): void {
    this.loadingProgress_.next({
      loaded: 0,
      total: total || 0,
      percent: 0,
      status: LoadingProgressStatus.LOADING
    });
  }
  completeLoading(message="Loading Complete"): void {
    const current = this.loadingProgress_.value;
    this.loadingProgress_.next({
      loaded: current.total,
      total: current.total,
      percent: 100,
      status: LoadingProgressStatus.COMPLETE,
      message
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

  set src(value: string) {
    this._src = value;
  }
  get src(){
    return this._src;
  }
  //Rotate content
  // Should be multiple of 90
  set rotation(value: number) {
    if (!(typeof value === 'number' && value % 90 === 0)) {
      console.warn('Invalid pages rotation angle.');
      return;
    }
    this._rotation = value;
  }
  //Set zoom value
  public set zoom(zoomLevel: number) {
    if (zoomLevel <= 0) return;
    this._zoom = zoomLevel;
  }

  //Zoom scale for canvas dimension
  //Valid values are "page-height" | "page-fit" | "page-width"
  set zoomScale(value: ZoomScale) {
    this._zoomScale = value;
  }
  //AutoResize
  set canAutoResize(value: boolean) {
    this._canAutoResize = Boolean(value);
  }

  // Show original size for PDF
  set originalSize(value: boolean) {
    this._originalSize = Boolean(value);
  }

  set stickToPage(value: boolean) {
    this._stickToPage = Boolean(value);
  }

  // Fit PDF to clients viewport
  set fitToPage(value: boolean) {
    this._fitToPage = Boolean(value);
  }

  //Show border between PDF pages
  set showBorders(value: boolean) {
    this._showBorders = Boolean(value);
  }
}

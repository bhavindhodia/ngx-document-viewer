import { ZoomScale } from "../../pdf-viewer/pdf-viewer/utils/typings";
import {TypedArray} from 'pdfjs-dist/types/src/display/api';

export abstract class ResourceLoader {
  protected _src: string | TypedArray = '';
  protected _rotation = 0;
  protected _zoom = 1.0;
  protected _zoomScale: ZoomScale = 'page-width';
  protected _canAutoResize = true;
  protected _originalSize = true;
  protected _stickToPage = false;
  protected _fitToPage = false;
  protected _showBorders = true;

  set src(value:string | TypedArray){
    this._src=value
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

import { Injectable } from '@angular/core';
import {Canvas, Circle, Polyline,FabricImage} from 'fabric';
export type POINT = {x: number, y: number};
@Injectable({
  providedIn: 'root'
})
export class FabricService {

  // draw properties are public to keep the demo more compact; but, you break it ... you buy it
  public strokeWidth: number;
  public strokeColor: string;
  public circleRadius: number;
  public circleFill: string;

  protected _canvas?: Canvas;

  protected _points: Array<Circle>;
  protected _polylines: Record<string, Polyline>;

  constructor()
  {
    this.strokeWidth  = 2;
    this.strokeColor  = '#000000';
    this.circleFill   = '#0000ff';
    this.circleRadius = 2;

    this._points    = new Array<Circle>();
    this._polylines = {}
  }

  public set canvas(surface: Canvas)
  {
    if (surface !== undefined && surface != null && surface instanceof Canvas) {
      this._canvas = surface;
    }
  }

  public clear(): void
  {
    if (this._canvas)
    {
      this._points.forEach( (circle: Circle): void => {
        if (this._canvas instanceof Canvas) {
          this._canvas.remove(circle);
        }
      });
      this._points.length = 0;
      Object.keys(this._polylines).forEach( (name: string): void => {
        if (this._canvas instanceof Canvas) {
          this._canvas.remove(this._polylines[name]);
        }
      });

      this._polylines = {};

      this._canvas.renderAll();
    }
  }

  public addPoint(p: POINT): void
  {
    const circle: Circle = new Circle(
      {
        left: p.x - this.circleRadius,
        top: p.y - this.circleRadius,
        fill: this.circleFill,
        radius: this.circleRadius
      });

    this._points.push(circle);

    if (this._canvas)
    {
      this._canvas.add(circle);
      this._canvas.renderAll();
    }
  }

  public addPolyline(name: string, points: Array<POINT>, clear: boolean = true): void
  {
    const polyLine: Polyline = new Polyline(points,
      {
        strokeWidth: this.strokeWidth,
        stroke: this.strokeColor,
        fill: 'transparent',
      });

    if (this._canvas)
    {
      if (clear && this._polylines[name] !== undefined) {
        this._canvas.remove(this._polylines[name]);
      }

      this._canvas.add(polyLine);
      this._canvas.renderAll();
    }

    this._polylines[name] = polyLine;
  }
}

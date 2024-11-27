import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ToolbarService {
  private editPen$ = new BehaviorSubject<boolean>(false);
  private _test = false
  get test(){
    return this._test
  }
  set test(value){
    this._test=value
  }
  constructor() {}

  getEditPen() {
    return this.editPen$.asObservable()
  }
  toogleEditPen() {
    this.editPen$.next(true);
  }

}

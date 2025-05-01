import {
  AfterViewInit,
  Component,
  effect,
  inject,
  input,
  OnInit,
} from '@angular/core';
import {
  DynamicComponentLoader,
  DynamicComponentLoaderType,
  ValidDocumentExtensions,
} from './dynamic-component-loader.service';
import { NgComponentOutlet } from '@angular/common';
import { ResourceLoaderService } from '../../shared/services/resource-loader.service';
import { ErrorComponent } from '../../shared/components/error/error.component';


export interface ComponentInputTypes {
  name: string;
  value: any;
  title?: string;
}

@Component({
  selector: 'lib-document-viewer',
  standalone: true,
  imports: [NgComponentOutlet],
  template: `
    <ng-container
      *ngComponentOutlet="
        dynamicComponent.component;
        inputs: dynamicComponent.inputs
      "
    />
  `,
  styleUrl: './document-viewer.component.css',
})
export class DocumentViewerComponent implements OnInit, AfterViewInit {
  documentUrl = input.required<string>();

  documentType: ValidDocumentExtensions | undefined = undefined;
  private _dynamicComponentService = inject(DynamicComponentLoader);
  private _resourceLoaderService = inject(ResourceLoaderService);
  private componentList!: Map<
    ValidDocumentExtensions,
    DynamicComponentLoaderType
  >;

  get dynamicComponent() {
    return (
      (this.documentType && this.componentList.get(this.documentType)) ?? {
        component: ErrorComponent,
        inputs: {},
      }
    );
  }
  constructor() {
    effect(() => {
      console.log('DOCUMENT VIEWER EFFECT RUN', this.documentUrl());
      this.documentType = this.getExtensionFromUrl(this.documentUrl());
      this.componentList = this._dynamicComponentService.setComponents({
        src: this.documentUrl(),
      });
      this._resourceLoaderService.src = this.documentUrl();
    });
  }
  ngOnInit(): void {}
  ngAfterViewInit(): void {}

  private getExtensionFromUrl(
    url: string
  ): ValidDocumentExtensions | undefined {
    const extension = new URL(url).pathname
      .split('/')
      .pop()
      ?.split(".")
      .pop()
      ?.toLowerCase();
    if (extension) {
      return extension.trim() as ValidDocumentExtensions;
    }
    return;
  }
}

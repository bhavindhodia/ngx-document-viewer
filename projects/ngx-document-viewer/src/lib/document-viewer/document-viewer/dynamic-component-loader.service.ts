import { Injectable, Type } from '@angular/core';
import {ImageViewerComponent, PdfViewerComponent, TiffViewerComponent} from '@ngx-document-viewer';
export enum ValidDocumentExtensions {
  PDF = 'pdf',
  TIFF = 'tiff',
  JPEG = 'jpeg',
  JPG = 'jpg',
  PNG = 'png',
}
export interface DynamicComponentLoaderType {
  component: Type<any>;
  inputs: Record<string, unknown>;
}
@Injectable({ providedIn: 'root' })
export class DynamicComponentLoader {

  data = new Map<ValidDocumentExtensions, DynamicComponentLoaderType>();
  setComponents(
    additionalInputs?: Record<string, unknown>
  ): Map<ValidDocumentExtensions, DynamicComponentLoaderType> {
    this.data.set(ValidDocumentExtensions.PDF, {
      component: PdfViewerComponent,
      inputs: { ...additionalInputs },
    });
    this.data.set(ValidDocumentExtensions.JPEG, {
      component: ImageViewerComponent,
      inputs: { ...additionalInputs },
    });
    this.data.set(ValidDocumentExtensions.JPG, {
      component: ImageViewerComponent,
      inputs: { ...additionalInputs },
    });
    this.data.set(ValidDocumentExtensions.PNG, {
      component: ImageViewerComponent,
      inputs: { ...additionalInputs },
    });
    this.data.set(ValidDocumentExtensions.TIFF, {
      component: TiffViewerComponent,
      inputs: { ...additionalInputs },
    });
    return this.data
  }
}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageViewerService } from './image-viewer/services/image-viewer.service';



@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers:[ImageViewerService]
})
export class ImageViewerModule { }

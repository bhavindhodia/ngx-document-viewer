import { Component, Input, input } from '@angular/core';

@Component({
  selector: 'lib-image-viewer',
  standalone: true,
  imports: [],
  templateUrl: './image-viewer.component.html',
  styleUrl: './image-viewer.component.css',
})
export class ImageViewerComponent {
  title = input<string>();
  src = input.required<string>()
}

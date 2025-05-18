import {
  AfterViewInit,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import {
  DocumentViewerComponent as LibDocumentViewer,
  ToolbarService,
} from '@ngx-document-viewer';
import { AsyncPipe, JsonPipe } from '@angular/common';
import { PdfViewerService } from '@ngx-document-viewer';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-document-viewer',
  standalone: true,
  imports: [
    NavbarComponent,
    LibDocumentViewer,
    JsonPipe,
    AsyncPipe,
    ButtonModule,
  ],
  templateUrl: './document-viewer.component.html',
  styleUrl: './document-viewer.component.scss',
})
export class DocumentViewerComponent implements OnInit, AfterViewInit {
  private _toolbarService = inject(ToolbarService);
  pdfViewerService = inject(PdfViewerService);
  documentUrl = signal<string>('');
  getServiceStatus$ = this.pdfViewerService.loadingProgress$;
  currentIndex = 0;

  files = [
    'multiPageTiff.tiff',
    'tiff1.tiff',
    'sample.pdf',
    'tiff5.tiff',
    'samplejpeg.jpg',
    'SamplePNG.png',
    'img1.jpg',
    'sample.pdf',
    'example.pdf',
    'policy.pdf',
  ];

  constructor() {}
  ngOnInit(): void {
    this.navigate();
  }

  ngAfterViewInit(): void {
    //this.getServiceStatus$ = this._toolbarService.getEditPen();
  }
  navigate(value: number = 0) {
    if (this.currentIndex === 0 && value === -1) {
      this.currentIndex= this.files.length
    };
    this.currentIndex += value;
    this.documentUrl.set(
      `http://localhost:3000/files/${this.files[this.currentIndex]}`
    );
  }
  getFile(value: number = 0): any {
    return;
  }
}

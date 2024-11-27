import { AfterViewInit, Component, effect, HostListener, inject, OnInit, signal } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";
import { DocumentViewerComponent as LibDocumentViewer, ToolbarService } from '@ngx-document-viewer';
import { AsyncPipe, JsonPipe } from '@angular/common';
import { PdfViewerService } from '@ngx-document-viewer';

@Component({
  selector: 'app-document-viewer',
  standalone: true,
  imports: [NavbarComponent, LibDocumentViewer, JsonPipe, AsyncPipe],
  templateUrl: './document-viewer.component.html',
  styleUrl: './document-viewer.component.scss',
})
export class DocumentViewerComponent implements AfterViewInit {
  /* documentUrl = 'http://localhost:3000/files/img1.JPG'; */
  documentUrl = 'http://localhost:3000/files/policy.pdf';
  private _toolbarService = inject(ToolbarService);
  pdfViewerService = inject(PdfViewerService);
  getServiceStatus$ = this.pdfViewerService.loadingProgress$;

  constructor() {

  }

  ngAfterViewInit(): void {
    //this.getServiceStatus$ = this._toolbarService.getEditPen();
  }


}

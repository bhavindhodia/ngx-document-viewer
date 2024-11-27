import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DocumentViewerComponent} from "./document-viewer/document-viewer.component";
import { Toast } from 'primeng/toast';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, DocumentViewerComponent,Toast],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  fileName = 'Document Name';

  documentUrl: undefined;
  isImageFile = true;

  constructor(private http: HttpClient) {
    //(window as any).pdfWorkerSrc = '/pdf.worker.min.mjs';
    // Set the initial document URL (e.g., an image or a PDF file)
    this.setDocumentUrl('assets/document.png');
  }

  loadDocument() {
    this.http
      .get('http://localhost:3000/files/sample.pdf', { responseType: 'blob' })
      .subscribe(console.log);
  }

  setDocumentUrl(url: string) {
    this.isImageFile =
      url.endsWith('.png') || url.endsWith('.jpg') || url.endsWith('.jpeg');
  }

  saveDocument() {
    // Add your save logic here
  }

  downloadDocument() {
    // Add your download logic here
  }

  toggleSelection() {
    // Add your selection logic here
  }

  drawLine() {
    // Add your line drawing logic here
  }

  addText() {
    // Add your text input logic here
  }

  rotateLeft() {
    // Add your rotate left logic here
  }

  rotateRight() {
    // Add your rotate right logic here
  }
}

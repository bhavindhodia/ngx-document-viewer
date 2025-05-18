import {inject, Injectable, Optional, SkipSelf} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {PDFDocument} from 'pdf-lib';
import * as UTIF from 'utif2';
import {ResourceLoader} from 'ngx-document-viewer/src/lib/shared/model/resource-loader';

@Injectable({
  providedIn: 'root'
})
export class TiffViewerService  extends ResourceLoader{
  private http = inject(HttpClient);
  constructor(
    @Optional() @SkipSelf() tiffViewerService:TiffViewerService
  ) {
    super();
    if (tiffViewerService) {
      throw new Error('Instance of this service already exist');
    }
  }
  /* Converts tiff to png Image data and writes that Image data to canvas to PDF*/
  convertTiffToPdf(url: string): Observable<Uint8Array> {
    this.src = url
    return this.http.get(url, { responseType: 'arraybuffer' }).pipe(
      switchMap(async (tiffBuffer: ArrayBuffer) => {
        const ifds = UTIF.decode(tiffBuffer);
        const pdfDoc = await PDFDocument.create();
        for (let i = 0; i < ifds.length; i++) {
          const ifd = ifds[i];
          UTIF.decodeImage(tiffBuffer, ifd);
          const rgba = UTIF.toRGBA8(ifd);
          const imageData = new Uint8ClampedArray(rgba);
          const imageBitmap = await createImageBitmap(
            new ImageData(imageData, ifd.width, ifd.height)
          );
          const canvas = document.createElement('canvas');
          canvas.width = ifd.width;
          canvas.height = ifd.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(imageBitmap, 0, 0);
          }
          const pngDataUrl = canvas.toDataURL('image/png');
          const pngImage = await pdfDoc.embedPng(pngDataUrl);
          const pageWidth = pngImage.width;
          const pageHeight = pngImage.height;
          const page = pdfDoc.addPage([pageWidth, pageHeight]);
          page.drawImage(pngImage, {
            x: 0,
            y: 0,
            width: pageWidth,
            height: pageHeight,
          });
        }
        return await pdfDoc.save();
      })
    );
  }
}

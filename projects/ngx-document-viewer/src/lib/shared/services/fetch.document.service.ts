import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FetchDocumentService {
  private http: HttpClient = inject(HttpClient);


  fetchDocuments(url: string) {
    const documentUrl = this.sanitizeUrl(url);
     return this.http.get(documentUrl, { responseType: 'blob' });
  }
  fetchDocumentChunk(url: string, range: string): Observable<Blob> {
     const headers = new HttpHeaders().set('Range', `bytes=${range}`);
     return this.http.get(url, { headers, responseType: 'blob' })
};
  sanitizeUrl(url: string): string {
    if (this.validURL(url)) {
      return url;
    }
    throw new Error('Invalid Url provided');
  }

  private validURL(str: string) {
    var pattern = new RegExp(
      '^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$',
      'i'
    ); // fragment locator
    return !!pattern.test(str);
  }
}

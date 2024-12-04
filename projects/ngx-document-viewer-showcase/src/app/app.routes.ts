import { Routes } from '@angular/router';
import { DocumentViewerComponent } from './document-viewer/document-viewer.component';

export const routes: Routes = [
  { path: 'home', component: DocumentViewerComponent },
  { path: '',redirectTo:'home', pathMatch: 'full'},
];

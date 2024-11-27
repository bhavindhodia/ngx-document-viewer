import { ApplicationConfig, ErrorHandler, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { ErrorHandlingService } from 'ngx-document-viewer/src/lib/shared/services/error.handling.service';
import { MessageService } from 'primeng/api';
import { PdfViewerService } from '@ngx-document-viewer';
import { Toast } from 'primeng/toast';
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          prefix: 'p',
          darkModeSelector: 'off',
          cssLayer: false,
        },
      },
    }),
    MessageService,
    PdfViewerService,
    {provide:ErrorHandler,useClass:ErrorHandlingService}
  ]
};

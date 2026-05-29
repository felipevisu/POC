import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Zoneless change detection (developer preview). No Zone.js — Angular
    // schedules CD off signal/template changes instead of monkey-patched async.
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient()
  ]
};

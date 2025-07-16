import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { APP_INITIALIZER, ErrorHandler, Injectable, NgZone } from '@angular/core';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { DatabaseService } from './app/shared/services';

export function initializeApp(databaseService: DatabaseService) {
  return () => databaseService.initDatabase();
}

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private zone: NgZone) {}
  handleError(error: any): void {
    // Print error to browser and terminal
    console.error('GLOBAL ERROR:', error);
    if (error && error.stack) {
      console.error('STACK TRACE:', error.stack);
    }
    // Optionally, show a user-friendly message or overlay
    // alert('Ocurrió un error grave. Ver consola para detalles.');
  }
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [DatabaseService],
      multi: true
    },
    { provide: ErrorHandler, useClass: GlobalErrorHandler }
  ],
});

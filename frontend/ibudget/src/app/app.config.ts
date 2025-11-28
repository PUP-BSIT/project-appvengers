import { routes } from './app.routes';
import { provideLoadingBarRouter } from '@ngx-loading-bar/router'
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideLoadingBarInterceptor } from '@ngx-loading-bar/http-client';
import { provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { authInterceptor } from '../services/auth.interceptor';
import { 
        ApplicationConfig, 
        provideBrowserGlobalErrorListeners, 
        provideZonelessChangeDetection,
    } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
      })
    ),
    provideCharts(withDefaultRegisterables()),
    provideHttpClient(
      withInterceptors([authInterceptor]),
      withInterceptorsFromDi()
    ),
    provideLoadingBarInterceptor(),
    provideLoadingBarRouter()
  ]
};

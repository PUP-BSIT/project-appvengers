import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from '../src/services/auth.interceptor';
import { environment } from './environments/environment';

// Initialize n8n chat widget with environment configuration
declare global {
  interface Window {
    n8nWebhookUrl: string;
  }
}

// Expose webhook URL to global scope for index.html script
window.n8nWebhookUrl = environment.n8nWebhookUrl;

bootstrapApplication(App, {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
}).catch((err) => console.error(err));
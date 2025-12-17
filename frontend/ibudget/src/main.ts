import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Console security warning with styling
console.log(
  '%cSTOP!',
  'color: red; font-size: 72px; font-weight: bold; text-shadow: 3px 3px 0 rgb(217,31,38), 6px 6px 0 rgb(226,91,14), 9px 9px 0 rgb(245,221,8);'
);
console.log(
  '%cThis is a browser feature intended for developers.',
  'font-size: 20px; font-weight: bold;'
);
console.log(
  '%cIf someone told you to copy-paste something here to enable an iBudget feature or "hack" an account, it is a scam and will give them access to your iBudget account.',
  'font-size: 18px;'
);

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
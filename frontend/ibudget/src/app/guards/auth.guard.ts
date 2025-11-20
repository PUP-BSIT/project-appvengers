import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '..//../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    // Redirect unauthenticated users to the landing page instead of the
    // login page so logout flows return to the public landing view.
    router.navigate(['/']);
    return false;
  }
  return true;
};
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';

/*
  Allows access if user is authenticated or if a email exists in the URL
*/
export const resendVerificationGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const hasEmail = !!route.queryParamMap.get('email');
  return (auth.isLoggedIn() || hasEmail) ? true : router
    .createUrlTree(['/auth-page']);
};

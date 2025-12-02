import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';

/*
  Allows access if user is authenticated or if a verification token 
  exists in the URL 
*/
export const emailVerificationGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const hasToken = !!route.queryParamMap.get('token');
  return (auth.isLoggedIn() || hasToken) ? true : router
    .createUrlTree(['/auth-page']);
};

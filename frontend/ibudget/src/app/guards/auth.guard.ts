import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // check if a token exists locally
  const token = authService.getToken();
  if (!token) {
    router.navigate(['/auth-page']);
    return false;
  }

  // validate the token with the backend using getProfile()
  return authService.getProfile().pipe(
    map(res => {
      if (res.success) {
        return true; // token is valid, allow navigation
      } else {
        authService.logout();
        router.navigate(['/auth-page']);
        return false;
      }
    }),
    catchError(() => {
      // backend unreachable or token invalid
      authService.logout();
      router.navigate(['/auth-page']);
      return of(false);
    })
  );
};

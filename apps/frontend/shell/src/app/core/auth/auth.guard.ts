import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AUTH_TOKEN_KEY } from './auth.config';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = sessionStorage.getItem(AUTH_TOKEN_KEY);

  if (token) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
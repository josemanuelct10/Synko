import { HttpInterceptorFn } from '@angular/common/http';

import { AUTH_TOKEN_KEY } from './auth.config';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = sessionStorage.getItem(AUTH_TOKEN_KEY);

  if (!token) {
    return next(req);
  }

  const authenticatedRequest = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(authenticatedRequest);
};
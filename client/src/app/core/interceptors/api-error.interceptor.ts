import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

interface ApiErrorBody {
  error?: { message?: string };
}

/** Normalizes backend error responses into a friendly Hebrew message on `error.message`. */
export const apiErrorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        const body = error.error as ApiErrorBody | undefined;
        const message = body?.error?.message ?? 'אירעה תקלה בתקשורת עם השרת. נסו שוב בעוד רגע.';
        return throwError(() => new Error(message));
      }
      return throwError(() => error);
    }),
  );
};

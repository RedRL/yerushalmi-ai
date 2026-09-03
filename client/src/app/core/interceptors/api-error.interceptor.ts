import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

interface ApiErrorBody {
  error?: {
    message?: string;
    details?: {
      fieldErrors?: Record<string, string[]>;
      formErrors?: string[];
    };
  };
}

function resolveApiErrorMessage(error: HttpErrorResponse): string {
  if (error.status === 0) {
    return 'לא הצלחנו להשלים את השליחה. בדקו את החיבור לאינטרנט ונסו שוב. אם התקלה חוזרת, אפשר לפנות אלינו דרך טופס יצירת הקשר שבהמשך העמוד.';
  }

  const body = error.error as ApiErrorBody | undefined;
  const fieldErrors = body?.error?.details?.fieldErrors;
  if (fieldErrors) {
    for (const messages of Object.values(fieldErrors)) {
      const first = messages.find((message) => message.trim().length > 0);
      if (first) return first;
    }
  }

  const formErrors = body?.error?.details?.formErrors;
  if (formErrors?.length) {
    return formErrors[0]!;
  }

  return body?.error?.message ?? 'אירעה תקלה בתקשורת עם השרת. נסו שוב בעוד רגע.';
}

/** Normalizes backend error responses into a friendly Hebrew message on `error.message`. */
export const apiErrorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        return throwError(() => new Error(resolveApiErrorMessage(error)));
      }
      return throwError(() => error);
    }),
  );
};

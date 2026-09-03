const NETWORK_ERROR_HE =
  'לא הצלחנו להשלים את שליחת הבקשה. בדקו את החיבור לאינטרנט ונסו שוב. אם התקלה חוזרת, אפשר לפנות אלינו דרך טופס יצירת הקשר שבהמשך העמוד.';

function looksLikeNetworkFailure(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes('failed to fetch') ||
    normalized.includes('networkerror') ||
    normalized.includes('network error') ||
    normalized.includes('load failed') ||
    normalized.includes('timeout') ||
    normalized.includes('err_internet') ||
    normalized.includes('err_connection')
  );
}

function containsHebrew(message: string): boolean {
  return /[\u0590-\u05FF]/.test(message);
}

/** Maps raw fetch/HTTP failures to a stable Hebrew message for customers. */
export function toHebrewUserError(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    if (looksLikeNetworkFailure(error.message)) {
      return NETWORK_ERROR_HE;
    }
    if (containsHebrew(error.message)) {
      return error.message;
    }
  }

  if (typeof error === 'string' && error.trim()) {
    if (looksLikeNetworkFailure(error)) {
      return NETWORK_ERROR_HE;
    }
    if (containsHebrew(error)) {
      return error;
    }
  }

  return fallback;
}

export { NETWORK_ERROR_HE };

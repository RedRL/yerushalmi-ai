/** Mirrors `server/src/pricing/coupon.config.ts`. The backend still recalculates the discount. */

export const COUPON_CODE = 'BACKSTAGE';
export const COUPON_DISCOUNT_RATE = 0.2;

export function normalizeCouponCode(value: string | null | undefined): string {
  return (value ?? '').trim().replace(/\s+/g, '').toUpperCase();
}

export function isKnownCouponCode(value: string | null | undefined): boolean {
  const normalized = normalizeCouponCode(value);
  return normalized.length > 0 && normalized === COUPON_CODE;
}

export type CouponEntryState = 'empty' | 'applied' | 'incomplete' | 'invalid';

export function couponEntryState(value: string | null | undefined): CouponEntryState {
  const normalized = normalizeCouponCode(value);
  if (!normalized) return 'empty';
  if (normalized === COUPON_CODE) return 'applied';
  if (COUPON_CODE.startsWith(normalized)) return 'incomplete';
  return 'invalid';
}

export function couponDiscountAmount(subtotal: number): number {
  return Math.round(subtotal * COUPON_DISCOUNT_RATE);
}

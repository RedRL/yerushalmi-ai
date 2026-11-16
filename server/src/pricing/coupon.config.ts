/** Public promo codes. The server is the source of truth for the discount. */

export const COUPONS = {
  BACKSTAGE: { discountRate: 0.2 },
  ALMOGUSHI: { discountRate: 0.3 },
} as const;

export type CouponCode = keyof typeof COUPONS;

export const COUPON_CODES = Object.keys(COUPONS) as CouponCode[];

/** Original public promo — prefer `resolveCoupon` for new code. */
export const COUPON_CODE: CouponCode = 'BACKSTAGE';
/** Rate for `COUPON_CODE` — prefer `resolveCoupon` for new code. */
export const COUPON_DISCOUNT_RATE = COUPONS.BACKSTAGE.discountRate;

export function normalizeCouponCode(value: string | null | undefined): string {
  return (value ?? '').trim().replace(/\s+/g, '').toUpperCase();
}

function isCouponCode(value: string): value is CouponCode {
  return Object.prototype.hasOwnProperty.call(COUPONS, value);
}

export function resolveCoupon(
  value: string | null | undefined,
): { code: CouponCode; discountRate: number } | null {
  const normalized = normalizeCouponCode(value);
  if (!normalized || !isCouponCode(normalized)) return null;
  return { code: normalized, discountRate: COUPONS[normalized].discountRate };
}

export function isKnownCouponCode(value: string | null | undefined): boolean {
  return resolveCoupon(value) !== null;
}

export type CouponEntryState = 'empty' | 'applied' | 'incomplete' | 'invalid';

export function couponEntryState(value: string | null | undefined): CouponEntryState {
  const normalized = normalizeCouponCode(value);
  if (!normalized) return 'empty';
  if (resolveCoupon(normalized)) return 'applied';
  if (COUPON_CODES.some((code) => code.startsWith(normalized))) return 'incomplete';
  return 'invalid';
}

export function couponDiscountAmount(subtotal: number, couponCode?: string | null): number {
  const coupon = resolveCoupon(couponCode);
  if (!coupon) return 0;
  return Math.round(subtotal * coupon.discountRate);
}

export function couponDiscountPercent(couponCode?: string | null): number {
  const coupon = resolveCoupon(couponCode);
  return coupon ? Math.round(coupon.discountRate * 100) : 0;
}

import { describe, expect, it } from 'vitest';
import {
  formatShortInquiryReference,
  generateInquiryReferenceId,
  isInquiryReferenceNumber,
} from './inquiry-reference.util';

describe('inquiry-reference.util', () => {
  it('generates an 8-digit numeric reference', () => {
    const referenceId = generateInquiryReferenceId();
    expect(isInquiryReferenceNumber(referenceId)).toBe(true);
    expect(referenceId).toMatch(/^\d{8}$/);
  });

  it('returns numeric references unchanged', () => {
    expect(formatShortInquiryReference('48123456')).toBe('48123456');
  });

  it('supports legacy UUID references for older submissions', () => {
    expect(formatShortInquiryReference('181d4a54-80b2-48df-afd7-3dec2c1018b3')).toBe('181d4a54');
  });

  it('does not truncate Hebrew folder ids into misleading prefixes', () => {
    expect(formatShortInquiryReference('הראל-ירושלמי-2026-08-21-04:07:32')).not.toBe('הראל-ירו');
  });
});

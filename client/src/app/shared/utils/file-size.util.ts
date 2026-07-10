/** Formats a byte count into a short Hebrew-friendly, human readable string (e.g. "2.4MB"). */
export function formatFileSize(bytes: number): string {
  if (bytes <= 0) return '0KB';

  const units = ['B', 'KB', 'MB', 'GB'];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, exponent);

  return `${exponent === 0 ? value : value.toFixed(1)}${units[exponent]}`;
}

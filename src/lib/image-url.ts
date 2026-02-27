const IMAGE_PROTOCOLS = new Set(["http:", "https:"]);

export function isValidImageUrl(value: string | null | undefined): value is string {
  if (!value) return false;

  try {
    const parsed = new URL(value.trim());
    return IMAGE_PROTOCOLS.has(parsed.protocol);
  } catch {
    return false;
  }
}

export function pickFirstValidImageUrl(urls: Array<string | null | undefined>): string | null {
  return urls.find((url) => isValidImageUrl(url)) ?? null;
}

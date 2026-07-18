/**
 * Adzuna doesn't return a logo. We guess a domain from the company name and
 * hit Clearbit's keyless logo API. This guess is frequently wrong (real domain
 * lookup would need a paid API), so the frontend MUST fall back to the
 * ui-avatars initials URL on <img onError>, not trust this as authoritative.
 */
export function getPrimaryLogoUrl(companyName: string): string {
  const domainGuess = companyName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .trim();
  return `https://logo.clearbit.com/${domainGuess}.com`;
}

export function getFallbackLogoUrl(companyName: string): string {
  const initials = encodeURIComponent(companyName.trim());
  return `https://ui-avatars.com/api/?name=${initials}&background=4F46E5&color=fff&bold=true`;
}

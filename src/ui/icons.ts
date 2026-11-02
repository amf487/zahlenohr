/** Inline SVG icons (24×24, stroke style unless noted). */
export const svg = (inner: string, className = ''): string =>
  `<svg class="i ${className}" viewBox="0 0 24 24" aria-hidden="true">${inner}</svg>`;

export const ICONS = {
  settings:
    '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
  back: '<path d="M15 18l-6-6 6-6"/>',
  slow: '<path d="M4 12h10"/><path d="M10 7l5 5-5 5"/><path d="M19 6v12"/>',
  speaker:
    '<path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/>',
  speakerSmall: '<path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/>',
  stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>',
} as const;

/** Filled play triangle (16×16). */
export const PLAY = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 1.5v13l11-6.5z"/></svg>';

/** Filled star for the result screen. */
export const STAR =
  '<svg viewBox="0 0 24 24"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z"/></svg>';

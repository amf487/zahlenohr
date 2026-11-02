/** Minimal DOM helpers; the UI is plain TypeScript without a framework. */

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** Escapes text for use inside HTML templates. */
export const esc = (value: unknown): string => String(value).replace(/[&<>"']/g, (c) => ESCAPES[c]!);

/** Creates one element from an HTML string. */
export function el<T extends HTMLElement = HTMLElement>(markup: string): T {
  const t = document.createElement('template');
  t.innerHTML = markup.trim();
  return t.content.firstElementChild as T;
}

/** Finds an element inside `root` and fails loudly when the markup and code disagree. */
export function q<T extends Element = HTMLElement>(root: ParentNode, selector: string): T {
  const found = root.querySelector<T>(selector);
  if (!found) throw new Error(`Element not found: ${selector}`);
  return found;
}

export const qa = <T extends Element = HTMLElement>(root: ParentNode, selector: string): T[] => [
  ...root.querySelectorAll<T>(selector),
];

/** German text followed by the Chinese translation (hidden when Chinese hints are off). */
export const bi = (de: string, zh: string): string => `${esc(de)} <span class="zh">${esc(zh)}</span>`;

export const prefersReducedMotion = (): boolean =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

import { el, q } from '../dom';

/** A dialog that closes with its button, Escape, or a click on the backdrop. */
export class Modal {
  readonly root: HTMLElement;
  private returnFocus: HTMLElement | null = null;

  constructor(title: string, body: string, closeLabel: string) {
    this.root = el(`
      <div class="modal" hidden role="dialog" aria-modal="true">
        <div class="card modal__card">
          <h2>${title}</h2>
          ${body}
          <button class="btn btn--primary" type="button" data-ref="close">${closeLabel}</button>
        </div>
      </div>`);
    q(this.root, '[data-ref="close"]').addEventListener('click', () => this.close());
    this.root.addEventListener('click', (e) => {
      if (e.target === this.root) this.close();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) this.close();
    });
  }

  get isOpen(): boolean {
    return !this.root.hidden;
  }

  open(): void {
    this.returnFocus = document.activeElement as HTMLElement | null;
    this.root.hidden = false;
    q(this.root, '[data-ref="close"]').focus();
  }

  close(): void {
    this.root.hidden = true;
    this.returnFocus?.focus();
  }
}

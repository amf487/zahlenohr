/**
 * Turns a button into a two-step confirmation: the first tap arms it ("Wirklich …?"),
 * a second tap within a few seconds runs the action.
 */
export function confirmButton(
  button: HTMLButtonElement,
  labels: { idle: string; armed: string; done?: string },
  action: () => void,
  timeout = 3500,
): { reset(): void } {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const reset = () => {
    clearTimeout(timer);
    button.classList.remove('is-armed');
    button.textContent = labels.idle;
  };
  button.addEventListener('click', () => {
    if (!button.classList.contains('is-armed')) {
      button.classList.add('is-armed');
      button.textContent = labels.armed;
      timer = setTimeout(reset, timeout);
      return;
    }
    reset();
    if (labels.done) button.textContent = labels.done;
    action();
  });
  return { reset };
}

import { expect, test, type Page } from '@playwright/test';

interface Hook {
  current(): { question: { answer: string }; input: 'choice' | 'typed'; answered: boolean } | null;
}

// Speech is stubbed: every sentence "finishes" after 50 ms, so the clock starts right away.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const synth = window.speechSynthesis;
    let speaking = false;
    Object.defineProperty(synth, 'speaking', { get: () => speaking });
    synth.speak = (u: SpeechSynthesisUtterance) => {
      speaking = true;
      setTimeout(() => {
        speaking = false;
        u.onend?.(new Event('end') as SpeechSynthesisEvent);
      }, 50);
    };
    synth.cancel = () => {
      speaking = false;
    };
  });
  await page.goto('/');
});

const current = (page: Page) =>
  page.evaluate(() => {
    const c = (window as unknown as { __zahlenohr: Hook }).__zahlenohr.current();
    return c && { answer: c.question.answer, input: c.input };
  });

async function answerCorrectly(page: Page) {
  const c = (await current(page))!;
  if (c.input === 'typed') {
    await page.fill('[data-ref="input"]', c.answer);
    await page.click('[data-ref="check"]');
  } else {
    await page.locator(`.option[data-value="${c.answer}"]`).click();
  }
}

async function fitsWithoutScrolling(page: Page) {
  const size = await page.evaluate(() => ({
    h: document.documentElement.scrollHeight,
    w: document.documentElement.scrollWidth,
  }));
  expect(size.h).toBeLessThanOrEqual(760);
  expect(size.w).toBeLessThanOrEqual(1440);
}

test('plays a full round and saves the high score', async ({ page }) => {
  await page.click('[data-mode="mix"]');
  await page.click('[data-difficulty="hard"]');
  await fitsWithoutScrolling(page);
  await page.click('[data-ref="start"]');

  for (let i = 0; i < 10; i++) {
    await expect(page.locator('.timer')).not.toHaveClass(/is-waiting/);
    await answerCorrectly(page);
    await expect(page.locator('[data-ref="verdict"]')).toContainText('Richtig');
    await expect(page.locator('.tile--miss')).toHaveCount(0);
    await fitsWithoutScrolling(page);
    await page.click('[data-ref="next"]');
  }

  await expect(page.locator('.screen--result')).toBeVisible();
  await expect(page.locator('[data-ref="record"]')).toContainText('Neuer Rekord');
  await expect(page.locator('.answers > li.is-ok')).toHaveCount(10);
  await fitsWithoutScrolling(page);
  await page.click('[data-ref="toStart"]');
  await expect(page.locator('.highscores li.is-fresh')).toHaveCount(1);
});

test('wrong answers show the explanation and red tiles', async ({ page }) => {
  await page.click('[data-mode="number"]');
  await page.click('[data-difficulty="medium"]');
  await page.click('[data-ref="start"]');
  await expect(page.locator('.timer')).not.toHaveClass(/is-waiting/);
  const c = (await current(page))!;
  await page.locator(`.option:not([data-value="${c.answer}"])`).first().click();
  await expect(page.locator('[data-ref="verdict"]')).toContainText('Falsch');
  await expect(page.locator('[data-ref="hints"] li').first()).toBeVisible();
  await expect(page.locator('.option.is-correct')).toHaveAttribute('data-value', c.answer);
});

test('replaying keeps the cursor in the answer field', async ({ page }) => {
  await page.click('[data-mode="phone"]');
  await page.click('[data-difficulty="hard"]');
  await page.click('[data-ref="start"]');
  for (let i = 0; i < 10; i++) {
    await expect(page.locator('.timer')).not.toHaveClass(/is-waiting/);
    const c = (await current(page))!;
    if (c.input === 'typed') {
      await page.fill('[data-ref="input"]', '0123');
      await page.click('[data-ref="play"]');
      await page.keyboard.type('45');
      await expect(page.locator('[data-ref="input"]')).toHaveValue('012345');
      return;
    }
    await answerCorrectly(page);
    await page.click('[data-ref="next"]');
  }
  throw new Error('no typed question in 10 tries');
});

test('settings: Switzerland, preview button and sentence overview', async ({ page }) => {
  await page.click('[data-ref="settings"]');
  await page.click('[data-region="CH"]');
  await expect(page.locator('[data-region="CH"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.stock tbody tr')).toHaveCount(5);
  await page.click('[data-ref="preview"]');
  await expect(page.locator('[data-ref="preview"]')).toContainText(/Stopp|Probe hören/);
  await fitsWithoutScrolling(page);
  await page.click('[data-ref="back"]');
  await page.click('[data-mode="price"]');
  await page.click('[data-ref="start"]');
  await expect(page.locator('.timer')).not.toHaveClass(/is-waiting/);
  expect((await current(page))!.answer).toMatch(/^CHF /);
});

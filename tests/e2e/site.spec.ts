import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const isMobile = (page: Page) => (page.viewportSize()?.width ?? 1440) < 760;

/** Stand-in for Cloudflare Turnstile: renders nothing and hands out a token at once. */
async function stubTurnstile(page: Page) {
  await page.route('https://challenges.cloudflare.com/**', (route) =>
    route.fulfill({
      contentType: 'text/javascript',
      body: `(() => {
        let cb = null;
        window.turnstile = {
          render: (el, o) => { cb = o.callback; setTimeout(() => cb('e2e-token'), 10); return 'w1'; },
          reset: () => setTimeout(() => cb && cb('e2e-token-2'), 10),
          remove: () => {},
        };
      })();`,
    }),
  );
}

test.describe('page', () => {
  test('landmarks, one h1, and no serious axe violations', async ({ page }) => {
    await page.goto('/?intro=0');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveText('Archit Khandelwal');
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('footer')).toHaveCount(1);
    // Scan settled paint: mid-thump stamps sit at partial opacity.
    await page.waitForFunction(() =>
      document.getAnimations().every((a) => a.playState !== 'running'),
    );
    const results = await new AxeBuilder({ page })
      .exclude('[data-reveal]:not([data-revealed])')
      .analyze();
    const serious = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    );
    expect(
      serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`),
    ).toEqual([]);
  });

  test('no horizontal scroll', async ({ page }) => {
    await page.goto('/?intro=0');
    await page.waitForTimeout(1200);
    const [sw, cw] = await page.evaluate(() => [
      document.documentElement.scrollWidth,
      document.documentElement.clientWidth,
    ]);
    expect(sw).toBeLessThanOrEqual(cw);
  });
});

test.describe('navigation', () => {
  test('inline links on desktop, Case Index menu on mobile', async ({ page }) => {
    await page.goto('/?intro=0');
    if (!isMobile(page)) {
      await expect(
        page.getByRole('navigation', { name: 'Sections' }).getByRole('link'),
      ).toHaveCount(6);
      return;
    }
    const button = page.getByRole('button', { name: 'Case Index' });
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await button.click();
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    const menu = page.getByRole('navigation', { name: 'Case index' });
    await expect(menu.getByRole('link')).toHaveCount(6);
    await expect(menu.getByRole('link').first()).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(button).toBeFocused();
  });

  test('a #section link lands on that section', async ({ page }) => {
    await page.goto('/?intro=0#commendations');
    await expect(page.locator('#commendations h2')).toBeInViewport();
  });

  test('choosing a menu link scrolls to the section and marks it current', async ({ page }) => {
    await page.goto('/?intro=0');
    if (isMobile(page)) {
      await page.getByRole('button', { name: 'Case Index' }).click();
      await page
        .getByRole('navigation', { name: 'Case index' })
        .getByRole('link', { name: /Case History/ })
        .click();
    } else {
      await page
        .getByRole('navigation', { name: 'Sections' })
        .getByRole('link', { name: 'Case History' })
        .click();
    }
    await expect(page.locator('#history')).toBeInViewport();
    await expect(
      page.locator('a[aria-current="location"][href="#history"]').first(),
    ).toBeAttached();
  });
});

test.describe('case folder', () => {
  test('opens as a modal, traps focus, closes on Esc and returns focus', async ({ page }) => {
    await page.goto('/?intro=0');
    const card = page.getByRole('button', { name: 'Open case file MedScript' });
    await card.click();
    const dialog = page.getByRole('dialog', { name: 'CASE 003 MedScript' });
    await expect(dialog).toBeVisible();
    await expect(page).toHaveURL(/#case-003$/);
    await expect(dialog.getByRole('button', { name: 'Close file ✕' })).toBeFocused();
    for (let i = 0; i < 20; i++) await page.keyboard.press('Tab');
    expect(await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'))).toBe(
      true,
    );
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(card).toBeFocused();
    await expect(page).not.toHaveURL(/#case-/);
  });

  test('prev / next follow board order and Back closes', async ({ page }) => {
    await page.goto('/?intro=0');
    await page.getByRole('button', { name: 'Open case file ShelfSense' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('button', { name: /Previous case/ })).toHaveCount(0);
    await dialog.getByRole('button', { name: /Next case/ }).click();
    await expect(page.getByRole('dialog', { name: 'CASE 003 MedScript' })).toBeVisible();
    await expect(page).toHaveURL(/#case-003$/);
    await page.goBack();
    await expect(page.getByRole('dialog')).toBeHidden();
    await expect(page.getByRole('button', { name: 'Open case file MedScript' })).toBeFocused();
  });

  test('a #case link opens that folder', async ({ page }) => {
    await page.goto('/?intro=0#case-001');
    await expect(page.getByRole('dialog', { name: 'CASE 001 Sentinel' })).toBeVisible();
  });
});

test('desk cards examine on tap / click', async ({ page }) => {
  await page.goto('/?intro=0');
  const card = page.locator('#desk button').filter({ hasText: 'The Typewriter' });
  await card.scrollIntoViewIfNeeded();
  if (isMobile(page)) await card.tap();
  else await card.click();
  await expect(card).toHaveAttribute('aria-expanded', 'true');
  if (isMobile(page)) {
    await card.tap();
    await expect(card).toHaveAttribute('aria-expanded', 'false');
  }
});

test('lights off persists across reloads', async ({ page }) => {
  await page.goto('/?intro=0');
  const toggle = page.getByRole('button', { name: /Lights (off|on)/ });
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await expect(page.getByRole('button', { name: /Lights (off|on)/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

test.describe('intro', () => {
  test('any key skips the intro', async ({ page }) => {
    await page.goto('/');
    const file = page.getByRole('button', { name: 'Open the case file' });
    await expect(file).toBeVisible();
    await page.keyboard.press('Space');
    await expect(file).toBeHidden();
    await expect(page.getByRole('link', { name: 'Examine the evidence →' })).toBeVisible();
  });

  test('clicking the file turns the lights on and opens the hero', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Open the case file' }).click({ force: true });
    await expect(page.getByRole('button', { name: 'Open the case file' })).toBeHidden({
      timeout: 5000,
    });
    await expect(page.locator('h1')).toBeInViewport();
  });

  test('?intro=1 or garbage still shows the intro', async ({ page }) => {
    await page.goto('/?intro=false');
    await expect(page.getByRole('button', { name: 'Skip the intro →' })).toBeVisible();
  });
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('everything is visible without scrolling and the string is drawn', async ({ page }) => {
    await page.goto('/?intro=0');
    const hidden = await page.evaluate(
      () =>
        [...document.querySelectorAll('[data-reveal]')].filter(
          (el) => getComputedStyle(el).opacity === '0',
        ).length,
    );
    expect(hidden).toBe(0);
    if (!isMobile(page)) {
      await expect(page.locator('#evidence svg path').last()).toHaveCSS('stroke-dashoffset', '0px');
    }
  });

  test('clicking the file ends the intro at once', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Open the case file' }).click();
    await expect(page.getByRole('button', { name: 'Open the case file' })).toBeHidden({
      timeout: 500,
    });
  });
});

test.describe('contact', () => {
  async function fill(page: Page) {
    await page.goto('/?intro=0#contact');
    await page.getByLabel('Your name').fill('Sam Spade');
    await page.getByLabel('Where he can reach you').fill('sam@example.com');
    await page.getByLabel('Spill it.').fill('I have a case for you.');
  }

  test('a tip slides under the door', async ({ page }) => {
    await stubTurnstile(page);
    let sent: unknown;
    await page.route('**/api/contact', async (route) => {
      sent = route.request().postDataJSON();
      await route.fulfill({ status: 202, json: { ok: true } });
    });
    await fill(page);
    await page.getByRole('button', { name: 'Slide it under the door' }).click();
    await expect(page.getByText("Message received. The lamp's on. He'll be in touch.")).toBeVisible(
      { timeout: 8000 },
    );
    expect(sent).toMatchObject({ name: 'Sam Spade', turnstileToken: 'e2e-token', website: '' });
  });

  test('rate limit and failures keep the form and show the noir error', async ({ page }) => {
    await stubTurnstile(page);
    await page.route('**/api/contact', (route) =>
      route.fulfill({ status: 429, json: { ok: false, code: 'rate' } }),
    );
    await fill(page);
    await page.getByRole('button', { name: 'Slide it under the door' }).click();
    await expect(page.getByRole('alert')).toHaveText(
      'Too many tips from this line. Try again in an hour.',
      {
        timeout: 8000,
      },
    );
    await expect(page.getByLabel('Your name')).toHaveValue('Sam Spade');

    await page.unroute('**/api/contact');
    await page.route('**/api/contact', (route) =>
      route.fulfill({ status: 502, json: { ok: false } }),
    );
    await page.getByRole('button', { name: 'Slide it under the door' }).click();
    await expect(page.getByRole('alert')).toContainText("The line's dead.");
    await expect(page.getByRole('alert').getByRole('link')).toHaveAttribute('href', /^mailto:/);
  });
});

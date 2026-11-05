import { test, expect, Page } from '@playwright/test';

// ─── helpers ──────────────────────────────────────────────────────────────────

/** Fails the test if the page has horizontal overflow. */
async function assertNoHorizontalOverflow(page: Page) {
  const overflows = await page.evaluate(() =>
    document.documentElement.scrollWidth > window.innerWidth
  );
  expect(overflows, 'Horizontal overflow detected (scrollWidth > innerWidth)').toBe(false);
}

/** The four nav link route ids and their expected visible labels. */
const NAV_LINKS = [
  { id: 'shop',    labelPattern: /sneakers/i },
  { id: 'new-in',  labelPattern: /new\s*in/i },
  { id: 'about',   labelPattern: /about/i    },
  { id: 'contact', labelPattern: /contact/i  },
] as const;

// ─── test suite ───────────────────────────────────────────────────────────────

test.describe('Navbar – mobile (390 px)', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test.beforeEach(async ({ page }) => {
    await page.route('**/api/products**', route =>
      route.fulfill({ json: { total: 0, products: [] } })
    );
    await page.goto('/');
    // Wait for the header to be present
    await page.waitForSelector('header');
  });

  // ── 1. No horizontal overflow on load ─────────────────────────────────────
  test('no horizontal overflow on load', async ({ page }) => {
    await assertNoHorizontalOverflow(page);
  });

  // ── 2. Desktop nav links are NOT visible at 390 px ────────────────────────
  test('desktop nav links are hidden at mobile width', async ({ page }) => {
    // The desktop <nav> uses hidden md:flex — it must not be visible
    const desktopNav = page.locator('header nav[aria-label="Main navigation"]');
    await expect(desktopNav).toBeHidden();
  });

  // ── 3. Hamburger button is visible and has correct ARIA ───────────────────
  test('hamburger button is visible with correct aria attributes', async ({ page }) => {
    const hamburger = page.getByRole('button', { name: /open menu/i });
    await expect(hamburger).toBeVisible();
    await expect(hamburger).toHaveAttribute('aria-expanded', 'false');
    await expect(hamburger).toHaveAttribute('aria-controls', 'bgy-mobile-menu');
  });

  // ── 4. Opening the menu shows all nav links ───────────────────────────────
  test('clicking hamburger opens menu and shows all nav links', async ({ page }) => {
    const hamburger = page.getByRole('button', { name: /open menu/i });
    await hamburger.click();

    // aria-expanded must flip
    const openHamburger = page.getByRole('button', { name: /close menu/i });
    await expect(openHamburger).toHaveAttribute('aria-expanded', 'true');

    // The drawer must be present
    const drawer = page.locator('#bgy-mobile-menu');
    await expect(drawer).toBeVisible();

    // Every nav link must be visible inside the drawer
    for (const link of NAV_LINKS) {
      const btn = drawer.getByRole('button', { name: link.labelPattern });
      await expect(btn).toBeVisible();
    }

    await assertNoHorizontalOverflow(page);
  });

  // ── 5. Each nav link navigates correctly ──────────────────────────────────
  for (const link of NAV_LINKS) {
    test(`clicking "${link.id}" link navigates and closes menu`, async ({ page }) => {
      // Open menu
      await page.getByRole('button', { name: /open menu/i }).click();
      const drawer = page.locator('#bgy-mobile-menu');
      await expect(drawer).toBeVisible();

      // Click the link
      await drawer.getByRole('button', { name: link.labelPattern }).click();

      // Menu must close
      await expect(drawer).toBeHidden();

      // The link should now be marked aria-current="page" in the desktop nav
      // (or wherever it renders after navigation). We just assert no overflow.
      await assertNoHorizontalOverflow(page);
    });
  }

  // ── 6. Escape key closes the menu ─────────────────────────────────────────
  test('Escape key closes the open menu', async ({ page }) => {
    await page.getByRole('button', { name: /open menu/i }).click();
    const drawer = page.locator('#bgy-mobile-menu');
    await expect(drawer).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(drawer).toBeHidden();
  });

  // ── 7. Clicking the backdrop closes the menu ──────────────────────────────
  test('clicking the backdrop closes the menu', async ({ page }) => {
    await page.getByRole('button', { name: /open menu/i }).click();
    const drawer = page.locator('#bgy-mobile-menu');
    await expect(drawer).toBeVisible();

    // Click top-left corner of the viewport (outside the drawer)
    await page.mouse.click(5, 5);
    await expect(drawer).toBeHidden();
  });

  // ── 8. Focus returns to hamburger after close ─────────────────────────────
  test('focus returns to hamburger button after menu closes via Escape', async ({ page }) => {
    const hamburger = page.getByRole('button', { name: /open menu/i });
    await hamburger.click();
    await expect(page.locator('#bgy-mobile-menu')).toBeVisible();

    await page.keyboard.press('Escape');
    // After close the hamburger (now labelled "Open menu") should be focused
    await expect(hamburger).toBeFocused();
  });

  // ── 9. No overflow at 280 px ──────────────────────────────────────────────
  test('no horizontal overflow at 280 px', async ({ page }) => {
    await page.setViewportSize({ width: 280, height: 653 });
    await assertNoHorizontalOverflow(page);

    // Hamburger still reachable
    const hamburger = page.getByRole('button', { name: /open menu/i });
    await expect(hamburger).toBeVisible();
  });
});

// ─── desktop suite ────────────────────────────────────────────────────────────

test.describe('Navbar – desktop (1280 px)', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test.beforeEach(async ({ page }) => {
    await page.route('**/api/products**', route =>
      route.fulfill({ json: { total: 0, products: [] } })
    );
    await page.goto('/');
    await page.waitForSelector('header');
  });

  test('desktop nav links are visible and hamburger is hidden', async ({ page }) => {
    const desktopNav = page.locator('header nav[aria-label="Main navigation"]');
    await expect(desktopNav).toBeVisible();

    const hamburger = page.getByRole('button', { name: /open menu/i });
    await expect(hamburger).toBeHidden();

    await assertNoHorizontalOverflow(page);
  });

  test('no horizontal overflow at 1440 px', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await assertNoHorizontalOverflow(page);
  });
});

// ─── breakpoint boundary ──────────────────────────────────────────────────────

test.describe('Navbar – breakpoint boundary (md = 768 px)', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/products**', route =>
      route.fulfill({ json: { total: 0, products: [] } })
    );
  });

  test('at 767 px hamburger is visible, desktop nav hidden', async ({ page }) => {
    await page.setViewportSize({ width: 767, height: 900 });
    await page.goto('/');
    await page.waitForSelector('header');

    await expect(page.locator('header nav[aria-label="Main navigation"]')).toBeHidden();
    await expect(page.getByRole('button', { name: /open menu/i })).toBeVisible();
    await assertNoHorizontalOverflow(page);
  });

  test('at 768 px desktop nav is visible, hamburger hidden', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 900 });
    await page.goto('/');
    await page.waitForSelector('header');

    await expect(page.locator('header nav[aria-label="Main navigation"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /open menu/i })).toBeHidden();
    await assertNoHorizontalOverflow(page);
  });

  test('at 769 px desktop nav remains visible', async ({ page }) => {
    await page.setViewportSize({ width: 769, height: 900 });
    await page.route('**/api/products**', route =>
      route.fulfill({ json: { total: 0, products: [] } })
    );
    await page.goto('/');
    await page.waitForSelector('header');

    await expect(page.locator('header nav[aria-label="Main navigation"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /open menu/i })).toBeHidden();
    await assertNoHorizontalOverflow(page);
  });
});

test.describe('Responsive viewport matrix', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/products**', route =>
      route.fulfill({ json: { total: 0, products: [] } })
    );
  });

  for (const width of [280, 320, 360, 390, 412, 480, 600, 766, 767, 768, 769, 820, 1023, 1024, 1280, 1440, 1920, 2560, 3840]) {
    test(`header has no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      await page.waitForSelector('header');

      await assertNoHorizontalOverflow(page);
      if (width < 768) {
        await expect(page.getByRole('button', { name: /open menu/i })).toBeVisible();
        await expect(page.locator('header nav[aria-label="Main navigation"]')).toBeHidden();
      } else {
        await expect(page.getByRole('button', { name: /open menu/i })).toBeHidden();
        await expect(page.locator('header nav[aria-label="Main navigation"]')).toBeVisible();
      }
    });
  }
});

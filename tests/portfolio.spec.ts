import { expect, test } from "@playwright/test";

test("desktop signatures, cinematic navigation, and real project routes", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName("Interfaces. Built to feel right.");
  await expect(page.locator("html")).toHaveAttribute("data-motion", "enabled");
  await page.waitForTimeout(1400);
  await page.screenshot({ path: "test-results/desktop-home.png" });
  const type = page.locator(".type-letter").first();
  const typeBox = await type.boundingBox();
  await page.mouse.move(typeBox!.x + typeBox!.width * 0.75, typeBox!.y + typeBox!.height * 0.6);
  await expect.poll(() => type.evaluate((element) => getComputedStyle(element).transform)).not.toBe("none");

  const stage = page.locator(".project-stage");
  await expect(stage).toHaveAttribute("data-pinned", "true");
  await stage.evaluate((element) => window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY + 300));
  const media = page.locator("#project-gather .project-media-link");
  await expect(media.locator("canvas")).toBeVisible();
  await expect(media.locator(".shader-layer")).toHaveCSS("opacity", "1");
  const box = await media.boundingBox();
  await page.mouse.move(box!.x + box!.width * 0.45, box!.y + box!.height * 0.4, { steps: 10 });
  await expect(page.locator(".cursor-label")).toHaveText("VIEW PROJECT ↗");
  await page.waitForTimeout(700);
  await page.screenshot({ path: "test-results/desktop-gather.png" });
  await expect.poll(() => media.locator(".image-surface").evaluate((element) => getComputedStyle(element).transform)).not.toBe("none");

  await page.getByRole("navigation", { name: "Choose a featured project" }).getByRole("link", { name: "02 FreshCart" }).click();
  await expect(stage).toHaveAttribute("data-active", "1");
  await expect(page.locator("#project-freshcart .image-surface")).toHaveAttribute("data-webgl-ready", "true");
  await expect(page.locator("#project-freshcart .shader-layer")).toHaveCSS("opacity", "1");
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "test-results/desktop-freshcart.png" });
  await page.locator("#project-freshcart .project-cta").click();
  await expect(page).toHaveURL(/\/projects\/freshcart$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("FreshCart.");
  await expect(page.getByRole("link", { name: "Visit live site" })).toHaveAttribute("href", "https://fresh-cart-rho-lovat.vercel.app/cart");
  await page.waitForTimeout(900);
  await page.screenshot({ path: "test-results/desktop-detail.png", fullPage: true });
  expect(errors).toEqual([]);
});

test("gallery supports buttons, keyboard, and mouse drag", async ({ page }) => {
  await page.goto("/projects/gather");
  const gallery = page.locator(".gallery-track");
  await gallery.scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "Next screenshot" }).click();
  await expect(page.locator(".gallery-controls p")).toHaveText("02 / 03");
  await gallery.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(".gallery-controls p")).toHaveText("03 / 03");
  await expect(page.getByRole("button", { name: "Next screenshot" })).toBeDisabled();
  const bounds = await gallery.boundingBox();
  await page.mouse.move(bounds!.x + 80, bounds!.y + 160);
  await page.mouse.down();
  await page.mouse.move(bounds!.x + bounds!.width * 0.85, bounds!.y + 160, { steps: 12 });
  await page.mouse.up();
  await expect(page.locator(".gallery-controls p")).toHaveText("02 / 03");
});

for (const width of [320, 390, 768]) {
  test(`responsive layout at ${width}px has a complete static experience`, async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width, height: 844 },
      isMobile: width < 768,
      hasTouch: true,
      reducedMotion: "no-preference",
    });
    const page = await context.newPage();
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/");
    await expect(page.locator(".custom-cursor")).toHaveCount(0);
    await expect(page.locator(".shader-layer canvas")).toHaveCount(0);
    await expect(page.locator(".project-stage")).not.toHaveAttribute("data-pinned", "true");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(await page.locator(".terminal-flow").evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
    await page.screenshot({ path: `test-results/mobile-${width}.png`, fullPage: true });
    await page.screenshot({ path: `test-results/mobile-hero-${width}.png` });
    await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Contact" }).click();
    await expect(page).toHaveURL(/#contact$/);
    await expect(page.getByRole("link", { name: "ma0083602@gmail.com" })).toBeInViewport();
    for (const slug of ["gather", "freshcart"]) {
      await page.goto(`/projects/${slug}`);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await expect(page.locator("canvas")).toHaveCount(0);
    }
    expect(errors).toEqual([]);
    await context.close();
  });
}

test("reduced motion can be switched on without losing content", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".project-stage")).toHaveAttribute("data-pinned", "true");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".custom-cursor")).toHaveCount(0);
  await expect(page.locator(".project-stage")).not.toHaveAttribute("data-pinned", "true");
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  await expect(page.locator(".shader-layer canvas")).toHaveCount(0);
  await expect(page.locator("#project-freshcart")).toBeVisible();
  await expect(page.locator("html")).not.toHaveAttribute("data-motion", "enabled");
});

test("keyboard entry, CV download, and unknown routes work", async ({ page, request }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
  const cv = await request.get("/Muhammad_Ashraf_CV_Final.docx");
  expect(cv.ok()).toBe(true);
  expect((await cv.body()).length).toBeGreaterThan(1000);
  const response = await page.goto("/projects/unknown");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Nothing here.");
});

test("WebGL context loss reconstructs the static image fallback", async ({ page }) => {
  await page.goto("/projects/gather");
  const cover = page.locator(".detail-cover");
  await cover.scrollIntoViewIfNeeded();
  await expect(cover.locator("canvas")).toBeVisible();
  await expect(cover.locator(".shader-layer")).toHaveCSS("opacity", "1");
  await cover.locator("canvas").evaluate((canvas) => canvas.dispatchEvent(new Event("webglcontextlost", { cancelable: true })));
  await expect(cover.locator("canvas")).toHaveCount(0);
  await expect(cover.getByRole("img")).toBeVisible();
  expect(await cover.getByRole("img").evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
});

test("JavaScript-disabled visitors can read and navigate the portfolio", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("#project-gather")).toBeVisible();
  await expect(page.locator("#project-freshcart")).toBeVisible();
  await page.locator("#project-gather .project-cta").click();
  await expect(page).toHaveURL(/\/projects\/gather$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Gather.");
  await context.close();
});

test("laptop showcase fits the viewport and works from the keyboard", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-motion", "enabled");
  await expect(page.locator(".project-stage")).toHaveAttribute("data-pinned", "true");
  const freshcart = page.getByRole("navigation", { name: "Choose a featured project" })
    .getByRole("link", { name: "02 FreshCart" });
  await freshcart.focus();
  await expect(freshcart).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#project-freshcart")).toBeFocused();
  await expect(page.locator("#project-freshcart .project-media-link")).toBeInViewport({ ratio: 1 });
  const caption = await page.locator("#project-freshcart .project-image-caption").boundingBox();
  const controls = await page.locator(".project-nav").boundingBox();
  expect(caption!.y + caption!.height).toBeLessThan(controls!.y);
  await page.screenshot({ path: "test-results/laptop-showcase.png" });
  await page.keyboard.press("Tab");
  await expect(page.locator("#project-freshcart .project-cta")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/projects\/freshcart$/);
});

test("an unavailable WebGL renderer keeps the real image usable", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
      value: function (this: HTMLCanvasElement, id: string, options?: unknown) {
        if (id === "webgl" || id === "webgl2" || id === "experimental-webgl") return null;
        return Reflect.apply(original, this, [id, options]);
      },
    });
  });
  await page.goto("/projects/gather");
  const cover = page.locator(".detail-cover");
  await cover.scrollIntoViewIfNeeded();
  await expect(cover.getByRole("img")).toBeVisible();
  await expect(cover.locator("canvas")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Visit live site" })).toBeVisible();
});

test("desktop section links reveal their content and return to the work", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-motion", "enabled");
  await page.waitForTimeout(1200);
  const nav = page.getByRole("navigation", { name: "Main navigation" });
  await nav.getByRole("link", { name: "About" }).click();
  await expect(page.locator("#about")).toBeFocused();
  await expect(page.locator("#about-heading")).toHaveCSS("opacity", "1");
  await page.screenshot({ path: "test-results/desktop-about.png" });
  await page.locator(".site-footer a").click();
  await expect(page.locator("#top")).toBeFocused();
  await nav.getByRole("link", { name: "Contact" }).click();
  await expect(page.locator("#contact")).toBeFocused();
  await expect(page.locator("#contact-heading")).toHaveCSS("opacity", "1");
  await page.screenshot({ path: "test-results/desktop-contact.png" });
  await page.locator(".site-footer a").click();
  await nav.getByRole("link", { name: "Work" }).click();
  await expect(page.locator("#work")).toBeFocused();
  expect(errors).toEqual([]);
});

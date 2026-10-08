import { expect, test } from "@playwright/test";
import sharp from "sharp";

const positionAt = async (page: import("@playwright/test").Page, selector: string, offset = 0) => {
  await page.locator(selector).evaluate((element, shift) => window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY + shift), offset);
  await page.waitForTimeout(1100);
};

test("recurring avatar types, looks, blinks, points, paints, waves, and pauses offscreen", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.locator(".hero [data-avatar]")).toHaveAttribute("data-state", "looking");
  await positionAt(page, "#coding", 180);
  const avatar = page.locator("#coding [data-avatar]");
  await expect(avatar).toHaveAttribute("data-state", "typing");
  await expect(avatar.locator("[data-part=laptop]")).toHaveCSS("opacity", "1");
  const arm = avatar.locator("[data-part=left-arm]");
  const initial = await arm.getAttribute("transform");
  await page.waitForTimeout(210);
  expect(await arm.getAttribute("transform")).not.toBe(initial);
  await page.screenshot({ path: "test-results/avatar-typing.png" });
  const pupils = avatar.locator("[data-part=pupils]");
  await page.mouse.move(10, 350);
  await page.waitForTimeout(450);
  const lookingLeft = await pupils.getAttribute("transform");
  await page.mouse.move(1400, 350);
  await page.waitForTimeout(450);
  expect(await pupils.getAttribute("transform")).not.toBe(lookingLeft);
  const blink = await avatar.locator("[data-part=eyes]").evaluate(async (element) => {
    let minimum = 1;
    for (let index = 0; index < 150; index++) {
      const transform = getComputedStyle(element).transform;
      if (transform !== "none") minimum = Math.min(minimum, new DOMMatrix(transform).d);
      await new Promise((resolve) => setTimeout(resolve, 30));
    }
    return minimum;
  });
  expect(blink).toBeLessThan(0.4);
  await page.locator(".code-panel").hover({ position: { x: 70, y: 80 } });
  await expect(avatar).toHaveAttribute("data-state", "pointing");
  await page.waitForTimeout(750);
  await page.screenshot({ path: "test-results/avatar-pointing.png" });
  await expect(page.locator(".hero [data-avatar]")).toHaveAttribute("data-animating", "false");
  await positionAt(page, ".playground-surface");
  await expect(page.locator("#playground [data-avatar]")).toHaveAttribute("data-state", "painting");
  await page.waitForTimeout(700);
  await expect(page.locator("#playground [data-part=brush]")).toHaveCSS("opacity", "1");
  await page.screenshot({ path: "test-results/avatar-painting.png" });
  await positionAt(page, "#contact");
  await expect(page.locator("#contact [data-avatar]")).toHaveAttribute("data-state", "waving");
  await page.waitForTimeout(800);
  await page.screenshot({ path: "test-results/avatar-waving.png" });
  expect(errors).toEqual([]);
});

for (const slug of ["gather", "freshcart"]) {
test(`${slug}: fast pointer motion separates image fragments and reconstructs them`, async ({ page }) => {
  await page.goto(`/projects/${slug}`);
  await positionAt(page, ".detail-cover", -140);
  const surface = page.locator(".detail-cover .image-surface");
  const canvas = surface.locator("canvas");
  await expect(surface).toHaveAttribute("data-webgl-ready", "true");
  await expect(canvas).toHaveAttribute("data-fragment-count", /\d+/);
  expect(Number(await canvas.getAttribute("data-fragment-count"))).toBeGreaterThan(2500);
  await page.mouse.move(10, 10);
  await page.waitForTimeout(1000);
  const box = await surface.boundingBox();
  const clip = { x: box!.x, y: box!.y, width: box!.width, height: box!.height };
  const intact = await page.screenshot({ clip, path: `test-results/${slug}-fragments-intact.png` });
  const disturb = async (range: number, delay: number) => {
    let peak = 0;
    for (let index = 0; index < 24; index++) {
      await page.mouse.move(box!.x + box!.width * (0.5 + (index % 2 ? range : -range)), box!.y + box!.height * 0.5);
      await page.waitForTimeout(delay);
      peak = Math.max(peak, Number(await canvas.getAttribute("data-scatter-strength")));
    }
    return peak;
  };
  const slow = await disturb(0.004, 75);
  await page.mouse.move(10, 10); await page.waitForTimeout(1800);
  const fast = await disturb(0.24, 16);
  expect(fast).toBeGreaterThan(slow + 0.15);
  await page.mouse.move(box!.x + box!.width * 0.5, box!.y + box!.height * 0.5);
  await page.waitForTimeout(35);
  const scattered = await page.screenshot({ clip, path: `test-results/${slug}-fragments-scattered.png` });
  await page.mouse.move(10, 10);
  await expect.poll(async () => Number(await canvas.getAttribute("data-scatter-strength"))).toBeLessThan(0.01);
  await page.waitForTimeout(800);
  const restored = await page.screenshot({ clip, path: `test-results/${slug}-fragments-restored.png` });
  const changedPixels = async (first: Buffer, second: Buffer) => {
    const a = await sharp(first).removeAlpha().raw().toBuffer();
    const b = await sharp(second).removeAlpha().raw().toBuffer();
    let changed = 0;
    for (let index = 0; index < a.length; index += 3) {
      if (Math.abs(a[index] - b[index]) + Math.abs(a[index + 1] - b[index + 1]) + Math.abs(a[index + 2] - b[index + 2]) > 70) changed++;
    }
    return changed / (a.length / 3);
  };
  const scatterDifference = await changedPixels(intact, scattered);
  expect(scatterDifference).toBeGreaterThan(0.035);
  expect(await changedPixels(intact, restored)).toBeLessThan(scatterDifference * 0.45);
});
}

test("coding panels and individual letters respond, then return to rest", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(1400);
  const letter = page.locator(".hero .type-letter").nth(3);
  const initial = await letter.boundingBox();
  await page.mouse.move(initial!.x - 8, initial!.y + initial!.height * 0.4);
  await page.waitForTimeout(200);
  const disturbed = await letter.boundingBox();
  expect(Math.hypot(disturbed!.x - initial!.x, disturbed!.y - initial!.y)).toBeGreaterThan(3);
  await page.mouse.move(5, 5); await page.waitForTimeout(750);
  const reset = await letter.boundingBox();
  expect(Math.hypot(reset!.x - initial!.x, reset!.y - initial!.y)).toBeLessThan(2);
  await positionAt(page, "#coding", 140);
  const panel = page.locator(".code-panel");
  const before = await panel.evaluate((element) => getComputedStyle(element).transform);
  await panel.hover({ position: { x: 35, y: 45 } });
  await page.waitForTimeout(350);
  expect(await panel.evaluate((element) => getComputedStyle(element).transform)).not.toBe(before);
  await page.mouse.move(5, 5); await page.waitForTimeout(1400);
  await expect.poll(() => panel.evaluate((element) => getComputedStyle(element).transform)).toBe("none");
});

test("capability tabs and process nodes work with mouse and keyboard", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#experiments")).toHaveCount(0);
  await positionAt(page, "#capabilities");
  const programming = page.getByRole("tab", { name: "04 Programming" });
  await programming.click();
  await expect(programming).toHaveAttribute("aria-selected", "true");
  for (const label of ["C++", "Python", "C#", "SQL"]) await expect(page.getByRole("tabpanel").getByText(label, { exact: true })).toBeVisible();
  await page.keyboard.press("Home");
  await expect(page.getByRole("tab", { name: "01 Frontend", exact: true })).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "02 Core frontend" })).toBeFocused();
  await expect(page.getByRole("tabpanel").getByText("REST APIs", { exact: true })).toBeVisible();
  await positionAt(page, "#process", 120);
  await page.getByRole("button", { name: /04 Refine/ }).click();
  await expect(page.locator(".process-insight p")).toHaveText("Check small screens, keyboard access, and every state.");
});

test("the playground responds to movement and stirring, and stops offscreen", async ({ page }) => {
  await page.goto("/");
  await positionAt(page, ".playground-surface", -100);
  const canvas = page.locator(".physics-canvas");
  await expect(canvas).toHaveAttribute("data-animating", "true");
  const initial = await canvas.evaluate((element) => (element as HTMLCanvasElement).toDataURL());
  const box = await canvas.boundingBox();
  await page.mouse.move(box!.x + box!.width * 0.5, box!.y + box!.height * 0.4);
  await expect.poll(() => page.locator(".image-echo").evaluateAll((elements) => Math.max(...elements.map((element) => Number(getComputedStyle(element).opacity))))).toBeGreaterThan(0.05);
  await page.waitForTimeout(250);
  expect(await canvas.evaluate((element) => (element as HTMLCanvasElement).toDataURL())).not.toBe(initial);
  await page.getByRole("button", { name: "Stir things up" }).click();
  await expect.poll(async () => Number(await canvas.getAttribute("data-energy"))).toBeGreaterThan(60);
  await page.screenshot({ path: "test-results/playground-stirred.png" });
  await positionAt(page, "#contact");
  await expect(canvas).toHaveAttribute("data-animating", "false");
  await expect.poll(() => page.locator(".image-echo").evaluateAll((elements) => Math.max(...elements.map((element) => Number(getComputedStyle(element).opacity))))).toBe(0);
});

test("mobile keeps the character and touch controls; reduced motion keeps all controls usable", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await page.goto("/");
  await positionAt(page, "#coding", 200);
  const avatar = page.locator("#coding [data-avatar]");
  await expect(avatar).toHaveAttribute("data-state", "typing");
  const arm = avatar.locator("[data-part=left-arm]");
  const before = await arm.getAttribute("transform");
  await page.waitForTimeout(190);
  expect(await arm.getAttribute("transform")).not.toBe(before);
  await expect(page.locator(".shader-layer canvas")).toHaveCount(0);
  await positionAt(page, ".playground-surface", -60);
  await page.getByRole("button", { name: "Stir things up" }).tap();
  await expect.poll(async () => Number(await page.locator(".physics-canvas").getAttribute("data-energy"))).toBeGreaterThan(40);
  await page.screenshot({ path: "test-results/mobile-playground-active.png" });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await positionAt(page, "#capabilities", 40);
  await page.getByRole("tab", { name: "04 Programming" }).tap();
  await expect(page.getByRole("tabpanel").getByText("Python", { exact: true })).toBeVisible();
  await expect(page.locator("[data-avatar][data-animating=true]")).toHaveCount(0);
  await positionAt(page, ".playground-surface", -60);
  const canvas = page.locator(".physics-canvas");
  const staticShapes = await canvas.evaluate((element) => (element as HTMLCanvasElement).toDataURL());
  await page.getByRole("button", { name: "Stir things up" }).tap();
  await expect.poll(() => canvas.evaluate((element) => (element as HTMLCanvasElement).toDataURL())).not.toBe(staticShapes);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await context.close();
});

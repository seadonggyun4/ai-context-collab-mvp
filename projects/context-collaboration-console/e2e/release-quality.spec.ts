import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const projectPath = "/projects/apc-monitoring-mvp";
const viewports = [
  { name: "desktop", width: 1280, height: 900 },
  { name: "compact-desktop", width: 1024, height: 900 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
] as const;

async function waitForProduct(page: Page) {
  await expect(page.getByRole("heading", { name: "APC 데이터 운영 모니터링" })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
}

async function expectNoA11yViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
}

for (const viewport of viewports) {
  test(`${viewport.name} layout과 접근성 계약`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto(projectPath);
    await waitForProduct(page);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    await expect(page.locator("#operational-content")).toBeVisible();

    await expectNoA11yViolations(page);
  });
}

test("skip link와 핵심 navigation을 keyboard로 탐색한다", async ({ page }) => {
  await page.setViewportSize(viewports[0]);
  await page.goto(projectPath);
  await waitForProduct(page);

  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "본문으로 건너뛰기" });
  await expect(skipLink).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#operational-content")).toBeFocused();

  const targets = await page.locator("button, a, select, input, textarea, [tabindex]:not([tabindex='-1'])").evaluateAll((elements) => elements.map((element) => {
    const rect = element.getBoundingClientRect();
    return { tag: element.tagName, label: element.getAttribute("aria-label") ?? element.textContent?.trim(), width: rect.width, height: rect.height };
  }).filter((item) => item.width > 0 && item.height > 0));
  const undersizedControls = targets.filter((item) => item.tag !== "A" && (item.width < 24 || item.height < 24));
  expect(undersizedControls).toEqual([]);
});

test("문서 editor는 keyboard focus와 accessible name을 유지한다", async ({ page }) => {
  const documentId = encodeURIComponent("apc-monitoring-mvp:0a1b2c3d4e5f60718293");
  await page.goto(`/projects/apc-monitoring-mvp/context/${documentId}?view=edit`);
  const editor = page.getByRole("textbox", { name: "Project Context MARKDOWN 편집기" });
  await expect(editor).toBeVisible();
  await editor.focus();
  await expect(editor).toBeFocused();
  await expect(page.getByRole("status", { name: "" }).filter({ hasText: "원본과 동일" })).toBeVisible();
});

test("dark dashboard와 Dracula editor가 접근성·reflow를 유지한다", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("context-console.theme-preference.v1", "dark"));
  await page.setViewportSize(viewports[0]);
  await page.goto(projectPath);
  await waitForProduct(page);
  await expectNoA11yViolations(page);

  const documentId = encodeURIComponent("apc-monitoring-mvp:0a1b2c3d4e5f60718293");
  await page.setViewportSize(viewports[3]);
  await page.goto(`/projects/apc-monitoring-mvp/context/${documentId}?view=edit`);
  await expect(page.getByRole("textbox", { name: "Project Context MARKDOWN 편집기" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  await expect(page.locator(".code-editor")).toHaveAttribute("data-theme", "dark");
  await expectNoA11yViolations(page);
});

test("메인 motion과 semantic action token이 양 테마에서 일관된다", async ({ page }) => {
  await page.setViewportSize(viewports[0]);
  await page.addInitScript(() => localStorage.setItem("context-console.theme-preference.v1", "light"));
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /변경의 이유부터.*검증 결과까지/ })).toBeVisible();
  await expect(page.locator("canvas[data-motion-scene]")).toHaveCount(4);
  await expect.poll(() => page.locator("canvas[data-webgl-status='ready']").count()).toBe(4);
  await expect(page.getByText("로그인", { exact: true })).toHaveCount(0);
  await expect(page.getByText("로그아웃", { exact: true })).toHaveCount(0);

  const primaryAction = page.getByRole("link", { name: "APC 프로젝트 열기" }).first();
  await expect(primaryAction).toHaveCSS("background-color", "rgb(17, 94, 89)");
  await expect(primaryAction.locator("span")).toHaveCSS("color", "rgb(255, 255, 255)");

  await page.getByRole("combobox", { name: "화면 테마, 현재 라이트" }).selectOption("dark");
  await expect(page.locator("html")).toHaveAttribute("data-resolved-theme", "dark");
  await expect(primaryAction).toHaveCSS("background-color", "rgb(103, 199, 188)");
  await expect(primaryAction.locator("span")).toHaveCSS("color", "rgb(8, 43, 40)");
  await expect(page.locator(".operating-proof > p > span")).toHaveCSS("color", "rgb(8, 43, 40)");
  await expect(page.locator(".closing-section h2 > span")).toHaveCSS("color", "rgb(16, 32, 29)");
  await expect(page.locator(".closing-section > div:last-child p > span")).toHaveCSS("color", "rgb(67, 83, 79)");
  await expectNoA11yViolations(page);
});

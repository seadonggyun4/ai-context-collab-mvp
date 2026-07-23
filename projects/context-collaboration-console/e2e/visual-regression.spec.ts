import { expect, test, type Page } from "@playwright/test";

const projectPath = "/projects/apc-monitoring-mvp";
const documentPath = `/projects/apc-monitoring-mvp/context/${encodeURIComponent("apc-monitoring-mvp:0a1b2c3d4e5f60718293")}?view=edit`;

async function settle(page: Page, heading: string) {
  await expect(page.getByRole("heading", { name: heading })).toBeVisible();
  await expect(page.getByText("로그인", { exact: true })).toHaveCount(0);
  await expect(page.getByText("로그아웃", { exact: true })).toHaveCount(0);
  await page.evaluate(() => document.fonts.ready);
}

test.use({ viewport: { width: 1280, height: 900 } });

for (const theme of ["light", "dark"] as const) {
  test(`landing ${theme}`, async ({ page }) => {
    await page.addInitScript((value) => localStorage.setItem("context-console.theme-preference.v1", value), theme);
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /변경의 이유부터.*검증 결과까지/ })).toBeVisible();
    await expect.poll(() => page.locator("canvas[data-webgl-status='ready']").count()).toBe(4);
    await expect(page).toHaveScreenshot(`landing-${theme}.png`, { fullPage: true });
  });
}

test("dashboard light", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("context-console.theme-preference.v1", "light"));
  await page.goto(projectPath);
  await settle(page, "APC 데이터 운영 모니터링");
  await expect(page).toHaveScreenshot("dashboard-light.png", { fullPage: true });
});

test("dashboard dark", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("context-console.theme-preference.v1", "dark"));
  await page.goto(projectPath);
  await settle(page, "APC 데이터 운영 모니터링");
  await expect(page).toHaveScreenshot("dashboard-dark.png", { fullPage: true });
});

for (const theme of ["light", "dark"] as const) {
  test(`editor ${theme}`, async ({ page }) => {
    await page.addInitScript((value) => localStorage.setItem("context-console.theme-preference.v1", value), theme);
    await page.goto(documentPath);
    await settle(page, "Project Context");
    await expect(page.locator(".code-editor")).toHaveAttribute("data-theme", theme);
    await expect(page).toHaveScreenshot(`editor-${theme}.png`, { fullPage: true });
  });
}

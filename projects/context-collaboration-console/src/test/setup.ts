import "@testing-library/jest-dom/vitest";

import { configure } from "@testing-library/react";
import { afterEach } from "vitest";

configure({ asyncUtilTimeout: 5_000 });

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({ matches: false, media: query, onchange: null, addListener: () => undefined, removeListener: () => undefined, addEventListener: () => undefined, removeEventListener: () => undefined, dispatchEvent: () => false }),
});

class ResizeObserverMock {
  observe() { /* test layout is static */ }
  unobserve() { /* test layout is static */ }
  disconnect() { /* test layout is static */ }
}

Object.defineProperty(window, "ResizeObserver", { writable: true, value: ResizeObserverMock });
Object.defineProperty(globalThis, "ResizeObserver", { writable: true, value: ResizeObserverMock });
Range.prototype.getClientRects = () => [] as unknown as DOMRectList;
Range.prototype.getBoundingClientRect = () => ({
  bottom: 0,
  height: 0,
  left: 0,
  right: 0,
  top: 0,
  width: 0,
  x: 0,
  y: 0,
  toJSON: () => undefined,
});

afterEach(() => {
  window.localStorage.clear();
  document.documentElement.dataset.resolvedTheme = "light";
  document.documentElement.dataset.themePreference = "system";
});

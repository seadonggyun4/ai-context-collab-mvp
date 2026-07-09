import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@astryxdesign/core/astryx.css";
import "@astryxdesign/theme-neutral/theme.css";
import { App } from "./app/App";
import "./shared/styles/global.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found");
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);

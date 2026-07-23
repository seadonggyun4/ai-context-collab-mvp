// Copyright © 2026 서동균 (DongGyun Seo). All Rights Reserved.
// SPDX-License-Identifier: LicenseRef-Proprietary

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "@app/App";

import "@app/styles/index.css";

const rootElement = document.getElementById("root");

if (!(rootElement instanceof HTMLElement)) {
  throw new Error("Application root element was not found.");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

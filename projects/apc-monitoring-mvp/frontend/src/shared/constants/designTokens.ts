import type { MonitoringStatus } from "@shared/types/monitoring";

export const DESIGN_TOKENS = {
  colors: {
    primary: "#37445E",
    primaryPanel: "#43506E",
    panel: "#43516D",
    panelHover: "#486185",
    panelSelected: "#42597B",
    secondaryPanel: "#505F7C",
    accent: "#FFC132",
    menuActive: "#011E58",
    segmented: "#1D3A8A",
    mutedBlue: "#7387A6",
    body: "#222222",
    bodyMuted: "#606060",
    grayBg: "#EEEEEE",
    softBg: "#F5F5F5",
    disabledBg: "#E9E9E9",
    borderLight: "#D9D9D9",
    borderMuted: "#80899C",
    white: "#FFFFFF",
    statusNormal: "#22C55E",
    statusDelayed: "#FFC132",
    statusError: "#D11B1B",
    statusMissing: "#9CA3AF",
    statusInfo: "#1890FF"
  },
  radius: {
    card: 5,
    segmented: 6
  }
} as const;

export const STATUS_COLORS: Record<MonitoringStatus, string> = {
  NORMAL: DESIGN_TOKENS.colors.statusNormal,
  DELAYED: DESIGN_TOKENS.colors.statusDelayed,
  ERROR: DESIGN_TOKENS.colors.statusError,
  MISSING: DESIGN_TOKENS.colors.statusMissing,
  UNDEFINED_RULE: DESIGN_TOKENS.colors.statusInfo
};

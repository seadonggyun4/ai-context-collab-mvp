import type { UserRole } from "@shared/types/monitoring";

let currentUserRole: UserRole = "VIEWER";

export function getCurrentUserRole() {
  return currentUserRole;
}

export function setCurrentUserRole(role: UserRole) {
  currentUserRole = role;
}

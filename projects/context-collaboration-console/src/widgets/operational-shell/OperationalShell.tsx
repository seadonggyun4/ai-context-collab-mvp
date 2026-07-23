import { type PropsWithChildren } from "react";
import { NavLink } from "react-router-dom";

import { useOptionalAuth } from "@entities/auth";
import { ThemeSwitcher } from "@features/change-theme";
import { routes } from "@shared/config";
import { BrandMark } from "@shared/ui/brand-mark";

import "./operational-shell.css";

interface OperationalShellProps extends PropsWithChildren {
  contextVersion: string;
  projectId: string;
  projectName: string;
}

const navigation = [
  { label: "개요", path: (id: string) => routes.project(id), end: true },
  { label: "변경 요청", path: routes.changes, end: false },
  { label: "프로젝트 문맥", path: routes.context, end: false },
  { label: "검증 증거", path: routes.evidence, end: false },
] as const;

export function OperationalShell({ children, contextVersion, projectId, projectName }: OperationalShellProps) {
  const auth = useOptionalAuth();
  const principal = auth?.state.status === "authenticated" ? auth.state.session.principal : null;
  const contextLabel = contextVersion.startsWith("context-v") ? contextVersion : `Context v${contextVersion}`;
  return (
    <div className="operational-shell">
      <a className="skip-link" href="#operational-content">본문으로 건너뛰기</a>
      <header className="operational-topbar">
        <NavLink className="brand-link" to={routes.home} aria-label="Context Flow 시작 화면">
          <BrandMark compact />
        </NavLink>
        <div className="operational-topbar__project">
          <span>프로젝트</span>
          <strong>{projectName}</strong>
        </div>
        <div className="operational-topbar__actions">
          <ThemeSwitcher />
          <div className="user-session">
            <span className="user-avatar" aria-label={principal === null ? "사용자 계정" : `${principal.displayName} · ${principal.role}`} title={principal?.displayName}>{principal?.displayName.slice(0, 1) ?? "-"}</span>
            {principal !== null && auth !== null ? (
              <button type="button" className="user-session__logout" onClick={() => void auth.logout()}>로그아웃</button>
            ) : null}
          </div>
        </div>
      </header>

      <aside className="operational-sidebar">
        <nav aria-label="프로젝트 메뉴">
          {navigation.map((item) => (
            <NavLink
              key={item.label}
              to={item.path(projectId)}
              end={item.end}
              className={({ isActive }) => (isActive ? "is-active" : undefined)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-meta">
          <span>운영 기준</span>
          <strong>{contextLabel}</strong>
        </div>
      </aside>

      <main className="operational-content" id="operational-content" tabIndex={-1}>{children}</main>
    </div>
  );
}

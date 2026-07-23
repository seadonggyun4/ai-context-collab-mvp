import { Link } from "react-router-dom";

import { ThemeSwitcher } from "@features/change-theme";
import { routes } from "@shared/config";
import { BrandMark } from "@shared/ui/brand-mark";

import "./public-header.css";

export function PublicHeader() {
  return (
    <>
      <a className="skip-link" href="#main-content">본문으로 건너뛰기</a>
      <header className="public-header">
      <div className="public-header__inner">
        <Link className="brand-link" to={routes.home} aria-label="Context Flow 시작 화면">
          <BrandMark />
        </Link>
        <nav className="public-header__nav" aria-label="주요 메뉴">
          <a href="#workflow">운영 방식</a>
          <a href="#governance">변경 관리</a>
          <a href="#evidence">검증 체계</a>
        </nav>
        <div className="public-header__actions">
          <ThemeSwitcher />
          <Link className="text-link text-link--strong" to={routes.project("apc-monitoring-mvp")}>
            프로젝트 열기 <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
      </header>
    </>
  );
}

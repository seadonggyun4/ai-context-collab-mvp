import { type PropsWithChildren } from "react";

import { useAuth } from "@entities/auth";
import { BrandMark } from "@shared/ui/brand-mark";

import "./auth-boundary.css";

export function AuthBoundary({ children }: PropsWithChildren) {
  const auth = useAuth();
  if (auth.state.status === "authenticated") return children;
  if (auth.state.status === "loading") return <main className="auth-boundary" aria-busy="true"><div><BrandMark /><p>조직 세션을 확인하고 있습니다</p></div></main>;
  return (
    <main className="auth-boundary">
      <section aria-labelledby="auth-title">
        <BrandMark />
        <p className="auth-boundary__label">CONTEXT CONSOLE</p>
        <h1 id="auth-title">{auth.state.status === "error" ? "인증 서비스를 확인해 주세요" : "조직 계정으로 로그인"}</h1>
        <p>{auth.state.status === "error" ? auth.state.detail : "승인·검증·Context 활성화 권한은 조직 계정의 역할 정책으로 결정됩니다."}</p>
        {auth.state.status === "error" ? <button type="button" onClick={auth.reload}>다시 확인</button> : <a href={auth.loginUrl}>로그인 계속하기</a>}
        <small>인증 정보와 provider token은 브라우저 저장소에 보관하지 않습니다.</small>
      </section>
    </main>
  );
}

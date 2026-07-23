import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type PropsWithChildren } from "react";
import { MemoryRouter } from "react-router-dom";

import { AppRouter } from "@app/router/AppRouter";
import { AnalysisRepositoryProvider, createFixtureAnalysisRepository } from "@entities/analysis";
import { createFixtureDocumentRepository, DocumentRepositoryProvider } from "@entities/document";
import { fixtureProjectRepository, ProjectRepositoryProvider } from "@entities/project";
import { ProductThemeProvider } from "@shared/lib/theme";
import { renderWithProviders } from "@test/renderWithProviders";

const projectId = "apc-monitoring-mvp";
const documentId = `${projectId}:0a1b2c3d4e5f60718293`;

describe("context browser and document editor routes", () => {
  it("filters SCR-05 documents through URL-backed controls", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AppRouter />, [`/projects/${projectId}/context`]);

    expect(await screen.findByRole("heading", { name: "프로젝트 기준 문서" })).toBeInTheDocument();
    expect(screen.getByText("5 / 5 문서")).toBeInTheDocument();
    await user.selectOptions(screen.getByRole("combobox", { name: "역할" }), "QA");
    expect(screen.getByText("1 / 5 문서")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "QA 수용 기준" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Project Context" })).not.toBeInTheDocument();
  });

  it("opens structured, raw, and editable SCR-06 views", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AppRouter />, [`/projects/${projectId}/context/${encodeURIComponent(documentId)}`]);

    expect(await screen.findByRole("heading", { name: "Project Context" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "문서 메타데이터" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "원본 보기" }));
    expect(screen.getByRole("textbox", { name: "Project Context 원본 읽기 전용" })).toHaveAttribute("contenteditable", "false");
    await user.click(screen.getByRole("button", { name: "편집" }));
    expect(screen.getByRole("textbox", { name: "Project Context MARKDOWN 편집기" })).toBeInTheDocument();
    expect(screen.getByText("원본과 동일")).toBeInTheDocument();
  });

  it("defers autosave during Korean IME composition and surfaces revision recovery", async () => {
    const repository = createFixtureDocumentRepository();
    const analysisRepository = createFixtureAnalysisRepository();
    function Wrapper({ children }: PropsWithChildren) {
      return <ProductThemeProvider><MemoryRouter initialEntries={[`/projects/${projectId}/context/${encodeURIComponent(documentId)}?view=edit`]}><ProjectRepositoryProvider repository={fixtureProjectRepository}><AnalysisRepositoryProvider repository={analysisRepository}><DocumentRepositoryProvider repository={repository}>{children}</DocumentRepositoryProvider></AnalysisRepositoryProvider></ProjectRepositoryProvider></MemoryRouter></ProductThemeProvider>;
    }
    render(<AppRouter />, { wrapper: Wrapper });
    const editor = await screen.findByRole("textbox", { name: "Project Context MARKDOWN 편집기" });

    fireEvent.compositionStart(editor);
    await userEvent.type(editor, "한글 기준");
    expect(screen.getByText("원본과 동일")).toBeInTheDocument();
    repository.advanceRevision(documentId, "# 서버에서 변경된 Project Context\n");
    fireEvent.compositionEnd(editor);

    expect(screen.getByText("저장 대기")).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "문서 원본이 변경되었습니다" }, { timeout: 2500 })).toBeInTheDocument();
    expect(screen.getByText("원본 변경 확인 필요")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "최신 원본 기준으로 초안 유지" }));
    await waitFor(() => expect(screen.getByText("초안 저장됨")).toBeInTheDocument(), { timeout: 2500 });
  });
});

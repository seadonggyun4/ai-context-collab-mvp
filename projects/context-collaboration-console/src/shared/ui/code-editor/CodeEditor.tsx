import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { markdown } from "@codemirror/lang-markdown";
import { yaml } from "@codemirror/lang-yaml";
import {
  bracketMatching,
  defaultHighlightStyle,
  foldGutter,
  foldKeymap,
  HighlightStyle,
  indentOnInput,
  syntaxHighlighting,
} from "@codemirror/language";
import { lintGutter, setDiagnostics, type Diagnostic } from "@codemirror/lint";
import { searchKeymap } from "@codemirror/search";
import { Compartment, EditorState } from "@codemirror/state";
import {
  drawSelection,
  dropCursor,
  EditorView,
  highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
  keymap,
  lineNumbers,
} from "@codemirror/view";
import { tags } from "@lezer/highlight";
import { useEffect, useRef } from "react";

import { useTheme } from "@shared/lib/theme";

import "./code-editor.css";

export interface CodeEditorDiagnostic {
  severity: "ERROR" | "WARNING" | "INFO";
  code: string;
  message: string;
  from: { line: number; column: number };
}

export type CodeEditorFormat = "MARKDOWN" | "YAML";

interface CodeEditorProps {
  value: string;
  format: CodeEditorFormat;
  diagnostics: CodeEditorDiagnostic[];
  onChange: (value: string) => void;
  ariaLabel: string;
  readOnly?: boolean;
}

const language = new Compartment();
const editorTheme = new Compartment();
const editable = new Compartment();
const accessibility = new Compartment();

const porcelainTheme = EditorView.theme({
  "&": { color: "#24302e", backgroundColor: "#fbfcfb" },
  ".cm-content": { caretColor: "#0b6b63" },
  ".cm-cursor, .cm-dropCursor": { borderLeftColor: "#0b6b63" },
  ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": { backgroundColor: "#cfe9e5" },
  ".cm-gutters": { backgroundColor: "#f2f5f4", color: "#77817f", border: "none" },
  ".cm-activeLine, .cm-activeLineGutter": { backgroundColor: "#e9f2f0" },
}, { dark: false });

const draculaTheme = EditorView.theme({
  "&": { color: "#f8f8f2", backgroundColor: "#282a36" },
  ".cm-content": { caretColor: "#f8f8f0" },
  ".cm-cursor, .cm-dropCursor": { borderLeftColor: "#f8f8f0" },
  ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": { backgroundColor: "#44475a" },
  ".cm-gutters": { backgroundColor: "#252733", color: "#a7a9b6", border: "none" },
  ".cm-activeLine, .cm-activeLineGutter": { backgroundColor: "#303341" },
}, { dark: true });

const porcelainHighlight = HighlightStyle.define([
  { tag: tags.heading, color: "#0b5d57", fontWeight: "700" },
  { tag: [tags.keyword, tags.bool, tags.atom], color: "#8b3d63" },
  { tag: [tags.string, tags.url], color: "#875b16" },
  { tag: [tags.comment, tags.meta], color: "#6f7c79" },
  { tag: tags.number, color: "#315d9a" },
  { tag: [tags.link, tags.name], color: "#176c82" },
]);

const draculaHighlight = HighlightStyle.define([
  { tag: tags.heading, color: "#8be9fd", fontWeight: "700" },
  { tag: [tags.keyword, tags.bool, tags.atom], color: "#ff79c6" },
  { tag: [tags.string, tags.url], color: "#f1fa8c" },
  { tag: [tags.comment, tags.meta], color: "#6272a4" },
  { tag: tags.number, color: "#bd93f9" },
  { tag: [tags.link, tags.name], color: "#50fa7b" },
]);

function languageExtension(format: CodeEditorFormat) {
  return format === "YAML" ? yaml() : markdown();
}

function themeExtension(theme: "light" | "dark") {
  return theme === "dark"
    ? [draculaTheme, syntaxHighlighting(draculaHighlight)]
    : [porcelainTheme, syntaxHighlighting(porcelainHighlight)];
}

function toCodeMirrorDiagnostics(view: EditorView, items: CodeEditorDiagnostic[]): Diagnostic[] {
  return items.map((item) => {
    const lineNumber = Math.min(Math.max(item.from.line, 1), view.state.doc.lines);
    const line = view.state.doc.line(lineNumber);
    const from = Math.min(line.from + Math.max(item.from.column - 1, 0), line.to);
    return {
      from,
      to: Math.max(from + 1, from),
      severity: item.severity === "ERROR" ? "error" : item.severity === "WARNING" ? "warning" : "info",
      message: item.message,
      source: item.code,
    };
  });
}

export function CodeEditor({ value, format, diagnostics, onChange, ariaLabel, readOnly = false }: CodeEditorProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const composingRef = useRef(false);
  const { resolvedTheme } = useTheme();
  const initialConfiguration = useRef({ value, format, resolvedTheme, readOnly, ariaLabel });
  onChangeRef.current = onChange;

  useEffect(() => {
    if (hostRef.current === null) return;
    const state = EditorState.create({
      doc: initialConfiguration.current.value,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightSpecialChars(),
        history(),
        foldGutter(),
        drawSelection(),
        dropCursor(),
        EditorState.allowMultipleSelections.of(true),
        indentOnInput(),
        bracketMatching(),
        highlightActiveLine(),
        EditorView.lineWrapping,
        lintGutter(),
        keymap.of([...defaultKeymap, ...searchKeymap, ...historyKeymap, ...foldKeymap, indentWithTab]),
        language.of(languageExtension(initialConfiguration.current.format)),
        editorTheme.of(themeExtension(initialConfiguration.current.resolvedTheme)),
        editable.of(EditorView.editable.of(!initialConfiguration.current.readOnly)),
        accessibility.of(EditorView.contentAttributes.of({ "aria-label": initialConfiguration.current.ariaLabel, spellcheck: "false" })),
        EditorView.updateListener.of((update) => {
          if (update.docChanged && !update.view.composing && !composingRef.current) {
            onChangeRef.current(update.state.doc.toString());
          }
        }),
        EditorView.domEventHandlers({
          compositionstart() {
            composingRef.current = true;
          },
          compositionend(_event, view) {
            composingRef.current = false;
            onChangeRef.current(view.state.doc.toString());
          },
        }),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      ],
    });
    const view = new EditorView({ state, parent: hostRef.current });
    viewRef.current = view;
    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (view === null || view.state.doc.toString() === value) return;
    view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: value } });
  }, [value]);

  useEffect(() => {
    viewRef.current?.dispatch({ effects: language.reconfigure(languageExtension(format)) });
  }, [format]);

  useEffect(() => {
    viewRef.current?.dispatch({ effects: editorTheme.reconfigure(themeExtension(resolvedTheme)) });
  }, [resolvedTheme]);

  useEffect(() => {
    viewRef.current?.dispatch({ effects: editable.reconfigure(EditorView.editable.of(!readOnly)) });
  }, [readOnly]);

  useEffect(() => {
    viewRef.current?.dispatch({ effects: accessibility.reconfigure(EditorView.contentAttributes.of({ "aria-label": ariaLabel, spellcheck: "false" })) });
  }, [ariaLabel]);

  useEffect(() => {
    const view = viewRef.current;
    if (view !== null) view.dispatch(setDiagnostics(view.state, toCodeMirrorDiagnostics(view, diagnostics)));
  }, [diagnostics]);

  return <div className="code-editor" ref={hostRef} data-theme={resolvedTheme} />;
}

"use client";

import { useEffect, useRef } from "react";
import { EditorState, Prec } from "@codemirror/state";
import { EditorView, drawSelection, highlightActiveLine, highlightActiveLineGutter, keymap, lineNumbers } from "@codemirror/view";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { bracketMatching, HighlightStyle, indentOnInput, indentUnit, syntaxHighlighting } from "@codemirror/language";
import { python } from "@codemirror/lang-python";
import { tags as t } from "@lezer/highlight";

const style = HighlightStyle.define([
  { tag: [t.keyword, t.controlKeyword, t.definitionKeyword, t.operatorKeyword, t.moduleKeyword], color: "#1e5aa8", fontWeight: "600" },
  { tag: [t.string], color: "#8a5300" },
  { tag: [t.comment], color: "#74736c", fontStyle: "italic" },
  { tag: [t.number, t.bool, t.null], color: "#7a2f8f" },
  { tag: [t.function(t.definition(t.variableName)), t.definition(t.className)], fontWeight: "600" },
  { tag: [t.standard(t.variableName)], color: "#0d6b6b" },
]);

export function Editor({
  initial,
  starter,
  resetSignal,
  onChange,
  onRun,
  label,
}: {
  initial: string;
  starter: string;
  resetSignal: number;
  onChange: (code: string) => void;
  onRun: () => void;
  label: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const cb = useRef({ onChange, onRun });
  cb.current = { onChange, onRun };

  useEffect(() => {
    const state = EditorState.create({
      doc: initial,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightActiveLine(),
        history(),
        drawSelection(),
        indentOnInput(),
        indentUnit.of("    "),
        bracketMatching(),
        python(),
        syntaxHighlighting(style),
        Prec.highest(keymap.of([{ key: "Mod-Enter", run: () => (cb.current.onRun(), true) }])),
        keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
        EditorView.updateListener.of((u) => {
          if (u.docChanged) cb.current.onChange(u.state.doc.toString());
        }),
        EditorView.contentAttributes.of({ "aria-label": label }),
      ],
    });
    view.current = new EditorView({ state, parent: host.current! });
    return () => view.current?.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset replaces the document with the starter code.
  useEffect(() => {
    if (!resetSignal || !view.current) return;
    const v = view.current;
    v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: starter } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal]);

  return <div className="editor" ref={host} />;
}

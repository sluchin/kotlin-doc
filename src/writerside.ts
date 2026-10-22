/**
 * Copyright (c) 2026 Tetsuya Higashi
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * Writerside (Kotlin のドキュメントを作るツール) の本文を, サイトの JavaScript が描く形に組み直す.
 *
 * サイトの CSS は, JavaScript が組み直したあとの形に当たる. サイトの見た目で表示するときは,
 * JavaScript を動かさないので, 同じ形にする.
 *
 * - 段落 (`p`) に `article__p` を付ける (幅と, 注意書きの枠との間).
 * - 注意書き (`aside.prompt`. `data-type` は `tip` `note` `warning`) の中身を,
 *   `div.prompt__wrapper.prompt__wrapper--type-<種類>` と `div.prompt__content` で囲み,
 *   中身の要素に `child` を付ける (枠の背景の色と, 中の要素の間).
 *
 * @param content 本文
 */
export function rewriteWriterside(content: Element): void {
  const doc = content.ownerDocument;
  content.querySelectorAll("p").forEach((p) => p.classList.add("article__p"));
  content.querySelectorAll("aside.prompt").forEach((prompt) => {
    // 種類がなければ, note として扱う
    const type = prompt.getAttribute("data-type") || "note";
    const wrapper = doc.createElement("div");
    wrapper.className = `prompt__wrapper prompt__wrapper--type-${type}`;
    const inner = doc.createElement("div");
    inner.className = "prompt__content";
    inner.append(...Array.from(prompt.childNodes));
    Array.from(inner.children).forEach((child) => child.classList.add("child"));
    wrapper.append(inner);
    prompt.append(wrapper);
  });
}

/**
 * Writerside の畳める項目を, 開け閉めできる `details` に組み直す (サイトの JavaScript が畳む. アプリは
 * JavaScript を動かさないので, 畳まずに全部が出てしまう).
 *
 * - 畳める項目 (`dt[data-expandable="true"]` と, 続く `dd`. 練習の問題と, ヒントなど) は,
 *   `dt` の中身を `summary` に, `dd` の中身を, その後ろに入れる (`dt` の id は `details` に移す).
 * - 畳めるコード (`div.code-collapse`. 練習の答えなど) は, `data-synopsis` を `summary` にして, コードを包む.
 * - 初めから開いている印 (`data-expanded` `data-is-expanded` が `true`) があれば, 開いておく.
 *
 * @param content 本文
 */
export function foldExpandables(content: Element): void {
  const doc = content.ownerDocument;
  // 中の項目から組み直す (外の項目を組み直すと, 中の項目は, 新しい details の中に移る)
  Array.from(content.querySelectorAll('dt[data-expandable="true"]'))
    .reverse()
    .forEach((dt) => {
      const details = doc.createElement("details");
      if (dt.id) {
        details.id = dt.id;
      }
      details.open = dt.getAttribute("data-expanded") === "true";
      const summary = doc.createElement("summary");
      summary.append(...Array.from(dt.childNodes));
      details.append(summary);
      const dd = dt.nextElementSibling;
      if (dd?.tagName === "DD") {
        details.append(...Array.from(dd.childNodes));
        dd.remove();
      }
      dt.replaceWith(details);
    });
  content.querySelectorAll(".code-collapse").forEach((code) => {
    const details = doc.createElement("details");
    if (code.id) {
      details.id = code.id;
      code.removeAttribute("id");
    }
    details.open = code.getAttribute("data-is-expanded") === "true";
    const summary = doc.createElement("summary");
    summary.textContent = code.getAttribute("data-synopsis") || "Code";
    code.replaceWith(details);
    details.append(summary, code);
  });
}

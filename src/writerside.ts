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

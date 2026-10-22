/**
 * Copyright (c) 2026 Tetsuya Higashi
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, expect, it } from "vitest";
import { site } from "./site";
import { foldExpandables, rewriteWriterside } from "./writerside";

/**
 * 作り物の本文を組み直す (ドキュメントの文章は使わない).
 *
 * @param html 本文の HTML
 * @returns 組み直した本文
 */
function rewrite(html: string): Element {
  const content = document.createElement("article");
  content.innerHTML = html;
  rewriteWriterside(content);
  return content;
}

describe("rewriteWriterside", () => {
  it("is the rewrite of the site look of the Kotlin site", () => {
    expect(site.siteLookRewrite).toBe(rewriteWriterside);
  });

  it("marks the paragraphs as the paragraphs of the article", () => {
    const content = rewrite('<p>One.</p><ul><li><p class="x">Two.</p></li></ul>');
    expect(content.innerHTML).toBe(
      '<p class="article__p">One.</p><ul><li><p class="x article__p">Two.</p></li></ul>',
    );
  });

  it("wraps the content of the prompts by their type, as the site script does", () => {
    const content = rewrite(
      '<aside class="prompt" data-type="tip" id="t"><p>Tip.</p> text</aside>' +
        '<aside class="prompt" data-type="warning"><p>A.</p><div>B.</div></aside>',
    );
    expect(content.innerHTML).toBe(
      '<aside class="prompt" data-type="tip" id="t"><div class="prompt__wrapper prompt__wrapper--type-tip">' +
        '<div class="prompt__content"><p class="article__p child">Tip.</p> text</div></div></aside>' +
        '<aside class="prompt" data-type="warning"><div class="prompt__wrapper prompt__wrapper--type-warning">' +
        '<div class="prompt__content"><p class="article__p child">A.</p><div class="child">B.</div></div></div></aside>',
    );
  });

  it("treats a prompt without a type as a note", () => {
    const content = rewrite('<aside class="prompt"><p>Note.</p></aside><aside>Other.</aside>');
    expect(content.querySelector(".prompt__wrapper")?.className).toBe(
      "prompt__wrapper prompt__wrapper--type-note",
    );
    expect(content.lastElementChild?.innerHTML).toBe("Other.");
  });
});

describe("foldExpandables", () => {
  /**
   * 作り物の本文の, 畳める項目を組み直す.
   *
   * @param html 本文の HTML
   * @returns 組み直した本文
   */
  function fold(html: string): Element {
    const content = document.createElement("article");
    content.innerHTML = html;
    foldExpandables(content);
    return content;
  }

  it("is the rewrite of the Kotlin site", () => {
    expect(site.rewrite).toBe(foldExpandables);
  });

  it("folds the expandable items and the hints inside them", () => {
    const content = fold(
      '<dl><dt id="t1" data-expandable="true" data-expanded="false">Task <code>x</code></dt>' +
        '<dd><p>Body.</p><dl><dt data-expandable="true" data-expanded="true">Hint</dt><dd>Tip.</dd></dl></dd>' +
        '<dt data-expandable="true">Last</dt></dl><dl><dt>Term</dt><dd>Plain.</dd></dl>',
    );
    expect(content.innerHTML).toBe(
      '<dl><details id="t1"><summary>Task <code>x</code></summary><p>Body.</p>' +
        '<dl><details open=""><summary>Hint</summary>Tip.</details></dl></details>' +
        "<details><summary>Last</summary></details></dl><dl><dt>Term</dt><dd>Plain.</dd></dl>",
    );
  });

  it("folds the collapsible code under its synopsis", () => {
    const content = fold(
      '<div class="code-collapse" id="c1" data-synopsis="Answer" data-is-expanded="true">a()</div>' +
        '<div class="code-collapse" data-is-expanded="false">b()</div>',
    );
    expect(content.innerHTML).toBe(
      '<details id="c1" open=""><summary>Answer</summary>' +
        '<div class="code-collapse" data-synopsis="Answer" data-is-expanded="true">a()</div></details>' +
        '<details><summary>Code</summary><div class="code-collapse" data-is-expanded="false">b()</div></details>',
    );
  });
});

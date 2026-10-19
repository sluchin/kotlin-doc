/**
 * Copyright (c) 2026 Tetsuya Higashi
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, expect, it } from "vitest";
import { site } from "./site";
import { rewriteWriterside } from "./writerside";

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

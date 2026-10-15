/**
 * Copyright (c) 2026 Tetsuya Higashi
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, expect, it } from "vitest";
import { isDocUrl } from "../shared/ts/lib/docUrl";
import { extractPage } from "../shared/ts/lib/extract";
import { collectSegments } from "../shared/ts/lib/segments";
import { site } from "./site";

/** 作り物の Kotlin のドキュメント風のページ (ドキュメントの文章は使わない). */
const PAGE = `<html><head><title>Sample | Kotlin Documentation</title></head><body>
<header>Menu</header>
<main><article class="article"><h1 id="s">Sample</h1>
<p>Call <code class="code">main</code> to start.</p>
<div class="code-block" data-lang="kotlin">
fun main() {
//sampleStart
    println("x")
//sampleEnd
}
</div>
<p>See <a href="other.html">Other</a>.</p></article></main></body></html>`;

describe("Kotlin site profile", () => {
  it("opens only the docs of the site, starting from a page that the server renders", () => {
    expect(isDocUrl(site.homeUrl, site)).toBe(true);
    expect(isDocUrl("https://kotlinlang.org/api/latest/jvm/stdlib/", site)).toBe(false);
    expect(isDocUrl("https://example.com/docs/a.html", site)).toBe(false);
  });

  it("takes the article, strips the site name, and makes the links absolute", () => {
    const page = extractPage(PAGE, site.homeUrl, site);
    expect(page.title).toBe("Sample");
    expect(page.html).not.toContain("Menu");
    expect(page.html).toContain('href="https://kotlinlang.org/docs/other.html"');
  });

  it("keeps the line breaks of the code and drops the markers of the samples", () => {
    const { html } = extractPage(PAGE, site.homeUrl, site);
    expect(html).toContain('fun main() {\n    println("x")\n}</div>');
    expect(html).not.toContain("sampleStart");
  });

  it("does not translate the code blocks", () => {
    const root = document.createElement("div");
    root.innerHTML = extractPage(PAGE, site.homeUrl, site).html;
    const texts = collectSegments(root).map((element) => element.textContent);
    expect(texts).toEqual(["Sample", "Call main to start.", "See Other."]);
  });
});

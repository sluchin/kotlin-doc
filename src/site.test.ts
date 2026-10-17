/**
 * Copyright (c) 2026 Tetsuya Higashi
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, expect, it } from "vitest";
import { isDocUrl, tabIndexOf } from "../shared/ts/lib/docUrl";
import { extractPage } from "../shared/ts/lib/extract";
import { collectSegments } from "../shared/ts/lib/segments";
import { versionFromText } from "../shared/ts/lib/version";
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
  it("opens the docs and the API of the site in the tabs, starting from a page that the server renders", () => {
    expect(isDocUrl(site.homeUrl, site)).toBe(true);
    expect(site.tabs?.map((tab) => tab.label)).toEqual(["Docs", "Stdlib"]);
    for (const tab of site.tabs ?? []) {
      expect(isDocUrl(tab.homeUrl, site)).toBe(true);
    }
    expect(tabIndexOf("https://kotlinlang.org/docs/a.html", site.tabs ?? [])).toBe(0);
    // 古い URL (転送のページ) も、新しい URL も、API のタブ
    expect(tabIndexOf("https://kotlinlang.org/api/latest/jvm/stdlib/", site.tabs ?? [])).toBe(1);
    expect(tabIndexOf("https://kotlinlang.org/api/core/kotlin-stdlib/", site.tabs ?? [])).toBe(1);
    expect(isDocUrl("https://kotlinlang.org/community/", site)).toBe(false);
    expect(isDocUrl("https://example.com/docs/a.html", site)).toBe(false);
  });

  it("follows the redirect page of the old API url", () => {
    const stub = `<noscript><meta http-equiv="refresh" content="0; url=/api/core/kotlin-stdlib/"/></noscript>
<script>window.location = '/api/core/kotlin-stdlib/' + window.location.hash;</script>`;
    const page = extractPage(stub, "https://kotlinlang.org/api/latest/jvm/stdlib/", site);
    expect(page.redirect).toBe("https://kotlinlang.org/api/core/kotlin-stdlib/");
    expect(isDocUrl(page.redirect as string, site)).toBe(true);
  });

  it("takes the main content of the API page and does not translate the declarations", () => {
    const api = `<html><head><title>listOf | Core API – Kotlin Programming Language</title></head><body>
<div id="main"><div class="main-content"><div class="breadcrumbs"><a href="../index.html">kotlin-stdlib</a></div>
<div class="cover"><h1 class="cover"><span>list</span><wbr><span>Of</span></h1></div>
<div class="symbol monospace">fun &lt;T&gt; listOf(): List&lt;T&gt;<span class="copy-popup-wrapper">Copy</span></div>
<p class="paragraph">Returns an empty read-only list.</p>
<div class="main-subrow"><a href="list.html">List</a><span class="anchor-wrapper">#</span></div>
</div></div></body></html>`;
    const page = extractPage(
      api,
      "https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/list-of.html",
      site,
    );
    expect(page.title).toBe("listOf");
    expect(page.html).not.toContain("Copy");
    expect(page.html).not.toContain(">#<");
    const doc = new DOMParser().parseFromString(`<div>${page.html}</div>`, "text/html");
    const texts = collectSegments(doc.body.firstElementChild as Element).map((e) => e.textContent);
    // 説明の文だけを翻訳する (宣言、名前、パンくず、見出しの名前は、翻訳しない)
    expect(texts).toEqual(["Returns an empty read-only list."]);
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

  it("reads the current Kotlin version to separate the cache", () => {
    const source = site.versionSource;
    expect(source?.url.startsWith("https://kotlinlang.org/docs/")).toBe(true);
    // 作り物の, 最初のページの一部 (サイトは, 属性の中に, エスケープした HTML で書く)
    const text =
      '<div data-content="{&quot;x&quot;:[&quot;\\u003cp\\u003eLatest Kotlin release: \\u003ca href\\u003d\\&quot;whatsnew2420.html\\&quot;\\u003e2.4.21\\u003c/a\\u003e&quot;]}"></div>';
    expect(versionFromText(text, source?.pattern as RegExp)).toBe("2.4.21");
    expect(versionFromText("<p>no release</p>", source?.pattern as RegExp)).toBeUndefined();
  });
});

/**
 * Copyright (c) 2026 Tetsuya Higashi
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type { SiteProfile } from "../shared/ts/lib/profile";
import { parseToc } from "./toc";
import { rewriteWriterside } from "./writerside";

/**
 * Kotlin のドキュメント (kotlinlang.org) の設定.
 *
 * ドキュメント (`/docs/`. 本文は article.article) と, 標準ライブラリの API (`/api/`. Dokka で作られている.
 * 本文は .main-content) を開く (タブは使わない. メニューは, ドキュメントの目次).
 */
export const site: SiteProfile = {
  name: "Kotlin Doc",
  host: "kotlinlang.org",
  pathPrefix: "/docs/",
  // 標準ライブラリの API (`/api/`. Dokka で作られている) も、アプリの中で開く (ドキュメントのリンクから入る).
  // 古い URL (`/api/latest/jvm/stdlib/...`) は、転送のページで、新しい URL (`/api/core/...`) に移る (アプリも、たどる)
  otherPathPrefixes: ["/api/"],
  // home.html は JavaScript で描かれるので、サーバーが本文を返す、最初のページを開く
  homeUrl: "https://kotlinlang.org/docs/getting-started.html",
  contentSelectors: ["article.article", ".main-content"],
  // API のページの、コピーのボタンと、見出しのリンクの印は、本文ではない
  removeSelectors: [".copy-popup-wrapper", ".anchor-wrapper"],
  // API のページの、宣言 (シグネチャ)、名前の行、パンくず、対応する環境の印、見出しの名前は、表示するが、翻訳しない
  noTranslateSelectors: [
    ".symbol",
    ".monospace",
    ".breadcrumbs",
    ".platform-tags",
    ".main-subrow",
    ".cover h1",
  ],
  // コードの //sampleStart と //sampleEnd は、サイトの JavaScript が隠す印 (試せる部分の範囲)
  dropCodeLines: /^\s*\/\/sample(Start|End)\s*$/,
  titleSuffix: / \| (Kotlin Documentation|Core API – Kotlin Programming Language)$/,
  // 目次 (ページの左のメニュー) は、JavaScript で描かれるので、サイトの JSON から読む
  menu: { type: "json", url: "https://kotlinlang.org/docs/HelpTOC.json", parse: parseToc },
  // サイトの見た目で表示するとき、サイトの JavaScript は動かさないので、描き終えなかったときの表示 (本文を隠さない) にする
  siteLookBodyClass: "app-render-failed",
  // サイトの CSS は、JavaScript が組み直した本文 (注意書きの枠など) に当たるので、同じ形に組み直す
  siteLookRewrite: rewriteWriterside,
  // URL に版はない (いつも最新の Kotlin のドキュメント). 最初のページの「Latest Kotlin release」から、今の版を読み取って、
  // 翻訳のキャッシュを、版ごとに分ける (版は選べない. Kotlin の版が上がったら、新しく翻訳する)
  versionSource: {
    url: "https://kotlinlang.org/docs/getting-started.html",
    pattern: /Latest Kotlin release:[\s\S]*?(\d+\.\d+\.\d+)/,
  },
};

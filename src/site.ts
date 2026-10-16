/**
 * Copyright (c) 2026 Tetsuya Higashi
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type { SiteProfile } from "../shared/ts/lib/profile";
import { parseToc } from "./toc";

/** Kotlin のドキュメント (kotlinlang.org/docs) の設定. 本文は article.article. */
export const site: SiteProfile = {
  name: "Kotlin Doc",
  host: "kotlinlang.org",
  pathPrefix: "/docs/",
  // home.html は JavaScript で描かれるので、サーバーが本文を返す、最初のページを開く
  homeUrl: "https://kotlinlang.org/docs/getting-started.html",
  contentSelectors: ["article.article"],
  removeSelectors: [],
  // コードの //sampleStart と //sampleEnd は、サイトの JavaScript が隠す印 (試せる部分の範囲)
  dropCodeLines: /^\s*\/\/sample(Start|End)\s*$/,
  titleSuffix: / \| Kotlin Documentation$/,
  // 目次 (ページの左のメニュー) は、JavaScript で描かれるので、サイトの JSON から読む
  menu: { type: "json", url: "https://kotlinlang.org/docs/HelpTOC.json", parse: parseToc },
  // URL に版はない (いつも最新の Kotlin のドキュメント). 最初のページの「Latest Kotlin release」から、今の版を読み取って、
  // 翻訳のキャッシュを、版ごとに分ける (版は選べない. Kotlin の版が上がったら、新しく翻訳する)
  versionSource: {
    url: "https://kotlinlang.org/docs/getting-started.html",
    pattern: /Latest Kotlin release:[\s\S]*?(\d+\.\d+\.\d+)/,
  },
};

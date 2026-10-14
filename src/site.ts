/**
 * Copyright (c) 2026 Tetsuya Higashi
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type { SiteProfile } from "../shared/ts/lib/profile";

/** Kotlin のドキュメント (kotlinlang.org/docs) の設定. 本文は article.article. */
export const site: SiteProfile = {
  name: "Kotlin Doc",
  host: "kotlinlang.org",
  pathPrefix: "/docs/",
  // home.html は JavaScript で描かれるので、サーバーが本文を返す、最初のページを開く
  homeUrl: "https://kotlinlang.org/docs/getting-started.html",
  contentSelectors: ["article.article"],
  removeSelectors: [],
  titleSuffix: / \| Kotlin Documentation$/,
};

/**
 * Copyright (c) 2026 Tetsuya Higashi
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { absoluteUrl } from "../shared/ts/lib/docUrl";
import type { MenuItem } from "../shared/ts/lib/profile";

/** HelpTOC.json の 1 つのページ (ページか、子を持つグループ). */
interface TocPage {
  title: string;
  url?: string;
  pages?: string[];
}

/** HelpTOC.json の形 (Kotlin のドキュメントの目次). */
interface Toc {
  entities: { pages: Record<string, TocPage> };
  topLevelIds: string[];
}

/** 目次から外すページ (JavaScript で描かれるので、本文が取れない). */
const SKIPPED = new Set(["home.html"]);

/**
 * HelpTOC.json を、メニューの項目の木にする.
 *
 * `url` を持つものがページ、`pages` を持つものがグループ (子の ID の並び). 同じ ID を、2 回たどらない.
 *
 * @param json HelpTOC.json を読んだもの
 * @param base HelpTOC.json の URL (ページの相対 URL を、絶対 URL にする)
 * @returns 項目
 */
export function parseToc(json: unknown, base: string): MenuItem[] {
  const { entities, topLevelIds } = json as Toc;
  const visit = (ids: readonly string[], seen: ReadonlySet<string>): MenuItem[] =>
    ids
      .filter((id) => entities.pages[id] && !seen.has(id))
      .map((id) => {
        const page = entities.pages[id];
        return {
          title: page.title,
          url: page.url ? absoluteUrl(page.url, base) : undefined,
          children: visit(page.pages ?? [], new Set([...seen, id])),
        };
      })
      .filter((item) => !SKIPPED.has(item.url?.split("/").pop() ?? ""));
  return visit(topLevelIds, new Set());
}

/**
 * Copyright (c) 2026 Tetsuya Higashi
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { describe, expect, it } from "vitest";
import { parseToc } from "./toc";

/** 作り物の目次 (実際のドキュメントのタイトルは使わない). */
const TOC = {
  entities: {
    pages: {
      home: { title: "Home", url: "home.html" },
      a: { title: "Alpha", url: "alpha.html" },
      g: { title: "Group", pages: ["b", "loop", "missing"] },
      b: { title: "Beta", url: "sub/beta.html" },
      loop: { title: "Loop", url: "loop.html", pages: ["g"] },
    },
  },
  topLevelIds: ["home", "a", "g", "unknown"],
};

describe("parseToc", () => {
  const items = parseToc(TOC, "https://kotlinlang.org/docs/HelpTOC.json");

  it("makes a tree of the pages and the groups with absolute urls", () => {
    expect(items.map((item) => item.title)).toEqual(["Alpha", "Group"]);
    expect(items[0].url).toBe("https://kotlinlang.org/docs/alpha.html");
    expect(items[1].url).toBeUndefined();
    expect(items[1].children.map((child) => [child.title, child.url])).toEqual([
      ["Beta", "https://kotlinlang.org/docs/sub/beta.html"],
      ["Loop", "https://kotlinlang.org/docs/loop.html"],
    ]);
  });

  it("skips the home page, the unknown ids and the cycles", () => {
    const loop = items[1].children[1];
    expect(loop.children.map((child) => child.title)).toEqual([]);
  });
});

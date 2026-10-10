import { describe, expect, it } from "vitest";

import { clickEvent } from "./click-events";

const SITE = "www.samuelsantana.dev";

function mount(html: string): HTMLElement {
  document.body.innerHTML = html;
  return document.body;
}

describe("clickEvent", () => {
  it("builds the event named by the closest tracked ancestor, with its data-track properties", () => {
    const body = mount(`
      <a href="/blog/a-post" data-track-event="article_card_clicked" data-track-post="a-post" data-track-position="2" data-track-locale="pt">
        <span id="inner">Read</span>
      </a>
    `);

    expect(clickEvent(body.querySelector("#inner")!, SITE)).toEqual({
      name: "article_card_clicked",
      properties: { post: "a-post", position: 2, locale: "pt" },
    });
  });

  it("takes the post from a data-post ancestor when the tracked element has none", () => {
    const body = mount(`
      <div data-post="a-post">
        <button id="copy" data-track-event="code_copied">Copy</button>
      </div>
    `);

    expect(clickEvent(body.querySelector("#copy")!, SITE)).toEqual({
      name: "code_copied",
      properties: { post: "a-post" },
    });
  });

  it("reports a link to another site as an outbound click, with the post when inside an article", () => {
    const body = mount(`
      <article data-post="a-post">
        <a id="out" href="https://github.com/samuelcsantana/pyxis-sdk">pyxis-sdk</a>
      </article>
      <footer>
        <a id="footer-link" href="https://www.linkedin.com/in/samuelcsantana/">LinkedIn</a>
      </footer>
    `);

    expect(clickEvent(body.querySelector("#out")!, SITE)).toEqual({
      name: "outbound_clicked",
      properties: { host: "github.com", post: "a-post" },
    });
    expect(clickEvent(body.querySelector("#footer-link")!, SITE)).toEqual({
      name: "outbound_clicked",
      properties: { host: "www.linkedin.com" },
    });
  });

  it("ignores internal links, anchors and elements that are not links", () => {
    const body = mount(`
      <a id="internal" href="/about">About</a>
      <a id="anchor" href="#section">Section</a>
      <p id="text">Just text</p>
    `);

    expect(clickEvent(body.querySelector("#internal")!, SITE)).toBeNull();
    expect(clickEvent(body.querySelector("#anchor")!, SITE)).toBeNull();
    expect(clickEvent(body.querySelector("#text")!, SITE)).toBeNull();
  });

  it("prefers the tracked ancestor over the outbound rule", () => {
    const body = mount(`
      <a id="tracked" href="https://example.com" data-track-event="toc_clicked" data-track-heading="intro">x</a>
    `);

    expect(clickEvent(body.querySelector("#tracked")!, SITE)).toEqual({
      name: "toc_clicked",
      properties: { heading: "intro" },
    });
  });
});

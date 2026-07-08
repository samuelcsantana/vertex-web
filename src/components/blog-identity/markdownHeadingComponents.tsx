import type { Components } from "react-markdown";

import type { Heading } from "@/features/posts/utils/extract-headings";

// Every page that renders admin-authored Markdown already has its own
// hardcoded <h1> (the post title, "Sobre"/"About", etc.) — without this,
// a body that itself starts with "# Something" produces a second,
// competing <h1> on the page, and there's nothing stopping the admin from
// writing one. Shifting every Markdown heading down one level keeps the
// page's real h1 the only h1, while still letting "#" through "######"
// nest normally relative to each other. h6 has nowhere further to go, so
// it stays h6 rather than something that doesn't exist.
//
// When a `headings` list is passed (from extractHeadings, run against the
// same Markdown string), the rendered h2/h3 also get the matching `id` —
// used by <TableOfContents>. The ids are consumed in order rather than
// re-slugified here, since react-markdown visits headings in document
// order and that's exactly the order extractHeadings already produced;
// re-deriving the slug at render time would risk it drifting from the
// TOC's version for the same heading (accents, inline code, etc.).
export function createHeadingComponents(
  headings: Heading[] = []
): Partial<Components> {
  let cursor = 0;

  return {
    h1: (props) => <h2 {...props} />,
    h2: (props) => (
      <h3 {...props} id={headings[cursor++]?.id} className="scroll-mt-24" />
    ),
    h3: (props) => (
      <h4 {...props} id={headings[cursor++]?.id} className="scroll-mt-24" />
    ),
    h4: (props) => <h5 {...props} />,
    h5: (props) => <h6 {...props} />,
    h6: (props) => <h6 {...props} />,
  };
}

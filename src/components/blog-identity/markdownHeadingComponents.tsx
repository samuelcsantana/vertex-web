import type { Components } from "react-markdown";

import type { Heading } from "@/features/posts/utils/extract-headings";

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

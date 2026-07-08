import type { Components } from "react-markdown";

// Every page that renders admin-authored Markdown already has its own
// hardcoded <h1> (the post title, "Sobre"/"About", etc.) — without this,
// a body that itself starts with "# Something" produces a second,
// competing <h1> on the page, and there's nothing stopping the admin from
// writing one. Shifting every Markdown heading down one level keeps the
// page's real h1 the only h1, while still letting "#" through "######"
// nest normally relative to each other. h6 has nowhere further to go, so
// it stays h6 rather than something that doesn't exist.
export const markdownHeadingComponents: Partial<Components> = {
  h1: (props) => <h2 {...props} />,
  h2: (props) => <h3 {...props} />,
  h3: (props) => <h4 {...props} />,
  h4: (props) => <h5 {...props} />,
  h5: (props) => <h6 {...props} />,
  h6: (props) => <h6 {...props} />,
};

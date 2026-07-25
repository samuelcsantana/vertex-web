// Canonical external profile URLs for Samuel Santana. Referenced from the
// Person JSON-LD (schema.org `sameAs`) on both the About page and every
// blog post, and from the footer's/profile card's rel="me" links — the
// single source so the two stay in sync instead of duplicating URLs
// across files.
export const SOCIAL_PROFILES = {
  github: "https://github.com/samuelcsantana",
  linkedin: "https://www.linkedin.com/in/samuelcsantana/",
} as const;

// sameAs is a schema.org profile-identity signal, not a contact channel —
// email is deliberately excluded from it and from this list.
export const SOCIAL_PROFILE_URLS = Object.values(SOCIAL_PROFILES);

export const CONTACT_EMAIL = "samuel.ssa89@gmail.com";

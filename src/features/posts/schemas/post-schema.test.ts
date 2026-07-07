import { describe, expect, it } from "vitest";

import { createPostFormSchema } from "./post-schema";

const validPost = {
  title: "My Post",
  titleEn: "",
  slug: "my-post",
  content: "Some content",
  contentEn: "",
  isPublished: true,
  allowComments: true,
  coverUrl: "",
  topicIds: [],
};

describe("createPostFormSchema", () => {
  it("accepts a fully valid post", () => {
    expect(createPostFormSchema.safeParse(validPost).success).toBe(true);
  });

  it("rejects an empty title", () => {
    const result = createPostFormSchema.safeParse({ ...validPost, title: "" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty slug", () => {
    const result = createPostFormSchema.safeParse({ ...validPost, slug: "" });
    expect(result.success).toBe(false);
  });

  it.each(["My Post", "my post", "my_post", "MY-POST", "-leading", "trailing-"])(
    "rejects a slug that isn't lowercase-hyphenated: %s",
    (slug) => {
      const result = createPostFormSchema.safeParse({ ...validPost, slug });
      expect(result.success).toBe(false);
    }
  );

  it("accepts a valid lowercase-hyphenated slug", () => {
    const result = createPostFormSchema.safeParse({
      ...validPost,
      slug: "a-valid-slug-123",
    });
    expect(result.success).toBe(true);
  });

  it("accepts an empty coverUrl (no cover set)", () => {
    const result = createPostFormSchema.safeParse({ ...validPost, coverUrl: "" });
    expect(result.success).toBe(true);
  });

  it("rejects a non-empty coverUrl that isn't a valid URL", () => {
    const result = createPostFormSchema.safeParse({
      ...validPost,
      coverUrl: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("accepts a valid coverUrl", () => {
    const result = createPostFormSchema.safeParse({
      ...validPost,
      coverUrl: "https://example.com/cover.jpg",
    });
    expect(result.success).toBe(true);
  });
});

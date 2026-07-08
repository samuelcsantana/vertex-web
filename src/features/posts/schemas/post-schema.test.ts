import { describe, expect, it } from "vitest";

import { createPostFormSchema } from "./post-schema";

const validPost = {
  title: "My Post",
  titleEn: "",
  titleEs: "",
  slug: "my-post",
  slugEn: "",
  slugEs: "",
  content: "Some content",
  contentEn: "",
  contentEs: "",
  isPublished: true,
  allowComments: true,
  coverUrl: "",
  metaDescription: "",
  metaDescriptionEn: "",
  metaDescriptionEs: "",
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

  it("accepts an empty slugEn/slugEs (no locale-specific slug)", () => {
    const result = createPostFormSchema.safeParse({
      ...validPost,
      slugEn: "",
      slugEs: "",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.slugEn).toBeUndefined();
      expect(result.data.slugEs).toBeUndefined();
    }
  });

  it("accepts a valid slugEn/slugEs", () => {
    const result = createPostFormSchema.safeParse({
      ...validPost,
      slugEn: "coffee-with-milk",
      slugEs: "cafe-con-leche",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.slugEn).toBe("coffee-with-milk");
      expect(result.data.slugEs).toBe("cafe-con-leche");
    }
  });

  it("rejects a slugEn that isn't lowercase-hyphenated", () => {
    const result = createPostFormSchema.safeParse({
      ...validPost,
      slugEn: "Coffee With Milk",
    });
    expect(result.success).toBe(false);
  });

  it("accepts a metaDescription up to 160 characters", () => {
    const result = createPostFormSchema.safeParse({
      ...validPost,
      metaDescription: "a".repeat(160),
    });
    expect(result.success).toBe(true);
  });

  it("rejects a metaDescription longer than 160 characters", () => {
    const result = createPostFormSchema.safeParse({
      ...validPost,
      metaDescription: "a".repeat(161),
    });
    expect(result.success).toBe(false);
  });

  it("rejects a metaDescriptionEn longer than 160 characters", () => {
    const result = createPostFormSchema.safeParse({
      ...validPost,
      metaDescriptionEn: "a".repeat(161),
    });
    expect(result.success).toBe(false);
  });

  it("rejects a metaDescriptionEs longer than 160 characters", () => {
    const result = createPostFormSchema.safeParse({
      ...validPost,
      metaDescriptionEs: "a".repeat(161),
    });
    expect(result.success).toBe(false);
  });
});

import fs from "fs";
import path from "path";
import matter from "gray-matter";

const BLOG_CONTENT_DIR = path.join(process.cwd(), "src/content/blog");

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  summary: string;
  content: string;
}

function readPostFile(fileName: string): BlogPost {
  const slug = fileName.replace(/\.mdx$/, "");
  const filePath = path.join(BLOG_CONTENT_DIR, fileName);
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(fileContent);

  return {
    slug,
    title: data.title,
    date: data.date,
    summary: data.summary,
    content,
  };
}

export function getPosts(): BlogPost[] {
  const fileNames = fs
    .readdirSync(BLOG_CONTENT_DIR)
    .filter((fileName) => fileName.endsWith(".mdx"));

  return fileNames
    .map(readPostFile)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): BlogPost | null {
  const filePath = path.join(BLOG_CONTENT_DIR, `${slug}.mdx`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  return readPostFile(`${slug}.mdx`);
}
